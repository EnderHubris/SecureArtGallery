from playwright.sync_api import Page, expect

BASE_URL = "http://localhost:5173"

def login_as_pytest(page: Page):
    page.goto(BASE_URL + "/login")
    
    page.get_by_placeholder("Username or Email").fill("pytest")
    page.get_by_placeholder("Password").fill("pytest")

    with page.expect_response(
        lambda r: r.url.rstrip("/").endswith("/login") and r.request.method == "POST"
    ) as response_info:
        page.get_by_role("button", name="Login").click()

    response = response_info.value
    body = response.json()
    assert body["success"] and body["jwt"]
    expect(page).to_have_url(f"{BASE_URL}/")
    return True

def login_as_user(page: Page, username: str, password: str):
    page.goto(BASE_URL + "/login")
    
    page.get_by_placeholder("Username or Email").fill(username)
    page.get_by_placeholder("Password").fill(password)

    with page.expect_response(
        lambda r: r.url.rstrip("/").endswith("/login") and r.request.method == "POST"
    ) as response_info:
        page.get_by_role("button", name="Login").click()

    response = response_info.value
    body = response.json()
    assert body["success"] and body["jwt"]
    expect(page).to_have_url(f"{BASE_URL}/")
    return True
