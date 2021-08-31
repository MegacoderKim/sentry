import os
import sys
from collections import OrderedDict

import pytest

dist_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "src", "sentry", "static", "sentry", "dist")
)
manifest_path = os.path.join(dist_path, "manifest.json")
pytest_plugins = ["sentry.utils.pytest"]

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))


def pytest_configure(config):
    import warnings

    # XXX(dcramer): Kombu throws a warning due to transaction.commit_manually
    # being used
    warnings.filterwarnings("error", "", Warning, r"^(?!(|kombu|raven|sentry))")

    # Create an empty webpack manifest file - otherwise tests will crash if it does not exist
    os.makedirs(dist_path, exist_ok=True)

    # Only create manifest if it doesn't exist
    # (e.g. acceptance tests will have an actual manifest from webpack)
    if os.path.exists(manifest_path):
        return

    with open(manifest_path, "w+") as fp:
        fp.write("{}")


def pytest_unconfigure():
    if not os.path.exists(manifest_path):
        return

    # Clean up manifest file if contents are empty
    with open(manifest_path) as f:
        if f.read() == "{}":
            os.remove(manifest_path)


def pytest_addoption(parser):
    parser.addoption(
        "--itunes",
        action="store_true",
        help="Run iTunes tests, see tests/sentry/utils/appleconnect/itunes",
    )


def pytest_runtest_setup(item):
    if item.get_closest_marker("itunes") and not item.config.getoption("--itunes"):
        pytest.skip("Test requires --itunes")


# XXX: The below code is vendored code from https://github.com/utgwkk/pytest-github-actions-annotate-failures
# so that we can add support for pytest_rerunfailures
# retried tests will no longer be annotated in GHA
#
# Reference:
# https://docs.pytest.org/en/latest/writing_plugins.html#hookwrapper-executing-around-other-hooks
# https://docs.pytest.org/en/latest/writing_plugins.html#hook-function-ordering-call-example
# https://docs.pytest.org/en/stable/reference.html#pytest.hookspec.pytest_runtest_makereport
#
# Inspired by:
# https://github.com/pytest-dev/pytest/blob/master/src/_pytest/terminal.py


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    # execute all other hooks to obtain the report object
    outcome = yield
    report = outcome.get_result()

    # enable only in a workflow of GitHub Actions
    # ref: https://help.github.com/en/actions/configuring-and-managing-workflows/using-environment-variables#default-environment-variables
    if os.environ.get("GITHUB_ACTIONS") != "true":
        return

    try:
        # If we have the pytest_rerunfailures plugin,
        # and there are still retries to be run,
        # then do not return the error
        import pytest_rerunfailures

        if item.execution_count <= pytest_rerunfailures.get_reruns_count(item):
            return
    except ImportError:
        pass

    if report.when == "call" and report.failed:
        # collect information to be annotated
        filesystempath, lineno, _ = report.location

        # try to convert to absolute path in GitHub Actions
        workspace = os.environ.get("GITHUB_WORKSPACE")
        if workspace:
            full_path = os.path.abspath(filesystempath)
            try:
                rel_path = os.path.relpath(full_path, workspace)
            except ValueError:
                # os.path.relpath() will raise ValueError on Windows
                # when full_path and workspace have different mount points.
                # https://github.com/utgwkk/pytest-github-actions-annotate-failures/issues/20
                rel_path = filesystempath
            if not rel_path.startswith(".."):
                filesystempath = rel_path

        # 0-index to 1-index
        lineno += 1

        # get the name of the current failed test, with parametrize info
        longrepr = report.head_line or item.name

        # get the error message and line number from the actual error
        try:
            longrepr += "\n\n" + report.longrepr.reprcrash.message
            lineno = report.longrepr.reprcrash.lineno

        except AttributeError:
            pass

        print(  # noqa: B314
            _error_workflow_command(filesystempath, lineno, longrepr), file=sys.stderr
        )


def _error_workflow_command(filesystempath, lineno, longrepr):
    # Build collection of arguments. Ordering is strict for easy testing
    details_dict = OrderedDict()
    details_dict["file"] = filesystempath
    if lineno is not None:
        details_dict["line"] = lineno

    details = ",".join(f"{k}={v}" for k, v in details_dict.items())

    if longrepr is None:
        return f"\n::error {details}"
    else:
        longrepr = _escape(longrepr)
        return f"\n::error {details}::{longrepr}"


def _escape(s):
    return s.replace("%", "%25").replace("\r", "%0D").replace("\n", "%0A")
