from typing import Dict, Any, Optional, TypeVar, Generic
from pydantic import BaseModel, Field
import time

T = TypeVar("T")


class Artifact(BaseModel, Generic[T]):
    """Base class for all artifacts produced by agents."""

    data: Optional[T] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: float = Field(default_factory=time.time)

    def to_dict(self) -> Dict[str, Any]:
        """Convert the artifact to a dictionary representation."""
        return self.model_dump()

    def to_json(self) -> str:
        """Convert the artifact to a JSON string."""
        return self.model_dump_json()
