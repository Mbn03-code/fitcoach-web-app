from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.auth.schemas import (
    LoginCodeIn,
    LoginPasswordIn,
    MessageOut,
    RegisterIn,
    RequestLoginCodeIn,
    TokenOut,
    VerifySignupIn,
)
from app.modules.auth.services import AuthService
from app.modules.users.models import User
from app.modules.users.schemas import UserOut

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=MessageOut)
def register(data: RegisterIn, db: Session = Depends(get_db)):
    return AuthService(db).register(data)


@router.post("/verify-signup", response_model=TokenOut)
def verify_signup(data: VerifySignupIn, db: Session = Depends(get_db)):
    return AuthService(db).verify_signup(data)


@router.post("/login-password", response_model=TokenOut)
def login_password(data: LoginPasswordIn, db: Session = Depends(get_db)):
    return AuthService(db).login_password(data)


@router.post("/request-login-code", response_model=MessageOut)
def request_login_code(data: RequestLoginCodeIn, db: Session = Depends(get_db)):
    return AuthService(db).request_login_code(data)


@router.post("/login-code", response_model=TokenOut)
def login_code(data: LoginCodeIn, db: Session = Depends(get_db)):
    return AuthService(db).login_code(data)


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
