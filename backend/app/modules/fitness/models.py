from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from app.core.base_model import TimestampMixin
from app.core.database import Base


class AthleteProfile(TimestampMixin, Base):
    __tablename__ = "athlete_profiles"
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    height_cm = Column(Integer, nullable=True)
    weight_kg = Column(Integer, nullable=True)
    goal = Column(String(100), nullable=True)
    level = Column(String(50), nullable=True)
    available_days_per_week = Column(Integer, nullable=True)


class CoachProfile(TimestampMixin, Base):
    __tablename__ = "coach_profiles"
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    specialty = Column(String(100), nullable=True)
    experience_years = Column(Integer, nullable=True)
    bio = Column(Text, nullable=True)


class Exercise(TimestampMixin, Base):
    __tablename__ = "exercises"
    name = Column(String(100), nullable=False)
    target_muscle = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)


class Program(TimestampMixin, Base):
    __tablename__ = "programs"
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    coach_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    athlete_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    duration_weeks = Column(Integer, nullable=False)
    days_per_week = Column(Integer, nullable=False)


class ProgramExercise(TimestampMixin, Base):
    __tablename__ = "program_exercises"
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    day_number = Column(Integer, nullable=False)
    sets = Column(Integer, nullable=False)
    reps = Column(Integer, nullable=False)
    note = Column(Text, nullable=True)


class WorkoutLog(Base):
    __tablename__ = "workout_logs"
    athlete_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    program_id = Column(Integer, ForeignKey("programs.id"), primary_key=True)
    week_number = Column(Integer, primary_key=True)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    note = Column(Text, nullable=True)


class WorkoutCategory(TimestampMixin, Base):
    __tablename__ = "workout_categories"
    title = Column(String(80), nullable=False)
    subtitle = Column(String(160), nullable=False)
    image_hint = Column(String(120), nullable=True)


class Article(TimestampMixin, Base):
    __tablename__ = "articles"
    title = Column(String(160), nullable=False)
    read_time = Column(String(20), nullable=False)
    slug = Column(String(80), unique=True, index=True, nullable=True)
    summary = Column(String(300), nullable=True)
    content = Column(Text, nullable=True)


class CoachRequest(TimestampMixin, Base):
    __tablename__ = "coach_requests"
    athlete_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    coach_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(30), nullable=False, default="pending")
    message = Column(Text, nullable=True)
