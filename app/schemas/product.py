from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CategoryBase(BaseModel):
    """Base category schema"""
    name: str
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    """Category creation schema"""
    pass


class Category(CategoryBase):
    """Category response schema"""
    id: int

    class Config:
        from_attributes = True


class PriceHistoryBase(BaseModel):
    """Base price history schema"""
    price: float
    currency: str = "USD"


class PriceHistoryCreate(PriceHistoryBase):
    """Price history creation schema"""
    product_id: int


class PriceHistory(PriceHistoryBase):
    """Price history response schema"""
    id: int
    product_id: int
    timestamp: datetime

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    """Base product schema"""
    title: str
    description: Optional[str] = None
    current_price: Optional[float] = None
    currency: str = "USD"
    image_url: Optional[str] = None
    product_url: Optional[str] = None


class ProductCreate(ProductBase):
    """Product creation schema"""
    category_id: Optional[int] = None


class ProductUpdate(BaseModel):
    """Product update schema"""
    title: Optional[str] = None
    description: Optional[str] = None
    current_price: Optional[float] = None
    image_url: Optional[str] = None
    product_url: Optional[str] = None
    category_id: Optional[int] = None


class Product(ProductBase):
    """Product response schema"""
    id: int
    category_id: Optional[int] = None
    category: Optional[Category] = None
    created_at: datetime
    updated_at: datetime
    last_scraped_at: datetime

    class Config:
        from_attributes = True


class ProductWithHistory(Product):
    """Product with price history"""
    price_history: List[PriceHistory] = []

    class Config:
        from_attributes = True


class TrendingProductsResponse(BaseModel):
    """Response schema for trending products endpoint"""
    total: int
    products: List[Product]
    category: Optional[str] = None
    last_updated: datetime


class ProductSearchResponse(BaseModel):
    """Response schema for product search"""
    total: int
    products: List[Product]
    query: str
    page: int
