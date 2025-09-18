from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Response, status
from pydantic import BaseModel, Field, field_validator

from prisma import Prisma
from prisma.errors import RecordNotFoundError

from app.schemas import BookCreate, BookResponse

from dotenv import load_dotenv
load_dotenv()

import os
print("DB_URL startswith:", os.getenv("DATABASE_URL", "")[:30], "...")  # sem logar a senha


prisma = Prisma()


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Manage Prisma connection for the app lifecycle."""
    await prisma.connect()
    try:
        yield
    finally:
        await prisma.disconnect()


app = FastAPI(title="Biblioteca API", lifespan=lifespan)


class BookBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    authors: List[str] = Field(..., min_items=1)
    page_count: int = Field(..., ge=1)
    pub_year: int = Field(..., ge=0)

    @field_validator("title")
    @classmethod
    def strip_title(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("O título não pode ser vazio.")
        return stripped

    @field_validator("authors")
    @classmethod
    def validate_authors(cls, value: List[str]) -> List[str]:
        cleaned = [author.strip() for author in value if author.strip()]
        if not cleaned:
            raise ValueError("Informe pelo menos um autor válido.")
        return cleaned


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    authors: Optional[List[str]] = Field(None, min_items=1)
    page_count: Optional[int] = Field(None, ge=1)
    pub_year: Optional[int] = Field(None, ge=0)

    @field_validator("title")
    @classmethod
    def strip_title(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        stripped = value.strip()
        if not stripped:
            raise ValueError("O título não pode ser vazio.")
        return stripped

    @field_validator("authors")
    @classmethod
    def validate_authors(cls, value: Optional[List[str]]) -> Optional[List[str]]:
        if value is None:
            return value
        cleaned = [author.strip() for author in value if author.strip()]
        if not cleaned:
            raise ValueError("Informe pelo menos um autor válido.")
        return cleaned


class BookResponse(BookBase):
    id: str
    created_at: datetime
    updated_at: datetime


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _to_book_response(record) -> BookResponse:
    if hasattr(record, "model_dump"):
        data = record.model_dump()
    elif hasattr(record, "dict"):
        data = record.dict()
    else:
        data = record.__dict__
    return BookResponse(**data)


@app.get("/")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/books", response_model=List[BookResponse])
async def list_books() -> List[BookResponse]:
    records = await prisma.books.find_many(order={"created_at": "desc"})
    return [_to_book_response(record) for record in records]


@app.get("/books/{book_id}", response_model=BookResponse)
async def get_book(book_id: str) -> BookResponse:
    record = await prisma.books.find_unique(where={"id": book_id})
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Livro não encontrado.")
    return _to_book_response(record)


@app.post("/books", response_model=BookResponse, status_code=201)
async def create_book(payload: BookCreate):
    record = await prisma.books.create(
        data={
            "title": payload.title,
            "page_count": payload.page_count,
            "pub_year": payload.pub_year,
            "authors": payload.authors,
        }
    )
    return _to_book_response(record)


@app.put("/books/{book_id}", response_model=BookResponse)
async def update_book(book_id: str, payload: BookUpdate) -> BookResponse:
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nenhum dado para atualização.")
    data["updated_at"] = _now_utc()
    try:
        record = await prisma.books.update(where={"id": book_id}, data=data)
    except RecordNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Livro não encontrado.")
    return _to_book_response(record)


@app.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(book_id: str) -> Response:
    try:
        await prisma.books.delete(where={"id": book_id})
    except RecordNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Livro não encontrado.")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
