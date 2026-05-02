import pytest


# Run all async tests with asyncio automatically — no need to add
# @pytest.mark.asyncio to every test function.
def pytest_configure(config):
    config.addinivalue_line(
        "markers", "asyncio: mark test as async"
    )
