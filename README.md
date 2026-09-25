# BizMate AI — Autonomous Business Operations Frontend

BizMate AI is a production-ready, responsive web application acting as the frontend interface for an existing **n8n AI Agent** workflow.

The existing n8n workflow contains:
1. **When Chat Message Received** (Chat Trigger / Webhook)
2. **OpenAI Chat Model**
3. **Simple Memory**
4. **Google Calendar Tool**
5. **Gmail Tool**
6. **Google Sheets Tool**

---

## Architecture Overview

```
USER
 ↓
Sign Up / Login (Firebase Auth)
 ↓
Dashboard / Chat Interface
 ↓
Frontend attaches Session ID + User Metadata
 ↓
HTTP POST to n8n Webhook Endpoint
 ↓
n8n AI Agent processes request & invokes:
   - Google Calendar Tool (Creates meetings & invites)
   - Gmail Tool (Drafts & sends emails)
   - Google Sheets Tool (Reads orders & updates spreadsheets)
 ↓
n8n returns structured or text response
 ↓
Frontend renders response with Interactive Result Cards:
   - CalendarEventCard
   - GmailSentCard
   - GoogleSheetsCard (Search, Paginate, Download CSV)
 ↓
Chat history persisted securely per user in Firebase Firestore
```

---

## Table of Contents

1. [How to Install Dependencies](#1-how-to-install-dependencies)
2. [How to Create Firebase Project](#2-how-to-create-firebase-project)
3. [How to Enable Firebase Authentication](#3-how-to-enable-firebase-authentication)
4. [How to Enable Email/Password Authentication](#4-how-to-enable-emailpassword-authentication)
5. [How to Create Firestore Database](#5-how-to-create-firestore-database)
6. [How to Configure Firestore Security Rules](#6-how-to-configure-firestore-security-rules)
7. [How to Add Firebase Environment Variables](#7-how-to-add-firebase-environment-variables)
8. [How to Configure n8n](#8-how-to-configure-n8n)
9. [How to Obtain the n8n Webhook / Chat Endpoint](#9-how-to-obtain-the-n8n-webhook--chat-endpoint)
10. [Expected n8n Request Payload](#10-expected-n8n-request-payload)
11. [Expected n8n Response Format](#11-expected-n8n-response-format)
12. [How to Run Locally](#12-how-to-run-locally)
13. [How to Build](#13-how-to-build)
14. [How to Deploy to Firebase Hosting](#14-how-to-deploy-to-firebase-hosting)

---

### 1. How to Install Dependencies

Make sure you have Node.js 18+ installed.

```bash
npm install
```

---

### 2. How to Create Firebase Project

1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and enter a name (e.g., `bizmate-ai`).
3. (Optional) Enable Google Analytics.
4. Click **Create project**.

---

### 3. How to Enable Firebase Authentication

1. In your Firebase Project console, click on **Build** > **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, click **Google** and switch the toggle to **Enable**. Select your project support email and click **Save**.

---

### 4. How to Enable Email/Password Authentication

1. In the **Authentication** > **Sign-in method** tab, click **Add new provider**.
2. Choose **Email/Password**.
3. Toggle **Email/Password** to **Enabled**. (Leave Email link disabled unless desired).
4. Click **Save**.

---

### 5. How to Create Firestore Database

1. In your Firebase console sidebar, go to **Build** > **Firestore Database**.
2. Click **Create database**.
3. Choose your database location (e.g., `nam5 (us-central)` or `asia-southeast1`).
4. Click **Next** and select **Start in production mode** (we deploy strict rules next).
5. Click **Create**.

---

### 6. How to Configure Firestore Security Rules

Deploy the included `firestore.rules` file to protect all user conversations and prevent cross-user data access:

```bash
firebase deploy --only firestore:rules
```

Or copy the rules from `/firestore.rules` into the **Firestore Database** > **Rules** tab in the Firebase Console.

The rules enforce:
- `users/{userId}`: Only readable and writable by the authenticated user (`request.auth.uid == userId`).
- `users/{userId}/conversations/{conversationId}`: Strictly restricted to the owner.
- `users/{userId}/conversations/{conversationId}/messages/{messageId}`: Strictly restricted to the owner.

---

### 7. How to Add Firebase Environment Variables

Create a `.env` file in the root of your project based on `.env.example`:

```env
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="bizmate-ai.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="bizmate-ai"
VITE_FIREBASE_STORAGE_BUCKET="bizmate-ai.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
VITE_FIREBASE_APP_ID="1:1234567890:web:abcdef123456"

# n8n AI Agent Webhook URL
VITE_N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook/bizmate-chat"
```

> **Note:** If environment variables are empty during local preview, the applet automatically falls back to `firebase-applet-config.json` and runs interactive n8n simulation mode.

---

### 8. How to Configure n8n

In your self-hosted or cloud n8n instance:

1. Open your workflow containing:
   - **Chat Trigger** or **Webhook** node
   - **AI Agent** node connected to **OpenAI Chat Model**
   - **Window Buffer Memory** or **Simple Memory**
   - **Google Calendar Tool**, **Gmail Tool**, **Google Sheets Tool**
2. In the **Chat Trigger / Webhook** node:
   - Method: `POST`
   - Response Mode: `When Last Node Finishes` (or `Using 'Respond to Webhook' Node`)
3. Make sure the workflow is set to **Active**.

---

### 9. How to Obtain the n8n Webhook / Chat Endpoint

1. Click on your **When Chat Message Received** or **Webhook** node in n8n.
2. Select the **Production URL** tab.
3. Copy the URL (e.g. `https://n8n.yourdomain.com/webhook/bizmate-chat`).
4. Set this as `VITE_N8N_WEBHOOK_URL` in your `.env`, or configure it in the in-app **Settings** page (`/settings`).

---

### 10. Expected n8n Request Payload

The frontend automatically formats each request as follows:

```json
{
  "chatInput": "Schedule a meeting with John tomorrow at 3 PM",
  "sessionId": "chat_1727221000_abc12",
  "userId": "firebase_auth_user_uid",
  "userEmail": "owner@business.com",
  "userName": "Business Owner"
}
```

Field mappings can be changed without touching core code in `src/config/n8nConfig.ts`.

---

### 11. Expected n8n Response Format

BizMate AI handles both standard text and structured outputs:

#### Standard Text Output:
```json
{
  "output": "Your meeting with John has been scheduled for tomorrow at 3:00 PM."
}
```

#### Structured Calendar Event:
```json
{
  "output": "Meeting created successfully.",
  "type": "calendar",
  "calendarEvent": {
    "title": "Team Strategy Meeting",
    "date": "September 25, 2026",
    "time": "3:00 PM - 3:45 PM",
    "attendees": ["john@example.com"],
    "meetingLink": "https://meet.google.com/abc-defg-hij",
    "status": "Successfully Created"
  }
}
```

#### Structured Gmail Dispatch:
```json
{
  "output": "Payment reminder email has been sent.",
  "type": "gmail",
  "gmailSent": {
    "to": "rahim.textiles@gmail.com",
    "subject": "Friendly Reminder: Invoice #INV-2026-884 Due",
    "status": "Successfully Sent",
    "snippet": "Dear Mr. Rahim, this is a friendly reminder that invoice #INV-2026-884 was due..."
  }
}
```

#### Structured Google Sheets Query:
```json
{
  "output": "Here are the matching orders from your spreadsheet:",
  "type": "sheets",
  "googleSheets": {
    "sheetName": "Q3_Customer_Orders_2026.xlsx",
    "headers": ["Order ID", "Client Name", "Item", "Amount", "Status"],
    "rows": [
      ["#INV-2026-884", "Rahim Textiles", "Cotton Fabric 200m", "৳54,000", "Overdue (5 days)"],
      ["#INV-2026-885", "Chowdhury Traders", "Dyeing & Processing", "৳28,500", "Paid"]
    ]
  }
}
```

---

### 12. How to Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

### 13. How to Build

```bash
npm run build
```

This compiles your TypeScript and Vite production assets into the `/dist` directory.

---

### 14. How to Deploy to Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in to Firebase:
   ```bash
   firebase login
   ```
3. Initialize hosting (select existing project and set public directory to `dist` with single-page app rewrite set to `Yes`):
   ```bash
   firebase init hosting
   ```
4. Build & deploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```
