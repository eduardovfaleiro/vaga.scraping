import pytest
from schemas.user import UserBase
from pydantic import ValidationError

def test_phone_validation_valid():
    # DDD + 8 digits
    user = UserBase(name="Test", email="test@example.com", title="Dev", skills=["Python"], phone="1199998888")
    assert user.phone == "551199998888"

    # DDD + 9 digits
    user = UserBase(name="Test", email="test@example.com", title="Dev", skills=["Python"], phone="11999998888")
    assert user.phone == "5511999998888"

    # With 55 prefix
    user = UserBase(name="Test", email="test@example.com", title="Dev", skills=["Python"], phone="5511999998888")
    assert user.phone == "5511999998888"

    # With formatting characters
    user = UserBase(name="Test", email="test@example.com", title="Dev", skills=["Python"], phone="(11) 99999-8888")
    assert user.phone == "5511999998888"

def test_phone_validation_invalid():
    # Too short
    with pytest.raises(ValidationError) as excinfo:
        UserBase(name="Test", email="test@example.com", title="Dev", skills=["Python"], phone="123")
    assert "telefone inválido" in str(excinfo.value)

    # International (not 55)
    with pytest.raises(ValidationError) as excinfo:
        UserBase(name="Test", email="test@example.com", title="Dev", skills=["Python"], phone="1112223334445")
    assert "apenas números do Brasil" in str(excinfo.value) or "telefone inválido" in str(excinfo.value)

def test_phone_validation_none():
    user = UserBase(name="Test", email="test@example.com", title="Dev", skills=["Python"], phone=None)
    assert user.phone is None
