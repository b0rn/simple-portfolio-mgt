class SupabaseAuthError(Exception):
    """Base exception for Supabase authentication errors."""

    pass


class SupabaseUrlNotSetError(SupabaseAuthError):
    def __init__(self, msg="Supabase URL is not set", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)


class AnonKeyNotSetError(SupabaseAuthError):
    def __init__(self, msg="Supabase ANON KEY is not set", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)

class EmailConfirmationRequiredError(SupabaseAuthError):
    def __init__(self, msg="Email confirmation required", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)


class NoAccessTokenError(SupabaseAuthError):
    def __init__(self, msg="No access token returned", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)


class TokenInvalidError(SupabaseAuthError):
    def __init__(self, msg="Token is invalid", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)


class CantFetchUserError(SupabaseAuthError):
    def __init__(self, msg="Could not fetch user", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)
        
class SignupFailedError(SupabaseAuthError):
    def __init__(self, msg="Supabase signup failed", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)
