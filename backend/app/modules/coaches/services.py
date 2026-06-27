from sqlalchemy.orm import Session
from app.core.exceptions import not_found
from app.modules.fitness.models import CoachProfile, Program
from app.modules.users.models import User


def _coach_tags(specialty: str | None) -> list[str]:
    text = (specialty or "fitness coaching").lower()
    if "strength" in text:
        return ["Strength", "Muscle gain", "Gym plans"]
    if "mobility" in text:
        return ["Mobility", "Flexibility", "Recovery"]
    if "fat" in text or "weight" in text:
        return ["Fat loss", "HIIT", "Consistency"]
    return ["Beginner friendly", "Weekly follow-up", "Clean plans"]


class CoachService:
    def __init__(self, db: Session):
        self.db = db

    def _serialize(self, user: User, profile: CoachProfile | None):
        programs_count = self.db.query(Program).filter(Program.coach_id == user.id, Program.deleted_at.is_(None)).count()
        specialty = profile.specialty if profile else "Personal Fitness Coach"
        return {
            "id": user.id,
            "full_name": user.full_name,
            "phone": user.phone,
            "specialty": specialty,
            "experience_years": profile.experience_years if profile else 2,
            "bio": profile.bio if profile else "Creates simple, realistic weekly training plans for beginners.",
            "programs_count": programs_count,
            "rating": 4.7 + ((user.id % 3) * 0.1),
            "tags": _coach_tags(specialty),
        }

    def list_coaches(self):
        users = (
            self.db.query(User)
            .filter(User.role == "coach", User.is_active.is_(True), User.is_verified.is_(True), User.deleted_at.is_(None))
            .order_by(User.full_name.asc())
            .all()
        )
        results = []
        for user in users:
            profile = self.db.query(CoachProfile).filter(CoachProfile.user_id == user.id, CoachProfile.deleted_at.is_(None)).first()
            results.append(self._serialize(user, profile))
        return results

    def get_coach(self, coach_id: int):
        user = self.db.query(User).filter(User.id == coach_id, User.role == "coach", User.deleted_at.is_(None)).first()
        if not user:
            not_found("Coach not found")
        profile = self.db.query(CoachProfile).filter(CoachProfile.user_id == user.id, CoachProfile.deleted_at.is_(None)).first()
        data = self._serialize(user, profile)
        data["approach"] = (
            "This coach focuses on a clear assessment, a realistic weekly schedule, and small progress checks. "
            "The goal is to make training easy to follow without noisy dashboards."
        )
        data["sample_plan"] = [
            "Week 1: movement assessment and beginner routine",
            "Week 2: strength or fat-loss focus based on your goal",
            "Week 3: progress check and exercise adjustment",
            "Week 4: habit review and next plan recommendation",
        ]
        return data
