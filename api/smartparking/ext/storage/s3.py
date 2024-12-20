from io import BytesIO
from urllib.parse import parse_qs, ParseResult
from typing import Optional
from .base import Storage

try:
    import boto3
    from botocore.exceptions import ClientError
    import logging

    logger = logging.getLogger(__name__)

    class S3Storage(Storage):

        @classmethod
        def accept(cls, scheme: str) -> bool:

            return scheme.lower() == 's3'

        def __init__(self, url: ParseResult) -> None:

            super().__init__(url)
            query_params = parse_qs(url.query)

            access_key = query_params.get('access_key', [None])[0]
            secret_key = query_params.get('secret', [None])[0]

            if access_key and secret_key:
                self.client = boto3.client(
                    's3',
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=url.netloc,
                    config=boto3.session.Config(signature_version='s3v4')
                )
            else:
                self.client = boto3.client(
                    's3',
                    region_name=url.netloc,
                    config=boto3.session.Config(signature_version='s3v4')
                )

            self.bucket = url.path.lstrip('/')
            logger.debug(f"Initialized S3Storage with bucket: {self.bucket}")

        def exists(self, path: str) -> bool:
            try:
                self.client.head_object(Bucket=self.bucket, Key=path)
                logger.debug(f"File exists: {path}")
                return True
            except ClientError as e:
                if e.response['Error']['Code'] == '404':
                    logger.debug(f"File does not exist: {path}")
                    return False
                else:
                    logger.error(f"Error checking existence of {path}: {e}")
                    raise

        def read(self, path: str) -> bytes:
            try:
                response = self.client.get_object(Bucket=self.bucket, Key=path)
                data = response['Body'].read()
                logger.info(f"Read {len(data)} bytes from {path}")
                return data
            except self.client.exceptions.NoSuchKey:
                logger.error(f"File not found: {path}")
                raise FileNotFoundError(f"The file {path} does not exist in bucket {self.bucket}.")
            except ClientError as e:
                logger.error(f"Error reading file {path}: {e}")
                raise IOError(f"An error occurred while reading the file {path}: {e}")

        def write(self, path: str, data: bytes, public: bool = False) -> int:
            try:
                extra_args = {}
                if public:
                    extra_args['ACL'] = 'public-read'

                self.client.put_object(
                    Bucket=self.bucket,
                    Key=path,
                    Body=data,
                    **extra_args
                )
                bytes_written = len(data)
                logger.info(f"Wrote {bytes_written} bytes to {path} with public={public}")
                return bytes_written
            except ClientError as e:
                logger.error(f"Error writing to file {path}: {e}")
                raise IOError(f"An error occurred while writing to the file {path}: {e}")

        def delete(self, path: str) -> None:

            try:
                self.client.delete_object(Bucket=self.bucket, Key=path)
                logger.info(f"Deleted file at {path}")
            except self.client.exceptions.NoSuchKey:
                logger.error(f"File not found for deletion: {path}")
                raise FileNotFoundError(f"The file {path} does not exist in bucket {self.bucket}.")
            except ClientError as e:
                logger.error(f"Error deleting file {path}: {e}")
                raise IOError(f"An error occurred while deleting the file {path}: {e}")

        def urlize(self, path: str, public: bool = False, expiration: int = 3600, **kwargs) -> str:

            try:
                if public:
                    url = f"https://{self.bucket}.s3.{self.client.meta.region_name}.amazonaws.com/{path}"
                    logger.debug(f"Generated public URL for {path}: {url}")
                    return url
                else:
                    url = self.client.generate_presigned_url(
                        'get_object',
                        Params={'Bucket': self.bucket, 'Key': path},
                        ExpiresIn=expiration,
                        **kwargs
                    )
                    logger.debug(f"Generated presigned URL for {path}: {url}")
                    return url
            except ClientError as e:
                logger.error(f"Error generating URL for {path}: {e}")
                raise

except ImportError as e:
    import logging
    logger = logging.getLogger(__name__)
    logger.warning("boto3 is not installed. S3Storage will not be available.")
