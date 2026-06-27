from pydantic import BaseModel


class CoachCardOut(BaseModel):
    id: int
    full_name: str
    phone: str
    specialty: str | None = None
    experience_years: int | None = None
    bio: str | None = None
    programs_count: int = 0
    rating: float = 4.8
    tags: list[str] = []


class CoachDetailOut(CoachCardOut):
    approach: str
    sample_plan: list[str]
