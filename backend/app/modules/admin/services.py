from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.exceptions import bad_request, forbidden, not_found
from app.modules.fitness.models import Article, Exercise, Program, WorkoutLog
from app.modules.users.models import User


class AdminService:
    def __init__(self, db: Session):
        self.db = db

    def _require_admin(self, current_user: User) -> None:
        if current_user.role != "admin":
            forbidden("Admin access required")

    def stats(self, current_user: User) -> dict:
        self._require_admin(current_user)
        alive_users = self.db.query(User).filter(User.deleted_at.is_(None))
        return {
            "total_users": alive_users.count(),
            "active_users": alive_users.filter(User.is_active.is_(True)).count(),
            "verified_users": alive_users.filter(User.is_verified.is_(True)).count(),
            "athletes": alive_users.filter(User.role == "athlete").count(),
            "coaches": alive_users.filter(User.role == "coach").count(),
            "admins": alive_users.filter(User.role == "admin").count(),
            "programs": self.db.query(Program).filter(Program.deleted_at.is_(None)).count(),
            "exercises": self.db.query(Exercise).filter(Exercise.deleted_at.is_(None)).count(),
            "articles": self.db.query(Article).filter(Article.deleted_at.is_(None)).count(),
            "completed_weeks": self.db.query(WorkoutLog).filter(WorkoutLog.completed.is_(True)).count(),
        }

    def list_users(self, current_user: User):
        self._require_admin(current_user)
        return self.db.query(User).filter(User.deleted_at.is_(None)).order_by(User.created_at.desc()).all()

    def update_user_status(self, user_id: int, is_active: bool, current_user: User):
        self._require_admin(current_user)
        user = self.db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()
        if not user:
            not_found("User not found")
        if user.id == current_user.id and not is_active:
            bad_request("You cannot deactivate your own admin account")
        user.is_active = is_active
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete_user(self, user_id: int, current_user: User):
        self._require_admin(current_user)
        user = self.db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()
        if not user:
            not_found("User not found")
        if user.id == current_user.id:
            bad_request("You cannot delete your own admin account")
        user.deleted_at = datetime.now(timezone.utc)
        self.db.commit()
        return {"message": "User removed"}

    def list_exercises(self, current_user: User):
        self._require_admin(current_user)
        return self.db.query(Exercise).filter(Exercise.deleted_at.is_(None)).order_by(Exercise.name.asc()).all()

    def create_exercise(self, data, current_user: User):
        self._require_admin(current_user)
        exercise = Exercise(name=data.name, target_muscle=data.target_muscle, description=data.description)
        self.db.add(exercise)
        self.db.commit()
        self.db.refresh(exercise)
        return exercise

    def update_exercise(self, exercise_id: int, data, current_user: User):
        self._require_admin(current_user)
        exercise = self.db.query(Exercise).filter(Exercise.id == exercise_id, Exercise.deleted_at.is_(None)).first()
        if not exercise:
            not_found("Exercise not found")
        exercise.name = data.name
        exercise.target_muscle = data.target_muscle
        exercise.description = data.description
        self.db.commit()
        self.db.refresh(exercise)
        return exercise

    def delete_exercise(self, exercise_id: int, current_user: User):
        self._require_admin(current_user)
        exercise = self.db.query(Exercise).filter(Exercise.id == exercise_id, Exercise.deleted_at.is_(None)).first()
        if not exercise:
            not_found("Exercise not found")
        exercise.deleted_at = datetime.now(timezone.utc)
        self.db.commit()
        return {"message": "Exercise removed"}

    def list_articles(self, current_user: User):
        self._require_admin(current_user)
        return self.db.query(Article).filter(Article.deleted_at.is_(None)).order_by(Article.id.asc()).all()

    def create_article(self, data, current_user: User):
        self._require_admin(current_user)
        if self.db.query(Article).filter(Article.slug == data.slug, Article.deleted_at.is_(None)).first():
            bad_request("Article slug already exists")
        article = Article(
            title=data.title,
            read_time=data.read_time,
            slug=data.slug,
            summary=data.summary,
            content=data.content,
        )
        self.db.add(article)
        self.db.commit()
        self.db.refresh(article)
        return article

    def update_article(self, article_id: int, data, current_user: User):
        self._require_admin(current_user)
        article = self.db.query(Article).filter(Article.id == article_id, Article.deleted_at.is_(None)).first()
        if not article:
            not_found("Article not found")
        existing = self.db.query(Article).filter(Article.slug == data.slug, Article.id != article.id, Article.deleted_at.is_(None)).first()
        if existing:
            bad_request("Article slug already exists")
        article.title = data.title
        article.read_time = data.read_time
        article.slug = data.slug
        article.summary = data.summary
        article.content = data.content
        self.db.commit()
        self.db.refresh(article)
        return article

    def delete_article(self, article_id: int, current_user: User):
        self._require_admin(current_user)
        article = self.db.query(Article).filter(Article.id == article_id, Article.deleted_at.is_(None)).first()
        if not article:
            not_found("Article not found")
        article.deleted_at = datetime.now(timezone.utc)
        self.db.commit()
        return {"message": "Article removed"}
