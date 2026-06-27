from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.exceptions import bad_request, forbidden, not_found
from app.modules.fitness.models import AthleteProfile, CoachRequest, Exercise, Program, ProgramExercise, WorkoutLog
from app.modules.users.models import User


DEFAULT_EXERCISES = [
    ("Bodyweight Squat", "Legs", "Beginner lower-body strength exercise."),
    ("Push Up", "Chest", "Classic upper-body movement for chest and arms."),
    ("Dumbbell Row", "Back", "Simple pulling exercise for back strength."),
    ("Plank", "Core", "Core stability exercise for beginners."),
    ("Jumping Jacks", "Cardio", "Easy cardio warm-up movement."),
    ("Glute Bridge", "Glutes", "Beginner-friendly hip and glute exercise."),
    ("Mountain Climbers", "Cardio", "Fast cardio movement for conditioning."),
    ("Shoulder Press", "Shoulders", "Dumbbell press for shoulder strength."),
]

EXERCISE_CATEGORY = {
    "Bodyweight Squat": "strength",
    "Push Up": "strength",
    "Dumbbell Row": "strength",
    "Shoulder Press": "strength",
    "Jumping Jacks": "fat-loss",
    "Mountain Climbers": "fat-loss",
    "Plank": "full-body",
    "Glute Bridge": "mobility",
}


class ProgramService:
    def __init__(self, db: Session):
        self.db = db

    def seed_exercises(self) -> None:
        if self.db.query(Exercise).count() > 0:
            return
        for name, target, description in DEFAULT_EXERCISES:
            self.db.add(Exercise(name=name, target_muscle=target, description=description))
        self.db.commit()

    def _serialize_exercise(self, exercise: Exercise) -> dict:
        return {
            "id": exercise.id,
            "name": exercise.name,
            "target_muscle": exercise.target_muscle,
            "description": exercise.description,
            "category": EXERCISE_CATEGORY.get(exercise.name, "full-body"),
            "video_key": None,
        }

    def list_exercises(self):
        self.seed_exercises()
        exercises = self.db.query(Exercise).filter(Exercise.deleted_at.is_(None)).order_by(Exercise.name.asc()).all()
        return [self._serialize_exercise(exercise) for exercise in exercises]

    def list_athletes(self, current_user: User):
       
        if current_user.role not in ["coach", "admin"]:
            forbidden("Only coaches can select athletes")

        if current_user.role == "admin":
            return (
                self.db.query(User)
                .filter(User.role == "athlete", User.is_verified.is_(True), User.is_active.is_(True), User.deleted_at.is_(None))
                .order_by(User.full_name.asc())
                .all()
            )

        requests = (
            self.db.query(CoachRequest, User)
            .join(User, User.id == CoachRequest.athlete_id)
            .filter(
                CoachRequest.coach_id == current_user.id,
                CoachRequest.status == "accepted",
                CoachRequest.deleted_at.is_(None),
                User.role == "athlete",
                User.is_verified.is_(True),
                User.is_active.is_(True),
                User.deleted_at.is_(None),
            )
            .order_by(CoachRequest.created_at.desc())
            .all()
        )
        athletes = []
        seen = set()
        for request, athlete in requests:
            if athlete.id in seen:
                continue
            seen.add(athlete.id)
            athletes.append({
                "id": athlete.id,
                "full_name": athlete.full_name,
                "phone": athlete.phone,
                "role": athlete.role,
                "request_id": request.id,
                "request_status": request.status,
                "request_message": request.message,
            })
        return athletes

    def _get_user(self, user_id: int) -> User:
        user = self.db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()
        if not user:
            not_found("User not found")
        return user

    def _get_program(self, program_id: int) -> Program:
        program = self.db.query(Program).filter(Program.id == program_id, Program.deleted_at.is_(None)).first()
        if not program:
            not_found("Program not found")
        return program

    def _can_view(self, program: Program, current_user: User) -> bool:
        return current_user.role == "admin" or program.coach_id == current_user.id or program.athlete_id == current_user.id

    def _can_manage(self, program: Program, current_user: User) -> bool:
        return current_user.role == "admin" or program.coach_id == current_user.id

    def _accepted_request_for(self, coach_id: int, athlete_id: int) -> CoachRequest | None:
        return (
            self.db.query(CoachRequest)
            .filter(
                CoachRequest.coach_id == coach_id,
                CoachRequest.athlete_id == athlete_id,
                CoachRequest.status == "accepted",
                CoachRequest.deleted_at.is_(None),
            )
            .order_by(CoachRequest.created_at.desc())
            .first()
        )

    def _serialize_program(self, program: Program, include_detail: bool = False) -> dict:
        coach = self._get_user(program.coach_id)
        athlete = self._get_user(program.athlete_id)
        logs = self.db.query(WorkoutLog).filter(WorkoutLog.program_id == program.id).order_by(WorkoutLog.week_number.asc()).all()
        completed_weeks = len([log for log in logs if log.completed])
        base = {
            "id": program.id,
            "title": program.title,
            "description": program.description,
            "duration_weeks": program.duration_weeks,
            "days_per_week": program.days_per_week,
            "coach": coach,
            "athlete": athlete,
            "completed_weeks": completed_weeks,
            "total_weeks": program.duration_weeks,
        }
        if include_detail:
            items = self.db.query(ProgramExercise).filter(ProgramExercise.program_id == program.id, ProgramExercise.deleted_at.is_(None)).order_by(ProgramExercise.day_number.asc(), ProgramExercise.id.asc()).all()
            base["exercises"] = [
                {
                    "id": item.id,
                    "day_number": item.day_number,
                    "sets": item.sets,
                    "reps": item.reps,
                    "note": item.note,
                    "exercise": self._serialize_exercise(self.db.query(Exercise).filter(Exercise.id == item.exercise_id).first()),
                }
                for item in items
            ]
            base["logs"] = logs
        return base

    def list_my_programs(self, current_user: User):
        query = self.db.query(Program).filter(Program.deleted_at.is_(None))
        if current_user.role == "athlete":
            query = query.filter(Program.athlete_id == current_user.id)
        elif current_user.role == "coach":
            query = query.filter(Program.coach_id == current_user.id)
        elif current_user.role != "admin":
            forbidden("Invalid role")
        programs = query.order_by(Program.created_at.desc()).all()
        return [self._serialize_program(program) for program in programs]

    def get_detail(self, program_id: int, current_user: User):
        program = self._get_program(program_id)
        if not self._can_view(program, current_user):
            forbidden("You cannot view this program")
        return self._serialize_program(program, include_detail=True)

    def _create_program_core(self, data, current_user: User, athlete: User):
        if athlete.role != "athlete":
            bad_request("Selected user is not an athlete")
        if not athlete.is_verified:
            bad_request("Athlete must be verified")
        profile = self.db.query(AthleteProfile).filter(AthleteProfile.user_id == athlete.id, AthleteProfile.deleted_at.is_(None)).first()
        if profile and profile.available_days_per_week and data.days_per_week > profile.available_days_per_week:
            bad_request("Program days per week cannot be more than athlete available days")
        self.seed_exercises()
        exercise_ids = [item.exercise_id for item in data.exercises]
        existing_count = self.db.query(Exercise).filter(Exercise.id.in_(exercise_ids), Exercise.deleted_at.is_(None)).count()
        if existing_count != len(set(exercise_ids)):
            bad_request("One or more exercises are invalid")

        program = Program(
            title=data.title,
            description=data.description,
            coach_id=current_user.id,
            athlete_id=athlete.id,
            duration_weeks=data.duration_weeks,
            days_per_week=data.days_per_week,
        )
        self.db.add(program)
        self.db.flush()
        for item in data.exercises:
            self.db.add(ProgramExercise(
                program_id=program.id,
                exercise_id=item.exercise_id,
                day_number=item.day_number,
                sets=item.sets,
                reps=item.reps,
                note=item.note,
            ))
        self.db.flush()
        return program

    def create_program(self, data, current_user: User):
        if current_user.role not in ["coach", "admin"]:
            forbidden("Only coaches can create programs")
        athlete = self._get_user(data.athlete_id)
        accepted_request = None
        if current_user.role == "coach":
            accepted_request = self._accepted_request_for(current_user.id, athlete.id)
            if not accepted_request:
                bad_request("This athlete must request you and be accepted before you can create a program")
        program = self._create_program_core(data, current_user, athlete)
        if accepted_request:
            accepted_request.status = "program_sent"
            accepted_request.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(program)
        return self._serialize_program(program, include_detail=True)

    def create_program_from_request(self, request_id: int, data, current_user: User):
        if current_user.role not in ["coach", "admin"]:
            forbidden("Only coaches can create programs")
        request = self.db.query(CoachRequest).filter(CoachRequest.id == request_id, CoachRequest.deleted_at.is_(None)).first()
        if not request:
            not_found("Request not found")
        if current_user.role == "coach" and request.coach_id != current_user.id:
            forbidden("You cannot create a program for this request")
        if request.status == "pending":
            bad_request("Accept this request before creating a program")
        if request.status == "rejected":
            bad_request("This request was rejected")
        if request.status == "program_sent":
            bad_request("A program was already sent for this request")
        athlete = self._get_user(request.athlete_id)
        program = self._create_program_core(data, current_user, athlete)
        request.status = "program_sent"
        request.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(program)
        return self._serialize_program(program, include_detail=True)

    def update_program(self, program_id: int, data, current_user: User):
        program = self._get_program(program_id)
        if not self._can_manage(program, current_user):
            forbidden("You cannot edit this program")
        athlete_profile = self.db.query(AthleteProfile).filter(AthleteProfile.user_id == program.athlete_id, AthleteProfile.deleted_at.is_(None)).first()
        if athlete_profile and athlete_profile.available_days_per_week and data.days_per_week > athlete_profile.available_days_per_week:
            bad_request("Program days per week cannot be more than athlete available days")
        program.title = data.title
        program.description = data.description
        program.duration_weeks = data.duration_weeks
        program.days_per_week = data.days_per_week
        self.db.commit()
        self.db.refresh(program)
        return self._serialize_program(program, include_detail=True)

    def delete_program(self, program_id: int, current_user: User):
        program = self._get_program(program_id)
        if not self._can_manage(program, current_user):
            forbidden("You cannot delete this program")
        program.deleted_at = datetime.now(timezone.utc)
        self.db.commit()
        return {"message": "Program deleted"}

    def complete_week(self, program_id: int, data, current_user: User):
        program = self._get_program(program_id)
        if current_user.role != "athlete" or program.athlete_id != current_user.id:
            forbidden("Only the assigned athlete can update progress")
        if data.week_number > program.duration_weeks:
            bad_request("Week number is outside program duration")
        log = (
            self.db.query(WorkoutLog)
            .filter(WorkoutLog.program_id == program.id, WorkoutLog.athlete_id == current_user.id, WorkoutLog.week_number == data.week_number)
            .first()
        )
        if not log:
            log = WorkoutLog(athlete_id=current_user.id, program_id=program.id, week_number=data.week_number)
            self.db.add(log)
        log.completed = data.completed
        log.note = data.note
        log.completed_at = datetime.now(timezone.utc) if data.completed else None
        self.db.commit()
        self.db.refresh(program)
        return self._serialize_program(program, include_detail=True)
