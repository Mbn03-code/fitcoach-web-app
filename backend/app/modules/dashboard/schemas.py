from pydantic import BaseModel
from app.modules.profiles.schemas import MyProfileOut


class DashboardStat(BaseModel):
    label: str
    value: str | int


class DashboardOut(BaseModel):
    profile: MyProfileOut
    message: str
    next_step: str
    stats: list[DashboardStat]
