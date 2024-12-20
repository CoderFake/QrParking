import smartparking.service.account as as_
from smartparking.api.commons import (
    APIRouter,
    Authorized,
    Depends,
    Query,
    vr,
    with_token,
    with_user,
)

router = APIRouter()


@router.post(
    "",
    status_code=201,
    responses={
        201: {"description": "User information after successful signup."},
    },
)
async def signup(
    auth: Authorized = Depends(with_token),
) -> vr.Me:
    login_id = auth.claims.get("sub", "")
    name = auth.claims.get("name", "")
    email = auth.claims.get("email", "")

    account, point = (await as_.signup(login_id, name, email)).get()
    return vr.Me.of(account)


@router.get(
    "",
    responses={
        200: {"description": "User information."},
    },
)
async def login(
    auth: Authorized = Depends(with_user),
) -> vr.Me:

    login_id = auth.claims.get("sub", "")
    account, point = (await as_.login(login_id)).get()

    return vr.Me.of(account)


@router.delete(
    "",
    status_code=204,
    responses={
        204: {"description": "Successfully processed."},
    },
)
async def withdraw(
    auth: Authorized = Depends(with_user),
):

    await as_.withdraw(auth.me)


