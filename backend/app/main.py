from contextlib import asynccontextmanager
from datetime import datetime, timezone
from uuid import UUID
from typing import List, Dict, Any

import os
from fastapi import FastAPI, HTTPException, Response, status
from dotenv import load_dotenv

from prisma import Prisma
from prisma.errors import RecordNotFoundError

from app.schemas import BookCreate, BookUpdate, BookResponse


# --- env ---
load_dotenv()
print("DB_URL startswith:", os.getenv("DATABASE_URL", "")[:30], "...")  # debug seguro


# --- prisma client ---
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


# --- helpers ---
def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _to_book_response(record) -> BookResponse:
    # Sanear autores (remover strings vazias) e montar resposta
    authors = [a for a in (getattr(record, "authors", []) or []) if a and a.strip()]
    return BookResponse(
        id=record.id,
        title=getattr(record, "title", None),
        page_count=getattr(record, "page_count", None),
        pub_year=getattr(record, "pub_year", None),
        created_at=getattr(record, "created_at"),
        updated_at=getattr(record, "updated_at"),
        authors=authors,
    )


# --- health ---
@app.get("/")
async def healthcheck() -> Dict[str, str]:
    return {"status": "ok"}


# --- books ---
@app.get("/books", response_model=List[BookResponse])
async def list_books():
    # order by created_at desc
    records = await prisma.books.find_many(order={"created_at": "desc"})
    return [_to_book_response(r) for r in records]


@app.get("/books/{book_id}", response_model=BookResponse)
async def get_book(book_id: UUID):
    r = await prisma.books.find_unique(where={"id": str(book_id)})
    if not r:
        raise HTTPException(status_code=404, detail="Book not found")
    return _to_book_response(r)


@app.post("/books", response_model=BookResponse, status_code=201)
async def create_book(payload: BookCreate):
    # autores nunca deve ser None (array do Postgres não aceita NULL) -> use []
    data: Dict[str, Any] = {
        "title": payload.title,
        "page_count": payload.page_count,
        "pub_year": payload.pub_year,
        "authors": payload.authors or [],
    }
    r = await prisma.books.create(data=data)
    return _to_book_response(r)


@app.put("/books/{book_id}", response_model=BookResponse)
@app.patch("/books/{book_id}", response_model=BookResponse)
async def patch_book(book_id: UUID, payload: BookUpdate):
    # monta 'data' apenas com campos fornecidos
    data: Dict[str, Any] = {}
    if payload.title is not None:
        data["title"] = payload.title
    if payload.page_count is not None:
        data["page_count"] = payload.page_count
    if payload.pub_year is not None:
        data["pub_year"] = payload.pub_year
    if payload.authors is not None:
        data["authors"] = payload.authors  # já normalizados; lista (talvez vazia)

    if not data:
        raise HTTPException(status_code=400, detail="Nenhum dado para atualização.")

    data["updated_at"] = _now_utc()

    try:
        r = await prisma.books.update(where={"id": str(book_id)}, data=data)
    except RecordNotFoundError:
        raise HTTPException(status_code=404, detail="Book not found")
    return _to_book_response(r)


@app.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(book_id: UUID) -> Response:
    try:
        await prisma.books.delete(where={"id": str(book_id)})
    except RecordNotFoundError:
        raise HTTPException(status_code=404, detail="Book not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
