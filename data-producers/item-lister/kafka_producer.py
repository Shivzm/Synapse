from confluent_kafka import Producer
from config import KAFKA_BOOTSTRAP_SERVERS, KAFKA_TOPIC, SERVICE_NAME
import json

_producer = Producer({"bootstrap.servers": KAFKA_BOOTSTRAP_SERVERS})

def _delivery_report(err, msg):
    if err:
        print(f"[{SERVICE_NAME}] Delivery failed: {err}")

def publish_new_item(item: dict):
    _producer.produce(
        topic=KAFKA_TOPIC,
        key=item.get("seller_id"),
        value=json.dumps(item, default=str),
        on_delivery=_delivery_report,
    )
    _producer.poll(0)