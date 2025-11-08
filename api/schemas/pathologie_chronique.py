from pydantic import BaseModel

class PathologieBase(BaseModel):
    nom: str
    description: str | None = None

class PathologieCreate(PathologieBase):
    pass

class PathologieRead(PathologieBase):
    id: int
    class Config:
        orm_mode = True