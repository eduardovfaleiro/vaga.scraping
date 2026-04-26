import os
import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

load_dotenv(dotenv_path=".env.test")

from database import Base, get_db
from main import app

# StaticPool garante que create_all e as sessions usem a mesma conexão em memória
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=engine)

VALID_PASSWORD = "Senha123!"


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    """Limpa o storage do rate limiter antes de cada teste para evitar
    que chamadas acumuladas entre testes disparem o limite."""
    from limiter import limiter
    limiter._storage.reset()

    yield


@pytest.fixture(autouse=True)
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


def make_user_payload(email="user@test.com", **kwargs):
    payload = {
        "name": "Test User",
        "email": email,
        "password": VALID_PASSWORD,
        "title": "Developer",
        "skills": ["python", "fastapi"],
    }
    payload.update(kwargs)
    return payload


@pytest.fixture
def auth_user(client):
    """Cria um usuário, faz login e retorna dict com id e headers."""
    payload = make_user_payload()
    res = client.post("/users", json=payload)
    assert res.status_code == 201, res.json()
    user_id = res.json()["id"]

    login_res = client.post(
        "/auth/login",
        json={"email": payload["email"], "password": payload["password"]},
    )
    assert login_res.status_code == 200, login_res.json()
    token = login_res.json()["access_token"]

    return {
        "id": user_id,
        "headers": {"Authorization": f"Bearer {token}"},
        "payload": payload,
    }
