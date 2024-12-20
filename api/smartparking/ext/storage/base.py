from typing import Type, Optional
from urllib.parse import urlparse, ParseResult
from pydantic import BaseModel, Field


class StorageSettings(BaseModel):
    url: str = Field(description="URL containing access information for the storage.")


class Storage:
    _children: set[Type] = set()

    def __init_subclass__(cls) -> None:
        Storage._children.add(cls)

    @staticmethod
    def of(url: str) -> Optional['Storage']:
        parsed = urlparse(url)
        storage_cls = next(filter(lambda s: s.accept(parsed.scheme), Storage._children), None)
        return storage_cls(parsed) if storage_cls else None

    @classmethod
    def accept(cls, scheme: str) -> bool:
        raise NotImplementedError("Subclasses must implement the accept method.")

    def __init__(self, url: ParseResult) -> None:
        pass

    def exists(self, path: str) -> bool:
        raise NotImplementedError("Subclasses must implement the exists method.")

    def read(self, path: str) -> bytes:
        raise NotImplementedError("Subclasses must implement the read method.")

    def write(self, path: str, data: bytes):
        raise NotImplementedError("Subclasses must implement the write method.")

    def delete(self, path: str):
        raise NotImplementedError("Subclasses must implement the delete method.")

    def urlize(self, path: str, **kwargs) -> str:
        raise NotImplementedError("Subclasses must implement the urlize method.")
