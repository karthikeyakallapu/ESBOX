from contextlib import asynccontextmanager
from urllib.request import Request

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError, HTTPException

from fastapi.responses import JSONResponse

from app.config import settings
from app.logger import logger, setup_logging

# Reconfigure logger with log_level from settings
setup_logging(settings.log_level)

from app.api.v1.router import router as api_router
from app.db.db import check_db
from app.services.telegram.client_manager import telegram_client_manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    await check_db()
    if settings.environment == "development" :
        logger.info("Started server on port {}".format(settings.port))
    else :
        logger.info("Started App server")
    yield
    logger.info("Stopping Server - Cleaning up Telegram clients...")
    await telegram_client_manager.clean_up_all_local_cache()
    logger.info("Server stopped")


app = FastAPI(title=settings.title, version=settings.version, lifespan=lifespan)

app.include_router(api_router, prefix="/api/v1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """
    Ensure all HTTPException details are returned as 'message' to the client
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle request validation errors with detailed field-level information
    """
    errors = []

    for error in exc.errors():
        loc = error.get("loc", [])
        source = loc[0] if loc else "unknown"  # query/body/path
        field = loc[-1] if loc else "unknown"
        msg = error.get("msg", "Validation error")

        # Clean up the message - remove "Value error, " prefix if present
        if msg.startswith("Value error, "):
            msg = msg.replace("Value error, ", "")

        errors.append({
            "field": field,
            "source": source,
            "message": msg
        })

    return JSONResponse(
        status_code=422,
        content={
            "message": "Validation error",
            "errors": errors
        }
    )



if __name__ == "__main__" and settings.environment == "development":
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
    )
