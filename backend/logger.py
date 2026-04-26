import logging
import sys
from pythonjsonlogger.json import JsonFormatter


def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    
    import os
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    logger.setLevel(getattr(logging, log_level, logging.INFO))

    if logger.handlers:
        return logger

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter("%(asctime)s %(name)s %(levelname)s %(message)s"))
    logger.addHandler(handler)
    logger.propagate = False

    return logger
