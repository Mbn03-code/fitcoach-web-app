from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.profiles.schemas import AthleteProfileIn, CoachProfileIn, MyProfileOut
from app.modules.profiles.services import ProfileService
from app.modules.users.models import User

router = APIRouter(prefix="/profiles", tags=["Profiles"])


@router.get("/me", response_model=MyProfileOut)
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return ProfileService(db).get_my_profile(current_user)


@router.put("/athlete", response_model=MyProfileOut)
def update_athlete_profile(
    data: AthleteProfileIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return ProfileService(db).update_athlete_profile(current_user, data)


@router.put("/coach", response_model=MyProfileOut)
def update_coach_profile(
    data: CoachProfileIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return ProfileService(db).update_coach_profile(current_user, data)
