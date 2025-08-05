# Email Setup Guide for Contact Form

## Issue: Contact form not sending emails

The contact form requires proper email configuration to send notifications when users submit messages.

## Steps to Fix:

### 1. **Get Gmail App Password**

Since you're using Gmail for sending emails, you need to create an "App Password":

1. Go to your Google Account settings: https://myaccount.google.com/
2. Select **Security** from the left panel
3. Under "Signing in to Google", select **2-Step Verification** (enable if not already)
4. Go back to Security, then select **App passwords**
5. Generate a new app password for "Mail"
6. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### 2. **Update Environment Variables**

Edit the `/workspace/server/.env` file and replace these values:

```bash
# Replace these with your actual credentials
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

**Example:**
```bash
EMAIL_USER=zensukinsc@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

### 3. **Restart the Server**

After updating the .env file, restart your server:

```bash
cd /workspace/server
npm start
```

### 4. **Test Email Configuration**

You can test the email setup by making a POST request to:
```
POST https://namasdeploy-production.up.railway.app/api/test-email
```

### 5. **Verify Contact Form**

1. Go to your website: https://www.namasbhutan.com
2. Navigate to the Contact page
3. Fill out and submit the contact form
4. Check the email inbox for `zensukinsc@gmail.com`

## Current Configuration

- **Email Service**: Gmail SMTP
- **Target Email**: zensukinsc@gmail.com
- **Server URL**: https://namasdeploy-production.up.railway.app
- **Frontend URL**: https://www.namasbhutan.com

## Common Issues:

1. **"Invalid login"** - Wrong email/password or 2FA not enabled
2. **"Less secure app access"** - Use App Password instead of regular password  
3. **"Connection timeout"** - Check firewall/network settings on server
4. **"535 Authentication failed"** - Double-check credentials in .env file

## Security Notes:

- Never commit the .env file with real credentials to git
- App passwords are safer than regular passwords
- The .env file is already in .gitignore to prevent accidental commits

## Testing Commands:

```bash
# Check if email variables are loaded
node -e "console.log('EMAIL_USER:', process.env.EMAIL_USER); console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');"

# Test email connection (from server directory)
curl -X POST https://namasdeploy-production.up.railway.app/api/test-email
```