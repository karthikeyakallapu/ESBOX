import re
from typing import Optional

from pydantic import BaseModel, Field, validator


class TelegramLoginBase(BaseModel):
    phone: str = Field(..., min_length=1, description="Phone number cannot be empty")

    @validator('phone')
    def validate_phone(cls, v):
        if not v or v.strip() == "":
            raise ValueError('Phone number cannot be empty')

        # Remove all spaces, dashes, parentheses, and plus signs for validation
        cleaned = re.sub(r'[\s\-\(\)\+]', '', v.strip())

        # Check if contains only digits
        if not cleaned.isdigit():
            raise ValueError('Phone number should contain only digits, spaces, +, -, or parentheses')

        # Check length (minimum 7 digits, maximum 15 digits - international standard)
        if len(cleaned) < 7:
            raise ValueError('Phone number is too short (minimum 7 digits)')
        if len(cleaned) > 15:
            raise ValueError('Phone number is too long (maximum 15 digits)')

        # Check if starts with valid country code pattern (optional)
        # Common country codes: 1 (US), 44 (UK), 91 (India), etc.
        if not re.match(r'^\d{7,15}$', cleaned):
            raise ValueError('Invalid phone number format')

        # Optional: Check if it's a valid international number format
        # This checks for common patterns (e.g., starts with valid country codes)
        # if not re.match(r'^(1|2|3|4|5|6|7|8|9)\d{6,14}$', cleaned):
        #     raise ValueError('Invalid phone number format')

        # Return formatted version (consistent format)
        # Format with plus for international
        if cleaned.startswith('00'):
            # Convert 00 to + (common in some countries)
            return '+' + cleaned[2:]
        elif cleaned.startswith('0'):
            # Local number - maybe you want to keep as is or add country code
            # For now, just return cleaned
            return cleaned
        else:
            # Already has country code, add plus if not present
            return '+' + cleaned

class TelegramAuthResponse(BaseModel):
    success: bool
    message: str
    requires_2fa: bool = False
    telegram_user: Optional[dict] = None


class TelegramAuth(BaseModel):
    code: str
