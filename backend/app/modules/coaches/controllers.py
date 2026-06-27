from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.coaches.schemas import CoachCardOut, CoachDetailOut
from app.modules.coaches.services import CoachService

router = APIRouter(prefix="/coaches", tags=["Coaches"])


@router.get("", response_model=list[CoachCardOut])
def list_coaches(db: Session = Depends(get_db)):
    return CoachService(db).list_coaches()


@router.get("/{coach_id}", response_model=CoachDetailOut)
def coach_detail(coach_id: int, db: Session = Depends(get_db)):
    return CoachService(db).get_coach(coach_id)
