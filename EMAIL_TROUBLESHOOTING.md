# Email Troubleshooting Guide

## Issue: Contact form not sending emails after deployment

### 🔍 Common Causes & Solutions

### 1. **Environment Variables Not Set in Production**

**Problem**: The most common issue is that `EMAIL_USER` and `EMAIL_PASS` environment variables are not configured in your production environment.

**Solution**:
- **For Railway/Heroku/Vercel**: Add environment variables in your deployment platform's dashboard
- **For cPanel/VPS**: Create a `.env` file on your server or set environment variables

**Required Environment Variables**:
```
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-16-character-app-password
```

### 2. **Gmail App Password Not Set Up**

**Problem**: Using regular Gmail password instead of App Password.

**Solution**:
1. Enable 2-Factor Authentication on your Gmail account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new App Password for "Mail"
4. Use the 16-character App Password (not your regular password)

### 3. **Check Server Logs**

**What to look for in server logs**:
- `✅ Email server connection verified successfully` - Good!
- `❌ Email server connection failed` - Configuration issue
- `📧 Attempting to send email to: zensukinsc@gmail.com` - Email attempt
- `✅ Contact form submitted and email sent successfully` - Success!
- `❌ Error sending email notification` - Check error details

### 4. **Test Email Functionality**

**Use the test endpoint**:
```bash
# Replace YOUR_SERVER_URL with your actual server URL
curl -X POST YOUR_SERVER_URL/api/test-email
```

**Or test via browser console**:
```javascript
fetch('/api/test-email', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

### 5. **Gmail Security Settings**

**Check these Gmail settings**:
- 2-Factor Authentication: ✅ Enabled
- App Passwords: ✅ Generated and used
- "Less secure app access": ❌ Should be disabled (use App Password instead)

### 6. **Firewall/Network Issues**

**For VPS/Self-hosted**:
- Ensure port 587 (SMTP) is not blocked
- Check if your hosting provider blocks outgoing SMTP
- Some shared hosting providers block SMTP ports

### 7. **Alternative Email Services**

**If Gmail doesn't work, try**:
- SendGrid
- Mailgun
- AWS SES
- Your hosting provider's SMTP service

### 🧪 Debug Steps

1. **Check server startup logs**:
   ```
   🚀 NAMAS Architecture API Server running on port 5000
   📧 Verifying email configuration...
   ✅ Email server connection verified successfully
   ```

2. **Test the endpoint**:
   - POST to `/api/test-email`
   - Check response and server logs

3. **Check contact form submission**:
   - Submit a contact form
   - Check server logs for email attempt
   - Look for error messages

4. **Verify environment variables**:
   - Server logs will show: `EMAIL_USER: ***configured***` or `NOT SET`

### 🔧 Quick Fixes

**For immediate testing, you can temporarily hardcode values** (remove after testing):
```javascript
// In server.js - TEMPORARY FOR TESTING ONLY
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-actual-email@gmail.com',
    pass: 'your-actual-app-password'
  },
  // ... rest of config
})
```

### 📋 Deployment Checklist

- [ ] Environment variables set in production
- [ ] Gmail App Password generated and used
- [ ] Server logs show email connection verified
- [ ] Test endpoint works
- [ ] Contact form submissions appear in server logs
- [ ] Check spam/junk folder in zensukinsc@gmail.com

### 🆘 Still Not Working?

1. **Share server logs** from startup and contact form submission
2. **Test the `/api/test-email` endpoint** and share the response
3. **Verify your deployment platform** supports SMTP
4. **Check if your hosting provider blocks SMTP** ports

### 📧 Expected Email Format

When working, you should receive emails like this:

**Subject**: `New Contact Form Submission from [Name]`
**To**: `zensukinsc@gmail.com`
**Content**: Formatted HTML with all form details

---

**Need help?** Check your server logs and test the `/api/test-email` endpoint first!