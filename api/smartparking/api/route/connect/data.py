import smartparking.service.data as ps
from smartparking.api.commons import (
    APIRouter,
    Authorized,
    otp_auth_instance,
    Depends,
    Errors,
    Query,
    Request,
    URLFor,
    abort_with,
    c,
    errorModel,
    vq,
    vr,
    with_user,
)
from smartparking.api.shared.schema import SelfContainedGenerateSchema

router = APIRouter()

@router.get(
    "/parking-infor/{parking_id}",
    status_code=200,
    responses={
        200: {"description": "Parking information."},
        404: {"description": "Parking not found."},
    },
)
async def get_parking_infor(
    parking_id: str,
    _: None =  Depends(otp_auth_instance.auth_with_otp),
) -> vr.ParkingInfor:

    parking = await ps.get_parking_infor(str(parking_id))

    if not parking:
        abort_with(status=404, message="Parking not found.")

    parking_infor = vr.ParkingInfor.of(parking.value)
    return parking_infor




@router.get(
    "/user-data",
    status_code=200,
    responses={
        200: {"description": "User data."},
        404: {"description": "User not found."},
    },
)
async def get_user_data(
    _: None = Depends(otp_auth_instance.auth_with_otp),
) -> vr.UserData:

    user_data = await ps.get_user_data()
    if not user_data:
        abort_with(status=404, message="User not found.")

    return vr.UserData.of(user_data.value)


# @router.post(
#     "/images",
#     status_code=201,
#     openapi_extra={
#         "requestBody": {
#             "content": {
#                 "multipart/form-data": {
#                     "schema": vq.CreateResumeBody.model_json_schema(
#                         schema_generator=SelfContaindGenerateSchema
#                     ),
#                     "encoding": {
#                         "photo": {
#                             "contentType": ["image/png", "image/jpeg"],
#                         },
#                     },
#                 },
#             },
#         },
#     },
#     responses={
#         201: {"description": ""},
#     },
# )
