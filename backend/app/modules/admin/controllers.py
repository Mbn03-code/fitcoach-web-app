from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.admin.schemas import (
    AdminArticleOut,
    AdminStatsOut,
    ExerciseManageIn,
    UserStatusIn,
    ArticleManageIn,
)
from app.modules.admin.services import AdminService
from app.modules.programs.schemas import ExerciseOut
from app.modules.users.models import User
from app.modules.users.schemas import UserOut

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats", response_model=AdminStatsOut)
def stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AdminService(db).stats(current_user)


@router.get("/users", response_model=list[UserOut])
def users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AdminService(db).list_users(current_user)


@router.patch("/users/{user_id}/status", response_model=UserOut)
def update_user_status(user_id: int, data: UserStatusIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AdminService(db).update_user_status(user_id, data.is_active, current_user)


@router.delete("/users/{user_id}")
def delete_user(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AdminService(db).delete_user(user_id, current_user)


@router.get("/exercises", response_model=list[ExerciseOut])
def exercises(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AdminService(db).list_exercises(current_user)


@router.post("/exercises", response_model=ExerciseOut)
def create_exercise(data: ExerciseManageIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AdminService(db).create_exercise(data, current_user)


@router.put("/exercises/{exercise_id}", response_model=ExerciseOut)
def update_exercise(exercise_id: int, data: ExerciseManageIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AdminService(db).update_exercise(exercise_id, data, current_user)


@router.delete("/exercises/{exercise_id}")
def delete_exercise(exercise_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AdminService(db).delete_exercise(exercise_id, current_user)


@router.get("/articles", response_model=list[AdminArticleOut])
def articles(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AdminService(db).list_articles(current_user)


@router.post("/articles", response_model=AdminArticleOut)
def create_article(data: ArticleManageIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AdminService(db).create_article(data, current_user)


@router.put("/articles/{article_id}", response_model=AdminArticleOut)
def update_article(article_id: int, data: ArticleManageIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AdminService(db).update_article(article_id, data, current_user)


@router.delete("/articles/{article_id}")
def delete_article(article_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AdminService(db).delete_article(article_id, current_user)
