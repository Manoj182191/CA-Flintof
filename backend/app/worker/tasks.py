import logging
from app.core.celery_app import celery_app
from app.services.email_service import send_email, get_password_reset_html, get_email_verification_html

logger = logging.getLogger(__name__)

@celery_app.task(name="app.worker.tasks.send_password_reset_email_task", bind=True, max_retries=3)
def send_password_reset_email_task(self, to_email: str, reset_link: str):
    logger.info(f"Processing password reset email for {to_email}")
    html_content = get_password_reset_html(reset_link)
    try:
        success = send_email(to_email, "Password Reset Request", html_content)
        if not success:
            logger.warning(f"Failed to send email to {to_email}, checking retry...")
            raise self.retry(countdown=60)
    except Exception as exc:
        logger.error(f"Error in send_password_reset_email_task: {exc}")
        raise self.retry(exc=exc, countdown=60)
    return True

@celery_app.task(name="app.worker.tasks.send_verification_email_task", bind=True, max_retries=3)
def send_verification_email_task(self, to_email: str, verify_link: str):
    logger.info(f"Processing verification email for {to_email}")
    html_content = get_email_verification_html(verify_link)
    try:
        success = send_email(to_email, "Verify your CA ERP Platform account", html_content)
        if not success:
            logger.warning(f"Failed to send email to {to_email}, checking retry...")
            raise self.retry(countdown=60)
    except Exception as exc:
        logger.error(f"Error in send_verification_email_task: {exc}")
        raise self.retry(exc=exc, countdown=60)
    return True

@celery_app.task(name="app.worker.tasks.process_document_ocr_task", bind=True)
def process_document_ocr_task(self, document_id: int, company_id: int):
    # This is a placeholder for the OCR logic that takes long
    logger.info(f"Processing OCR for document {document_id}")
    import time
    time.sleep(5) # Simulate long process
    # Here it would update the document database status
    return {"status": "success", "document_id": document_id}
