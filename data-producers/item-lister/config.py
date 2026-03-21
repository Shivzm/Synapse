from dotenv import load_dotenv
import os

# load service-level .env first, then root .env
# service values take priority over root values
load_dotenv()                          # loads ./data-producers/item-lister/.env
load_dotenv("../../.env")              # loads root .env as fallback

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
KAFKA_TOPIC             = os.getenv("KAFKA_TOPIC", "NewItems")

MINIO_ENDPOINT   = os.getenv("MINIO_ENDPOINT", "http://localhost:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
MINIO_BUCKET     = os.getenv("MINIO_BUCKET_ITEMS", "item-images")

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
SERVICE_NAME = os.getenv("SERVICE_NAME", "item-lister")
PORT = int(os.getenv("PORT", 8001))