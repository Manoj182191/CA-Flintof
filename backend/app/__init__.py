"""
CA ERP Backend Application Package
With runtime patches for passlib + bcrypt compatibility.
"""
try:
    import bcrypt
    
    # Patch hashpw
    original_hashpw = bcrypt.hashpw
    def patched_hashpw(password, salt):
        if isinstance(password, str):
            password = password.encode('utf-8')
        if len(password) > 72:
            password = password[:72]
        return original_hashpw(password, salt)
    bcrypt.hashpw = patched_hashpw
    
    # Patch checkpw
    original_checkpw = bcrypt.checkpw
    def patched_checkpw(password, hashed_password):
        if isinstance(password, str):
            password = password.encode('utf-8')
        if len(password) > 72:
            password = password[:72]
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        return original_checkpw(password, hashed_password)
    bcrypt.checkpw = patched_checkpw

except ImportError:
    pass
