from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime

from app.models import get_db, Product as ProductModel, Category as CategoryModel, PriceHistory as PriceHistoryModel
from app.schemas import Product, ProductWithHistory, TrendingProductsResponse, Category
from app.services.data_fetcher import ProductDataFetcher

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/trending", response_model=TrendingProductsResponse)
async def get_trending_products(
    category: Optional[str] = Query(None, description="Filter by category name"),
    limit: int = Query(50, ge=1, le=100, description="Number of products to return"),
    db: Session = Depends(get_db)
):
    """
    Get products from the database, optionally filtered by category.
    """
    query = db.query(ProductModel)

    # Filter by category if specified
    if category:
        category_obj = db.query(CategoryModel).filter(CategoryModel.name == category).first()
        if category_obj:
            query = query.filter(ProductModel.category_id == category_obj.id)

    # Order by most recently updated
    products = query.order_by(desc(ProductModel.updated_at)) \
                   .limit(limit) \
                   .all()

    # If no products in database, return empty
    if not products:
        return TrendingProductsResponse(
            total=0,
            products=[],
            category=category,
            last_updated=datetime.utcnow()
        )

    return TrendingProductsResponse(
        total=len(products),
        products=products,
        category=category,
        last_updated=max(p.last_scraped_at for p in products) if products else datetime.utcnow()
    )


@router.get("/trending/{category_name}", response_model=TrendingProductsResponse)
async def get_trending_by_category(
    category_name: str,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get trending products for a specific category"""
    return await get_trending_products(category=category_name, limit=limit, db=db)


@router.get("/{product_id}", response_model=ProductWithHistory)
async def get_product_by_id(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get product details by ID"""
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found")

    return product


@router.get("/{product_id}/price-history", response_model=List[dict])
async def get_product_price_history(
    product_id: int,
    limit: int = Query(100, ge=1, le=500, description="Number of history records"),
    db: Session = Depends(get_db)
):
    """Get price history for a product"""
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found")

    history = db.query(PriceHistoryModel) \
                .filter(PriceHistoryModel.product_id == product.id) \
                .order_by(desc(PriceHistoryModel.timestamp)) \
                .limit(limit) \
                .all()

    return [
        {
            "price": h.price,
            "currency": h.currency,
            "timestamp": h.timestamp
        }
        for h in history
    ]


@router.get("/categories/list", response_model=List[Category])
async def get_categories(db: Session = Depends(get_db)):
    """Get all available categories"""
    categories = db.query(CategoryModel).all()
    return categories


@router.post("/refresh")
async def refresh_products(
    limit: int = Query(10, ge=1, le=50, description="Products per category"),
    db: Session = Depends(get_db),
):
    """
    Fetch products from DummyJSON and refresh database records.
    """
    fetcher = ProductDataFetcher()
    try:
        result = await fetcher.refresh_products(db=db, limit=limit)
        return {"status": "success", **result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Refresh failed: {exc}")


@router.post("/sample-data", status_code=201)
async def populate_sample_data(db: Session = Depends(get_db)):
    """
    Populate the database with sample products for testing.
    """
    try:
        # Sample product data
        sample_products = [
            {
                "title": "Premium Wireless Ear Buds with USB-C Charging",
                "current_price": 189.99,
                "image_url": "https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg",
                "category": "Electronics"
            },
            {
                "title": "Smart Speaker with Voice Assistant",
                "current_price": 49.99,
                "image_url": "https://m.media-amazon.com/images/I/71h4JCjfGbL._AC_SL1500_.jpg",
                "category": "Electronics"
            },
            {
                "title": "Atomic Habits by James Clear - Hardcover",
                "current_price": 16.99,
                "image_url": "https://m.media-amazon.com/images/I/81YkqyaFVEL._SL1500_.jpg",
                "category": "Books"
            },
            {
                "title": "The Woman in Me by Britney Spears - Hardcover",
                "current_price": 18.99,
                "image_url": "https://m.media-amazon.com/images/I/81Rrpn8DJHL._SL1500_.jpg",
                "category": "Books"
            },
            {
                "title": "9-in-1 Electric Pressure Cooker",
                "current_price": 99.95,
                "image_url": "https://m.media-amazon.com/images/I/71V8HxINKlL._AC_SL1500_.jpg",
                "category": "Home & Kitchen"
            },
            {
                "title": "Air Fryer - 4 Quart Capacity",
                "current_price": 89.99,
                "image_url": "https://m.media-amazon.com/images/I/71Yyc6JiePL._AC_SL1500_.jpg",
                "category": "Home & Kitchen"
            },
            {
                "title": "Star Wars The Razor Crest Building Kit",
                "current_price": 139.99,
                "image_url": "https://m.media-amazon.com/images/I/81xhN7Y7RnL._AC_SL1500_.jpg",
                "category": "Toys & Games"
            },
            {
                "title": "Dreamhouse Playset - 8 Rooms",
                "current_price": 179.99,
                "image_url": "https://m.media-amazon.com/images/I/91lWc7HpDkL._AC_SL1500_.jpg",
                "category": "Toys & Games"
            }
        ]

        updated_count = 0
        for product_data in sample_products:
            # Get or create category
            category_name = product_data.pop("category")
            category_obj = db.query(CategoryModel).filter(CategoryModel.name == category_name).first()
            if not category_obj:
                category_obj = CategoryModel(name=category_name, description=f"Sample {category_name} products")
                db.add(category_obj)
                db.flush()

            # Check if product with the same title exists
            existing_product = db.query(ProductModel).filter(ProductModel.title == product_data["title"]).first()

            if existing_product:
                # Update existing product
                for key, value in product_data.items():
                    setattr(existing_product, key, value)
                existing_product.category_id = category_obj.id
                existing_product.last_scraped_at = datetime.utcnow()

                # Add price history
                price_history = PriceHistoryModel(
                    product_id=existing_product.id,
                    price=product_data["current_price"]
                )
                db.add(price_history)
            else:
                # Create new product
                new_product = ProductModel(
                    **product_data,
                    category_id=category_obj.id
                )
                db.add(new_product)
                db.flush()

                # Add initial price history
                price_history = PriceHistoryModel(
                    product_id=new_product.id,
                    price=product_data["current_price"]
                )
                db.add(price_history)

            updated_count += 1

        db.commit()

        return {
            "message": "Successfully populated sample data",
            "products_added": updated_count,
            "categories": ["Electronics", "Books", "Home & Kitchen", "Toys & Games"],
            "note": "This is sample data for demonstration purposes.",
            "timestamp": datetime.utcnow()
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error populating sample data: {str(e)}")
