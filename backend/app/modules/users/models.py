from sqlalchemy import Boolean, Column, DateTime, String
from app.core.base_model import TimestampMixin
from app.core.database import Base


class User(TimestampMixin, Base):
    __tablename__ = "users"

    full_name = Column(String(120), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="athlete")
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    phone_verified_at = Column(DateTime(timezone=True), nullable=True)
