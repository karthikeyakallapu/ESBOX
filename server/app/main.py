from contextlib import asynccontextmanager
from urllib.request import Request

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError, HTTPException

from fastapi.responses import JSONResponse

from app.config import settings
from app.logger import logger
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


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Get the first error only
    first_error = exc.errors()[0] if exc.errors() else None

    if first_error:
        loc = first_error.get("loc", [])
        field = loc[-1] if loc else "unknown"
        msg = first_error.get("msg", "Validation error")

        # Clean up the message - remove "Value error, " prefix if present
        if msg.startswith("Value error, "):
            msg = msg.replace("Value error, ", "")

        return JSONResponse(
            status_code=400,
            content={"message": msg}
        )

    return JSONResponse(
        status_code=400,
        content={"message": "Validation error"}
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
    )


if __name__ == "__main__" and settings.environment == "development":
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
    )
