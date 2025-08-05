# Namas Architecture Website

A modern, responsive website for Namas Architecture showcasing their portfolio, services, and team.

## Features

- **Portfolio Showcase**: Beautiful project galleries with detailed descriptions
- **Service Pages**: Comprehensive information about architectural services
- **Team Profiles**: Meet the team behind the designs
- **Blog System**: Share insights and updates
- **Admin Dashboard**: Content management system
- **Contact Form**: Direct communication with email notifications
- **Responsive Design**: Optimized for all devices

## Email Configuration

The contact form sends notifications to a specified email address. To configure email functionality:

1. **Set up Gmail App Password** (recommended):
   - Enable 2-factor authentication on your Gmail account
   - Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Generate a new app password for "Mail"
   - Use this app password (not your regular Gmail password)

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

3. **Target Email**: 
   Contact form submissions are automatically sent to `zensukinsc@gmail.com`

**Note**: The contact form will still work and save submissions even if email configuration fails.

## Tech Stack
