from dotenv import load_dotenv
import os

load_dotenv()
load_dotenv("../../.env")

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
KAFKA_TOPIC             = os.getenv("KAFKA_TOPIC", "UserInteractions")

ENVIRONMENT  = os.getenv("ENVIRONMENT", "development")
SERVICE_NAME = os.getenv("SERVICE_NAME", "click-tracker")
PORT         = int(os.getenv("PORT", 8002))