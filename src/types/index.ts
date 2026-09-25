export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: string;
  lastLoginAt: string;
  plan: 'free' | 'pro' | 'enterprise';
  role: 'user' | 'admin';
  businessName?: string;
  preferredLanguage?: string;
}

export interface N8NFieldMapping {
  messageField?: string;
  sessionField?: string;
  userIdField?: string;
  userEmailField?: string;
  userNameField?: string;
  authHeader?: string;
}

export interface UserSettings {
  userId: string;
  theme: 'dark' | 'light' | 'system';
  enterToSend: boolean;
  showTimestamps: boolean;
  compactMode: boolean;
  emailNotifications: boolean;
  n8nCustomUrl?: string;
  n8nFieldMapping?: N8NFieldMapping;
  preferredLanguage?: string;
}

export interface Conversation {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessageSnippet?: string;
}

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'sent' | 'delivered' | 'error' | 'pending';

export interface CalendarEventData {
  eventId?: string;
  title: string;
  date: string;
  time: string;
  attendees?: string[];
  meetingLink?: string;
  status: 'Successfully Created' | 'Scheduled' | 'Pending';
}

export interface GmailSentData {
  messageId?: string;
  to: string;
  subject: string;
  status: 'Successfully Sent' | 'Delivered' | 'Queued';
  snippet?: string;
}

export interface GoogleSheetsData {
  sheetName?: string;
  headers: string[];
  rows: (string | number)[][];
  totalRows?: number;
}

export interface StructuredN8NData {
  type: 'calendar' | 'gmail' | 'sheets' | 'general';
  calendarEvent?: CalendarEventData;
  gmailSent?: GmailSentData;
  googleSheets?: GoogleSheetsData;
  rawPayload?: any;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  userId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  status: MessageStatus;
  structuredData?: StructuredN8NData;
  language?: string;
}

export interface N8NRequestPayload {
  chatInput: string;
  sessionId: string;
  userId: string;
  userEmail: string;
  userName: string;
  language?: string;
  userLocale?: string;
}

export interface N8NResponseResult {
  text: string;
  structuredData?: StructuredN8NData;
  rawResponse?: any;
}

// Integrations & Action Confirmation Types
export type IntegrationStatus = 'connected' | 'syncing' | 'error' | 'disconnected';

export interface IntegrationItem {
  id: string;
  name: string;
  category: 'email' | 'calendar' | 'sheets' | 'payment';
  status: IntegrationStatus;
  lastSynced: string;
  details: string;
  icon: string;
}

export type ActionStatus = 'pending' | 'confirmed' | 'cancelled' | 'executing';

export interface ActionApprovalPayload {
  actionId: string;
  actionType: 'SEND_EMAIL' | 'SCHEDULE_EVENT' | 'UPDATE_SHEET' | 'CREATE_INVOICE';
  service: 'Gmail' | 'Google Calendar' | 'Google Sheets';
  title: string;
  bengaliPrompt: string;
  status: ActionStatus;
  details: {
    recipient?: string;
    subject?: string;
    bodyPreview?: string;
    dateTime?: string;
    duration?: string;
    attendees?: string[];
    invoiceId?: string;
    clientName?: string;
    amount?: string;
    sheetName?: string;
    rowValues?: Record<string, string | number>;
  };
  executedAt?: string;
}

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text?: string;
  bengaliText?: string;
  actionApproval?: ActionApprovalPayload;
  summaryTable?: {
    headers: string[];
    rows: (string | number)[][];
  };
  keyValues?: { label: string; value: string; highlight?: boolean }[];
  tags?: string[];
}

export interface BusinessMetric {
  label: string;
  value: string;
  change: string;
}

export interface NewsletterPreferences {
  aiTips: boolean;
  productivity: boolean;
  automation: boolean;
  productUpdates: boolean;
  newFeatures: boolean;
}

export interface NewsletterSubscriber {
  id?: string;
  email: string;
  subscribedAt: string;
  status: 'subscribed' | 'unsubscribed';
  source: 'landing_page' | 'dashboard' | 'footer' | 'account' | 'manual';
  language: string;
  userId?: string | null;
  unsubscribedAt?: string | null;
  preferences?: NewsletterPreferences;
}

export interface NewsletterCampaign {
  id?: string;
  subject: string;
  previewText?: string;
  content: string;
  language: string;
  audience: 'all' | 'language' | 'preference';
  targetPreference?: keyof NewsletterPreferences;
  status: 'draft' | 'scheduled' | 'sent';
  scheduledAt?: string | null;
  sentAt?: string | null;
  recipientCount?: number;
  createdAt: string;
  adminUserId: string;
}

