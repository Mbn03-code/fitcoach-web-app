from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.exceptions import bad_request, forbidden, not_found, unauthorized
from app.core.security import (
    create_access_token,
    generate_otp_code,
    hash_otp_code,
    hash_password,
    verify_password,
)
from app.modules.auth.models import OtpCode
from app.modules.auth.repositories import OtpRepository
from app.modules.auth.sms import send_otp
from app.modules.users.models import User
from app.modules.users.repositories import UserRepository


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)
        self.otps = OtpRepository(db)

    def _create_otp(self, user: User, purpose: str) -> str:
        code = generate_otp_code()
        otp = OtpCode(
            user_id=user.id,
            phone=user.phone,
            code_hash=hash_otp_code(code),
            purpose=purpose,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES),
        )
        self.otps.create(otp)
        send_otp(user.phone, code)
        return code

    def _verify_otp(self, phone: str, code: str, purpose: str) -> User:
        user = self.users.get_by_phone(phone)
        if not user:
            not_found("User not found")

        otp = self.otps.get_latest_active(phone, purpose)
        if not otp:
            bad_request("OTP not found. Request a new code.")

        expires_at = otp.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            bad_request("OTP expired. Request a new code.")

        if otp.attempts >= otp.max_attempts:
            bad_request("Too many wrong attempts. Request a new code.")

        if otp.code_hash != hash_otp_code(code):
            otp.attempts += 1
            self.otps.save(otp)
            bad_request("Invalid OTP code")

        otp.consumed_at = datetime.now(timezone.utc)
        self.otps.save(otp)
        return user

    def register(self, data):
        if self.users.get_by_phone(data.phone):
            bad_request("Phone number already exists")
        user = User(
            full_name=data.full_name,
            phone=data.phone,
            password_hash=hash_password(data.password),
            role=data.role,
            is_verified=False,
        )
        user = self.users.create(user)
        code = self._create_otp(user, "signup")
        return {"message": "User registered. Verify your phone number.", "dev_otp": code, "phone": user.phone}

    def verify_signup(self, data):
        user = self._verify_otp(data.phone, data.code, "signup")
        user.is_verified = True
        user.phone_verified_at = datetime.now(timezone.utc)
        user = self.users.save(user)
        token = create_access_token({"sub": str(user.id), "role": user.role})
        return {"access_token": token, "token_type": "bearer", "user": user}

    def login_password(self, data):
        user = self.users.get_by_phone(data.phone)
        if not user or not verify_password(data.password, user.password_hash):
            unauthorized("Invalid phone or password")
        if not user.is_active:
            forbidden("User is inactive")
        if not user.is_verified:
            forbidden("Please verify your phone number first")
        token = create_access_token({"sub": str(user.id), "role": user.role})
        return {"access_token": token, "token_type": "bearer", "user": user}

    def request_login_code(self, data):
        user = self.users.get_by_phone(data.phone)
        if not user:
            not_found("User not found")
        if not user.is_active:
            forbidden("User is inactive")
        if not user.is_verified:
            forbidden("Please verify your phone number first")
        code = self._create_otp(user, "login")
        return {"message": "Login code created.", "dev_otp": code, "phone": user.phone}

    def login_code(self, data):
        user = self._verify_otp(data.phone, data.code, "login")
        if not user.is_active:
            forbidden("User is inactive")
        if not user.is_verified:
            forbidden("Please verify your phone number first")
        token = create_access_token({"sub": str(user.id), "role": user.role})
        return {"access_token": token, "token_type": "bearer", "user": user}
