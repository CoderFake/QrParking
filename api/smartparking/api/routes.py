import logging
import secrets
from typing import Annotated

from smartparking.config import ApplicationSettings, Environment
from smartparking.model.errors import Errors
from fastapi import APIRouter, Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from .route.connect import data, me, mqtt
from .route.internal import docs
from .shared.errors import ValidationErrorResponse, errorModel, setup_handlers

# Initialize HTTP Basic security scheme
security = HTTPBasic()

# Define an error model for authentication errors
authError = errorModel(Errors.UNAUTHORIZED, Errors.NOT_SIGNED_UP)

router = APIRouter()

def setup_api(app: FastAPI, env: Environment, logger: logging.Logger):

    router = APIRouter(
        prefix="",
        responses={
            422: {
                "model": ValidationErrorResponse,
                "description": "Validation error.",
            }
        },
    )

    router.include_router(
        prefix="/me",
        router=me.router,
        tags=["Me"],
        responses={
            401: {"model": authError, "description": "Authentication failed."},
        },
    )

    router.include_router(
        prefix="/mqtt",
        router=mqtt.router,
        tags=["Mqtt"],
        responses={
            401: {"model": authError, "description": "Authentication failed."},
        },
    )

    router.include_router(
        prefix="/data",
        router=data.router,
        tags=["Data"],
        responses={
            401: {"model": authError, "description": "Authentication failed."},
        },
    )

    # Conditionally include documentation routes if enabled in the environment settings
    if env.settings.docs.enabled:
        doc_dependencies = []

        if env.settings.docs.username:
            doc_dependencies.append(Depends(DocumentAuth(env.settings.docs)))

        router.include_router(
            prefix="/docs",
            router=docs.router,
            dependencies=doc_dependencies,
        )

    # Include the configured router into the FastAPI application
    app.include_router(router)

    # Setup application-wide error handlers
    setup_handlers(app, env.settings.errors, logger)


class DocumentAuth:
    def __init__(self, auth: ApplicationSettings.DocumentAuth) -> None:
        self.auth = auth
        self.encoded_username = auth.username.encode("utf-8")
        self.encoded_password = auth.password.encode("utf-8")

    def __call__(
        self, credentials: Annotated[HTTPBasicCredentials, Depends(security)]
    ) -> str:
        username = credentials.username.encode("utf-8")
        password = credentials.password.encode("utf-8")

        # Compare the provided credentials with the expected credentials securely
        if not (
            secrets.compare_digest(username, self.encoded_username)
            and secrets.compare_digest(password, self.encoded_password)
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password.",
                headers={"WWW-Authenticate": "Basic"},
            )

        return credentials.username
