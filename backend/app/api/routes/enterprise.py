"""
Enterprise extension routes for remaining CA operating system modules.
"""

from datetime import date, datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.database.base import get_db
from app.core.security import hash_password, verify_password
from app.models.models import (
    AIConversation,
    AISuggestion,
    AIUsageLog,
    ComplianceNotice,
    ComplianceTask,
    DeviceRegistration,
    DirectorKYC,
    Document,
    DocumentFolder,
    DocumentTag,
    DocumentVersion,
    FeatureFlag,
    ExtractionAuditLog,
    GovernmentIntegration,
    IntegrationSyncLog,
    KnowledgeBase,
    PermissionMatrix,
    PromptTemplate,
    RocFiling,
    SaaSPlan,
    SecurityLog,
    SystemHealthMetric,
    TenantSubscription,
    UsageMetric,
    UserSession,
    VoiceCommand,
    WebhookEvent,
    WhatsAppMessage,
    WorkflowInstance,
)
from app.models.models import ClientPortalDocument, ClientPortalMessage, ClientPortalNotification, ClientPortalUser, CAClient, CANotice, CATask, ComplianceDeadline, ComplianceTracker
from app.services.enterprise_services import (
    AIInfrastructureService,
    CommunicationService,
    ComplianceCenterService,
    DocumentService,
    IntegrationService,
    OCRService,
    SaaSAdminService,
    SecurityService,
    WorkflowService,
)

router = APIRouter(tags=["enterprise-extensions"])


class FolderCreate(BaseModel):
    company_id: int
    folder_name: str
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


class WorkflowCreate(BaseModel):
    company_id: int
    workflow_name: str
    workflow_type: str
    stages: List[Dict[str, Any]]


class WorkflowInstanceCreate(BaseModel):
    company_id: int
    workflow_id: int
    entity_type: str
    entity_id: int
    initiated_by: Optional[int] = None
    context_data: Dict[str, Any] = {}


class WorkflowAction(BaseModel):
    action: str
    actor_user_id: Optional[int] = None
    comments: Optional[str] = None


class ComplianceTaskCreate(BaseModel):
    company_id: int
    task_name: str
    compliance_type: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    financial_year: Optional[str] = None
    period: Optional[str] = None
    due_date: Optional[date] = None
    priority: str = "Medium"
    risk_level: str = "Low"
    assigned_to: Optional[str] = None
    notes: Optional[str] = None


class ComplianceNoticeCreate(BaseModel):
    company_id: int
    notice_source: str
    notice_type: str
    notice_number: Optional[str] = None
    notice_date: Optional[date] = None
    due_date: Optional[date] = None
    subject: Optional[str] = None
    description: Optional[str] = None
    risk_level: str = "Medium"


class IntegrationCreate(BaseModel):
    company_id: int
    integration_type: str
    username: Optional[str] = None
    api_key: Optional[str] = None


class IntegrationSyncCreate(BaseModel):
    integration_id: int
    sync_type: str
    direction: str = "Pull"
    payload: Dict[str, Any] = {}


class WebhookCreate(BaseModel):
    company_id: int
    provider: str
    event_type: str
    payload: Dict[str, Any]


class PromptCreate(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    company_id: Optional[int] = None
    template_name: str
    provider: str = "OpenAI"
    model_name: Optional[str] = None
    context_type: Optional[str] = None
    prompt_text: str
    variables: Dict[str, Any] = {}


class KnowledgeCreate(BaseModel):
    company_id: int
    title: str
    source_type: Optional[str] = None
    source_id: Optional[int] = None
    content: Optional[str] = None
    metadata_json: Dict[str, Any] = {}


class ConversationCreate(BaseModel):
    company_id: int
    user_id: Optional[int] = None
    context_type: str
    title: Optional[str] = None


class ConversationMessage(BaseModel):
    role: str
    content: str


class AIUsageCreate(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    company_id: int
    user_id: Optional[int] = None
    provider: str
    model_name: Optional[str] = None
    feature_name: Optional[str] = None
    prompt_tokens: int = 0
    completion_tokens: int = 0
    estimated_cost: float = 0


class AISuggestionCreate(BaseModel):
    company_id: int
    suggestion_type: str
    title: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    description: Optional[str] = None
    recommendation: Optional[str] = None
    risk_score: Optional[float] = None


class ForecastCreate(BaseModel):
    company_id: int
    prediction_type: str
    period: str
    values: Dict[str, Any]


class WhatsAppMessageCreate(BaseModel):
    company_id: int
    phone_number: str
    direction: str
    message_type: str = "Text"
    message_text: Optional[str] = None
    attachment_url: Optional[str] = None


class VoiceCommandCreate(BaseModel):
    company_id: int
    transcript: str
    user_id: Optional[int] = None


class SecurityLogCreate(BaseModel):
    company_id: Optional[int] = None
    user_id: Optional[int] = None
    event_type: str
    ip_address: Optional[str] = None
    device_id: Optional[str] = None
    user_agent: Optional[str] = None
    risk_level: str = "Low"
    details: Dict[str, Any] = {}


class UserSessionCreate(BaseModel):
    user_id: int
    device_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class SubscriptionCreate(BaseModel):
    company_id: int
    plan_name: str
    status: str = "Active"
    billing_cycle: str = "Monthly"
    seats: int = 1
    starts_on: Optional[date] = None
    ends_on: Optional[date] = None
    feature_flags: Dict[str, Any] = {}
    usage_limits: Dict[str, Any] = {}


class UsageMetricCreate(BaseModel):
    company_id: int
    metric_name: str
    metric_value: float = 0
    period: Optional[str] = None
    metadata_json: Dict[str, Any] = {}


class ClientPortalUserCreate(BaseModel):
    ca_client_id: int
    email: str
    password: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    access_level: str = "View"


class ClientPortalLogin(BaseModel):
    email: str
    password: str


class ClientPortalMessageCreate(BaseModel):
    ca_client_id: int
    sender_type: str
    sender_name: Optional[str] = None
    message: str
    attachments: List[Dict[str, Any]] = []


class ClientPortalNotificationCreate(BaseModel):
    ca_client_id: int
    notification_type: str
    title: str
    message: Optional[str] = None
    action_url: Optional[str] = None


class DeviceCreate(BaseModel):
    user_id: int
    device_id: str
    device_name: Optional[str] = None
    device_type: Optional[str] = None
    ip_address: Optional[str] = None
    is_trusted: bool = False


class PermissionMatrixCreate(BaseModel):
    company_id: int
    role_name: str
    module_name: str
    permissions: Dict[str, Any]


class SaaSPlanCreate(BaseModel):
    plan_name: str
    description: Optional[str] = None
    monthly_price: float = 0
    annual_price: float = 0
    features: Dict[str, Any] = {}
    limits: Dict[str, Any] = {}


class FeatureFlagCreate(BaseModel):
    company_id: Optional[int] = None
    flag_key: str
    flag_value: bool = False
    rollout_rules: Dict[str, Any] = {}


class SystemHealthCreate(BaseModel):
    metric_name: str
    metric_value: float = 0
    status: str = "Healthy"
    metadata_json: Dict[str, Any] = {}


# ============== WORKFLOW ENGINE ==============

@router.post("/api/workflows")
def create_workflow(payload: WorkflowCreate, db: Session = Depends(get_db)):
    return WorkflowService.create_workflow(db, payload.company_id, payload.workflow_name, payload.workflow_type, payload.stages)


@router.post("/api/workflows/instances")
def start_workflow_instance(payload: WorkflowInstanceCreate, db: Session = Depends(get_db)):
    try:
        return WorkflowService.start_instance(db, **payload.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.patch("/api/workflows/instances/{instance_id}/action")
def workflow_action(instance_id: int, payload: WorkflowAction, db: Session = Depends(get_db)):
    try:
        return WorkflowService.act_on_instance(db, instance_id, payload.action, payload.actor_user_id, payload.comments)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.get("/api/workflows/instances/{company_id}")
def list_workflow_instances(company_id: int, db: Session = Depends(get_db)):
    return db.query(WorkflowInstance).filter(WorkflowInstance.company_id == company_id).all()


# ============== ROC/MCA AND COMPLIANCE CENTER ==============

@router.post("/api/compliance-center/tasks")
def create_compliance_task(payload: ComplianceTaskCreate, db: Session = Depends(get_db)):
    return ComplianceCenterService.create_task(db, **payload.model_dump())


@router.get("/api/compliance-center/tasks/{company_id}")
def list_compliance_tasks(company_id: int, db: Session = Depends(get_db)):
    return db.query(ComplianceTask).filter(ComplianceTask.company_id == company_id).order_by(ComplianceTask.due_date).all()


@router.post("/api/compliance-center/notices")
def create_compliance_notice(payload: ComplianceNoticeCreate, db: Session = Depends(get_db)):
    return ComplianceCenterService.create_notice(db, **payload.model_dump())


@router.get("/api/compliance-center/notices/{company_id}")
def list_compliance_notices(company_id: int, db: Session = Depends(get_db)):
    return db.query(ComplianceNotice).filter(ComplianceNotice.company_id == company_id).order_by(ComplianceNotice.due_date).all()


@router.get("/api/compliance-center/dashboard/{company_id}")
def compliance_dashboard(company_id: int, db: Session = Depends(get_db)):
    return ComplianceCenterService.dashboard(db, company_id)


@router.get("/api/roc/filings/{company_id}")
def list_roc_filings(company_id: int, db: Session = Depends(get_db)):
    return db.query(RocFiling).filter(RocFiling.company_id == company_id).all()


@router.get("/api/roc/director-kyc/{company_id}")
def list_director_kyc(company_id: int, db: Session = Depends(get_db)):
    return db.query(DirectorKYC).filter(DirectorKYC.company_id == company_id).all()




# ============== GOVERNMENT INTEGRATIONS ==============

@router.post("/api/integrations")
def configure_integration(payload: IntegrationCreate, db: Session = Depends(get_db)):
    return IntegrationService.configure(db, **payload.model_dump())


@router.get("/api/integrations/{company_id}")
def list_integrations(company_id: int, db: Session = Depends(get_db)):
    return db.query(GovernmentIntegration).filter(GovernmentIntegration.company_id == company_id).all()


@router.post("/api/integrations/sync")
def queue_integration_sync(payload: IntegrationSyncCreate, db: Session = Depends(get_db)):
    try:
        return IntegrationService.sync(db, payload.integration_id, payload.sync_type, payload.direction, payload.payload)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.get("/api/integrations/sync-logs/{integration_id}")
def list_sync_logs(integration_id: int, db: Session = Depends(get_db)):
    return db.query(IntegrationSyncLog).filter(IntegrationSyncLog.integration_id == integration_id).order_by(IntegrationSyncLog.started_at.desc()).all()


@router.post("/api/integrations/webhooks")
def record_webhook(payload: WebhookCreate, db: Session = Depends(get_db)):
    return IntegrationService.record_webhook(db, **payload.model_dump())


@router.get("/api/integrations/webhooks/{company_id}")
def list_webhooks(company_id: int, db: Session = Depends(get_db)):
    return db.query(WebhookEvent).filter(WebhookEvent.company_id == company_id).order_by(WebhookEvent.created_at.desc()).all()


# ============== AI INFRASTRUCTURE AND AI SERVICES ==============

@router.post("/api/ai/prompts")
def create_prompt(payload: PromptCreate, db: Session = Depends(get_db)):
    return AIInfrastructureService.create_prompt(db, **payload.model_dump())


@router.get("/api/ai/prompts")
def list_prompts(company_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    query = db.query(PromptTemplate)
    if company_id:
        query = query.filter(PromptTemplate.company_id == company_id)
    return query.all()


@router.post("/api/ai/knowledge")
def add_knowledge(payload: KnowledgeCreate, db: Session = Depends(get_db)):
    return AIInfrastructureService.add_knowledge(db, **payload.model_dump())


@router.get("/api/ai/knowledge/{company_id}")
def list_knowledge(company_id: int, db: Session = Depends(get_db)):
    return db.query(KnowledgeBase).filter(KnowledgeBase.company_id == company_id).all()


@router.post("/api/ai/conversations")
def start_conversation(payload: ConversationCreate, db: Session = Depends(get_db)):
    return AIInfrastructureService.start_conversation(db, payload.company_id, payload.user_id, payload.context_type, payload.title)


@router.post("/api/ai/conversations/{conversation_id}/messages")
def add_conversation_message(conversation_id: int, payload: ConversationMessage, db: Session = Depends(get_db)):
    try:
        return AIInfrastructureService.add_message(db, conversation_id, payload.role, payload.content)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.get("/api/ai/conversations/{company_id}")
def list_conversations(company_id: int, db: Session = Depends(get_db)):
    return db.query(AIConversation).filter(AIConversation.company_id == company_id).order_by(AIConversation.updated_at.desc()).all()


@router.post("/api/ai/usage")
def track_ai_usage(payload: AIUsageCreate, db: Session = Depends(get_db)):
    return AIInfrastructureService.track_usage(db, **payload.model_dump())


@router.get("/api/ai/usage/{company_id}")
def list_ai_usage(company_id: int, db: Session = Depends(get_db)):
    return db.query(AIUsageLog).filter(AIUsageLog.company_id == company_id).order_by(AIUsageLog.created_at.desc()).all()


@router.post("/api/ai/suggestions")
def create_ai_suggestion(payload: AISuggestionCreate, db: Session = Depends(get_db)):
    return AIInfrastructureService.create_suggestion(db, **payload.model_dump())


@router.get("/api/ai/suggestions/{company_id}")
def list_ai_suggestions(company_id: int, db: Session = Depends(get_db)):
    return db.query(AISuggestion).filter(AISuggestion.company_id == company_id).order_by(AISuggestion.created_at.desc()).all()


@router.post("/api/ai/forecasts")
def create_ai_forecast(payload: ForecastCreate, db: Session = Depends(get_db)):
    return AIInfrastructureService.create_forecast(db, payload.company_id, payload.prediction_type, payload.period, payload.values)


# ============== WHATSAPP AND VOICE ACCOUNTING ==============

@router.post("/api/whatsapp/messages")
def record_whatsapp_message(payload: WhatsAppMessageCreate, db: Session = Depends(get_db)):
    return CommunicationService.record_whatsapp_message(db, **payload.model_dump())


@router.get("/api/whatsapp/messages/{company_id}")
def list_whatsapp_messages(company_id: int, db: Session = Depends(get_db)):
    return db.query(WhatsAppMessage).filter(WhatsAppMessage.company_id == company_id).order_by(WhatsAppMessage.received_at.desc()).all()


@router.post("/api/voice/commands")
def parse_voice_command(payload: VoiceCommandCreate, db: Session = Depends(get_db)):
    return CommunicationService.parse_voice_command(db, payload.company_id, payload.transcript, payload.user_id)


@router.get("/api/voice/commands/{company_id}")
def list_voice_commands(company_id: int, db: Session = Depends(get_db)):
    return db.query(VoiceCommand).filter(VoiceCommand.company_id == company_id).order_by(VoiceCommand.created_at.desc()).all()


# ============== ENTERPRISE SECURITY ==============

@router.post("/api/security/logs")
def create_security_log(payload: SecurityLogCreate, db: Session = Depends(get_db)):
    return SecurityService.log_event(db, **payload.model_dump())


@router.get("/api/security/logs")
def list_security_logs(company_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    query = db.query(SecurityLog)
    if company_id:
        query = query.filter(SecurityLog.company_id == company_id)
    return query.order_by(SecurityLog.created_at.desc()).all()


@router.post("/api/security/sessions")
def start_user_session(payload: UserSessionCreate, db: Session = Depends(get_db)):
    return SecurityService.start_session(db, **payload.model_dump())


@router.get("/api/security/sessions/{user_id}")
def list_user_sessions(user_id: int, db: Session = Depends(get_db)):
    return db.query(UserSession).filter(UserSession.user_id == user_id).order_by(UserSession.started_at.desc()).all()


@router.post("/api/security/devices")
def register_device(payload: DeviceCreate, db: Session = Depends(get_db)):
    device = DeviceRegistration(**payload.model_dump())
    db.add(device)
    db.commit()
    db.refresh(device)
    return device


@router.get("/api/security/devices/{user_id}")
def list_devices(user_id: int, db: Session = Depends(get_db)):
    return db.query(DeviceRegistration).filter(DeviceRegistration.user_id == user_id).all()


@router.post("/api/security/permissions")
def create_permission_matrix(payload: PermissionMatrixCreate, db: Session = Depends(get_db)):
    item = PermissionMatrix(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/api/security/permissions/{company_id}")
def list_permission_matrix(company_id: int, db: Session = Depends(get_db)):
    return db.query(PermissionMatrix).filter(PermissionMatrix.company_id == company_id).all()


# ============== SAAS ADMIN PLATFORM ==============

@router.post("/api/saas/subscriptions")
def create_subscription(payload: SubscriptionCreate, db: Session = Depends(get_db)):
    data = payload.model_dump()
    if data.get("starts_on") is None:
        data.pop("starts_on")
    return SaaSAdminService.create_subscription(db, **data)


@router.post("/api/saas/plans")
def create_saas_plan(payload: SaaSPlanCreate, db: Session = Depends(get_db)):
    plan = SaaSPlan(**payload.model_dump())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


@router.get("/api/saas/plans")
def list_saas_plans(db: Session = Depends(get_db)):
    return db.query(SaaSPlan).filter(SaaSPlan.is_active == True).all()


@router.post("/api/saas/feature-flags")
def create_feature_flag(payload: FeatureFlagCreate, db: Session = Depends(get_db)):
    flag = FeatureFlag(**payload.model_dump())
    db.add(flag)
    db.commit()
    db.refresh(flag)
    return flag


@router.get("/api/saas/feature-flags")
def list_feature_flags(company_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    query = db.query(FeatureFlag)
    if company_id:
        query = query.filter(FeatureFlag.company_id == company_id)
    return query.all()


@router.get("/api/saas/subscriptions/{company_id}")
def list_subscriptions(company_id: int, db: Session = Depends(get_db)):
    return db.query(TenantSubscription).filter(TenantSubscription.company_id == company_id).order_by(TenantSubscription.created_at.desc()).all()


@router.post("/api/saas/usage")
def record_usage_metric(payload: UsageMetricCreate, db: Session = Depends(get_db)):
    return SaaSAdminService.record_usage(db, **payload.model_dump())


@router.get("/api/saas/usage/{company_id}")
def list_usage_metrics(company_id: int, db: Session = Depends(get_db)):
    return db.query(UsageMetric).filter(UsageMetric.company_id == company_id).order_by(UsageMetric.recorded_at.desc()).all()


@router.post("/api/saas/system-health")
def record_system_health(payload: SystemHealthCreate, db: Session = Depends(get_db)):
    metric = SystemHealthMetric(**payload.model_dump())
    db.add(metric)
    db.commit()
    db.refresh(metric)
    return metric


@router.get("/api/saas/system-health")
def list_system_health(db: Session = Depends(get_db)):
    return db.query(SystemHealthMetric).order_by(SystemHealthMetric.recorded_at.desc()).all()
