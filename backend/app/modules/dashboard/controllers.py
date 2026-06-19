from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.dashboard.schemas import DashboardOut
from app.modules.fitness.models import Program, WorkoutLog
from app.modules.profiles.services import ProfileService
from app.modules.users.models import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/me", response_model=DashboardOut)
def my_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = ProfileService(db).get_my_profile(current_user)

    if current_user.role == "athlete":
        program_count = db.query(Program).filter(Program.athlete_id == current_user.id, Program.deleted_at.is_(None)).count()
        completed_weeks = db.query(WorkoutLog).filter(WorkoutLog.athlete_id == current_user.id, WorkoutLog.completed.is_(True)).count()
        stats = [
            {"label": "Assigned programs", "value": program_count},
            {"label": "Completed weeks", "value": completed_weeks},
            {"label": "Profile", "value": "Complete" if profile["is_complete"] else "Incomplete"},
        ]
        message = "Welcome to your athlete dashboard."
        next_step = "Complete your profile so a coach can create a better plan for you."
    elif current_user.role == "coach":
        program_count = db.query(Program).filter(Program.coach_id == current_user.id, Program.deleted_at.is_(None)).count()
        stats = [
            {"label": "Created programs", "value": program_count},
            {"label": "Profile", "value": "Complete" if profile["is_complete"] else "Incomplete"},
            {"label": "Role", "value": "Coach"},
        ]
        message = "Welcome to your coach dashboard."
        next_step = "Complete your coach profile so athletes can understand your specialty."
    else:
        stats = [
            {"label": "Role", "value": current_user.role},
            {"label": "Profile", "value": "Admin"},
        ]
        message = "Welcome to your admin dashboard."
        next_step = "Use admin tools in the next phase."

    return {"profile": profile, "message": message, "next_step": next_step, "stats": stats}
