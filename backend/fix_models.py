import sys

def fix_models():
    path = 'app/models/models.py'
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    try:
        first = lines.index('class LeaveType(Base):\n')
        second = lines.index('class LeaveType(Base):\n', first + 1)
        
        # Keep everything up to just before the second occurrence
        clean_lines = lines[:second]
        
        # Append EmailVerificationToken
        clean_lines.append('\n# ============== AUTH & SECURITY EXTENDED MODELS ==============\n\n')
        clean_lines.append('class EmailVerificationToken(Base):\n')
        clean_lines.append('    __tablename__ = "email_verification_tokens"\n\n')
        clean_lines.append('    id = Column(Integer, primary_key=True)\n')
        clean_lines.append('    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)\n')
        clean_lines.append('    token_hash = Column(String(255), nullable=False, unique=True)\n')
        clean_lines.append('    expires_at = Column(DateTime, nullable=False)\n')
        clean_lines.append('    verified_at = Column(DateTime)\n')
        clean_lines.append('    created_at = Column(DateTime, default=datetime.utcnow)\n\n')
        clean_lines.append('    user = relationship("User")\n')
        
        with open(path, 'w', encoding='utf-8') as f:
            f.writelines(clean_lines)
            
        print("Fixed models.py successfully.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_models()
