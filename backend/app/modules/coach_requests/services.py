from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.exceptions import bad_request, forbidden, not_found
from app.modules.fitness.models import AthleteProfile, CoachProfile, CoachRequest, Program
from app.modules.programs.services import ProgramService
from app.modules.users.models import User


VALID_STATUSES = {"pending", "accepted", "rejected", "program_sent"}


class CoachRequestService:
    def __init__(self, db: Session):
        self.db = db

    def _get_user(self, user_id: int) -> User:
        user = self.db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()
        if not user:
            not_found("User not found")
        return user

    def _get_request(self, request_id: int) -> CoachRequest:
        request = self.db.query(CoachRequest).filter(CoachRequest.id == request_id, CoachRequest.deleted_at.is_(None)).first()
        if not request:
            not_found("Request not found")
        return request

    def _program_for_request(self, request: CoachRequest):
        program = (
            self.db.query(Program)
            .filter(
                Program.athlete_id == request.athlete_id,
                Program.coach_id == request.coach_id,
                Program.deleted_at.is_(None),
            )
            .order_by(Program.created_at.desc())
            .first()
        )
        return program

    def _serialize_profile(self, profile):
        if not profile:
            return None
        data = {}
        for key, value in profile.__dict__.items():
            if key.startswith('_') or key in {'deleted_at'}:
                continue
            if isinstance(value, datetime):
                data[key] = value.isoformat()
            else:
                data[key] = value
        return data

    def _serialize_request(self, request: CoachRequest, include_detail: bool = False):
        athlete = self._get_user(request.athlete_id)
        coach = self._get_user(request.coach_id)
        program = self._program_for_request(request)
        data = {
            "id": request.id,
            "athlete": athlete,
            "coach": coach,
            "status": request.status,
            "message": request.message,
            "created_at": request.created_at,
            "updated_at": request.updated_at,
            "program": ProgramService(self.db)._serialize_program(program) if program else None,
        }
        if include_detail:
            athlete_profile = self.db.query(AthleteProfile).filter(AthleteProfile.user_id == athlete.id, AthleteProfile.deleted_at.is_(None)).first()
            coach_profile = self.db.query(CoachProfile).filter(CoachProfile.user_id == coach.id, CoachProfile.deleted_at.is_(None)).first()
            data["athlete_profile"] = self._serialize_profile(athlete_profile)
            data["coach_profile"] = self._serialize_profile(coach_profile)
        return data

    def create_request(self, data, current_user: User):
        if current_user.role != "athlete":
            forbidden("Only athletes can request programs")
        coach = self._get_user(data.coach_id)
        if coach.role != "coach" or not coach.is_active or not coach.is_verified:
            bad_request("Selected user is not an available coach")

        existing = (
            self.db.query(CoachRequest)
            .filter(
                CoachRequest.athlete_id == current_user.id,
                CoachRequest.coach_id == coach.id,
                CoachRequest.status.in_(["pending", "accepted"]),
                CoachRequest.deleted_at.is_(None),
            )
            .first()
        )
        if existing:
            return self._serialize_request(existing, include_detail=True)

        request = CoachRequest(
            athlete_id=current_user.id,
            coach_id=coach.id,
            status="pending",
            message=data.message,
        )
        self.db.add(request)
        self.db.commit()
        self.db.refresh(request)
        return self._serialize_request(request, include_detail=True)

    def my_requests(self, current_user: User):
        if current_user.role != "athlete":
            forbidden("Only athletes can view their program requests")
        requests = (
            self.db.query(CoachRequest)
            .filter(CoachRequest.athlete_id == current_user.id, CoachRequest.deleted_at.is_(None))
            .order_by(CoachRequest.created_at.desc())
            .all()
        )
        return [self._serialize_request(item) for item in requests]

    def incoming_requests(self, current_user: User):
        if current_user.role not in ["coach", "admin"]:
            forbidden("Only coaches can view incoming requests")
        query = self.db.query(CoachRequest).filter(CoachRequest.deleted_at.is_(None))
        if current_user.role == "coach":
            query = query.filter(CoachRequest.coach_id == current_user.id)
        requests = query.order_by(CoachRequest.created_at.desc()).all()
        return [self._serialize_request(item) for item in requests]

    def detail(self, request_id: int, current_user: User):
        request = self._get_request(request_id)
        if current_user.role != "admin" and current_user.id not in [request.athlete_id, request.coach_id]:
            forbidden("You cannot view this request")
        return self._serialize_request(request, include_detail=True)

    def update_status(self, request_id: int, data, current_user: User):
        request = self._get_request(request_id)
        if current_user.role not in ["coach", "admin"] or (current_user.role == "coach" and request.coach_id != current_user.id):
            forbidden("Only the selected coach can update this request")
        if request.status == "program_sent":
            bad_request("Program was already sent for this request")
        if data.status not in VALID_STATUSES:
            bad_request("Invalid request status")
        request.status = data.status
        request.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(request)
        return self._serialize_request(request, include_detail=True)

    def mark_program_sent(self, request_id: int, current_user: User):
        request = self._get_request(request_id)
        if current_user.role not in ["coach", "admin"] or (current_user.role == "coach" and request.coach_id != current_user.id):
            forbidden("Only the selected coach can send a program for this request")
        request.status = "program_sent"
        request.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(request)
        return request
