def send_otp(phone: str, code: str) -> None:
    # Development mode: no real SMS provider.
    print(f"[DEV OTP] phone={phone} code={code}")
