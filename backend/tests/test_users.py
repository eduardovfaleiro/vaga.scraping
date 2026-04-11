def test_create_user(client):
    email = "edu@test.com"

    res = client.post("/users", json={
        "name": "Eduardo",
        "email": email,
        "password": "senha123",
        "skills": ["python", "fastapi"]
    })

    assert res.status_code == 201
    assert res.json()["email"] == email