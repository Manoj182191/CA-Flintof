"""
CA Practice Management Service
Handles client management, notice tracking, task management, deadline tracking
"""

from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.models.models import (
    CAClient, CANotice, CATask, ComplianceDeadline, Company
)
from typing import Dict, List, Optional
from collections import defaultdict


class CAPracticeManagementService:
    """Service for CA practice management"""
    
    # Compliance deadline templates
    COMPLIANCE_CALENDAR = {
        'GSTR-1': {'month': 'monthly', 'days_after': 11},  # 11th of next month
        'GSTR-3B': {'month': 'monthly', 'days_after': 20},  # 20th of next month
        'GSTR-9': {'month': 'annual', 'days_after': 31},  # 31st Dec
        'GSTR-9C': {'month': 'annual', 'days_after': 31},  # 31st Dec
        'TDS 24Q': {'month': 'quarterly', 'days_after': 30},  # 7th of next month
        'TDS 26Q': {'month': 'quarterly', 'days_after': 30},
        'Form 16A': {'month': 'annual', 'days_after': 31},  # 31st May
        'ITR Filing': {'month': 'annual', 'days_after': 31},  # 31st July
        'Annual Filing': {'month': 'annual', 'days_after': 30},  # 30th June
    }
    
    @classmethod
    def create_ca_client(
        cls,
        company_id: int,
        client_name: str,
        client_type: str,
        pan: str,
        email: str,
        phone: str,
        service_types: List[str],
        db: Session
    ) -> CAClient:
        """Create new client record"""
        
        client = CAClient(
            company_id=company_id,
            client_name=client_name,
            client_type=client_type,
            pan=pan,
            email=email,
            phone=phone,
            service_type=service_types,
            engagement_date=date.today(),
            status="Active"
        )
        
        db.add(client)
        db.flush()
        
        # Auto-create compliance deadlines for the client
        cls._create_compliance_deadlines(client.id, db)
        
        db.commit()
        return client
    
    @classmethod
    def _create_compliance_deadlines(
        cls,
        client_id: int,
        db: Session
    ):
        """Create compliance deadlines for client"""
        
        client = db.query(CAClient).get(client_id)
        if not client:
            return
        
        current_year = date.today().year
        
        # Create GSTR deadlines if GST service is included
        if 'GST' in (client.service_type or []):
            for month in range(1, 13):
                # GSTR-1: 11th of next month
                deadline = date(current_year if month < 12 else current_year + 1,
                              month + 1 if month < 12 else 1, 11)
                
                cd = ComplianceDeadline(
                    company_id=client.company_id,
                    deadline_type="GSTR-1",
                    due_date=deadline,
                    financial_year=f"{current_year}-{current_year+1}",
                    month=month,
                    description=f"GSTR-1 filing for month {month}",
                    status="Pending"
                )
                db.add(cd)
                
                # GSTR-3B: 20th of next month
                deadline_3b = date(current_year if month < 12 else current_year + 1,
                                 month + 1 if month < 12 else 1, 20)
                
                cd_3b = ComplianceDeadline(
                    company_id=client.company_id,
                    deadline_type="GSTR-3B",
                    due_date=deadline_3b,
                    financial_year=f"{current_year}-{current_year+1}",
                    month=month,
                    description=f"GSTR-3B return for month {month}",
                    status="Pending"
                )
                db.add(cd_3b)
        
        # Create TDS deadlines if TDS service is included
        if 'TDS' in (client.service_type or []):
            # Quarterly TDS returns
            for quarter in range(1, 5):
                deadline = date(current_year, (quarter * 3) + 1, 7)
                
                cd = ComplianceDeadline(
                    company_id=client.company_id,
                    deadline_type="TDS 24Q",
                    due_date=deadline,
                    financial_year=f"{current_year}-{current_year+1}",
                    month=quarter * 3,
                    description=f"TDS 24Q for Q{quarter}",
                    status="Pending"
                )
                db.add(cd)
        
        # Create annual deadlines
        if 'Audit' in (client.service_type or []):
            cd_audit = ComplianceDeadline(
                company_id=client.company_id,
                deadline_type="Audit",
                due_date=date(current_year + 1, 9, 30),
                financial_year=f"{current_year}-{current_year+1}",
                description="Annual audit completion",
                status="Pending"
            )
            db.add(cd_audit)
        
        if 'ITR' in (client.service_type or []):
            cd_itr = ComplianceDeadline(
                company_id=client.company_id,
                deadline_type="ITR",
                due_date=date(current_year + 1, 7, 31),
                financial_year=f"{current_year}-{current_year+1}",
                description="Income Tax Return filing",
                status="Pending"
            )
            db.add(cd_itr)
        
        db.commit()
    
    @classmethod
    def record_notice(
        cls,
        client_id: int,
        notice_type: str,
        notice_number: str,
        notice_date: date,
        due_date: date,
        subject: str,
        description: str,
        db: Session
    ) -> CANotice:
        """Record a notice received from authorities"""
        
        notice = CANotice(
            client_id=client_id,
            notice_type=notice_type,
            notice_number=notice_number,
            notice_date=notice_date,
            received_date=date.today(),
            due_date=due_date,
            subject=subject,
            description=description,
            status="Received"
        )
        
        db.add(notice)
        db.commit()
        
        return notice
    
    @classmethod
    def create_task(
        cls,
        client_id: int,
        company_id: int,
        task_title: str,
        task_type: str,
        assigned_to: str,
        due_date: date,
        priority: str,
        description: str = None,
        db: Session = None
    ) -> CATask:
        """Create task for client"""
        
        task = CATask(
            client_id=client_id,
            company_id=company_id,
            task_title=task_title,
            task_type=task_type,
            assigned_to=assigned_to,
            due_date=due_date,
            priority=priority,
            description=description,
            status="Pending"
        )
        
        db.add(task)
        db.commit()
        
        return task
    
    @classmethod
    def get_pending_deadlines(
        cls,
        company_id: int,
        db: Session,
        days_ahead: int = 30
    ) -> List[Dict]:
        """Get pending compliance deadlines"""
        
        today = date.today()
        deadline_date = today + timedelta(days=days_ahead)
        
        deadlines = db.query(ComplianceDeadline).filter(
            and_(
                ComplianceDeadline.company_id == company_id,
                ComplianceDeadline.due_date >= today,
                ComplianceDeadline.due_date <= deadline_date,
                ComplianceDeadline.status == "Pending"
            )
        ).order_by(ComplianceDeadline.due_date).all()
        
        result = []
        for deadline in deadlines:
            days_remaining = (deadline.due_date - today).days
            is_overdue = days_remaining < 0
            
            result.append({
                "id": deadline.id,
                "deadline_type": deadline.deadline_type,
                "due_date": deadline.due_date.isoformat(),
                "days_remaining": days_remaining,
                "is_overdue": is_overdue,
                "description": deadline.description,
                "financial_year": deadline.financial_year,
                "alert_status": "Urgent" if days_remaining <= 7 else "Upcoming"
            })
        
        return result
    
    @classmethod
    def get_overdue_deadlines(
        cls,
        company_id: int,
        db: Session
    ) -> List[Dict]:
        """Get overdue compliance deadlines"""
        
        today = date.today()
        
        deadlines = db.query(ComplianceDeadline).filter(
            and_(
                ComplianceDeadline.company_id == company_id,
                ComplianceDeadline.due_date < today,
                ComplianceDeadline.status == "Pending"
            )
        ).order_by(ComplianceDeadline.due_date.desc()).all()
        
        result = []
        for deadline in deadlines:
            days_overdue = (today - deadline.due_date).days
            
            result.append({
                "id": deadline.id,
                "deadline_type": deadline.deadline_type,
                "due_date": deadline.due_date.isoformat(),
                "days_overdue": days_overdue,
                "description": deadline.description,
                "financial_year": deadline.financial_year
            })
        
        return result
    
    @classmethod
    def get_client_dashboard(
        cls,
        client_id: int,
        db: Session
    ) -> Dict:
        """Get client dashboard summary"""
        
        client = db.query(CAClient).get(client_id)
        if not client:
            raise ValueError("Client not found")
        
        # Get pending tasks
        pending_tasks = db.query(CATask).filter(
            and_(
                CATask.client_id == client_id,
                CATask.status == "Pending"
            )
        ).count()
        
        # Get open notices
        open_notices = db.query(CANotice).filter(
            and_(
                CANotice.client_id == client_id,
                CANotice.status.in_(["Received", "In Progress"])
            )
        ).all()
        
        # Get upcoming deadlines
        today = date.today()
        upcoming = db.query(ComplianceDeadline).filter(
            and_(
                ComplianceDeadline.company_id == client.company_id,
                ComplianceDeadline.due_date >= today,
                ComplianceDeadline.due_date <= today + timedelta(days=30),
                ComplianceDeadline.status == "Pending"
            )
        ).count()
        
        # Get overdue items
        overdue = db.query(ComplianceDeadline).filter(
            and_(
                ComplianceDeadline.company_id == client.company_id,
                ComplianceDeadline.due_date < today,
                ComplianceDeadline.status == "Pending"
            )
        ).count()
        
        return {
            "client_name": client.client_name,
            "client_type": client.client_type,
            "status": client.status,
            "services": client.service_type,
            "pending_tasks": pending_tasks,
            "open_notices": len(open_notices),
            "upcoming_deadlines": upcoming,
            "overdue_items": overdue,
            "critical_alerts": len([n for n in open_notices if (today - n.due_date).days > 0])
        }
    
    @classmethod
    def get_ca_practice_summary(
        cls,
        company_id: int,
        db: Session
    ) -> Dict:
        """Get CA practice summary for all clients"""
        
        clients = db.query(CAClient).filter(CAClient.company_id == company_id).all()
        
        total_clients = len(clients)
        active_clients = sum(1 for c in clients if c.status == "Active")
        
        # Count tasks by priority
        tasks = db.query(CATask).filter(CATask.company_id == company_id).all()
        task_distribution = defaultdict(int)
        for task in tasks:
            task_distribution[task.priority] += 1
        
        # Count open notices
        notices = db.query(CANotice).filter(
            CANotice.client_id.in_([c.id for c in clients]),
            CANotice.status != "Resolved"
        ).all()
        
        # Count overdue deadlines
        today = date.today()
        overdue_deadlines = db.query(ComplianceDeadline).filter(
            and_(
                ComplianceDeadline.company_id == company_id,
                ComplianceDeadline.due_date < today,
                ComplianceDeadline.status == "Pending"
            )
        ).count()
        
        return {
            "total_clients": total_clients,
            "active_clients": active_clients,
            "inactive_clients": total_clients - active_clients,
            "total_tasks": len(tasks),
            "task_distribution": dict(task_distribution),
            "open_notices": len(notices),
            "critical_notices": sum(1 for n in notices if (today - n.due_date).days > 0),
            "overdue_deadlines": overdue_deadlines
        }
    
    @classmethod
    def update_deadline_status(
        cls,
        deadline_id: int,
        status: str,
        db: Session
    ) -> ComplianceDeadline:
        """Update compliance deadline status"""
        
        deadline = db.query(ComplianceDeadline).get(deadline_id)
        if not deadline:
            raise ValueError("Deadline not found")
        
        deadline.status = status
        if status == "Completed":
            deadline.completion_date = date.today()
        
        db.commit()
        return deadline
    
    @classmethod
    def resolve_notice(
        cls,
        notice_id: int,
        resolution_notes: str,
        db: Session
    ) -> CANotice:
        """Mark notice as resolved"""
        
        notice = db.query(CANotice).get(notice_id)
        if not notice:
            raise ValueError("Notice not found")
        
        notice.status = "Resolved"
        notice.resolution_notes = resolution_notes
        notice.resolved_on = date.today()
        
        db.commit()
        return notice
