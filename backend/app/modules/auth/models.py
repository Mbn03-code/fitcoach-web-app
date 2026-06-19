from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from app.core.base_model import TimestampMixin
from app.core.database import Base


class OtpCode(TimestampMixin, Base):
    __tablename__ = "otp_codes"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    phone = Column(String(20), index=True, nullable=False)
    code_hash = Column(String(255), nullable=False)
    purpose = Column(String(20), nullable=False)  # signup / login
    attempts = Column(Integer, default=0)
    max_attempts = Column(Integer, default=3)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    consumed_at = Column(DateTime(timezone=True), nullable=True)
