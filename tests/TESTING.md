# Testing the Secure Gallary
*The following command instructions listed in this documentation are written under the context of being within the same directory this file is present in.*

Test files follow the naming format `test_<number>_<context>.py` this is to ensure
pytest executes the test files in a particular order, for example the [functional tests](#functional)
are best ran in the order of testing registration first before logging in
and testing authenticated views, this ensures the test-user exists in the
database before attempting actual authentication.

## Preparing Environment
This test-suite is focused on Python because it's simple and does
general-purpose scripting very well.

To prepare your python environment it is highly recommended that
you create a `virtual environment` so you can install the required
packages using pip.
```console
python3 -m venv <dir>
source <dir>/bin/activate
pip install -r requirements.txt
```

### Functional
Functional tests are written using [playwright](https://playwright.dev/python/docs/intro) a popular and maintained library used for web-driver based testing.

To run the test-suite.
```console
cd functional
pytest
```

### Security
