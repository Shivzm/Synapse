import boto3
from botocore.client import Config
from fastapi import UploadFile
from config import MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET

s3 = boto3.client(
    "s3",
    endpoint_url=MINIO_ENDPOINT,
    aws_access_key_id=MINIO_ACCESS_KEY,
    aws_secret_access_key=MINIO_SECRET_KEY,
    config=Config(signature_version="s3v4"),
)

def ensure_bucket():
    existing = [b["Name"] for b in s3.list_buckets()["Buckets"]]
    if MINIO_BUCKET not in existing:
        s3.create_bucket(Bucket=MINIO_BUCKET)

async def upload_image_to_minio(item_id: str, image: UploadFile) -> str:
    contents = await image.read()
    key = f"items/{item_id}/{image.filename}"
    s3.put_object(
        Bucket=MINIO_BUCKET,
        Key=key,
        Body=contents,
        ContentType=image.content_type,
    )
    return f"{MINIO_ENDPOINT}/{MINIO_BUCKET}/{key}"