// Client-side helper for triggering Resend email endpoints
import { getAdminIdToken } from '../firebase';

/** Headers for admin-only endpoints: JSON plus the signed-in admin's Firebase ID token. */
async function adminHeaders(json = true): Promise<Record<string, string>> {
  const headers: Record<string, string> = json ? { 'Content-Type': 'application/json' } : {};
  const token = await getAdminIdToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export interface SendInquiryPayload {
  name: string;
  email: string;
  phone?: string;
  inquiryType?: string;
  artworkTitle?: string;
  dimensions?: string;
  interest: string;
  message: string;
  inquiryId?: string;
}

export interface SendReplyPayload {
  toEmail: string;
  toName: string;
  subject: string;
  message: string;
  originalMessage?: string;
  inquiryId?: string;
}

export interface EmailServiceStatus {
  configured: boolean;
  adminEmail: string;
  senderEmail: string;
  mode: 'live' | 'simulated';
  service: string;
}

/**
 * Sends confirmation email to user & notification email to admin
 */
export async function dispatchInquiryEmail(payload: SendInquiryPayload): Promise<{
  success: boolean;
  userEmailSent?: boolean;
  adminEmailSent?: boolean;
  mode?: 'live' | 'simulated';
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.error || `Server responded with status ${res.status}`,
      };
    }

    return await res.json();
  } catch (err: any) {
    console.warn('[emailApi] Network request failed for dispatchInquiryEmail:', err);
    return {
      success: false,
      error: err?.message || 'Network error while sending inquiry email',
    };
  }
}

/**
 * Sends a direct email response from admin to customer
 */
export async function sendAdminReply(payload: SendReplyPayload): Promise<{
  success: boolean;
  mode?: 'live' | 'simulated';
  emailId?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/reply-email', {
      method: 'POST',
      headers: await adminHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: data.error || `Server responded with status ${res.status}`,
      };
    }

    return data;
  } catch (err: any) {
    console.error('[emailApi] Network request failed for sendAdminReply:', err);
    return {
      success: false,
      error: err.message || 'Network error while contacting reply service',
    };
  }
}

/**
 * Checks if Resend API key is configured on server
 */
export async function fetchEmailServiceStatus(): Promise<EmailServiceStatus> {
  try {
    const res = await fetch('/api/email-status', { headers: await adminHeaders(false) });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Fallback default
  }
  return {
    configured: false,
    adminEmail: 'appsamyar@gmail.com',
    senderEmail: 'Saghi Abyar Studio <contact@saghiabyar.com>',
    mode: 'simulated',
    service: 'Resend',
  };
}

/**
 * Triggers a test email to verify domain verification and delivery
 */
export async function triggerTestEmail(targetEmail: string): Promise<{
  success: boolean;
  mode?: 'live' | 'simulated';
  targetEmail: string;
  sender?: string;
  emailId?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/send-test-email', {
      method: 'POST',
      headers: await adminHeaders(),
      body: JSON.stringify({ targetEmail }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        targetEmail,
        error: data.error || `Server responded with status ${res.status}`,
      };
    }

    return data;
  } catch (err: any) {
    console.error('[emailApi] Network request failed for triggerTestEmail:', err);
    return {
      success: false,
      targetEmail,
      error: err.message || 'Failed to dispatch test email',
    };
  }
}

/**
 * Syncs inbound emails from Resend Receiving API
 */
export async function syncInboundEmails(): Promise<{
  success: boolean;
  emails: any[];
  mode?: 'live' | 'simulated';
  error?: string;
}> {
  try {
    const res = await fetch('/api/inbox/sync', { headers: await adminHeaders(false) });
    const data = await res.json().catch(() => ({}));
    return {
      success: res.ok && data.success !== false,
      emails: data.emails || [],
      mode: data.mode || 'simulated',
      error: data.error,
    };
  } catch (err: any) {
    console.warn('[emailApi] Inbound sync notice:', err);
    return {
      success: false,
      emails: [],
      error: err.message,
    };
  }
}

/**
 * Simulates a customer reply message for thread testing
 */
export async function simulateInboundEmail(payload: {
  inquiryId: string;
  senderName: string;
  senderEmail: string;
  message: string;
  subject?: string;
}): Promise<{
  success: boolean;
  receivedMessage?: any;
  error?: string;
}> {
  try {
    const res = await fetch('/api/inbox/simulate-inbound', {
      method: 'POST',
      headers: await adminHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    };
  }
}


