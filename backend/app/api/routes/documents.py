from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, Header
from fastapi.responses import FileResponse
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.database.base import get_db
from app.models.models import Document, DocumentFolder, DocumentTag, DocumentVersion, ExtractionAuditLog
from app.services.enterprise_services import DocumentService, OCRService

router = APIRouter(prefix="/api/documents", tags=["documents"])

class FolderCreate(BaseModel):
    company_id: Optional[int] = None
    folder_name: Optional[str] = None
    name: Optional[str] = None
    parent_id: Optional[int] = None
    description: Optional[str] = None

class TagCreate(BaseModel):
    company_id: int
    tag_name: str
    tag_color: Optional[str] = None

class OCRRequest(BaseModel):
    document_id: int
    extraction_type: str
    provider: str = "local"

@router.post("/folders")
def create_document_folder(
    payload: FolderCreate, 
    x_company_id: Optional[int] = Header(None, alias="X-Company-ID"),
    db: Session = Depends(get_db)
):
    data = payload.model_dump(exclude_unset=True, exclude_none=True)
    comp_id = data.get("company_id") or x_company_id
    if not comp_id:
        raise HTTPException(status_code=400, detail="Company ID missing")
    data["company_id"] = comp_id
    if "name" in data and not data.get("folder_name"):
        data["folder_name"] = data.pop("name")
    return DocumentService.create_folder(db, **data)

@router.get("/folders/{company_id}")
def list_document_folders(company_id: int, db: Session = Depends(get_db)):
    return db.query(DocumentFolder).filter(DocumentFolder.company_id == company_id).all()

@router.post("/tags")
def create_document_tag(payload: TagCreate, db: Session = Depends(get_db)):
    return DocumentService.create_tag(db, **payload.model_dump())

@router.get("/tags/{company_id}")
def list_document_tags(company_id: int, db: Session = Depends(get_db)):
    return db.query(DocumentTag).filter(DocumentTag.company_id == company_id).all()

@router.post("/upload")
def upload_document(
    company_id: int = Query(...),
    document_type: str = Query(...),
    uploaded_by: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    folder_id: Optional[int] = Query(None),
    tags: Optional[List[str]] = Query(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    try:
        return DocumentService.upload_document(db, company_id, file, document_type, uploaded_by, tags, folder_id, category)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

@router.post("/{document_id}/versions")
def upload_document_version(
    document_id: int,
    uploaded_by: Optional[str] = Query(None),
    change_notes: Optional[str] = Query(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    try:
        return DocumentService.add_version(db, document_id, file, uploaded_by, change_notes)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

@router.get("/{company_id}")
def list_documents(company_id: int, include_archived: bool = Query(False), db: Session = Depends(get_db)):
    query = db.query(Document).filter(Document.company_id == company_id)
    if not include_archived:
        query = query.filter(Document.is_archived == False)
    return query.order_by(Document.uploaded_on.desc()).all()

@router.get("/download/{document_id}")
def download_document(document_id: int, db: Session = Depends(get_db)):
    document = db.query(Document).get(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return FileResponse(document.file_path, filename=document.file_name, media_type=document.mime_type)

@router.delete("/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    try:
        return DocumentService.delete_document(db, document_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

@router.get("/{document_id}/versions")
def list_document_versions(document_id: int, db: Session = Depends(get_db)):
    return db.query(DocumentVersion).filter(DocumentVersion.document_id == document_id).order_by(DocumentVersion.version_number.desc()).all()

@router.get("/search/{company_id}")
def search_documents(company_id: int, q: str, db: Session = Depends(get_db)):
    # Basic search on document name
    return db.query(Document).filter(Document.company_id == company_id, Document.file_name.ilike(f"%{q}%")).all()

# OCR
@router.post("/ocr/extract")
def extract_document(payload: OCRRequest, db: Session = Depends(get_db)):
    try:
        return OCRService.extract_document(db, payload.document_id, payload.extraction_type, payload.provider)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

@router.get("/ocr/logs/{document_id}")
def list_ocr_logs(document_id: int, db: Session = Depends(get_db)):
    return db.query(ExtractionAuditLog).filter(ExtractionAuditLog.document_id == document_id).order_by(ExtractionAuditLog.processed_at.desc()).all()
