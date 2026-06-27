from datetime import datetime
from pydantic import BaseModel, Field
from app.modules.users.schemas import UserOut
from app.modules.programs.schemas import ProgramListItemOut


class CoachRequestCreateIn(BaseModel):
    coach_id: int
    message: str | None = Field(default=None, max_length=500)


class CoachRequestStatusIn(BaseModel):
    status: str = Field(pattern="^(accepted|rejected)$")


class CoachRequestOut(BaseModel):
    id: int
    athlete: UserOut
    coach: UserOut
    status: str
    message: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    program: ProgramListItemOut | None = None


class CoachRequestDetailOut(CoachRequestOut):
    athlete_profile: dict | None = None
    coach_profile: dict | None = None
