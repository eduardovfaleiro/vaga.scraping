from fastapi import APIRouter, Depends, Response, Cookie, Request, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from services.auth import (
    send_password_reset_email,
    create_reset_token,
    reset_user_password,
    verify_password,
    verify_google_token,
    verify_github_token,
    create_access_token,
    create_refresh_token,
    refresh_access_token,
)
import crud.user as user_crud
from services.matcher import process_user_against_existing_jobs
from schemas.auth import LoginRequest, TokenResponse, ForgotPasswordRequest, ResetPasswordRequest, GoogleAuthRequest, GithubAuthRequest
from limiter import limiter


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/forgot_password")
async def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = user_crud.get_user_by_email(db, body.email)
    if user:
        token = create_reset_token(user.id)
        send_password_reset_email(user.email, token)
    return {"message": "Se esse email existir no sistema, um link para recuperação de senha será enviado para ele"}


@router.post("/reset_password")
async def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    reset_user_password(db, body.token, body.new_password)
    return {"message": "Senha redefinida com sucesso"}


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = user_crud.get_user_by_email(db, body.email)
    if not user or not user.hashed_password or not verify_password(body.password, user.hashed_password):
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


@router.post("/github", response_model=TokenResponse)
async def github_auth(body: GithubAuthRequest, response: Response, db: Session = Depends(get_db)):
    info = verify_github_token(body.code)

    user = user_crud.get_user_by_github_id(db, info["github_id"])
    if not user:
        user = user_crud.get_user_by_email(db, info["email"])
        if user:
            user.github_id = info["github_id"]
            db.commit()
        else:
            user = user_crud.create_github_user(db, info["github_id"], info["email"], info["name"])
            await process_user_against_existing_jobs(db, user)

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


@router.post("/google", response_model=TokenResponse)
async def google_auth(body: GoogleAuthRequest, response: Response, db: Session = Depends(get_db)):
    info = verify_google_token(body.credential)

    user = user_crud.get_user_by_google_id(db, info["google_id"])
    if not user:
        user = user_crud.get_user_by_email(db, info["email"])
        if user:
            user.google_id = info["google_id"]
            db.commit()
        else:
            user = user_crud.create_google_user(db, info["google_id"], info["email"], info["name"])
            await process_user_against_existing_jobs(db, user)

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
