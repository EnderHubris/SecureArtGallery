from time import sleep
from playwright.sync_api import Page, expect

from os import getenv
from dotenv import load_dotenv
load_dotenv()

adm_user = getenv("ADM_USERNAME")
adm_pass = getenv("ADM_PASSWORD")

assert adm_user != None, "Undefined ADM_USERNAME"
assert adm_pass != None, "Undefined ADM_PASSWORD"

from t_utils import BASE_URL, login_as_user

# Lobby -> Hall-B -> Hall-C
def move_to_hall_c(page: Page):
    assert login_as_user(page, adm_user, adm_pass), f"Failed to login as {adm_user}!"
    page.goto(BASE_URL)

    expect(page.get_by_text("Welcome to the Lobby!"))
    page.get_by_role("button", name="Enter Hall B").click()
    sleep(0.5)

    expect(page.get_by_text("Welcome to the Hall B!"))
    page.get_by_role("button", name="Enter Hall C").click()
    sleep(0.5)
    
    expect(page.get_by_text("Welcome to the Hall C!"))
    expect(page.get_by_role("button", name="Enter Restricted Hall"))
    return True

"""
@section
Following tests are focused on admin perspective
"""
def test_admin_login(page: Page):
    assert login_as_user(page, adm_user, adm_pass), f"Failed to login as {adm_user}!"
    page.goto(BASE_URL)

    # find span with id="username-display"
    expect(page.locator("span#username-display", has_text=adm_user))
    # find object with specific class and check text content
    expect(page.locator(".badge.bg-danger")).to_have_text(adm_user)

    expect(page.get_by_text("Logout"))
    expect(page.get_by_text("Admin"))
    expect(page.get_by_text("Login")).to_have_count(0)
    expect(page.get_by_text("Employee")).to_have_count(0)

def test_restricted_access(page: Page):
    assert move_to_hall_c(page), "Failed to travel to Hall C"
    page.get_by_role("button", name="Enter Restricted Hall").click()
    sleep(0.15)
    expect(page.get_by_text("Welcome to the Restricted Hall!"))

def test_admin_panel(page: Page):
    assert login_as_user(page, adm_user, adm_pass), f"Failed to login as {adm_user}!"
    page.goto(BASE_URL + "/admin")

    expect(page.get_by_text("Admin Panel"))

    tabs = page.locator("ul.nav-tabs button.nav-link")
    expect(tabs).to_have_count(4)
    expect(tabs).to_have_text(["Manage Gallary", "Create Employee", "Users", "Action Logs"])

def test_admin_subpanels(page: Page):
    assert login_as_user(page, adm_user, adm_pass), f"Failed to login as {adm_user}!"
    targets = [
        ("manage", [ "Room Overview", "Gallery Images", "Add Content" ]),
        ("create", [ "Username", "Email", "Role", "Password" ]),
        ("users", [ "Change Role", "refresh" ]),
        ("logs", [ "Action Logs", "ENTERED", "IP Address" ])
    ]
    for t in targets:
        tab, words = t
        page.goto(BASE_URL + f"/admin?tab={tab}")
        for w in words:
            expect(page.get_by_text(w))
