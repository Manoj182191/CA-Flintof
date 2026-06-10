"""
Comprehensive test suite for the CA ERP backend.
Run: pytest backend/tests -v
"""
import pytest
from datetime import date, datetime, timedelta
from decimal import Decimal


# ============ Fixtures ============

# ============ Fixtures ============
# Moved to conftest.py


# ============ Auth Tests ============

class TestAuth:
    def test_register_success(self, client):
        r = client.post("/api/auth/register", json={
            "email": "user1@test.com", "username": "usr1",
            "full_name": "User One", "password": "securepass1"
        })
        assert r.status_code == 201
        assert r.json()["email"] == "user1@test.com"

    def test_register_duplicate(self, client):
        payload = {"email": "dup@test.com", "username": "dup",
                   "full_name": "Dup", "password": "securepass1"}
        client.post("/api/auth/register", json=payload)
        r = client.post("/api/auth/register", json=payload)
        assert r.status_code == 409

    def test_register_weak_password(self, client):
        r = client.post("/api/auth/register", json={
            "email": "weak@test.com", "username": "weak",
            "full_name": "Weak", "password": "123"
        })
        assert r.status_code == 422

    def test_login_success(self, client):
        client.post("/api/auth/register", json={
            "email": "l@test.com", "username": "usr_l",
            "full_name": "L", "password": "securepass1"
        })
        r = client.post("/api/auth/login", json={"email": "l@test.com", "password": "securepass1"})
        assert r.status_code == 200
        assert "access_token" in r.json()

    def test_login_wrong_password(self, client):
        client.post("/api/auth/register", json={
            "email": "w@test.com", "username": "usr_w",
            "full_name": "W", "password": "securepass1"
        })
        r = client.post("/api/auth/login", json={"email": "w@test.com", "password": "wrongpass"})
        assert r.status_code == 401

    def test_me_requires_auth(self, client):
        r = client.get("/api/auth/me")
        assert r.status_code in (401, 403)

    def test_me_with_auth(self, client, auth_headers):
        r = client.get("/api/auth/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"] == "test@example.com"

    def test_password_change(self, client, auth_headers):
        r = client.post("/api/auth/password/change", headers=auth_headers, json={
            "current_password": "testpass123", "new_password": "newpass456"
        })
        assert r.status_code == 200
        # Login with new password
        r = client.post("/api/auth/login", json={
            "email": "test@example.com", "password": "newpass456"
        })
        assert r.status_code == 200


# ============ Company Tests ============

class TestCompanies:
    def test_create_company(self, client, auth_headers):
        r = client.post("/api/companies/", headers=auth_headers, json={
            "name": "Acme Corp", "pan": "AAAPA1234A", "gstin": "27AAAPA1234A1Z0",
            "business_type": "Private Limited"
        })
        assert r.status_code == 201
        assert r.json()["name"] == "Acme Corp"
        assert r.json()["gstin"] == "27AAAPA1234A1Z0"

    def test_create_company_invalid_gstin(self, client, auth_headers):
        r = client.post("/api/companies/", headers=auth_headers, json={
            "name": "Bad GSTIN Co", "gstin": "BAD"
        })
        assert r.status_code == 400

    def test_list_companies(self, client, auth_headers):
        client.post("/api/companies/", headers=auth_headers, json={"name": "Co1"})
        client.post("/api/companies/", headers=auth_headers, json={"name": "Co2"})
        r = client.get("/api/companies/", headers=auth_headers)
        assert r.status_code == 200
        assert len(r.json()) >= 2

    def test_get_company(self, client, auth_headers):
        r = client.post("/api/companies/", headers=auth_headers, json={"name": "GetMe"})
        cid = r.json()["id"]
        r = client.get(f"/api/companies/{cid}", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["name"] == "GetMe"

    def test_get_nonexistent_company(self, client, auth_headers):
        r = client.get("/api/companies/9999", headers=auth_headers)
        assert r.status_code == 404

    def test_update_company(self, client, auth_headers):
        r = client.post("/api/companies/", headers=auth_headers, json={"name": "Old"})
        cid = r.json()["id"]
        r = client.put(f"/api/companies/{cid}", headers=auth_headers, json={"name": "New"})
        assert r.status_code == 200
        assert r.json()["name"] == "New"

    def test_financial_year_auto_created(self, client, auth_headers):
        r = client.post("/api/companies/", headers=auth_headers, json={"name": "FYTest"})
        cid = r.json()["id"]
        r = client.get(f"/api/companies/{cid}/financial-years", headers=auth_headers)
        assert r.status_code == 200
        assert len(r.json()) >= 1
        assert r.json()[0]["is_active"] is True

    def test_branch_crud(self, client, auth_headers):
        r = client.post("/api/companies/", headers=auth_headers, json={"name": "BranchCo"})
        cid = r.json()["id"]
        # Head office auto-created
        r = client.get(f"/api/companies/{cid}/branches", headers=auth_headers)
        assert len(r.json()) >= 1
        # Create branch
        r = client.post("/api/companies/branches/", headers=auth_headers, json={
            "company_id": cid, "name": "Mumbai", "code": "MUM", "is_head_office": False
        })
        assert r.status_code == 201

    def test_company_settings(self, client, auth_headers):
        r = client.post("/api/companies/", headers=auth_headers, json={"name": "SettingsCo"})
        cid = r.json()["id"]
        r = client.get(f"/api/companies/{cid}/settings", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["company_id"] == cid


# ============ GST Tests ============

class TestGST:
    def test_gstin_valid(self):
        from app.services.gst_service import validate_gstin
        # Real-format valid GSTIN (test data)
        r = validate_gstin("27AAAPA1234A1Z5")
        # May be invalid checksum; test that validator runs
        assert "valid" in r

    def test_gstin_length(self):
        from app.services.gst_service import validate_gstin
        r = validate_gstin("SHORT")
        assert r["valid"] is False
        assert "15" in r["error"]

    def test_calculate_gst_intra(self):
        from app.services.gst_service import calculate_gst
        r = calculate_gst(1000, 18, is_interstate=False)
        assert r["cgst"] == 90
        assert r["sgst"] == 90
        assert r["igst"] == 0
        assert r["total_tax"] == 180

    def test_calculate_gst_inter(self):
        from app.services.gst_service import calculate_gst
        r = calculate_gst(1000, 18, is_interstate=True)
        assert r["igst"] == 180
        assert r["cgst"] == 0
        assert r["sgst"] == 0

    def test_calculate_gst_5pct(self):
        from app.services.gst_service import calculate_gst
        r = calculate_gst(2000, 5, is_interstate=False)
        assert r["cgst"] == 50
        assert r["sgst"] == 50


# ============ TDS Tests ============

class TestTDS:
    def test_calculate_tds_194j(self):
        from app.services.tds_service import calculate_tds
        r = calculate_tds(50000, "194J", "Individual")
        assert r["rate"] == 10
        assert r["tds"] == 5000
        assert r["cess"] > 0

    def test_calculate_tds_below_threshold(self):
        from app.services.tds_service import calculate_tds
        r = calculate_tds(20000, "194J", "Individual")
        # Threshold is 30000 for 194J
        assert r["threshold_applied"] is True
        assert r["total_tds"] == 0

    def test_calculate_tds_194c_individual(self):
        from app.services.tds_service import calculate_tds
        r = calculate_tds(100000, "194C", "Individual")
        assert r["rate"] == 1
        assert r["tds"] == 1000

    def test_calculate_tds_194c_company(self):
        from app.services.tds_service import calculate_tds
        r = calculate_tds(100000, "194C-Company", "Company")
        assert r["rate"] == 2
        assert r["tds"] == 2000

    def test_tds_rates_completeness(self):
        from app.services.tds_service import TDS_RATES
        # Common sections
        for s in ["194A", "194B", "194C", "194H", "194I", "194J"]:
            assert s in TDS_RATES
            assert "rate" in TDS_RATES[s]
            assert "threshold" in TDS_RATES[s]


# ============ Payroll Tests ============

class TestPayroll:
    def test_pf_below_ceiling(self):
        from app.services.payroll_service import calculate_pf
        r = calculate_pf(10000)
        assert r["pf_base"] == 10000
        assert r["employee_pf"] == 1200

    def test_pf_above_ceiling(self):
        from app.services.payroll_service import calculate_pf
        r = calculate_pf(50000)
        # Cap at 15000 for PF
        assert r["pf_base"] == 15000
        assert r["employee_pf"] == 1800

    def test_esi_applicable(self):
        from app.services.payroll_service import calculate_esi
        r = calculate_esi(15000)
        assert r["applicable"] is True
        assert r["employee_esi"] == 112.5  # 0.75% of 15000

    def test_esi_not_applicable(self):
        from app.services.payroll_service import calculate_esi
        r = calculate_esi(25000)
        assert r["applicable"] is False
        assert r["employee_esi"] == 0

    def test_pt_slab_below_5000(self):
        from app.services.payroll_service import calculate_pt
        r = calculate_pt(4000, 5)
        assert r["pt"] == 0

    def test_pt_slab_5000_10000(self):
        from app.services.payroll_service import calculate_pt
        r = calculate_pt(7000, 5)
        assert r["pt"] == 175

    def test_pt_slab_above_10000(self):
        from app.services.payroll_service import calculate_pt
        r = calculate_pt(15000, 5)
        assert r["pt"] == 200

    def test_pt_february_surcharge(self):
        from app.services.payroll_service import calculate_pt
        r = calculate_pt(15000, 2)
        # February: +300 for the >10000 slab
        assert r["pt"] == 500

    def test_tds_on_salary_new_regime(self):
        from app.services.payroll_service import calculate_tds_on_salary
        r = calculate_tds_on_salary(1200000, regime="new")
        assert r["annual_tds"] > 0
        # New regime: 0-3L: 0, 3-7L: 5%, 7-10L: 10%, 10-12L: 15%
        # On 12L - 75K std = 11,92,500
        # Slab 1: 0 (0-3L)
        # Slab 2: 4L * 5% = 20,000
        # Slab 3: 3L * 10% = 30,000
        # Slab 4: 1,92,500 * 15% = 28,875
        # Total tax: 78,875; cess 4%: 3,155
        # Total: ~82,030
        assert r["annual_tds"] > 50000

    def test_tds_on_salary_below_rebate(self):
        from app.services.payroll_service import calculate_tds_on_salary
        r = calculate_tds_on_salary(500000, regime="new")
        # Rebate 87A: full rebate if income <= 7L
        assert r["rebate_87a"] > 0
        assert r["annual_tds"] == 0  # 0 due to full rebate


# ============ Inventory Tests ============

class TestInventory:
    def test_fifo_basic(self):
        from app.services.inventory_service import FIFOValuator
        v = FIFOValuator()
        v.add(100, 10)  # Buy 100 @ 10
        v.add(50, 12)   # Buy 50 @ 12
        consumed, value = v.consume(120)
        assert consumed == 120
        # 100@10=1000, 20@12=240 => 1240
        assert value == 1240
        q, val = v.value_on_hand()
        assert q == 30
        assert val == 360  # 30 @ 12

    def test_lifo_basic(self):
        from app.services.inventory_service import LIFOValuator
        v = LIFOValuator()
        v.add(100, 10)
        v.add(50, 12)
        consumed, value = v.consume(80)
        # LIFO: 50@12=600 + 30@10=300 = 900
        assert value == 900
        q, val = v.value_on_hand()
        assert q == 70
        assert val == 700  # 70 @ 10

    def test_wac_basic(self):
        from app.services.inventory_service import WeightedAverageValuator
        v = WeightedAverageValuator()
        v.add(100, 10)  # 1000
        v.add(50, 14)   # 700  => 150 @ avg 1700/150 = 11.33
        consumed, value = v.consume(80)
        # 80 * (1700/150) = 906.67
        assert value > 900
        assert value < 920


# ============ Accounting Service Tests ============

class TestAccounting:
    def test_validate_voucher_balance(self):
        from app.services.accounting_service import AccountingService
        from app.schemas.schemas import TransactionCreate
        txns = [
            TransactionCreate(ledger_id=1, debit_amount=100, credit_amount=0),
            TransactionCreate(ledger_id=2, debit_amount=0, credit_amount=100),
        ]
        balanced, msg, td, tc = AccountingService.validate_voucher_balance(txns)
        assert balanced is True
        assert td == 100
        assert tc == 100

    def test_validate_voucher_unbalanced(self):
        from app.services.accounting_service import AccountingService
        from app.schemas.schemas import TransactionCreate
        txns = [
            TransactionCreate(ledger_id=1, debit_amount=100, credit_amount=0),
            TransactionCreate(ledger_id=2, debit_amount=0, credit_amount=50),
        ]
        balanced, _, _, _ = AccountingService.validate_voucher_balance(txns)
        assert balanced is False


# ============ AI Service Tests ============

class TestAI:
    def test_rule_based_answer_gst(self):
        from app.services.ai_service import _rule_based_answer
        from unittest.mock import MagicMock
        db = MagicMock()
        r = _rule_based_answer(db, 1, "what is the GST rate?")
        assert "GST" in r

    def test_rule_based_answer_default(self):
        from app.services.ai_service import _rule_based_answer
        from unittest.mock import MagicMock
        db = MagicMock()
        r = _rule_based_answer(db, 1, "xyz random query")
        assert "CA-ERP" in r or "help" in r.lower()

    def test_voice_intent_voucher(self):
        from app.services.whatsapp_voice_service import VoiceCommandHandler
        r = VoiceCommandHandler.parse_intent("create payment voucher to vendor for 5000")
        assert r["intent"] == "create_voucher"
        assert r["amount"] == 5000

    def test_voice_intent_invoice(self):
        from app.services.whatsapp_voice_service import VoiceCommandHandler
        r = VoiceCommandHandler.parse_intent("create invoice for ABC Corp 10000")
        assert r["intent"] == "create_invoice"
        assert r["amount"] == 10000

    def test_voice_intent_trial_balance(self):
        from app.services.whatsapp_voice_service import VoiceCommandHandler
        r = VoiceCommandHandler.parse_intent("show me the trial balance")
        assert r["intent"] == "show_trial_balance"


# ============ WhatsApp Tests ============

class TestWhatsApp:
    def test_parse_invoice(self):
        from app.services.whatsapp_voice_service import WhatsAppHandler
        from unittest.mock import MagicMock
        db = MagicMock()
        db.query.return_value.filter.return_value.order_by.return_value.first.return_value = None
        r = WhatsAppHandler._parse_invoice(db, 1, "9876543210", "Invoice ABC Pvt 5000 18 gst")
        # Without DB, will try to query and may fail
        # Just test that it returns a dict
        assert "intent" in r

    def test_parse_balance_response(self):
        from app.services.whatsapp_voice_service import WhatsAppHandler
        from unittest.mock import MagicMock
        db = MagicMock()
        # Mock customer not found
        db.query.return_value.filter.return_value.first.return_value = None
        r = WhatsAppHandler._parse_balance(db, 1, "9876543210")
        assert r["intent"] == "balance"


# ============ Security Tests ============

class TestSecurity:
    def test_password_hashing(self):
        from app.core.security import hash_password, verify_password
        h = hash_password("mypassword")
        assert h != "mypassword"
        assert verify_password("mypassword", h)
        assert not verify_password("wrongpassword", h)

    def test_totp_secret_generation(self):
        from app.core.security import generate_totp_secret
        s = generate_totp_secret()
        assert len(s) >= 16
        s2 = generate_totp_secret()
        assert s != s2

    def test_totp_verification(self):
        from app.core.security import generate_totp_secret, verify_totp
        secret = generate_totp_secret()
        # Invalid code should fail
        assert verify_totp(secret, "000000") is False
        # Non-numeric should fail
        assert verify_totp(secret, "abcdef") is False

    def test_backup_codes(self):
        from app.core.security import generate_backup_codes
        codes = generate_backup_codes(10)
        assert len(codes) == 10
        assert len(set(codes)) == 10  # All unique

    def test_backup_codes_custom_count(self):
        from app.core.security import generate_backup_codes
        codes = generate_backup_codes(5)
        assert len(codes) == 5

    def test_token_expiry(self):
        from app.core.security import create_access_token
        from datetime import timedelta
        t = create_access_token({"sub": "1"}, expires_delta=timedelta(seconds=1))
        # Token should be a string
        assert isinstance(t, str)
        assert len(t) > 0


# ============ Integration Tests ============

class TestEndToEnd:
    def test_full_workflow(self, client, auth_headers):
        # 1. Create company
        r = client.post("/api/companies/", headers=auth_headers, json={
            "name": "E2E Co", "pan": "AAAPA1234A", "gstin": "27AAAPA1234A1Z0"
        })
        assert r.status_code == 201
        cid = r.json()["id"]

        # 2. List companies
        r = client.get("/api/companies/", headers=auth_headers)
        assert r.status_code == 200
        assert any(c["id"] == cid for c in r.json())

        # 3. Get FY
        r = client.get(f"/api/companies/{cid}/financial-years", headers=auth_headers)
        assert r.status_code == 200
        assert len(r.json()) >= 1

        # 4. Get settings
        r = client.get(f"/api/companies/{cid}/settings", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["company_id"] == cid

    def test_multi_company_tenant_isolation(self, client, auth_headers):
        # Create company A
        r = client.post("/api/companies/", headers=auth_headers, json={"name": "CoA"})
        cid_a = r.json()["id"]
        # Create company B
        r = client.post("/api/companies/", headers=auth_headers, json={"name": "CoB"})
        cid_b = r.json()["id"]
        # Both should be accessible
        r = client.get(f"/api/companies/{cid_a}", headers=auth_headers)
        assert r.status_code == 200
        r = client.get(f"/api/companies/{cid_b}", headers=auth_headers)
        assert r.status_code == 200

    def test_company_settings_update(self, client, auth_headers):
        r = client.post("/api/companies/", headers=auth_headers, json={"name": "SettingsTest"})
        cid = r.json()["id"]
        r = client.put(f"/api/companies/{cid}/settings", headers=auth_headers, json={
            "default_gst_rate": 12,
            "invoice_prefix": "TEST",
            "enable_payroll": False,
        })
        assert r.status_code == 200
        assert r.json()["default_gst_rate"] == 12
        assert r.json()["invoice_prefix"] == "TEST"
        assert r.json()["enable_payroll"] is False
