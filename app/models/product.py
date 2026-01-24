from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base


class Product(Base):
    """Product model for Delinoapp products"""

    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    asin = Column(String, nullable=False, unique=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    current_price = Column(Float, nullable=True)
    currency = Column(String, default="USD")
    image_url = Column(String, nullable=True)
    product_url = Column(String, nullable=True)

    # Category relationship
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    category = relationship("Category", back_populates="products")

    # Price history relationship
    price_history = relationship("PriceHistory", back_populates="product", cascade="all, delete-orphan")

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_scraped_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Product(id={self.id}, title='{self.title[:30]}...')>"
