from sqlalchemy.orm import Session
from app.modules.users.repositories import UserRepository


class UserService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def find_by_phone(self, phone: str):
        return self.repo.get_by_phone(phone)
