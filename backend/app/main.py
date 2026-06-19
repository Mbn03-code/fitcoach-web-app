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

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME, version="1.0.0")

allowed_origins = [settings.FRONTEND_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(public_router)
app.include_router(profiles_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {"message": "FitCoach backend is running", "docs": "/docs"}
