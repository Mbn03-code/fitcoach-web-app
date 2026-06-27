from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.programs.schemas import (
    AthleteOptionOut,
    CompleteWeekIn,
    ExerciseOut,
    ProgramCreateIn,
    ProgramDetailOut,
    ProgramFromRequestIn,
    ProgramListItemOut,
    ProgramUpdateIn,
)
from app.modules.programs.services import ProgramService
from app.modules.users.models import User

router = APIRouter(prefix="/programs", tags=["Programs"])


@router.get("/exercises", response_model=list[ExerciseOut])
def exercises(db: Session = Depends(get_db)):
    return ProgramService(db).list_exercises()


@router.get("/athletes", response_model=list[AthleteOptionOut])
def athletes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return ProgramService(db).list_athletes(current_user)


@router.get("", response_model=list[ProgramListItemOut])
def my_programs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return ProgramService(db).list_my_programs(current_user)


@router.post("", response_model=ProgramDetailOut)
def create_program(data: ProgramCreateIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return ProgramService(db).create_program(data, current_user)


@router.post("/from-request/{request_id}", response_model=ProgramDetailOut)
def create_program_from_request(request_id: int, data: ProgramFromRequestIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return ProgramService(db).create_program_from_request(request_id, data, current_user)


@router.get("/{program_id}", response_model=ProgramDetailOut)
def detail(program_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return ProgramService(db).get_detail(program_id, current_user)


@router.put("/{program_id}", response_model=ProgramDetailOut)
def update_program(program_id: int, data: ProgramUpdateIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return ProgramService(db).update_program(program_id, data, current_user)


@router.delete("/{program_id}")
def delete_program(program_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return ProgramService(db).delete_program(program_id, current_user)


@router.post("/{program_id}/complete-week", response_model=ProgramDetailOut)
def complete_week(program_id: int, data: CompleteWeekIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return ProgramService(db).complete_week(program_id, data, current_user)
