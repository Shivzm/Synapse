from dotenv import load_dotenv
import os

load_dotenv()
load_dotenv("../../.env")

CLICKHOUSE_HOST         = os.getenv("CLICKHOUSE_HOST", "localhost")
CLICKHOUSE_PORT         = int(os.getenv("CLICKHOUSE_PORT", 8123))
CLICKHOUSE_DB           = os.getenv("CLICKHOUSE_DB", "synapse")
CLICKHOUSE_USER         = os.getenv("CLICKHOUSE_USER", "default")
CLICKHOUSE_PASSWORD     = os.getenv("CLICKHOUSE_PASSWORD", "")

VESPA_ENDPOINT          = os.getenv("VESPA_ENDPOINT", "http://localhost:8080")

TRAINING_LOOKBACK_DAYS  = int(os.getenv("TRAINING_LOOKBACK_DAYS", 30))
MODEL_OUTPUT_PATH       = os.getenv("MODEL_OUTPUT_PATH", "models/ranking.onnx")
ENVIRONMENT             = os.getenv("ENVIRONMENT", "development")