# app/schemas.py (exemplo)
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

CURRENT_YEAR = datetime.now().year

class BookCreate(BaseModel):
    title: str = Field(min_length=1)
    page_count: int | None = Field(default=None, ge=1, le=100000)
    pub_year: int = Field(ge=1450, le=CURRENT_YEAR)   # ajuste os limites que fizerem sentido
    authors: list[str]

    @field_validator('authors', mode='before')
    @classmethod
    def clean_authors(cls, v):
        # aceita string única ou lista
        if isinstance(v, str):
            v = [v]
        cleaned = [s.strip() for s in (v or []) if isinstance(s, str) and s.strip()]
        if not cleaned:
            raise ValueError('Informe pelo menos um autor válido.')
        return cleaned

class BookResponse(BaseModel):
    id: str
    title: str | None = None
    page_count: int | None = None
    pub_year: int | None = None
    created_at: datetime
    updated_at: datetime
    authors: list[str]
