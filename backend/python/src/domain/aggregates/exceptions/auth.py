class EmailAlreadyExistsError(Exception):
    def __init__(self, msg='Email already exists', *args, **kwargs):
        super().__init__(msg, *args, **kwargs)

class InvalidCredentialsError(Exception):
    def __init__(self, msg='Invalid credentials', *args, **kwargs):
        super().__init__(msg, *args, **kwargs)