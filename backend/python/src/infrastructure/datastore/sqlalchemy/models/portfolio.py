from __future__ import annotations

from datetime import datetime
import uuid
from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .asset import Asset
    from .user import User

from ..base import Base

class Portfolio(Base):
    __tablename__ = "portfolios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    owner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    assets: Mapped[list["Asset"]] = relationship(
        back_populates="portfolio", # so the Asset model can reference back
        cascade="all, delete-orphan", # delete assets when portfolio is deleted
        lazy="selectin", # optimize loading with selectin loading (avoids N+1 problem, loads assets in one query)
    )

    owner: Mapped["User"] = relationship(back_populates="portfolios") # link back to User
