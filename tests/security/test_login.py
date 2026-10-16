import requests

BASE_URL = "http://localhost:8888"

def test_login_sqli():
    generic_payloads = [
        "admin' or 1=1#",
        "admin' or 1=1-- -",
        "admin\" or 1=1#",
        "admin\" or 1=1-- -"
    ]
    time_based_payloads = [
        "admin';(select 1 from pg_sleep(10))#",
        "admin';(select 1 from pg_sleep(10))-- -",
        "admin\";(select 1 from pg_sleep(10))#",
        "admin\";(select 1 from pg_sleep(10))-- -",
    ]

    t_url = BASE_URL + "/login"

    for payload in generic_payloads:
        r = requests.post(t_url, json={ "username": payload, "password": "not_a_password"})
        assert r.json()['message'] == "Incorrect Username or Password", "SQLI Detected!"
        assert r.json()['jwt'] == "", "SQLI Detected!"

    for payload in time_based_payloads:
            r = requests.post(
                t_url,
                json={ "username": payload, "password": "not_a_password"},
                timeout=20 * 1000 # 20 seconds in milliseconds
            )
            seconds = r.elapsed.total_seconds()
            assert seconds < 10, "SQLI Time-Based Detected!"
