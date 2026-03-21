import uuid
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from schemas import ItemUploadRequest, ItemResponse
from kafka_producer import publish_new_item, _producer
from s3_client import upload_image_to_minio, ensure_bucket

@asynccontextmanager
async def lifespan(app):
    ensure_bucket()       # runs once on startup before accepting requests
    yield                 # server is live and handling requests here
    _producer.flush()     # runs once on shutdown, drains kafka buffer

app = FastAPI(title = "Item Lister", lifespan=lifespan)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/items/upload", response_model=ItemResponse)
async def Upload_item(item: ItemUploadRequest):
    """
    Core endpoint. Seller submits item metadata.
    Publishes a NewItems event to Kafka for Flink to consume.
    """
    item_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc)

    kafka_payload = {
        "item_id": item_id,
        "title": item.title,
        "description": item.description,
        "price": item.price,
        "category": item.category,
        "seller_id": item.seller_id,
        "image_urls": item.image_urls,
        "timestamp": created_at.isoformat(),
    }
    publish_new_item(kafka_payload)

    return ItemResponse(
        item_id=item_id,
        status="indexed",
        created_at=created_at,
        **item.model_dump(),
    )

@app.post("/items/upload-with-images", response_model=ItemResponse)
async def upload_item_with_images(
    title: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    category: str = Form(...),
    seller_id: str = Form(...),
    images: list[UploadFile] = File(default=[]),
    ):
    """
    Multipart variant: accepts actual image files,
    uploads them to MinIO, then proceeds as above.
    """
    item_id = str(uuid.uuid4())
    image_urls = []

    for image in images:
        url = await upload_image_to_minio(item_id, image)
        image_urls.append(url)

    created_at = datetime.now(timezone.utc)
    kafka_payload = {
        "item_id": item_id,
        "title": title,
        "description": description,
        "price": price,
        "category": category,
        "seller_id": seller_id,
        "image_urls": image_urls,
        "timestamp": created_at.isoformat(),
    }
    publish_new_item(kafka_payload)

    return ItemResponse(
        item_id=item_id, title=title, description=description,
        price=price, category=category, seller_id=seller_id,
        image_urls=image_urls, status="indexed", created_at=created_at,
    )


@app.get("/items/{item_id}")
def get_item(item_id: str):
    """
    Lightweight lookup — mainly for debugging.
    In production, reads should go to Vespa, not here.
    """
    # TODO: query ClickHouse or a cache
    raise HTTPException(status_code=501, detail="Not yet implemented")

@app.delete("/items/{item_id}")
def delete_item(item_id: str):
    """
    Delist an item. Should publish a 'DeleteItem' Kafka event
    so Flink can remove it from Vespa and ClickHouse.
    """
    # TODO: publish delete event to Kafka
    raise HTTPException(status_code=501, detail="Not yet implemented")

@app.get("/items/seller/{seller_id}")
def get_items_by_seller(seller_id: str):
    """Returns all items listed by a given seller."""
    # TODO: query ClickHouse
    raise HTTPException(status_code=501, detail="Not yet implemented")