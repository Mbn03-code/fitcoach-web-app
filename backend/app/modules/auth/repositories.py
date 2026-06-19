from sqlalchemy.orm import Session
from app.modules.auth.models import OtpCode


class OtpRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, otp: OtpCode) -> OtpCode:
        self.db.add(otp)
        self.db.commit()
        self.db.refresh(otp)
        return otp

    def get_latest_active(self, phone: str, purpose: str) -> OtpCode | None:
        return (
            self.db.query(OtpCode)
            .filter(
                OtpCode.phone == phone,
                OtpCode.purpose == purpose,
                OtpCode.consumed_at.is_(None),
                OtpCode.deleted_at.is_(None),
            )
            .order_by(OtpCode.id.desc())
            .first()
        )

    def save(self, otp: OtpCode) -> OtpCode:
        self.db.add(otp)
        self.db.commit()
        self.db.refresh(otp)
        return otp
