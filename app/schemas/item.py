from pydantic import BaseModel, Field
from typing import Optional


class ItemBase(BaseModel):
    """Base schema for Item"""
    name: str = Field(..., min_length=1, max_length=100, description="Item name")
    description: Optional[str] = Field(None, max_length=500, description="Item description")
    price: float = Field(..., gt=0, description="Item price")
    is_active: bool = Field(default=True, description="Item availability status")


class ItemCreate(ItemBase):
    """Schema for creating an item"""
    pass


class ItemUpdate(BaseModel):
    """Schema for updating an item"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price: Optional[float] = Field(None, gt=0)
    is_active: Optional[bool] = None


class ItemResponse(ItemBase):
    """Schema for item response"""
    id: int = Field(..., description="Item ID")

    class Config:
        from_attributes = True
