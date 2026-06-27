from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
import app.model_registry  # noqa: F401
from app.modules.auth.controllers import router as auth_router
from app.modules.users.controllers import router as users_router
from app.modules.public.controllers import router as public_router
from app.modules.profiles.controllers import router as profiles_router
from app.modules.dashboard.controllers import router as dashboard_router
from app.modules.programs.controllers import router as programs_router
from app.modules.admin.controllers import router as admin_router
from app.modules.coaches.controllers import router as coaches_router
from app.modules.coach_requests.controllers import router as coach_requests_router
from app.modules.programs.services import ProgramService
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.modules.users.models import User
from app.modules.fitness.models import CoachProfile

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME, version="1.0.0")

allowed_origins = [settings.FRONTEND_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(public_router)
app.include_router(profiles_router)
app.include_router(dashboard_router)
app.include_router(programs_router)
app.include_router(admin_router)
app.include_router(coaches_router)
app.include_router(coach_requests_router)


@app.on_event("startup")
def seed_phase3_data():
    db = SessionLocal()
    try:
        ProgramService(db).seed_exercises()
        admin = db.query(User).filter(User.phone == "09120000000", User.deleted_at.is_(None)).first()
        if not admin:
            db.add(User(
                full_name="Admin User",
                phone="09120000000",
                password_hash=hash_password("admin12345"),
                role="admin",
                is_active=True,
                is_verified=True,
            ))
            db.commit()

        sample_coaches = [
            ("Maya Strength", "09121111111", "Strength and muscle gain", 6, "I build simple gym plans for athletes who want stronger legs, back, and core."),
            ("Nima Mobility", "09122222222", "Mobility and recovery", 4, "I help beginners move better, reduce stiffness, and train safely."),
            ("Sara Fat Loss", "09123333333", "Fat loss and conditioning", 5, "I design realistic fat-loss plans with cardio, strength, and weekly check-ins."),
        ]
        for full_name, phone, specialty, years, bio in sample_coaches:
            coach = db.query(User).filter(User.phone == phone, User.deleted_at.is_(None)).first()
            if not coach:
                coach = User(
                    full_name=full_name,
                    phone=phone,
                    password_hash=hash_password("coach12345"),
                    role="coach",
                    is_active=True,
                    is_verified=True,
                )
                db.add(coach)
                db.flush()
            profile = db.query(CoachProfile).filter(CoachProfile.user_id == coach.id, CoachProfile.deleted_at.is_(None)).first()
            if not profile:
                db.add(CoachProfile(user_id=coach.id, specialty=specialty, experience_years=years, bio=bio))
        db.commit()
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "FitCoach backend is running", "docs": "/docs"}
