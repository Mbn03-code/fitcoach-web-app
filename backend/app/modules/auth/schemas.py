from typing import Literal
from pydantic import BaseModel, Field
from app.modules.users.schemas import UserOut


IRAN_PHONE_PATTERN = r"^09\d{9}$"
FULL_NAME_PATTERN = r"^[A-Za-zآ-یءئؤإأۀ\s]+$"


class RegisterIn(BaseModel):
    full_name: str = Field(min_length=2, max_length=120, pattern=FULL_NAME_PATTERN)
    phone: str = Field(min_length=11, max_length=11, pattern=IRAN_PHONE_PATTERN)
    password: str = Field(min_length=8, max_length=128)
    role: Literal["athlete", "coach"] = "athlete"


class VerifySignupIn(BaseModel):
    phone: str = Field(min_length=11, max_length=11, pattern=IRAN_PHONE_PATTERN)
    code: str = Field(min_length=4, max_length=6)


class LoginPasswordIn(BaseModel):
    phone: str = Field(min_length=11, max_length=11, pattern=IRAN_PHONE_PATTERN)
    password: str = Field(min_length=8, max_length=128)


class RequestLoginCodeIn(BaseModel):
    phone: str = Field(min_length=11, max_length=11, pattern=IRAN_PHONE_PATTERN)


class LoginCodeIn(BaseModel):
    phone: str = Field(min_length=11, max_length=11, pattern=IRAN_PHONE_PATTERN)
    code: str = Field(min_length=4, max_length=6)


class MessageOut(BaseModel):
    message: str
    dev_otp: str | None = None
    phone: str | None = None


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
