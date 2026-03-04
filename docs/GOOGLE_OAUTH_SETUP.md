# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the GateKeeper application.

## Prerequisites

- A Google Cloud Platform account
- Access to the [Google Cloud Console](https://console.cloud.google.com/)

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a project" at the top
3. Click "New Project"
4. Enter a project name (e.g., "GateKeeper")
5. Click "Create"

## Step 2: Enable Google+ API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type and click "Create"
3. Fill in the required fields:
   - **App name**: GateKeeper
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click "Save and Continue"
5. On the Scopes page, click "Add or Remove Scopes"
6. Add these scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
7. Click "Save and Continue"
8. Add test users (your email addresses) if in testing mode
9. Click "Save and Continue"

## Step 4: Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Enter a name (e.g., "GateKeeper Web Client")
5. Under "Authorized JavaScript origins", add:
   ```
   http://localhost:3000
   http://localhost:3001
   ```
6. Under "Authorized redirect URIs", add:
   ```
   http://localhost:3001/api/auth/google/callback
   ```
7. Click "Create"
8. Copy your **Client ID** and **Client Secret**

## Step 5: Update Environment Variables

1. Open your `.env` file in the project root
2. Update the following variables with your credentials:
   ```env
   GOOGLE_CLIENT_ID="your_client_id_here"
   GOOGLE_CLIENT_SECRET="your_client_secret_here"
   GOOGLE_CALLBACK_URL="http://localhost:3001/api/auth/google/callback"
   ```

## Step 6: Run Database Migration

The database schema has been updated to support Google OAuth. Run the migration:

```bash
cd packages/database
npx prisma migrate dev --name add_google_oauth_support
```

This will add the following fields to the User model:
- `googleId` - Stores the Google user ID
- `avatarUrl` - Stores the user's profile picture URL
- `passwordHash` - Now optional (for OAuth users)

## Step 7: Start the Application

1. Start the database:
   ```bash
   docker-compose up -d
   ```

2. Start the API server:
   ```bash
   cd apps/api
   npm run dev
   ```

3. Start the attendee web app:
   ```bash
   cd apps/attendee-web
   npm run dev
   ```

## Testing Google OAuth

1. Go to http://localhost:3000/auth
2. Click "Continue with Google"
3. You'll be redirected to Google's login page
4. Sign in with your Google account
5. Grant permissions to the app
6. You'll be redirected back to the app and automatically logged in

## Production Deployment

For production deployment, you'll need to:

1. Update the OAuth consent screen to "Production" status
2. Update the authorized origins and redirect URIs to your production domain
3. Update the `.env` variables with production URLs:
   ```env
   GOOGLE_CALLBACK_URL="https://your-domain.com/api/auth/google/callback"
   ```

## Troubleshooting

### Error: redirect_uri_mismatch

- Make sure the redirect URI in your Google Cloud Console exactly matches the one in your `.env` file
- Check that there are no trailing slashes

### Error: invalid_client

- Double-check your Client ID and Client Secret
- Make sure they're correctly copied into your `.env` file

### Error: access_denied

- The user cancelled the OAuth flow or denied permissions
- Make sure all required scopes are properly configured

## Security Notes

- Never commit your `.env` file with real credentials to version control
- Use different OAuth clients for development and production
- Regularly rotate your client secrets
- Limit test users while in testing mode
