# Quick Debug Instructions for Ubuntu Server

## Step 1: Update LOG_LEVEL to DEBUG

Edit your `.env` file:
```bash
nano ~/.env
# or
nano /home/ubuntu/ESBOX/server/.env
```

Change this line:
```
LOG_LEVEL=INFO
```
To:
```
LOG_LEVEL=DEBUG
```

Save and exit (Ctrl+X, then Y, then Enter in nano)

## Step 2: Restart the Server

Stop the current server (Ctrl+C if running in foreground)

Then restart:
```bash
cd /home/ubuntu/ESBOX/server
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1
```

## Step 3: Check for Debug Logs

You should see this on startup:
```
🔧 Logger initialized with level: DEBUG (effective: DEBUG)
```

## Step 4: Try to Upload

Make a file upload request and watch for cyan-colored DEBUG logs

## Step 5: If Session Not Found, Run Debug Script

```bash
cd /home/ubuntu/ESBOX/server
python test_session_debug.py
```

This will tell you exactly what's wrong with the session!

## What to Look For

### Good Signs ✅
- "User X session found in Redis"
- "Successfully decrypted!"
- "User X has Telegram session, proceeding with upload"

### Bad Signs ❌
- "result from DB for user X: None" → User never connected Telegram
- "Decryption failed" → Encryption key mismatch
- "Session for user X not in Redis" → Normal, should fall back to DB

## If User Has No Session

The user needs to connect their Telegram account:

1. Frontend should call: `POST /api/v1/telegram/request-code`
2. User enters the code they receive on Telegram
3. Frontend calls: `POST /api/v1/telegram/verify-code`
4. Session is saved to database
5. Now uploads will work!

## Quick Test Query (PostgreSQL)

Check if user has a session in DB:
```sql
SELECT id, user_id, 
       LENGTH(encrypted_session) as encrypted_length,
       created_at, updated_at
FROM telegram_sessions 
WHERE user_id = 1;
```

If this returns no rows, the user needs to complete Telegram authentication!

