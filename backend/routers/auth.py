from fastapi import APIRouter, Depends, Response, Cookie, Request, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from services.auth import (
    verify_password,
    create_access_token,
    create_refresh_token,
    refresh_access_token,
)
import crud.user as user_crud
from schemas.auth import LoginRequest, TokenResponse
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = user_crud.get_user_by_email(db, body.email)
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 30,
    )
    return {"access_token": access_token}


@router.post("/refresh", response_model=TokenResponse)
async def refresh(refresh_token: Optional[str] = Cookie(default=None)):
    access_token = refresh_access_token(refresh_token)
    return {"access_token": access_token}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"message": "Logout realizado"}
