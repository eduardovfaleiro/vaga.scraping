from pydantic import BaseModel, field_validator
from typing import Optional, List
import re
from constants import DEFAULT_MATCH_THRESHOLD

class UserBase(BaseModel):
    name: str
    email: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        if not re.match(r"^[^@]+@[^@]+\.[^@]+$", v):
            raise ValueError("email inválido")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        if v is None:
            return v
        
        # Remove non-digits
        digits = re.sub(r"\D", "", v)
        
        if not digits:
            return None

        # Brazilian number validation
        # 10 digits: DDD + Number (8 digits)
        # 11 digits: DDD + Number (9 digits)
        # 12 digits: 55 + DDD + Number (8 digits)
        # 13 digits: 55 + DDD + Number (9 digits)
        
        if len(digits) in [10, 11]:
            return f"55{digits}"
        elif len(digits) in [12, 13]:
            if not digits.startswith("55"):
                raise ValueError("apenas números do Brasil são permitidos (+55)")
            return digits
        else:
            raise ValueError("telefone inválido. use o formato (XX) 99999-9999")

    title: str
    skills: List[str]
    match_threshold: float = DEFAULT_MATCH_THRESHOLD
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("senha deve ter no mínimo 8 caracteres")
        if not re.search(r"[A-Z]", v):
            raise ValueError("senha deve ter no mínimo 1 letra maiúscula")
        if not re.search(r"[0-9]", v):
            raise ValueError("senha deve ter no mínimo 1 número")
        if not re.search(r"[^A-Za-z0-9]", v):
            raise ValueError("senha deve ter no mínimo 1 caractere especial")
        return v

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    title: Optional[str] = None
    match_threshold: Optional[float] = None
    skills: Optional[List[str]] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        return UserBase.validate_phone(v)

class User(UserBase):
    id: int

    class Config:
        from_attributes = True
