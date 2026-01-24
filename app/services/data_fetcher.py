import logging
from datetime import datetime
from typing import Dict, List, Optional

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Category as CategoryModel
from app.models import PriceHistory as PriceHistoryModel
from app.models import Product as ProductModel


logger = logging.getLogger(__name__)


DEFAULT_CATEGORIES = [
    "smartphones",
    "laptops",
    "home-decoration",
    "tops",
    "sports-accessories",
]


class ProductDataFetcher:
    def __init__(self, base_url: Optional[str] = None) -> None:
        self.base_url = base_url or settings.dummyjson_base_url

    async def fetch_categories(self) -> List[str]:
        url = f"{self.base_url}/products/category-list"
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(url)
            response.raise_for_status()
            payload = response.json()
        if isinstance(payload, list):
            return payload
        return []

    async def fetch_products(self, category: str, limit: int = 20) -> List[Dict[str, object]]:
        url = f"{self.base_url}/products/category/{category}"
        params = {"limit": str(limit)}
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            payload = response.json()

        products = payload.get("products", [])
        if not isinstance(products, list):
            return []
        return products

    def parse_product_data(self, raw_data: Dict[str, object], category_name: str) -> Optional[Dict[str, object]]:
        title = raw_data.get("title")
        if not title:
            return None

        price = raw_data.get("price")
        product_id = raw_data.get("id")
        product_url = None
        if product_id is not None:
            product_url = f"{self.base_url}/products/{product_id}"

        return {
            "title": str(title).strip(),
            "description": raw_data.get("description"),
            "current_price": float(price) if price is not None else None,
            "currency": "USD",
            "image_url": raw_data.get("thumbnail"),
            "product_url": product_url,
            "category_name": category_name,
        }

    def save_to_database(self, products: List[Dict[str, object]], db: Session) -> int:
        updated_count = 0

        for product_data in products:
            if not product_data:
                continue

            category_name = product_data.pop("category_name")
            category_obj = db.query(CategoryModel).filter(CategoryModel.name == category_name).first()
            if not category_obj:
                category_obj = CategoryModel(
                    name=category_name,
                    description=f"{category_name} products",
                )
                db.add(category_obj)
                db.flush()

            product_url = product_data.get("product_url")
            if product_url:
                existing_product = (
                    db.query(ProductModel).filter(ProductModel.product_url == product_url).first()
                )
            else:
                existing_product = None

            if not existing_product:
                existing_product = (
                    db.query(ProductModel).filter(ProductModel.title == product_data["title"]).first()
                )

            current_price = product_data.get("current_price")
            currency = product_data.get("currency", "USD")

            if existing_product:
                existing_product.title = product_data.get("title", existing_product.title)
                existing_product.description = product_data.get("description", existing_product.description)
                existing_product.image_url = product_data.get("image_url", existing_product.image_url)
                existing_product.product_url = product_data.get("product_url", existing_product.product_url)
                existing_product.category_id = category_obj.id
                existing_product.last_scraped_at = datetime.utcnow()

                if current_price is not None and current_price != existing_product.current_price:
                    existing_product.current_price = current_price
                    existing_product.currency = currency
                    price_history = PriceHistoryModel(
                        product_id=existing_product.id,
                        price=current_price,
                        currency=currency,
                    )
                    db.add(price_history)
            else:
                new_product = ProductModel(
                    title=product_data.get("title"),
                    description=product_data.get("description"),
                    current_price=current_price,
                    currency=currency,
                    image_url=product_data.get("image_url"),
                    product_url=product_data.get("product_url"),
                    category_id=category_obj.id,
                    last_scraped_at=datetime.utcnow(),
                )
                db.add(new_product)
                db.flush()

                if current_price is not None:
                    price_history = PriceHistoryModel(
                        product_id=new_product.id,
                        price=current_price,
                        currency=currency,
                    )
                    db.add(price_history)

            updated_count += 1

        db.commit()
        return updated_count

    async def refresh_products(
        self,
        db: Session,
        categories: Optional[List[str]] = None,
        limit: int = 10,
    ) -> Dict[str, object]:
        target_categories = categories or DEFAULT_CATEGORIES
        total_updated = 0

        for category in target_categories:
            raw_products = await self.fetch_products(category, limit=limit)
            normalized = [
                parsed
                for raw in raw_products
                if (parsed := self.parse_product_data(raw, category))
            ]
            total_updated += self.save_to_database(normalized, db)

        return {
            "products_processed": total_updated,
            "categories": target_categories,
            "source": "dummyjson",
            "updated_at": datetime.utcnow(),
        }
