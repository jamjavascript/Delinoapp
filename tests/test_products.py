import os

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ["SCHEDULER_ENABLED"] = "false"

from app.main import app  # noqa: E402
from app.models import Base, Category, Product, PriceHistory, get_db  # noqa: E402


TEST_DATABASE_URL = "sqlite://"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def reset_db() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def seed_data() -> int:
    db = TestingSessionLocal()
    try:
        category = Category(name="Electronics", description="Test category")
        db.add(category)
        db.flush()

        product = Product(
            asin="test-asin-1",
            title="Test Product",
            current_price=99.99,
            currency="USD",
            image_url="https://example.com/product.png",
            category_id=category.id,
        )
        db.add(product)
        db.flush()

        history = PriceHistory(
            product_id=product.id,
            price=99.99,
            currency="USD",
        )
        db.add(history)
        db.commit()

        return product.id
    finally:
        db.close()


def test_trending_products_returns_seeded_product():
    reset_db()
    product_id = seed_data()

    response = client.get("/api/v1/products/trending")
    assert response.status_code == 200

    payload = response.json()
    assert payload["total"] == 1
    assert payload["products"][0]["id"] == product_id


def test_categories_list_includes_seeded_category():
    reset_db()
    seed_data()

    response = client.get("/api/v1/products/categories/list")
    assert response.status_code == 200

    categories = response.json()
    assert any(category["name"] == "Electronics" for category in categories)


def test_product_detail_includes_price_history():
    reset_db()
    product_id = seed_data()

    response = client.get(f"/api/v1/products/{product_id}")
    assert response.status_code == 200

    payload = response.json()
    assert payload["id"] == product_id
    assert payload["price_history"]


def test_price_history_endpoint_returns_history_points():
    reset_db()
    product_id = seed_data()

    response = client.get(f"/api/v1/products/{product_id}/price-history")
    assert response.status_code == 200

    history = response.json()
    assert len(history) == 1
    assert history[0]["price"] == 99.99
