import json
from confluent_kafka import Producer

KAFKA_BOOTSTRAP_SERVERS = "localhost:9092"
TOPIC = "UserInteractions"

_producer = Producer({"bootstrap.servers": KAFKA_BOOTSTRAP_SERVERS})

def _delivery_report(err, msg):
    if err:
        print(f"[click-tracker] Delivery failed for {msg.key()}: {err}")

def publish_user_interaction(event: dict):
    _producer.produce(
        topic=TOPIC,
        key=event.get("user_id"),          # partition by user_id so Flink gets all events
        value=json.dumps(event, default=str),  # default=str handles datetime serialization
        on_delivery=_delivery_report,
    )
    _producer.poll(0)   # trigger delivery callbacks without blocking