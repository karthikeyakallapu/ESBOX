from contextlib import asynccontextmanager
from urllib.request import Request

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from fastapi.responses import JSONResponse

from app.config import settings
from app.logger import logger
from app.api.v1.router import router as api_router
from app.db.db import check_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await check_db()
    logger.info("Started server on port {}".format(settings.port))
    yield
    logger.info("Stopping Server")


app = FastAPI(title=settings.title, version=settings.version, lifespan=lifespan)

app.include_router(api_router, prefix="/api/v1")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"])


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        loc = error.get("loc", [])
        error_field = loc[1] if len(loc) > 1 else loc[0] if loc else None
        errors.append({
            "error_message": error.get("msg", ""),
            "error_field": error_field
        })
    return JSONResponse(
        status_code=400,
        content={"errors": errors}
    )


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
    )
