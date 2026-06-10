import os
import sys
import datetime

# Add backend dir to pythonpath
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.models import User, Company, FinancialYear, LedgerGroup, CompanySetting
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def seed_db():
    print("Connecting to live PostgreSQL database...")
    db_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://")
    engine = create_engine(db_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # 1. Admin User
        admin_email = "admin@caerp.com"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                email=admin_email,
                username="admin",
                full_name="System Administrator",
                hashed_password=get_password_hash("Admin@123!"),
                is_active=True,
                is_admin=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print(f"Created Admin User: {admin_email}")
        else:
            print(f"Admin User {admin_email} already exists.")

        # 2. Demo Company
        company_name = "Acme Corp Ltd"
        company = db.query(Company).filter(Company.name == company_name).first()
        if not company:
            company = Company(
                name=company_name,
                legal_name="Acme Corporation Limited",
                pan="ABCDE1234F",
                gstin="27ABCDE1234F1Z5",
                business_type="Private Limited",
                email="contact@acmecorp.com",
                phone="9876543210",
                address="123 Acme Tower, Nariman Point, Mumbai, Maharashtra 400021",
                country="IN",
                currency="INR",
                created_by=admin.id
            )
            db.add(company)
            db.commit()
            db.refresh(company)
            print(f"Created Demo Company: {company_name}")
        else:
            print(f"Demo Company {company_name} already exists.")

        # 3. Default Settings
        setting = db.query(CompanySetting).filter(CompanySetting.company_id == company.id).first()
        if not setting:
            setting = CompanySetting(
                company_id=company.id,
                enable_multi_currency=False,
                enable_cost_centers=True,
                enable_profit_centers=False,
                enable_gst=True,
                enable_tds=True,
                enable_payroll=True,
                enable_inventory=True,
                enable_audit=True,
                base_currency="INR"
            )
            db.add(setting)
            db.commit()
            print("Created Default Settings for Demo Company.")

        # 4. Financial Year
        current_year = datetime.date.today().year
        fy_start = datetime.date(current_year if datetime.date.today().month >= 4 else current_year - 1, 4, 1)
        fy_end = datetime.date(fy_start.year + 1, 3, 31)
        fy_label = f"{fy_start.year}-{str(fy_end.year)[-2:]}"

        fy = db.query(FinancialYear).filter(FinancialYear.company_id == company.id, FinancialYear.label == fy_label).first()
        if not fy:
            fy = FinancialYear(
                company_id=company.id,
                start_date=fy_start,
                end_date=fy_end,
                label=fy_label,
                is_active=True,
                is_locked=False
            )
            db.add(fy)
            db.commit()
            print(f"Created Financial Year: {fy_label}")

        # 5. Default Ledger Groups
        groups = [
            {"name": "Assets", "group_type": "Asset", "is_system": True},
            {"name": "Liabilities", "group_type": "Liability", "is_system": True},
            {"name": "Equity", "group_type": "Liability", "is_system": True},
            {"name": "Income", "group_type": "Income", "is_system": True},
            {"name": "Expenses", "group_type": "Expense", "is_system": True},
            {"name": "Sundry Debtors", "group_type": "Asset", "is_system": True, "parent": "Assets"},
            {"name": "Sundry Creditors", "group_type": "Liability", "is_system": True, "parent": "Liabilities"},
            {"name": "Bank Accounts", "group_type": "Asset", "is_system": True, "parent": "Assets"},
            {"name": "Cash-in-hand", "group_type": "Asset", "is_system": True, "parent": "Assets"},
            {"name": "Duties & Taxes", "group_type": "Liability", "is_system": True, "parent": "Liabilities"}
        ]
        
        group_map = {}
        for g_data in groups:
            g_name = g_data["name"]
            existing = db.query(LedgerGroup).filter(LedgerGroup.company_id == company.id, LedgerGroup.name == g_name).first()
            if not existing:
                parent_id = None
                if "parent" in g_data and g_data["parent"] in group_map:
                    parent_id = group_map[g_data["parent"]]
                
                lg = LedgerGroup(
                    company_id=company.id,
                    name=g_name,
                    group_type=g_data["group_type"],
                    parent_id=parent_id
                )
                db.add(lg)
                db.commit()
                db.refresh(lg)
                group_map[g_name] = lg.id
                print(f"Created Ledger Group: {g_name}")
            else:
                group_map[g_name] = existing.id

        print("\nLive PostgreSQL Database Seeded Successfully!")
        print(f"Login: {admin_email} | Password: Admin@123!")

    except Exception as e:
        print(f"Error seeding database: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
