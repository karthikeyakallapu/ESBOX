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

    # Convert string log level to logging level
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)

    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
    root_logger.setLevel(numeric_level)

    # Update all existing loggers to use the new level
    for name in logging.root.manager.loggerDict:
        logger_instance = logging.getLogger(name)
        logger_instance.setLevel(numeric_level)

    # Print startup message with actual effective level
    effective_level = logging.getLevelName(root_logger.level)
    print(f"🔧 Logger initialized with level: {log_level.upper()} (effective: {effective_level})")

    # Also log it using the logger itself
    root_logger.debug(f"DEBUG logging is enabled for level: {log_level.upper()}")
    root_logger.info(f"Logger configuration complete - Level set to {log_level.upper()}")


# Initialize with INFO by default, will be reconfigured in main.py with config value
setup_logging()

logger = logging.getLogger()
