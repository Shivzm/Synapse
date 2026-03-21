from datetime import datetime, timezone
from fastapi import FastAPI
from events import ClickEvent, ViewEvent, PurchaseEvent, CartAddEvent
from kafka_producer import publish_user_interaction, _producer
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app):
    yield
    _producer.flush()

app = FastAPI(title="Click Tracker", lifespan=lifespan)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/events/click")
async def track_click(event: ClickEvent):
    """
    Fired when a user clicks a search result.
    `position` is critical — used by ML training
    to correct for position bias in click data.
    """
    event.timestamp = event.timestamp or datetime.now(timezone.utc)
    publish_user_interaction(event.model_dump())
    return {"status": "ok"}

@app.post("/events/view")
async def track_view(event: ViewEvent):
    """
    Fired when a user views an item detail page.
    `dwell_time_ms` is a strong relevance signal for ML training.
    """
    event.timestamp = event.timestamp or datetime.now(timezone.utc)
    publish_user_interaction(event.model_dump())
    return {"status": "ok"}

@app.post("/events/purchase")
async def track_purchase(event: PurchaseEvent):
    """
    Strongest positive signal for ranking models.
    Flink uses purchases to heavily weight item features.
    """
    event.timestamp = event.timestamp or datetime.now(timezone.utc)
    publish_user_interaction(event.model_dump())
    return {"status": "ok"}

@app.post("/events/cart_add")
async def track_cart_add(event: CartAddEvent):
    """
    Weaker than purchase but stronger than click.
    Sits between click and purchase in the engagement funnel.
    """
    event.timestamp = event.timestamp or datetime.now(timezone.utc)
    publish_user_interaction(event.model_dump())
    return {"status": "ok"}