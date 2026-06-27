from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.coach_requests.schemas import CoachRequestCreateIn, CoachRequestDetailOut, CoachRequestOut, CoachRequestStatusIn
from app.modules.coach_requests.services import CoachRequestService
from app.modules.users.models import User

router = APIRouter(prefix="/coach-requests", tags=["Coach Requests"])


@router.post("", response_model=CoachRequestDetailOut)
def create_request(data: CoachRequestCreateIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return CoachRequestService(db).create_request(data, current_user)


@router.get("/my", response_model=list[CoachRequestOut])
def my_requests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return CoachRequestService(db).my_requests(current_user)


@router.get("/incoming", response_model=list[CoachRequestOut])
def incoming_requests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return CoachRequestService(db).incoming_requests(current_user)


@router.get("/{request_id}", response_model=CoachRequestDetailOut)
def request_detail(request_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return CoachRequestService(db).detail(request_id, current_user)


@router.patch("/{request_id}/status", response_model=CoachRequestDetailOut)
def update_status(request_id: int, data: CoachRequestStatusIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return CoachRequestService(db).update_status(request_id, data, current_user)


@router.post("/{request_id}/accept", response_model=CoachRequestDetailOut)
def accept_request(request_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return CoachRequestService(db).update_status(request_id, CoachRequestStatusIn(status="accepted"), current_user)


@router.post("/{request_id}/reject", response_model=CoachRequestDetailOut)
def reject_request(request_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return CoachRequestService(db).update_status(request_id, CoachRequestStatusIn(status="rejected"), current_user)
