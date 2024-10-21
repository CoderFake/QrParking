import boto3
from botocore.client import Config
from io import BytesIO
from django.conf import settings


class S3Client:
    def __init__(self):
        self.client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY,
            aws_secret_access_key=settings.AWS_SECRET_KEY,
            config=Config(signature_version="s3v4"),
            region_name=settings.AWS_REGION,
        )

    def exists(self, path):
        contents = self.client.list_objects(
            Bucket=settings.BUCKET_NAME,
        ).get("Contents", [])
        return any([c["Key"] == path for c in contents])

    def read(self, path):
        buf = BytesIO()
        self.client.download_fileobj(settings.BUCKET_NAME, path, buf)
        return buf.getvalue()

    def write(self, path, data, public=False):
        buf = BytesIO(data)
        extra_args = {"ACL": "public-read"} if public else {}
        self.client.upload_fileobj(buf, settings.BUCKET_NAME, path, ExtraArgs=extra_args)

    def delete(self, path):
        self.client.delete_object(
            Bucket=settings.BUCKET_NAME,
            Key=path,
        )

    def urlize(self, path, expiration=3600, public=False, **kwargs):
        if public:
            return f"https://{settings.BUCKET_NAME}.s3.amazonaws.com/{path}"
        else:
            return self.client.generate_presigned_url(
                "get_object",
                Params={"Bucket": settings.BUCKET_NAME, "Key": path},
                ExpiresIn=expiration,
            )
