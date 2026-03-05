import logging
from datetime import datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import SessionLocal
from app.services.data_fetcher import ProductDataFetcher


logger = logging.getLogger(__name__)


class ProductScheduler:
    def __init__(self) -> None:
        self.scheduler = AsyncIOScheduler()
        self.fetcher = ProductDataFetcher()

    async def refresh_all_products(self) -> None:
        db: Session = SessionLocal()
        try:
            result = await self.fetcher.refresh_products(db=db)
            logger.info(
                "Scheduled refresh complete: %s products, categories=%s",
                result.get("products_processed"),
                result.get("categories"),
            )
        except Exception as exc:
            logger.exception("Scheduled refresh failed: %s", exc)
        finally:
            db.close()

    def start(self) -> None:
        self.scheduler.add_job(
            self.refresh_all_products,
            "interval",
            hours=settings.product_refresh_hours,
            id="product_refresh",
            next_run_time=datetime.utcnow(),
            replace_existing=True,
        )
        self.scheduler.start()

    def shutdown(self) -> None:
        self.scheduler.shutdown(wait=False)
