import logging
from colorlog import ColoredFormatter


def setup_logging(log_level: str = "INFO"):
    """
    Setup colored logging with configurable log level.

    Args:
        log_level: Log level as string (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
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

    # Convert string log level to logging level
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)
    root_logger.setLevel(numeric_level)

    print(f"🔧 Logger initialized with level: {log_level.upper()}")


# Initialize with INFO by default, will be reconfigured in main.py with config value
setup_logging()

logger = logging.getLogger()
