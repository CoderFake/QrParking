from dataclasses import dataclass
from typing import Any, Optional, Generic, TypeVar, Dict
from fastapi import Header, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from smartparking.model.errors import Errors, Errorneous
from smartparking.resources import context as r
import smartparking.model.composite as c
from .errors import abort, abort_with

Me = TypeVar('Me')


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
