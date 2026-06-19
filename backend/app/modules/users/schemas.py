from pydantic import BaseModel


class UserOut(BaseModel):
    id: int
    full_name: str
    phone: str
    role: str
    is_active: bool
    is_verified: bool

    model_config = {"from_attributes": True}
