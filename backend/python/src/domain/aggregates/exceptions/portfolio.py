class PortfolioNotFound(Exception):
    def __init__(self, msg="Portfolio not found", *args, **kwargs):
        super().__init__(msg, *args, **kwargs)
