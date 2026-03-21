from pydantic import BaseModel
from typing import Literal
from datetime import datetime

class BaseEvent(BaseModel):
    user_id: str
    item_id: str
    session_id: str
    query: str | None = None   # the search query that led here
    position: int | None = None  # rank position in results (for position-bias correction)
    timestamp: datetime | None = None

class ClickEvent(BaseEvent):
    event_type: Literal["click"] = "click"

class ViewEvent(BaseEvent):
    event_type: Literal["view"] = "view"
    dwell_time_ms: int | None = None  # how long they looked at the item page

class PurchaseEvent(BaseEvent):
    event_type: Literal["purchase"] = "purchase"
    price_paid: float | None = None

class CartAddEvent(BaseEvent):
    event_type: Literal["cart_add"] = "cart_add"