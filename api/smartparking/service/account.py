from typing import Any, Dict, cast
from uuid import uuid4

from smartparking.ext.firebase.base import FirebaseAdmin
from firebase_admin.auth import delete_user
from sqlalchemy import cast as Cast
from sqlalchemy import (
    delete,
    func,
    insert,
    literal_column,
    not_,
    or_,
    select,
    union_all,
    update,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import Date, String

from .commons import Errors, Maybe, c, datetime, m, r, service


@service
async def signup(login_id: str, name: str, email: str) -> Maybe[c.Me]:

    account = await r.tx.scalar(
        select(m.Account).where(m.Account.login_id == login_id).with_for_update()
    )

    now = datetime.now()

    if account is None:

        account = await r.tx.scalar(
            insert(m.Account).returning(m.Account),
            dict(
                id=str(uuid4()),
                login_id=login_id,
                username=name,
                email=email,
                date_joined=now,
                last_login=now,
            ),
        )

    return await r.tx.get(c.Me, account.id)


@service
async def login(login_id: str) -> Maybe[c.Me]:


    account = await r.tx.scalar(select(m.Account).where(m.Account.login_id == login_id))
    now = datetime.now()

    if account is None:
        return Errors.UNAUTHORIZED

    await r.tx.execute(
        update(m.Account).where(m.Account.login_id == login_id).values(last_login=now)
    )
    await r.tx.commit()

    return await r.tx.get(c.Me, account.id)


@service
async def withdraw(me: c.Me):

    await r.tx.execute(delete(m.Account).where(m.Account.id == me.id))

    try:

        firebase = cast(FirebaseAdmin, r.firebase).app
        delete_user(me.login_id, app=firebase)
    except Exception as e:
        r.logger.warning(f"Failed to delete Firebase user {me.login_id}", exc_info=e)
