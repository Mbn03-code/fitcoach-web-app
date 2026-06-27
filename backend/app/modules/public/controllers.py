from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.fitness.models import Article, WorkoutCategory

router = APIRouter(prefix="/public", tags=["Public"])

DEFAULT_ARTICLES = [
    {
        "title": "5 beginner workouts to start this week",
        "read_time": "6 min read",
        "slug": "beginner-workouts",
        "summary": "Five simple sessions for starting your first workout week.",
        "content": "Start with full-body basics, light cardio, mobility, and recovery. Keep the first week simple so your body can adapt.",
    },
    {
        "title": "How to stay consistent on busy days",
        "read_time": "4 min read",
        "slug": "stay-consistent",
        "summary": "Small habits that help you keep moving when life gets busy.",
        "content": "Use a 10-minute minimum workout, prepare your clothes in advance, and track small wins. Missing one day does not restart your progress.",
    },
    {
        "title": "Simple meal prep for fitness beginners",
        "read_time": "7 min read",
        "slug": "meal-prep",
        "summary": "Easy meals to support energy, training, and recovery.",
        "content": "Choose one protein, one simple carb, and vegetables you like. Repeat meals to keep the routine easy.",
    },
]


def seed_landing_content(db: Session):
    if db.query(WorkoutCategory).count() == 0:
        db.add_all([
            WorkoutCategory(title="Strength", subtitle="Build muscle with smart gym plans.", image_hint="strength"),
            WorkoutCategory(title="Fat Loss", subtitle="HIIT, cardio, and daily burn goals.", image_hint="fat-loss"),
            WorkoutCategory(title="Full Body", subtitle="Balanced routines for total fitness.", image_hint="full-body"),
            WorkoutCategory(title="Mobility", subtitle="Improve flexibility and joint control.", image_hint="mobility"),
        ])
    if db.query(Article).count() == 0:
        db.add_all([Article(**item) for item in DEFAULT_ARTICLES])
    db.commit()


@router.get("/landing")
def landing(db: Session = Depends(get_db)):
    seed_landing_content(db)
    categories = db.query(WorkoutCategory).filter(WorkoutCategory.deleted_at.is_(None)).order_by(WorkoutCategory.id.asc()).all()
    articles = db.query(Article).filter(Article.deleted_at.is_(None)).order_by(Article.id.asc()).all()
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
        "articles": [
            {"title": a.title, "read_time": a.read_time, "slug": a.slug or "beginner-workouts", "summary": a.summary}
            for a in articles
        ],
    }
