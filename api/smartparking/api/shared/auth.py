from dataclasses import dataclass
from typing import Any, Optional, Generic, TypeVar, Dict
from fastapi import Header, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi import Header, HTTPException, status
import os
from smartparking.ext.otp.base import OTPSetting, OTP
from smartparking.model.errors import Errors, Errorneous
from smartparking.resources import context as r
import smartparking.model.composite as c
from .errors import abort, abort_with
from smartparking.config import environment

Me = TypeVar('Me')
settings = environment().settings
otp_setting = OTPSetting(
    access=settings.otp.access,
    secret=settings.otp.secret,
    interval=settings.otp.interval,
    digits=settings.otp.digits
)

@dataclass
class Authorized(Generic[Me]):
    me: Me
    claims: Dict[str, Any]


class Authorization(Generic[Me]):

    async def __call__(
            self,
            authorization: Optional[str] = Header(default=None),
    ) -> Authorized[Me]:
        if not authorization:
            return Authorized(self.no_auth(), {})
        elif not authorization.startswith('Bearer '):
            abort(401, code=Errors.UNAUTHORIZED.name, message="Invalid authorization header")

        token = authorization[7:]
        try:
            claims = r.auth.verify(token)
        except Exception as e:
            abort(401, code=Errors.UNAUTHORIZED.name, message="Token verification failed")

        me = await self.authorize(claims)

        return Authorized(me, claims)

    def no_auth(self) -> Me:
        abort(401, code=Errors.UNAUTHORIZED.name, message="Bearer token is not set")

    async def authorize(self, claims: Dict[str, Any]) -> Me:
        raise NotImplementedError()


class WithToken(Authorization[None]):
    async def authorize(self, claims: Dict[str, Any]) -> None:
        return None


class WithUser(Authorization[c.Me]):
    async def authorize(self, claims: Dict[str, Any]) -> c.Me:

        from smartparking.service.account import login

        result = await login(claims['sub'])
        if isinstance(result, Errorneous):
            abort_with(401, Errors.NOT_SIGNED_UP.name, "Not signed up yet")
        return result.value  # Assuming `Maybe` has a `value` attribute for successful results


class MaybeUser(Authorization[Optional[c.Me]]):

    def no_auth(self, *args) -> Optional[c.Me]:
        return None

    async def authorize(self, claims: Dict[str, Any]) -> Optional[c.Me]:

        from smartparking.service.account import login

        result = await login(claims['sub'])
        if isinstance(result, Errorneous):
            return self.no_auth()
        return result.value


# ----------------------------------------------------------------
# Dependencies
# ----------------------------------------------------------------
with_token = WithToken()
with_user = WithUser()
maybe_user = MaybeUser()


# ----------------------------------------------------------------


class OTPAuth:
    def __init__(self):

        self.otp = OTP(otp_setting)

    async def auth_with_otp(
        self,
        api_access_key: Optional[str] = Header(None),
        api_access_token: Optional[str] = Header(None)
    ):
        if not api_access_key or not api_access_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing API access key or token"
            )

        if api_access_key != settings.otp.access:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid API access key"
            )

        is_valid = await self.otp.validate_otp(api_access_token)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired OTP"
            )

    async def auth_for_mqtt(self, api_access_key: str):

        if not api_access_key:
            raise ValueError("Missing API access key or token")

        if api_access_key != settings.otp.access:
            raise ValueError("Invalid API access key")



otp_auth_instance = OTPAuth()