from time import sleep
from playwright.sync_api import Page, expect

from t_utils import BASE_URL, login_as_pytest

"""
@section
Following tests are focused on general guests
"""

def test_lobby_user(page: Page):
    assert login_as_pytest(page), "Failed to login as pytest!"

    page.goto(BASE_URL)
    
    # check user info display
    expect(page.locator("span#username-display", has_text="pytest"))
    # find object with specific class and check text content
    expect(page.locator(".badge.bg-primary")).to_have_text("guest")

    # check lobby display
    expect(page.get_by_text("Welcome to the Lobby!"))
    expect(page.get_by_text("Open to Visitors"))
    expect(page.get_by_text("Occupancy 35"))

    expect(page.get_by_text("Enter Hall A"))
    expect(page.get_by_text("Enter Hall B"))

    expect(page.get_by_text("Logout"))
    expect(page.get_by_text("Login")).to_have_count(0)
    expect(page.get_by_text("Employee")).to_have_count(0)
    expect(page.get_by_text("Admin")).to_have_count(0)

# Lobby -> Hall-B -> Hall-C
def move_pytest_to_hall_c(page: Page):
    assert login_as_pytest(page), "Failed to login as pytest!"
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

def test_valid_movement(page: Page):
    assert move_pytest_to_hall_c(page), "pytest failed to travel to Hall C"

def test_rejected_movement(page: Page):
    assert move_pytest_to_hall_c(page), "pytest failed to travel to Hall C"
    page.get_by_role("button", name="Enter Restricted Hall").click()
    sleep(0.15)
    expect(page.get_by_text("Cannot enter a Restricted Area!"))
    return
