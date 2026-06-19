from sqlalchemy.orm import Session
from app.modules.fitness.models import AthleteProfile, CoachProfile


class ProfileRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_athlete_profile(self, user_id: int):
        return (
            self.db.query(AthleteProfile)
            .filter(AthleteProfile.user_id == user_id, AthleteProfile.deleted_at.is_(None))
            .first()
        )

    def get_coach_profile(self, user_id: int):
        return (
            self.db.query(CoachProfile)
            .filter(CoachProfile.user_id == user_id, CoachProfile.deleted_at.is_(None))
            .first()
        )

    def save(self, profile):
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile
