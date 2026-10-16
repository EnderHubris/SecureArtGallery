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
