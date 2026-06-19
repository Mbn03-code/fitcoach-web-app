from sqlalchemy.orm import Session
from app.modules.users.models import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_phone(self, phone: str) -> User | None:
        return self.db.query(User).filter(User.phone == phone, User.deleted_at.is_(None)).first()

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def save(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
