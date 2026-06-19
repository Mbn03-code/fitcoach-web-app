from sqlalchemy.orm import Session
from app.core.exceptions import forbidden
from app.modules.fitness.models import AthleteProfile, CoachProfile
from app.modules.profiles.repositories import ProfileRepository
from app.modules.users.models import User


class ProfileService:
    def __init__(self, db: Session):
        self.db = db
        self.profiles = ProfileRepository(db)

    def _is_athlete_complete(self, profile: AthleteProfile | None) -> bool:
        return bool(
            profile
            and profile.height_cm
            and profile.weight_kg
            and profile.goal
            and profile.level
            and profile.available_days_per_week
        )

    def _is_coach_complete(self, profile: CoachProfile | None) -> bool:
        return bool(profile and profile.specialty and profile.experience_years is not None and profile.bio)

    def get_my_profile(self, user: User):
        athlete_profile = self.profiles.get_athlete_profile(user.id) if user.role == "athlete" else None
        coach_profile = self.profiles.get_coach_profile(user.id) if user.role == "coach" else None
        is_complete = self._is_athlete_complete(athlete_profile) if user.role == "athlete" else self._is_coach_complete(coach_profile)
        return {
            "user": user,
            "profile_type": user.role,
            "is_complete": is_complete,
            "athlete_profile": athlete_profile,
            "coach_profile": coach_profile,
        }

    def update_athlete_profile(self, user: User, data):
        if user.role != "athlete":
            forbidden("Only athletes can update athlete profile")
        profile = self.profiles.get_athlete_profile(user.id)
        if profile is None:
            profile = AthleteProfile(user_id=user.id)
        for field, value in data.model_dump().items():
            setattr(profile, field, value)
        self.profiles.save(profile)
        return self.get_my_profile(user)

    def update_coach_profile(self, user: User, data):
        if user.role != "coach":
            forbidden("Only coaches can update coach profile")
        profile = self.profiles.get_coach_profile(user.id)
        if profile is None:
            profile = CoachProfile(user_id=user.id)
        for field, value in data.model_dump().items():
            setattr(profile, field, value)
        self.profiles.save(profile)
        return self.get_my_profile(user)
