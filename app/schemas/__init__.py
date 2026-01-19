from app.schemas.item import ItemResponse, ItemCreate, ItemUpdate
from app.schemas.product import (
    Category,
    CategoryCreate,
    CategoryBase,
    Product,
    ProductCreate,
    ProductUpdate,
    ProductBase,
    ProductWithHistory,
    PriceHistory,
    PriceHistoryCreate,
    PriceHistoryBase,
    TrendingProductsResponse,
    ProductSearchResponse,
)

__all__ = [
    # Item schemas (existing)
    "ItemResponse",
    "ItemCreate",
    "ItemUpdate",
    # Product schemas
    "Category",
    "CategoryCreate",
    "CategoryBase",
    "Product",
    "ProductCreate",
    "ProductUpdate",
    "ProductBase",
    "ProductWithHistory",
    "PriceHistory",
    "PriceHistoryCreate",
    "PriceHistoryBase",
    "TrendingProductsResponse",
    "ProductSearchResponse",
]
