from slowapi import Limiter
from slowapi.util import get_remote_address

# Rate limiter instance — import from this module in routers to avoid circular imports
limiter = Limiter(key_func=get_remote_address)