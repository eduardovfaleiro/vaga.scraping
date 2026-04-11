from fastapi.testclient import TestClient
from sqlalchemy import create_engine

import os                                                                                                                                                                         
os.environ["DATABASE_URL"] = "sqlite:///:memory:" 

from database import Base
from sqlalchemy.orm import sessionmaker

import pytest
from main import app

engine = create_engine(os.getenv("DATABASE_URL"), connect_args={"check_same_thread": False})   

TestingSessionLocal = sessionmaker(bind=engine)

@pytest.fixture(autouse=True)                                                                                                                                                       
def db():
    Base.metadata.create_all(bind=engine) # Gera todas as tabelas com base nos models que usam a classe Base
    session = TestingSessionLocal()
    yield session # Lança pro pytest conseguir adminstrar a session (rollback, close, etc)
    session.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db):
    def override_get_db():
        yield db
    app.dependency_overrides['get_db'] = override_get_db
    return TestClient(app)