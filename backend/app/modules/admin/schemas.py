from pydantic import BaseModel, Field
from app.modules.users.schemas import UserOut
from app.modules.programs.schemas import ExerciseOut


class AdminStatsOut(BaseModel):
    total_users: int
    active_users: int
    verified_users: int
    athletes: int
    coaches: int
    admins: int
    programs: int
    exercises: int
    articles: int
    completed_weeks: int


class UserStatusIn(BaseModel):
    is_active: bool


class ExerciseManageIn(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    target_muscle: str | None = Field(default=None, max_length=100)
    description: str | None = Field(default=None, max_length=500)


class ArticleManageIn(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    read_time: str = Field(min_length=3, max_length=20)
    slug: str = Field(min_length=3, max_length=80, pattern=r"^[a-z0-9-]+$")
    summary: str | None = Field(default=None, max_length=300)
    content: str | None = Field(default=None, max_length=5000)


class AdminArticleOut(BaseModel):
    id: int
    title: str
    read_time: str
    slug: str | None = None
    summary: str | None = None
    content: str | None = None

    model_config = {"from_attributes": True}


class AdminUsersOut(BaseModel):
    users: list[UserOut]
