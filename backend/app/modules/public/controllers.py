from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.fitness.models import Article, WorkoutCategory

router = APIRouter(prefix="/public", tags=["Public"])


def seed_landing_content(db: Session):
    if db.query(WorkoutCategory).count() == 0:
        db.add_all([
            WorkoutCategory(title="Strength", subtitle="Build muscle with smart gym plans.", image_hint="strength"),
            WorkoutCategory(title="Fat Loss", subtitle="HIIT, cardio, and daily burn goals.", image_hint="fat-loss"),
            WorkoutCategory(title="Full Body", subtitle="Balanced routines for total fitness.", image_hint="full-body"),
            WorkoutCategory(title="Mobility", subtitle="Improve flexibility and joint control.", image_hint="mobility"),
        ])
    if db.query(Article).count() == 0:
        db.add_all([
            Article(title="5 beginner workouts to start this week", read_time="6 min read"),
            Article(title="How to stay consistent on busy days", read_time="4 min read"),
            Article(title="Simple meal prep for fitness beginners", read_time="7 min read"),
        ])
    db.commit()


@router.get("/landing")
def landing(db: Session = Depends(get_db)):
    seed_landing_content(db)
    categories = db.query(WorkoutCategory).order_by(WorkoutCategory.id.asc()).all()
    articles = db.query(Article).order_by(Article.id.asc()).all()
    return {
        "brand": "Futurea",
        "hero": {
            "headline": ["UNLEASH", "YOUR", "POTENTIAL"],
            "subtitle": "Personalized workouts, expert coaching, and progress tracking in one clean app.",
        },
        "stats": [
            {"value": "10K+", "label": "Happy Members", "icon": "users"},
            {"value": "500+", "label": "Workout Plans", "icon": "play"},
            {"value": "4.9", "label": "Average Rating", "icon": "star"},
        ],
        "categories": [{"title": c.title, "subtitle": c.subtitle, "image_hint": c.image_hint} for c in categories],
        "articles": [{"title": a.title, "read_time": a.read_time, "slug": ["beginner-workouts", "stay-consistent", "meal-prep"][idx] if idx < 3 else "beginner-workouts"} for idx, a in enumerate(articles)],
    }
