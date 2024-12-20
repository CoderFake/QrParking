import json
from typing import Any, Optional, Literal, Union, Callable
from functools import cached_property
import jwt
from pydantic import BaseModel
import requests
from cachecontrol import CacheControl
from cryptography.x509 import load_pem_x509_certificate
from cryptography.hazmat.backends import default_backend
import firebase_admin
import firebase_admin.auth


class FirebaseSettings(BaseModel):
    project_id: str


class FirebaseAuthSettings(FirebaseSettings):
    kind: Literal['auth']


class FirebaseAdminSettings(FirebaseSettings):
    kind: Literal['admin']
    name: Optional[str]
    api_key: str
    credential: str


class FirebaseAuth:

    def __init__(self, settings: FirebaseSettings) -> None:
        self.settings = settings

    def verify(self, token: str) -> dict[str, Any]:

        kid = jwt.get_unverified_header(token).get('kid', '')
        key = kid and self.keys().get(kid, None)
        if not key:
            raise ValueError(f"Invalid Firebase kid: {kid}")

        cert = load_pem_x509_certificate(key.encode(), default_backend())

        return jwt.decode(
            token,
            cert.public_key(),  # type: ignore
            algorithms=['RS256'],
            audience=self.settings.project_id,
            issuer=f"https://securetoken.google.com/{self.settings.project_id}",
        )

    def keys(self, cache: CacheControl = CacheControl(requests.session())) -> dict[str, str]:

        response = cache.get('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com')
        response.raise_for_status()
        return response.json()


class FirebaseAdmin:
    def __init__(self, settings: FirebaseAdminSettings) -> None:
        self.settings = settings
        self.auth = FirebaseAuth(settings)

    @cached_property
    def app(self) -> firebase_admin.App:
        try:
            return firebase_admin.get_app(self.settings.name) if self.settings.name else firebase_admin.get_app()
        except ValueError:
            cred = firebase_admin.credentials.Certificate(self.settings.credential)
            return firebase_admin.initialize_app(cred,
                                                 name=self.settings.name) if self.settings.name else firebase_admin.initialize_app(
                cred)

    def generate(self, sub: str, **claims: Any) -> tuple[str, str]:
        custom_token = firebase_admin.auth.create_custom_token(
            sub,
            app=self.app,
            developer_claims=claims
        ).decode()

        response = requests.post(
            f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key={self.settings.api_key}",
            headers={'Content-Type': 'application/json'},
            data=json.dumps({
                "token": custom_token,
                "returnSecureToken": True,
            })
        )

        response.raise_for_status()

        json_response = response.json()
        try:
            return json_response['idToken'], json_response['refreshToken']
        except KeyError as e:
            raise KeyError(f"Expected token not found in response: {e}")

    def get_users(self, uids: list[str]) -> list[firebase_admin.auth.UserRecord]:
        identifiers = [firebase_admin.auth.UidIdentifier(uid) for uid in uids]
        response = firebase_admin.auth.get_users(identifiers, app=self.app)
        if not response.users:
            raise ValueError(f"User not found in Firebase: {uids}")
        return response.users
