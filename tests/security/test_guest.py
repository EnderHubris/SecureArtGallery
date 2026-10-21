import requests
import pytest

BACKEND_URL = "http://localhost:8888"
BASE_URL = "http://localhost:5173"

session = requests.Session()
files = {
    "username": (None, "pytest"),
    "email": (None, "pytest@pytest.htb"),
    "password": (None, "pytest"),
}
# ensure the account is created
session.post(BACKEND_URL + "/register", files=files)

# gain a JWT session
session.post(BACKEND_URL + "/login", json={ "username": "pytest", "password": "pytest"})
base_req = session.post(BACKEND_URL + "/info")
userInfo = base_req.json()

if userInfo['user']['username'] != "pytest":
    pytest.exit("[-] Guest-User login failed!", returncode=1)
print("[+] Successful Login as guest (pytest)")
session.get(BASE_URL)

def test_guest_movement():
    global session

    # from lobby (1) the adjacent rooms are id's 2, 3
    for room_id in range(4, 20):
        r = session.post(BACKEND_URL + "/enter_room", json={ "id": room_id })
        result = r.json()
        assert result['success'] == False, "Invalid movement returned with success!"
        assert result['message'] == "Cannot enter a non-adjacent room!", "Unauthenticated User can move between rooms!"

def test_employee_access():
    global session

    r = session.get(BACKEND_URL + "/employee/get_rooms")
    assert r.status_code != 200, "Unauthorized Employee Access!"

def test_admin_access():
    global session

    r = session.get(BACKEND_URL + "/admin/get_rooms")
    assert r.status_code != 200, "Unauthorized Admin Access!"

def test_gallery_fetching():
    global session

    payloads = [
        "/etc/passwd",
        ".env",
    ]
    for payload in payloads:
        for i in range(0,10):
            # try different path traversals
            t = ("../" * i) + payload
            r = session.get(BACKEND_URL + "/gallery/" + t)
            assert r.status_code != 200, "LFI Detected!"
