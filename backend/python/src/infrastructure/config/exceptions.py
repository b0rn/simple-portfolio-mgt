class SettingsNotSetError(Exception):
    """Raised when required settings are not set."""

    def __init__(self, msg="Required settings are not set", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)
