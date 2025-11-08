from pydantic import BaseModel

class ModuleIABase(BaseModel):
    nom: str
    description: str
    domaine: str
    actif: bool = True

class ModuleIACreate(ModuleIABase):
    pass

class ModuleIAOut(ModuleIABase):
    id: int

    class Config:
        orm_mode = True
