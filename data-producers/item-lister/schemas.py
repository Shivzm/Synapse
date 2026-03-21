from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ItemUploadRequest(BaseModel):
    title: str
    description: str
    price: float
    category: str
    seller_id: str
    image_urls: list[str] = []

class ItemResponse(BaseModel):
    item_id: str
    title: str
    description: str
    price: float
    category: str
    seller_id: str
    image_urls: list[str]
    status: str
    created_at: datetime