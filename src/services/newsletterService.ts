import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { NewsletterSubscriber, NewsletterPreferences, NewsletterCampaign } from '../types';
import { removeUndefinedFields } from '../utils/firestoreUtils';
import { N8N_NEWSLETTER_WEBHOOK_URL } from '../config/n8nConfig';

export const DEFAULT_NEWSLETTER_PREFERENCES: NewsletterPreferences = {
  aiTips: true,
  productivity: true,
  automation: true,
  productUpdates: true,
  newFeatures: true,
};

/**
 * Deterministic document ID generator for subscriber emails.
 * Converts email into a safe, valid Firestore document key.
 */
export function getSubscriberDocId(normalizedEmail: string): string {
  // Replace symbols to make safe document ID: e.g. user_domain_com
  return encodeURIComponent(normalizedEmail.toLowerCase().trim()).replace(/%/g, '_');
}

/**
 * Comprehensive email validator
 * Rejects invalid strings such as "test", "abc@", "example@", "user@domain" (no TLD)
 */
export function validateNewsletterEmail(email: string): { valid: boolean; normalized: string; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, normalized: '', error: 'Email cannot be empty.' };
  }

  const normalized = email.trim().toLowerCase();

  if (normalized.length === 0) {
    return { valid: false, normalized: '', error: 'Email cannot be empty.' };
  }

  if (normalized.length > 254) {
    return { valid: false, normalized, error: 'Email address is too long.' };
  }

  // Must have an '@' and a domain containing at least one '.' with valid TLD of >= 2 chars
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(normalized)) {
    return { valid: false, normalized, error: 'Please enter a valid email address.' };
  }

  const parts = normalized.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { valid: false, normalized, error: 'Please enter a valid email address.' };
  }

  const domain = parts[1];
  if (!domain.includes('.') || domain.endsWith('.')) {
    return { valid: false, normalized, error: 'Please enter a valid email address.' };
  }

  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2) {
    return { valid: false, normalized, error: 'Please enter a valid email address.' };
  }

  return { valid: true, normalized };
}

export const newsletterService = {
  /**
   * Subscribe an email address to the newsletter
   */
  async subscribe(
    rawEmail: string,
    options: {
      source?: 'landing_page' | 'dashboard' | 'footer' | 'account' | 'manual';
      language?: string;
      userId?: string | null;
      preferences?: Partial<NewsletterPreferences>;
    } = {}
  ): Promise<{ 
    success: boolean; 
    alreadySubscribed?: boolean; 
    resubscribed?: boolean; 
    error?: string; 
    subscriber?: NewsletterSubscriber 
  }> {
    const { valid, normalized, error: validationError } = validateNewsletterEmail(rawEmail);
    if (!valid) {
      return { success: false, error: validationError || 'Please enter a valid email address.' };
    }

    const docId = getSubscriberDocId(normalized);
    const docRef = doc(db, 'newsletterSubscribers', docId);

    try {
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const existing = snap.data() as NewsletterSubscriber;

        // Duplicate protection: already active subscriber
        if (existing.status === 'subscribed') {
          return {
            success: false,
            alreadySubscribed: true,
            subscriber: { ...existing, id: docId },
          };
        }

        // Resubscribe if previously unsubscribed
        const now = new Date().toISOString();
        const mergedPreferences: NewsletterPreferences = {
          ...DEFAULT_NEWSLETTER_PREFERENCES,
          ...(existing.preferences || {}),
          ...(options.preferences || {}),
        };

        const updatePayload = removeUndefinedFields({
          status: 'subscribed',
          subscribedAt: now,
          unsubscribedAt: null,
          language: options.language || existing.language || 'en',
          source: options.source || existing.source || 'landing_page',
          userId: options.userId !== undefined ? (options.userId || null) : (existing.userId || null),
          preferences: mergedPreferences,
        });

        await updateDoc(docRef, updatePayload);

        return {
          success: true,
          resubscribed: true,
          subscriber: { ...existing, ...updatePayload, id: docId, email: normalized },
        };
      }

      // New subscriber
      const now = new Date().toISOString();
      const subscriberPayload: NewsletterSubscriber = {
        email: normalized,
        subscribedAt: now,
        status: 'subscribed',
        source: options.source || 'landing_page',
        language: options.language || 'en',
        userId: options.userId || null,
        preferences: {
          ...DEFAULT_NEWSLETTER_PREFERENCES,
          ...(options.preferences || {}),
        },
      };

      const cleanPayload = removeUndefinedFields(subscriberPayload);
      await setDoc(docRef, cleanPayload);

      return {
        success: true,
        alreadySubscribed: false,
        subscriber: { ...cleanPayload, id: docId },
      };
    } catch (err: any) {
      console.error('Newsletter subscribe error:', err);
      return {
        success: false,
        error: err.message || 'Unable to complete newsletter subscription. Please try again.',
      };
    }
  },

  /**
   * Unsubscribe an email from the newsletter (status: "unsubscribed")
   */
  async unsubscribe(rawEmail: string): Promise<{ success: boolean; error?: string }> {
    const { valid, normalized, error: validationError } = validateNewsletterEmail(rawEmail);
    if (!valid) {
      return { success: false, error: validationError || 'Please enter a valid email address.' };
    }

    const docId = getSubscriberDocId(normalized);
    const docRef = doc(db, 'newsletterSubscribers', docId);

    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        // If not found, create a tombstone record marked as unsubscribed
        const now = new Date().toISOString();
        await setDoc(docRef, removeUndefinedFields({
          email: normalized,
          status: 'unsubscribed',
          subscribedAt: now,
          unsubscribedAt: now,
          source: 'landing_page',
          language: 'en',
          userId: null,
        }));
        return { success: true };
      }

      const now = new Date().toISOString();
      await updateDoc(docRef, removeUndefinedFields({
        status: 'unsubscribed',
        unsubscribedAt: now,
      }));

      return { success: true };
    } catch (err: any) {
      console.error('Newsletter unsubscribe error:', err);
      return { success: false, error: err.message || 'Failed to unsubscribe. Please try again.' };
    }
  },

  /**
   * Fetch subscriber by email
   */
  async getSubscriber(rawEmail: string): Promise<NewsletterSubscriber | null> {
    const { valid, normalized } = validateNewsletterEmail(rawEmail);
    if (!valid) return null;

    const docId = getSubscriberDocId(normalized);
    const docRef = doc(db, 'newsletterSubscribers', docId);

    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { ...(snap.data() as NewsletterSubscriber), id: docId };
      }
      return null;
    } catch (err) {
      console.warn('Could not fetch subscriber info:', err);
      return null;
    }
  },

  /**
   * Fetch subscriber by Firebase userId
   */
  async getSubscriberByUserId(userId: string): Promise<NewsletterSubscriber | null> {
    if (!userId) return null;
    try {
      const q = query(
        collection(db, 'newsletterSubscribers'),
        where('userId', '==', userId),
        limit(1)
      );
      const snaps = await getDocs(q);
      if (!snaps.empty) {
        const docSnap = snaps.docs[0];
        return { ...(docSnap.data() as NewsletterSubscriber), id: docSnap.id };
      }
      return null;
    } catch (err) {
      console.warn('Could not query subscriber by userId:', err);
      return null;
    }
  },

  /**
   * Update newsletter preferences
   */
  async updatePreferences(
    rawEmail: string,
    preferences: NewsletterPreferences
  ): Promise<{ success: boolean; error?: string }> {
    const { valid, normalized, error: valErr } = validateNewsletterEmail(rawEmail);
    if (!valid) return { success: false, error: valErr };

    const docId = getSubscriberDocId(normalized);
    const docRef = doc(db, 'newsletterSubscribers', docId);

    try {
      await updateDoc(docRef, removeUndefinedFields({ preferences }));
      return { success: true };
    } catch (err: any) {
      console.error('Error updating newsletter preferences:', err);
      return { success: false, error: err.message || 'Failed to update preferences.' };
    }
  },

  /**
   * Fetch all subscribers for admin dashboard with filtering and search
   */
  async listSubscribers(options: {
    status?: 'all' | 'subscribed' | 'unsubscribed';
    search?: string;
    limitCount?: number;
  } = {}): Promise<NewsletterSubscriber[]> {
    try {
      const coll = collection(db, 'newsletterSubscribers');
      let q = query(coll, orderBy('subscribedAt', 'desc'), limit(options.limitCount || 100));

      if (options.status && options.status !== 'all') {
        q = query(coll, where('status', '==', options.status), limit(options.limitCount || 100));
      }

      const snap = await getDocs(q);
      let list: NewsletterSubscriber[] = snap.docs.map((d) => ({
        ...(d.data() as NewsletterSubscriber),
        id: d.id,
      }));

      if (options.search && options.search.trim()) {
        const term = options.search.toLowerCase().trim();
        list = list.filter((s) => s.email.toLowerCase().includes(term));
      }

      return list;
    } catch (err) {
      console.error('Error listing newsletter subscribers:', err);
      return [];
    }
  },

  /**
   * Aggregate subscriber statistics for admin console
   */
  async getSubscriberStats(): Promise<{
    total: number;
    active: number;
    unsubscribed: number;
    newToday: number;
    newThisMonth: number;
  }> {
    try {
      const snap = await getDocs(collection(db, 'newsletterSubscribers'));
      let total = 0;
      let active = 0;
      let unsubscribed = 0;
      let newToday = 0;
      let newThisMonth = 0;

      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const currentMonthStr = now.toISOString().slice(0, 7);

      snap.docs.forEach((d) => {
        const data = d.data() as NewsletterSubscriber;
        total += 1;
        if (data.status === 'subscribed') {
          active += 1;
        } else if (data.status === 'unsubscribed') {
          unsubscribed += 1;
        }

        if (data.subscribedAt) {
          if (data.subscribedAt.startsWith(todayStr)) {
            newToday += 1;
          }
          if (data.subscribedAt.startsWith(currentMonthStr)) {
            newThisMonth += 1;
          }
        }
      });

      return { total, active, unsubscribed, newToday, newThisMonth };
    } catch (err) {
      console.warn('Could not compute newsletter stats from Firestore:', err);
      return { total: 0, active: 0, unsubscribed: 0, newToday: 0, newThisMonth: 0 };
    }
  },

  /**
   * Export all subscribers as a CSV file download
   */
  async exportSubscribersCsv(): Promise<void> {
    const list = await this.listSubscribers({ limitCount: 2000 });
    const headers = [
      'Email',
      'Status',
      'Language',
      'Source',
      'Subscribed Date',
      'Unsubscribed Date',
      'AI Tips',
      'Productivity',
      'Automation',
      'Updates',
      'New Features',
      'User ID',
    ];

    const rows = list.map((s) => [
      `"${s.email}"`,
      `"${s.status}"`,
      `"${s.language || 'en'}"`,
      `"${s.source || 'landing_page'}"`,
      `"${s.subscribedAt || ''}"`,
      `"${s.unsubscribedAt || ''}"`,
      s.preferences?.aiTips ? 'Yes' : 'No',
      s.preferences?.productivity ? 'Yes' : 'No',
      s.preferences?.automation ? 'Yes' : 'No',
      s.preferences?.productUpdates ? 'Yes' : 'No',
      s.preferences?.newFeatures ? 'Yes' : 'No',
      `"${s.userId || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bizmate_newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Dispatch a campaign via the configured n8n / backend webhook
   */
  async sendCampaign(
    campaign: Omit<NewsletterCampaign, 'id' | 'createdAt'>
  ): Promise<{ success: boolean; error?: string; campaignId?: string }> {
    if (!N8N_NEWSLETTER_WEBHOOK_URL) {
      return {
        success: false,
        error: 'Email delivery is not configured yet. Set VITE_N8N_NEWSLETTER_WEBHOOK_URL in your environment.',
      };
    }

    const campaignId = `camp_${Date.now()}`;
    const payload = {
      action: 'sendNewsletter',
      campaignId,
      subject: campaign.subject,
      previewText: campaign.previewText || '',
      content: campaign.content,
      language: campaign.language,
      audience: campaign.audience,
      targetPreference: campaign.targetPreference,
      adminUserId: campaign.adminUserId,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(N8N_NEWSLETTER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook returned HTTP ${response.status}`);
      }

      // Record campaign in Firestore
      try {
        const campRef = doc(db, 'newsletterCampaigns', campaignId);
        await setDoc(campRef, removeUndefinedFields({
          ...campaign,
          id: campaignId,
          status: 'sent',
          sentAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        }));
      } catch (err) {
        console.warn('Could not record campaign in Firestore:', err);
      }

      return { success: true, campaignId };
    } catch (err: any) {
      console.error('Error dispatching newsletter campaign to webhook:', err);
      return {
        success: false,
        error: err.message || 'Failed to dispatch newsletter campaign to n8n webhook.',
      };
    }
  },

  /**
   * Generate an accessible, mobile-friendly HTML newsletter template
   */
  generateEmailHtml(params: {
    subject: string;
    previewText?: string;
    headline: string;
    content: string;
    ctaText?: string;
    ctaUrl?: string;
    unsubscribeUrl?: string;
    preferencesUrl?: string;
  }): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bizmate.ai';
    const unsub = params.unsubscribeUrl || `${origin}/unsubscribe`;
    const prefs = params.preferencesUrl || `${origin}/newsletter-preferences`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 24px 16px; }
    .card { background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px 24px; }
    .brand { display: flex; align-items: center; margin-bottom: 24px; }
    .logo { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #ffffff; width: 36px; height: 36px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; font-size: 16px; text-align: center; line-height: 36px; }
    .brand-name { font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
    h1 { font-size: 24px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 16px; line-height: 1.3; }
    p { font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-bottom: 16px; }
    .content { margin-bottom: 28px; white-space: pre-line; }
    .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 10px; margin: 12px 0 24px 0; }
    .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #1f2937; text-align: center; font-size: 12px; color: #64748b; line-height: 1.5; }
    .footer a { color: #818cf8; text-decoration: none; margin: 0 8px; }
    .footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="brand">
        <span class="logo">B</span>
        <span class="brand-name">BizMate AI</span>
      </div>
      <h1>${params.headline || params.subject}</h1>
      <div class="content">${params.content}</div>
      ${params.ctaText && params.ctaUrl ? `<a href="${params.ctaUrl}" class="btn" target="_blank">${params.ctaText}</a>` : ''}
      <div class="footer">
        <p>You received this email because you subscribed to updates from BizMate AI.</p>
        <p>
          <a href="${prefs}">Manage Preferences</a> •
          <a href="${unsub}">Unsubscribe</a>
        </p>
        <p>© ${new Date().getFullYear()} BizMate AI Inc. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
  }
};
