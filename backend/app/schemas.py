from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


class BookCreate(BaseModel):
    # todos opcionais: se ausentes, ficam como None (ou [] no caso de authors, via validator)
    title: Optional[str] = None
    page_count: Optional[int] = None
    pub_year: Optional[int] = None
    authors: Optional[List[str]] = None  # pode vir None

    @field_validator('authors', mode='before')
    @classmethod
    def normalize_authors_create(cls, v):
        # aceita None, string única ou lista; remove strings vazias/whitespace
        if v is None:
            return []
        if isinstance(v, str):
            v = [v]
        return [s.strip() for s in v if isinstance(s, str) and s.strip()]


class BookUpdate(BaseModel):
    # PATCH/PUT parcial: apenas campos presentes serão alterados
    title: Optional[str] = None
    page_count: Optional[int] = None
    pub_year: Optional[int] = None
    authors: Optional[List[str]] = None

    @field_validator('authors', mode='before')
    @classmethod
    def normalize_authors_update(cls, v):
        # None => não alterar; se vier valor, limpar
        if v is None:
            return None
        if isinstance(v, str):
            v = [v]
        return [s.strip() for s in v if isinstance(s, str) and s.strip()]


class BookResponse(BaseModel):
    # resposta sempre consistente; authors vira lista (talvez vazia)
    id: str
    title: Optional[str] = None
    page_count: Optional[int] = None
    pub_year: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    authors: List[str] = []  # sempre lista

    @field_validator('authors', mode='before')
    @classmethod
    def normalize_authors_resp(cls, v):
        if v is None:
            return []
        if isinstance(v, str):
            v = [v]
        return [s.strip() for s in v if isinstance(s, str) and s.strip()]
