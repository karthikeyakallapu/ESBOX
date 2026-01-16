import logging
from colorlog import ColoredFormatter


def setup_logging():
    handler = logging.StreamHandler()
    handler.setFormatter(
        ColoredFormatter(
            "%(log_color)s%(asctime)s - %(levelname)-5s%(reset)s- %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
            log_colors={
                "DEBUG": "cyan",
                "INFO": "green",
                "WARNING": "yellow",
                "ERROR": "red",
                "CRITICAL": "bold_red",
            },
        )
    )

    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
    root_logger.setLevel(logging.INFO)


setup_logging()

logger = logging.getLogger()
