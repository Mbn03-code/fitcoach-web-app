from pydantic import BaseModel, Field
from app.modules.users.schemas import UserOut


class AthleteProfileIn(BaseModel):
    height_cm: int | None = Field(default=None, ge=100, le=250)
    weight_kg: int | None = Field(default=None, ge=30, le=250)
    goal: str | None = Field(default=None, max_length=100)
    level: str | None = Field(default=None, max_length=50)
    available_days_per_week: int | None = Field(default=None, ge=1, le=7)


class CoachProfileIn(BaseModel):
    specialty: str | None = Field(default=None, max_length=100)
    experience_years: int | None = Field(default=None, ge=0, le=60)
    bio: str | None = Field(default=None, max_length=800)


class AthleteProfileOut(BaseModel):
    id: int
    user_id: int
    height_cm: int | None = None
    weight_kg: int | None = None
    goal: str | None = None
    level: str | None = None
    available_days_per_week: int | None = None

    model_config = {"from_attributes": True}


class CoachProfileOut(BaseModel):
    id: int
    user_id: int
    specialty: str | None = None
    experience_years: int | None = None
    bio: str | None = None

    model_config = {"from_attributes": True}


class MyProfileOut(BaseModel):
    user: UserOut
    profile_type: str
    is_complete: bool
    athlete_profile: AthleteProfileOut | None = None
    coach_profile: CoachProfileOut | None = None
