from enum import Enum


class UserRole(str, Enum):
    athlete = "athlete"
    coach = "coach"
    admin = "admin"


class OtpPurpose(str, Enum):
    signup = "signup"
    login = "login"
