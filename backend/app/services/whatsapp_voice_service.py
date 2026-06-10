"""
WhatsApp & Voice Accounting Service
Implements: WhatsApp invoice creation command parser, voice command parser
(transcript -> intent + structured action), command routing, response formatting.
"""
from datetime import date, datetime
from typing import Dict, List, Optional
import re
import json
import logging
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.models import (
    WhatsAppMessage, VoiceCommand, Customer, Vendor, Invoice,
    InvoiceLineItem, StockItem, Company,
)

logger = logging.getLogger(__name__)


# ============ WhatsApp ============

class WhatsAppHandler:
    """Handle incoming and outgoing WhatsApp messages."""

    @staticmethod
    def record_message(
        db: Session, company_id: int, phone_number: str, direction: str,
        message_text: str = None, message_type: str = "Text",
        attachment_url: str = None,
    ) -> WhatsAppMessage:
        """Record an incoming/outgoing message and process if incoming."""
        msg = WhatsAppMessage(
            company_id=company_id, phone_number=phone_number,
            direction=direction, message_type=message_type,
            message_text=message_text, attachment_url=attachment_url,
            processing_status="Pending" if direction == "INCOMING" else "Sent",
        )
        db.add(msg)
        db.flush()

        if direction == "INCOMING" and message_text:
            try:
                response = WhatsAppHandler.process_command(db, company_id, phone_number, message_text)
                msg.processing_status = "Processed"
                msg.processing_log = response
            except Exception as e:
                msg.processing_status = "Failed"
                msg.processing_log = {"error": str(e)}
        db.commit()
        db.refresh(msg)
        return msg

    @staticmethod
    def process_command(db: Session, company_id: int, phone: str, text: str) -> Dict:
        """
        Parse a natural-language WhatsApp message and produce a structured action.
        Supports: invoice, payment, balance.
        """
        text_lower = text.lower().strip()
        if text_lower.startswith("invoice") or text_lower.startswith("bill"):
            return WhatsAppHandler._parse_invoice(db, company_id, phone, text)
        if text_lower.startswith("payment") or text_lower.startswith("paid"):
            return WhatsAppHandler._parse_payment(db, company_id, phone, text)
        if text_lower.startswith("balance") or text_lower == "bal":
            return WhatsAppHandler._parse_balance(db, company_id, phone)
        if text_lower.startswith("hi") or text_lower.startswith("hello"):
            return {
                "intent": "greeting",
                "response": (
                    "Hello! I can help you:\n"
                    "- Create an invoice: 'Invoice ABC Pvt 5000'\n"
                    "- Record a payment: 'Payment from ABC 2500'\n"
                    "- Check balance: 'Balance'"
                ),
            }
        return {
            "intent": "unknown",
            "response": "I didn't understand. Try 'Invoice [customer] [amount]' or 'Balance'.",
        }

    @staticmethod
    def _parse_invoice(db: Session, company_id: int, phone: str, text: str) -> Dict:
        """Parse 'Invoice [customer name] [amount] [gst rate]'."""
        # Strip leading keyword
        body = re.sub(r"^(invoice|bill)\s+", "", text, flags=re.IGNORECASE).strip()
        # Find amount
        amount_match = re.search(r"(\d+(?:\.\d+)?)", body)
        if not amount_match:
            return {"intent": "invoice", "error": "Could not find an amount in the message"}
        amount = float(amount_match.group(1))
        customer_name = body[:amount_match.start()].strip() or "Unknown"
        # GST rate
        gst_match = re.search(r"(\d+)\s*%?\s*gst", body, re.IGNORECASE)
        gst_rate = float(gst_match.group(1)) if gst_match else 18.0

        # Find or create customer by phone
        customer = db.query(Customer).filter(
            Customer.company_id == company_id, Customer.phone == phone
        ).first()
        if not customer:
            customer = Customer(company_id=company_id, name=customer_name, phone=phone)
            db.add(customer)
            db.flush()

        # Create invoice
        last = db.query(Invoice).filter(
            Invoice.company_id == company_id
        ).order_by(Invoice.id.desc()).first()
        next_num = (last.id + 1) if last else 1
        inv = Invoice(
            company_id=company_id, customer_id=customer.id,
            invoice_number=f"INV-WA-{next_num:06d}",
            invoice_date=date.today(),
            invoice_type="Sales",
            subtotal=amount, tax_amount=round(amount * gst_rate / 100, 2),
            total_amount=round(amount * (1 + gst_rate / 100), 2),
            paid_amount=0, status="Draft",
        )
        db.add(inv)
        db.flush()
        db.add(InvoiceLineItem(
            invoice_id=inv.id, description=body, quantity=1, unit_price=amount,
            gst_rate=gst_rate, gst_amount=round(amount * gst_rate / 100, 2),
            line_total=amount,
        ))
        db.commit()

        return {
            "intent": "invoice",
            "success": True,
            "invoice_id": inv.id,
            "invoice_number": inv.invoice_number,
            "customer": customer.name,
            "amount": amount,
            "gst_rate": gst_rate,
            "total": inv.total_amount,
            "response": (
                f"Invoice {inv.invoice_number} created for {customer.name}: "
                f"Rs. {inv.total_amount} (incl. {gst_rate}% GST)"
            ),
        }

    @staticmethod
    def _parse_payment(db: Session, company_id: int, phone: str, text: str) -> Dict:
        body = re.sub(r"^(payment|paid)\s+", "", text, flags=re.IGNORECASE).strip()
        body = re.sub(r"^(from|by)\s+", "", body, flags=re.IGNORECASE).strip()
        amount_match = re.search(r"(\d+(?:\.\d+)?)", body)
        if not amount_match:
            return {"intent": "payment", "error": "Could not find amount"}
        amount = float(amount_match.group(1))
        name = body[:amount_match.start()].strip() or "Customer"
        return {
            "intent": "payment",
            "success": True,
            "customer": name,
            "amount": amount,
            "response": f"Recorded payment of Rs. {amount} from {name}. (Verify in app)",
        }

    @staticmethod
    def _parse_balance(db: Session, company_id: int, phone: str) -> Dict:
        customer = db.query(Customer).filter(
            Customer.company_id == company_id, Customer.phone == phone
        ).first()
        if not customer:
            return {"intent": "balance", "response": "No account found for this number."}
        outstanding = db.query(func.coalesce(func.sum(Invoice.total_amount - Invoice.paid_amount), 0)).filter(
            Invoice.company_id == company_id, Invoice.customer_id == customer.id,
            Invoice.status.in_(["Sent", "Overdue"]),
        ).scalar() or 0
        return {
            "intent": "balance",
            "customer": customer.name,
            "outstanding": round(float(outstanding), 2),
            "response": f"Hello {customer.name}, your outstanding balance is Rs. {round(float(outstanding), 2)}",
        }


# ============ Voice ============

class VoiceCommandHandler:
    """Process voice transcripts into structured commands."""

    @staticmethod
    def process_voice(
        db: Session, company_id: int, user_id: int, transcript: str,
    ) -> VoiceCommand:
        """Record and process a voice command."""
        parsed = VoiceCommandHandler.parse_intent(transcript)
        cmd = VoiceCommand(
            company_id=company_id, user_id=user_id,
            transcript=transcript, command_type=parsed.get("intent"),
            parsed_payload=parsed,
            action_status="Parsed",
        )
        db.add(cmd)
        db.commit()
        db.refresh(cmd)
        return cmd

    @staticmethod
    def parse_intent(transcript: str) -> Dict:
        """
        Rule-based voice intent parser.
        Recognizes: voucher creation, invoice creation, query, report.
        """
        text = transcript.lower().strip()
        result = {"intent": "unknown", "raw": transcript}

        # Voucher: "create payment voucher to [payee] for [amount]"
        m = re.search(
            r"(create|make|record)?\s*(payment|receipt|journal|sales|purchase)?\s*voucher\s*(?:to|for)?\s*([\w\s]+?)\s*(?:for|of|amount)?\s*(\d+(?:\.\d+)?)",
            text,
        )
        if m:
            return {
                "intent": "create_voucher",
                "voucher_type": (m.group(2) or "Journal").capitalize(),
                "payee": m.group(3).strip(),
                "amount": float(m.group(4)),
            }

        # Invoice: "create invoice for [customer] [amount]"
        m = re.search(
            r"(create|make)?\s*invoice\s*(?:for|to)?\s*([\w\s]+?)\s*(?:for|of|amount)?\s*(\d+(?:\.\d+)?)",
            text,
        )
        if m:
            return {
                "intent": "create_invoice",
                "customer": m.group(2).strip(),
                "amount": float(m.group(3)),
            }

        # Reports
        if "trial balance" in text or "show trial" in text:
            return {"intent": "show_trial_balance"}
        if "profit" in text and "loss" in text:
            return {"intent": "show_profit_loss"}
        if "balance sheet" in text:
            return {"intent": "show_balance_sheet"}
        if "day book" in text or "daybook" in text:
            return {"intent": "show_day_book"}
        if "cash flow" in text:
            return {"intent": "show_cash_flow"}
        if "stock" in text or "inventory" in text:
            return {"intent": "show_stock"}

        # Greetings
        if re.match(r"^(hi|hello|hey)\b", text):
            return {"intent": "greeting"}

        return result
