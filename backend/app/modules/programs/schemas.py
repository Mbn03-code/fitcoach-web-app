from pydantic import BaseModel, Field, model_validator
from app.modules.users.schemas import UserOut


class ExerciseOut(BaseModel):
    id: int
    name: str
    target_muscle: str | None = None
    description: str | None = None
    category: str | None = None
    video_key: str | None = None

    class Config:
        from_attributes = True


class AthleteOptionOut(BaseModel):
    id: int
    full_name: str
    phone: str
    role: str
    request_id: int | None = None
    request_status: str | None = None
    request_message: str | None = None

    class Config:
        from_attributes = True


class ProgramExerciseIn(BaseModel):
    exercise_id: int
    day_number: int = Field(ge=1, le=7)
    sets: int = Field(ge=1, le=20)
    reps: int = Field(ge=1, le=100)
    note: str | None = Field(default=None, max_length=300)


class ProgramCreateIn(BaseModel):
    title: str = Field(min_length=3, max_length=150)
    description: str | None = Field(default=None, max_length=1000)
    athlete_id: int
    duration_weeks: int = Field(ge=1, le=24)
    days_per_week: int = Field(ge=1, le=7)
    exercises: list[ProgramExerciseIn] = Field(min_length=1, max_length=30)

    @model_validator(mode="after")
    def check_days(self):
        for item in self.exercises:
            if item.day_number > self.days_per_week:
                raise ValueError("Exercise day cannot be greater than program days per week")
        return self


class ProgramFromRequestIn(BaseModel):
    title: str = Field(min_length=3, max_length=150)
    description: str | None = Field(default=None, max_length=1000)
    duration_weeks: int = Field(ge=1, le=24)
    days_per_week: int = Field(ge=1, le=7)
    exercises: list[ProgramExerciseIn] = Field(min_length=1, max_length=30)

    @model_validator(mode="after")
    def check_days(self):
        for item in self.exercises:
            if item.day_number > self.days_per_week:
                raise ValueError("Exercise day cannot be greater than program days per week")
        return self


class ProgramUpdateIn(BaseModel):
    title: str = Field(min_length=3, max_length=150)
    description: str | None = Field(default=None, max_length=1000)
    duration_weeks: int = Field(ge=1, le=24)
    days_per_week: int = Field(ge=1, le=7)


class ProgramExerciseOut(BaseModel):
    id: int
    day_number: int
    sets: int
    reps: int
    note: str | None = None
    exercise: ExerciseOut


class WorkoutLogOut(BaseModel):
    athlete_id: int
    program_id: int
    week_number: int
    completed: bool
    note: str | None = None


class ProgramListItemOut(BaseModel):
    id: int
    title: str
    description: str | None = None
    duration_weeks: int
    days_per_week: int
    coach: UserOut
    athlete: UserOut
    completed_weeks: int
    total_weeks: int


class ProgramDetailOut(ProgramListItemOut):
    exercises: list[ProgramExerciseOut]
    logs: list[WorkoutLogOut]


class CompleteWeekIn(BaseModel):
    week_number: int = Field(ge=1, le=24)
    completed: bool = True
    note: str | None = Field(default=None, max_length=500)
