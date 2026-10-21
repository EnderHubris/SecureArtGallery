import requests

BASE_URL = "http://localhost:8888"

def test_movement():
    for room_id in range(0, 20):
        r = requests.post(BASE_URL + "/enter_room", json={ "id": room_id })
        assert r.json()['success'] == False, "Invalid movement returned with success!"
        assert r.json()['message'] == "Could not enter at this time!", "Unauthenticated User can move between rooms!"

def test_pfp_fetching():
    payloads = [
        "/etc/passwd",
        ".env",
    ]
    for payload in payloads:
        for i in range(0,10):
            # try different path traversals
            t = ("../" * i) + payload
            r = requests.get(BASE_URL + "/image/" + t)
            assert r.status_code != 200, "LFI Detected!"

def test_employee_access():
    r = requests.get(BASE_URL + "/employee/get_rooms")
    assert r.status_code != 200, "Unauthorized Employee Access!"

def test_admin_access():
    r = requests.get(BASE_URL + "/admin/get_rooms")
    assert r.status_code != 200, "Unauthorized Admin Access!"

def test_gallery_fetching():
    payloads = [
        "/etc/passwd",
        ".env",
    ]
    for payload in payloads:
        for i in range(0,10):
            # try different path traversals
            t = ("../" * i) + payload
            r = requests.get(BASE_URL + "/gallery/" + t)
            assert r.status_code != 200, "LFI Detected!"
