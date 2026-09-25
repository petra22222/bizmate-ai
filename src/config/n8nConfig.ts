/**
 * =========================================================================
 * N8N WORKFLOW INTEGRATION CONFIGURATION
 * =========================================================================
 * 
 * Production webhook endpoint for the BizMate AI Agent workflow with Google Calendar,
 * Gmail, and Google Sheets integrations.
 */

export const N8N_DEFAULT_WEBHOOK_URL =
  'https://n8n.srv1238021.hstgr.cloud/webhook/d6770cd9-abb5-45fb-8378-25488a4aaf00';

// Aliases for compatibility across components
export const N8N_DEFAULT_CHAT_URL = N8N_DEFAULT_WEBHOOK_URL;

export const N8N_WEBHOOK_URL =
  ((typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_N8N_WEBHOOK_URL || import.meta.env.VITE_N8N_CHAT_URL)) || N8N_DEFAULT_WEBHOOK_URL).trim();

export const N8N_CHAT_URL = N8N_WEBHOOK_URL;

// Configurable endpoint for Newsletter Campaign delivery
export const N8N_NEWSLETTER_WEBHOOK_URL =
  ((typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_N8N_NEWSLETTER_WEBHOOK_URL || import.meta.env.VITE_NEWSLETTER_WEBHOOK_URL)) || '').trim();

export interface N8NConfigType {
  // Webhook URL endpoint for the n8n AI Agent Chat Trigger
  webhookUrl: string;
  
  // HTTP method
  method: 'POST';
  
  // Field name where the user message is sent (default: "chatInput")
  messageField: string;
  
  // Field name for the conversation/session ID (default: "sessionId")
  sessionField: string;
  
  // Field name for user ID
  userIdField: string;
  
  // Field name for user email
  userEmailField: string;
  
  // Field name for user name
  userNameField: string;
  
  // Optional Authorization header (e.g. "Bearer YOUR_N8N_TOKEN")
  authHeader?: string;
  
  // Request timeout in milliseconds (e.g. 60000ms for AI Agent tool execution)
  timeoutMs: number;
}

export const N8N_CONFIG: N8NConfigType = {
  webhookUrl: N8N_WEBHOOK_URL,
  method: 'POST',
  messageField: 'chatInput',
  sessionField: 'sessionId',
  userIdField: 'userId',
  userEmailField: 'userEmail',
  userNameField: 'userName',
  authHeader: '',
  timeoutMs: 60000,
};

/**
 * Returns the effective n8n Webhook URL, prioritizing user-defined URL in settings
 * before falling back to the configured production URL.
 * Automatically filters out any legacy or deprecated webhook URLs.
 */
export function getEffectiveN8nUrl(customUserUrl?: string): string {
  if (customUserUrl && customUserUrl.trim().length > 0) {
    const trimmed = customUserUrl.trim();
    // Filter out old legacy webhook URL if it was cached in Firestore settings
    if (trimmed.includes('d776cf77-4e8e-4ebf-b4ef-47875c772b31')) {
      return N8N_CONFIG.webhookUrl;
    }
    return trimmed;
  }
  return N8N_CONFIG.webhookUrl;
}
