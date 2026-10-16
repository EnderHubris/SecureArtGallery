from playwright.sync_api import Page, expect

from t_utils import BASE_URL

"""
@section
Following tests are focused on general guests
"""

def test_default_guest(page: Page):
    page.goto(BASE_URL)
    
    # check default user info display

    # find span with id="username-display"
    expect(page.locator("span#username-display", has_text="guest"))
    # find object with specific class and check text content
    expect(page.locator(".badge.bg-primary")).to_have_text("guest")

    # check default lobby display
    expect(page.get_by_text("Welcome to the Lobby!"))
    expect(page.get_by_text("Open to Visitors"))
    expect(page.get_by_text("Occupancy 15"))
    expect(page.get_by_text("There are no adjoining rooms."))

    expect(page.get_by_text("Login"))
    expect(page.get_by_text("Logout")).to_have_count(0)
    expect(page.get_by_text("Employee")).to_have_count(0)
    expect(page.get_by_text("Admin")).to_have_count(0)

def test_login(page: Page):
    page.goto(BASE_URL + "/register")

    # prepare form values
    page.get_by_placeholder("Username").fill("pytest")
    page.get_by_placeholder("Email").fill("pytest@pytest.htb")
    page.get_by_placeholder("Password").fill("pytest")

    # wait for the login request so we can inspect what was sent and returned
    with page.expect_response(
        lambda r: r.url.rstrip("/").endswith("/register") and r.request.method == "POST"
    ) as response_info:
        page.get_by_role("button", name="Register").click()

    response = response_info.value
    body = response.json()
    if body["success"]:
        expect(page.get_by_role("success")).to_have_text(body["message"])
        expect(page).to_have_url(f"{BASE_URL}/login")
    else:
        # triggers when server failure or existing account
        # occurrs
        expect(page.get_by_role("alert")).to_have_text(body["message"])
        expect(page).to_have_url(f"{BASE_URL}/register")

def test_login_fail(page: Page):
    page.goto(BASE_URL + "/login")

    page.get_by_placeholder("Username or Email").fill("anon")
    page.get_by_placeholder("Password").fill("anon")

    with page.expect_response(
        lambda r: r.url.rstrip("/").endswith("/login") and r.request.method == "POST"
    ) as response_info:
        page.get_by_role("button", name="Login").click()

    response = response_info.value
    body = response.json()
    expect(page.get_by_role("alert")).to_have_text(body["message"])
    expect(page).to_have_url(f"{BASE_URL}/login")
