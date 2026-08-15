class EngineNotBuiltError(Exception):
    """Raised when the SQLAlchemy engine/session factory has not been built."""

    def __init__(self, msg="base has not been built", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)
