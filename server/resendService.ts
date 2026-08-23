import { Resend } from 'resend';
import { 
  UserInquiryEmailData, 
  AdminReplyEmailData, 
  generateUserConfirmationEmailHtml, 
  generateAdminNotificationEmailHtml, 
  generateAdminReplyEmailHtml,
  generateTestEmailHtml,
  STUDIO_CONTACT_INFO
} from './emailTemplates';

let resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey.trim());
  }
  return resendClient;
}

export interface EmailDispatchResult {
  success: boolean;
  userEmailSent: boolean;
  adminEmailSent: boolean;
  mode: 'live' | 'simulated';
  userEmailId?: string;
  adminEmailId?: string;
  message?: string;
  error?: string;
}

/**
 * Dispatches automated double-email flow:
 * 1. Professional Confirmation Email to the user
 * 2. Notification Email to the studio admin
 */
export async function sendInquiryEmails(inquiry: UserInquiryEmailData): Promise<EmailDispatchResult> {
  const resend = getResendClient();
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'appsamyar@gmail.com';
  const senderEmail = process.env.SENDER_EMAIL || `Saghi Abyar Studio <${STUDIO_CONTACT_INFO.email}>`;

  if (!resend) {
    console.log('[Resend Email Service] RESEND_API_KEY is not configured. Running in simulated fallback mode.');
    return {
      success: true,
      userEmailSent: true,
      adminEmailSent: true,
      mode: 'simulated',
      message: 'Inquiry received and logged. Set RESEND_API_KEY in environment secrets to enable live email delivery.',
    };
  }

  let userEmailSent = false;
  let adminEmailSent = false;
  let userEmailId: string | undefined;
  let adminEmailId: string | undefined;
  const errors: string[] = [];

  // Compose clean, anti-spam subject lines
  const targetTopic = inquiry.artworkTitle || inquiry.interest || 'Fine Art & Classical Tar';
  const cleanUserSubject = `Your Inquiry at Saghi Abyar Studio - ${targetTopic}`;
  const cleanAdminSubject = `[Studio Inquiry] ${inquiry.name} - ${targetTopic}`;

  // 1. Send confirmation email to User
  try {
    const userResult = await resend.emails.send({
      from: senderEmail,
      to: inquiry.email,
      subject: cleanUserSubject,
      html: generateUserConfirmationEmailHtml(inquiry),
    });

    if (userResult.data?.id) {
      userEmailSent = true;
      userEmailId = userResult.data.id;
      console.log(`[Resend] User confirmation sent to ${inquiry.email} (ID: ${userResult.data.id})`);
    } else if (userResult.error) {
      console.warn(`[Resend] User email notice:`, userResult.error);
      errors.push(`User email: ${userResult.error.message || JSON.stringify(userResult.error)}`);
    }
  } catch (err: any) {
    console.error('[Resend] Error sending user confirmation email:', err);
    errors.push(`User send error: ${err.message}`);
  }

  // 2. Send notification email to Admin
  try {
    const adminResult = await resend.emails.send({
      from: senderEmail,
      to: adminEmail,
      subject: cleanAdminSubject,
      html: generateAdminNotificationEmailHtml(inquiry),
      replyTo: inquiry.email,
    });

    if (adminResult.data?.id) {
      adminEmailSent = true;
      adminEmailId = adminResult.data.id;
      console.log(`[Resend] Admin alert sent to ${adminEmail} (ID: ${adminResult.data.id})`);
    } else if (adminResult.error) {
      console.warn(`[Resend] Admin email notice:`, adminResult.error);
      errors.push(`Admin email: ${adminResult.error.message || JSON.stringify(adminResult.error)}`);
    }
  } catch (err: any) {
    console.error('[Resend] Error sending admin notification email:', err);
    errors.push(`Admin send error: ${err.message}`);
  }

  return {
    success: userEmailSent || adminEmailSent || errors.length === 0,
    userEmailSent,
    adminEmailSent,
    mode: 'live',
    userEmailId,
    adminEmailId,
    error: errors.length > 0 ? errors.join('; ') : undefined,
  };
}

/**
 * Sends a test verification email to confirm Resend delivery and anti-spam domain authentication
 */
export async function sendTestEmail(targetEmail: string = 'help.system@ymail.com'): Promise<{
  success: boolean;
  mode: 'live' | 'simulated';
  targetEmail: string;
  emailId?: string;
  sender: string;
  error?: string;
}> {
  const resend = getResendClient();
  const senderEmail = process.env.SENDER_EMAIL || `Saghi Abyar Studio <${STUDIO_CONTACT_INFO.email}>`;
  const subject = 'Verification Notice: Saghi Abyar Studio Email Service';
  const html = generateTestEmailHtml(targetEmail);

  if (!resend) {
    console.log(`[Resend Test Email] Simulating test email dispatch to ${targetEmail}`);
    return {
      success: true,
      mode: 'simulated',
      targetEmail,
      sender: senderEmail,
      emailId: `sim_test_${Date.now()}`,
    };
  }

  try {
    const result = await resend.emails.send({
      from: senderEmail,
      to: targetEmail,
      subject,
      html,
    });

    if (result.data?.id) {
      console.log(`[Resend Test Email] Successfully dispatched to ${targetEmail} (ID: ${result.data.id})`);
      return {
        success: true,
        mode: 'live',
        targetEmail,
        sender: senderEmail,
        emailId: result.data.id,
      };
    } else {
      console.warn('[Resend Test Email] Result error:', result.error);
      return {
        success: false,
        mode: 'live',
        targetEmail,
        sender: senderEmail,
        error: result.error?.message || 'Failed to dispatch test email',
      };
    }
  } catch (err: any) {
    console.error('[Resend Test Email] Exception:', err);
    return {
      success: false,
      mode: 'live',
      targetEmail,
      sender: senderEmail,
      error: err.message || 'Exception during test email dispatch',
    };
  }
}

/**
 * Sends a custom reply from the admin directly to the customer with anti-spam HTML template
 */
export async function sendAdminReplyEmail(replyData: AdminReplyEmailData): Promise<{
  success: boolean;
  mode: 'live' | 'simulated';
  emailId?: string;
  sentMessage?: {
    id: string;
    senderType: 'admin';
    senderName: string;
    senderEmail: string;
    recipientEmail: string;
    subject: string;
    message: string;
    createdAt: string;
    status: 'sent' | 'simulated' | 'received';
    tags: string[];
    emailId?: string;
  };
  error?: string;
}> {
  const resend = getResendClient();
  const senderEmail = process.env.SENDER_EMAIL || `Saghi Abyar Studio <${STUDIO_CONTACT_INFO.email}>`;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'appsamyar@gmail.com';
  const cleanSubject = replyData.subject.trim() || 'Your Inquiry at Saghi Abyar Studio';
  const createdAt = new Date().toISOString();
  const simulatedId = `msg_adm_${Date.now()}`;

  const sentMessage: {
    id: string;
    senderType: 'admin';
    senderName: string;
    senderEmail: string;
    recipientEmail: string;
    subject: string;
    message: string;
    createdAt: string;
    status: 'sent' | 'simulated' | 'received';
    tags: string[];
    emailId?: string;
  } = {
    id: simulatedId,
    senderType: 'admin',
    senderName: 'Saghi Abyar Studio',
    senderEmail: STUDIO_CONTACT_INFO.email,
    recipientEmail: replyData.toEmail,
    subject: cleanSubject,
    message: replyData.message,
    createdAt,
    status: 'sent',
    tags: ['Admin Reply', 'Direct Communication'],
    emailId: undefined,
  };

  if (!resend) {
    console.log('[Resend Email Service] RESEND_API_KEY is not configured. Simulating reply transmission.');
    sentMessage.status = 'simulated';
    sentMessage.emailId = `sim_${Date.now()}`;
    return {
      success: true,
      mode: 'simulated',
      emailId: sentMessage.emailId,
      sentMessage,
    };
  }

  try {
    const result = await resend.emails.send({
      from: senderEmail,
      to: replyData.toEmail,
      replyTo: adminEmail,
      subject: cleanSubject,
      html: generateAdminReplyEmailHtml({ ...replyData, subject: cleanSubject }),
    });

    if (result.data?.id) {
      sentMessage.emailId = result.data.id;
      return {
        success: true,
        mode: 'live',
        emailId: result.data.id,
        sentMessage,
      };
    } else {
      return {
        success: false,
        mode: 'live',
        sentMessage,
        error: result.error?.message || 'Failed to dispatch email reply via Resend',
      };
    }
  } catch (err: any) {
    console.error('[Resend] Error in sendAdminReplyEmail:', err);
    return {
      success: false,
      mode: 'live',
      sentMessage,
      error: err.message || 'Exception during email transmission',
    };
  }
}

/**
 * Fetches inbound emails from Resend Receiving API
 */
export async function fetchInboundEmailsFromResend(): Promise<{
  success: boolean;
  emails: any[];
  mode: 'live' | 'simulated';
  error?: string;
}> {
  const resend = getResendClient();
  if (!resend) {
    return {
      success: true,
      mode: 'simulated',
      emails: [],
    };
  }

  try {
    // Attempt Resend Receiving API
    const res = await (resend.emails as any).receiving?.list?.();
    if (res?.data) {
      const items = Array.isArray(res.data) ? res.data : (res.data.data || []);
      return {
        success: true,
        mode: 'live',
        emails: items,
      };
    }
    return {
      success: true,
      mode: 'live',
      emails: [],
    };
  } catch (err: any) {
    console.warn('[Resend] Error calling resend.emails.receiving.list:', err);
    return {
      success: false,
      mode: 'live',
      emails: [],
      error: err.message || 'Receiving domain is not yet active in Resend dashboard',
    };
  }
}

export async function fetchInboundEmailDetails(emailId: string): Promise<{
  success: boolean;
  email?: any;
  error?: string;
}> {
  const resend = getResendClient();
  if (!resend) {
    return { success: false, error: 'Resend is not configured' };
  }

  try {
    const res = await (resend.emails as any).receiving?.get?.(emailId);
    if (res?.data) {
      return {
        success: true,
        email: res.data,
      };
    }
    return {
      success: false,
      error: res?.error?.message || 'Email not found',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    };
  }
}

export interface InboundParsedMessage {
  id: string;
  senderType: 'user';
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  message: string;
  html?: string;
  createdAt: string;
  status: 'received';
  tags: string[];
  emailId?: string;
  inReplyTo?: string;
  inquiryId?: string;
}

/**
 * Parses raw Resend inbound webhook or receiving payload
 */
export function parseInboundWebhookEvent(body: any): InboundParsedMessage | null {
  try {
    const data = body?.data || body;
    if (!data) return null;

    const fromRaw = data.from || body.from || '';
    let senderEmail = '';
    let senderName = '';

    if (typeof fromRaw === 'string') {
      const match = fromRaw.match(/(.*)<(.+@.+[\.\w+])>/);
      if (match) {
        senderName = match[1].trim().replace(/^["']|["']$/g, '');
        senderEmail = match[2].trim();
      } else {
        senderEmail = fromRaw.trim();
        senderName = fromRaw.split('@')[0] || 'Art Collector';
      }
    } else if (typeof fromRaw === 'object' && fromRaw.email) {
      senderEmail = fromRaw.email;
      senderName = fromRaw.name || fromRaw.email.split('@')[0];
    }

    if (!senderEmail) {
      senderEmail = 'collector@inbound.resend';
      senderName = 'Art Collector';
    }

    const toRaw = data.to || body.to;
    const recipientEmail = Array.isArray(toRaw) ? toRaw.join(', ') : String(toRaw || 'contact@saghiabyar.com');
    const subject = String(data.subject || body.subject || 'Re: Studio Inquiry').trim();
    const textContent = String(data.text || data.html || body.text || body.html || body.message || '').trim();
    const htmlContent = data.html || body.html || undefined;

    // Detect inquiry ID from subject or headers
    let inquiryId: string | undefined;
    const inqMatch = subject.match(/\[(inq-[\w-]+)\]/i) || textContent.match(/\[(inq-[\w-]+)\]/i);
    if (inqMatch) {
      inquiryId = inqMatch[1];
    }

    const emailId = data.email_id || data.id || body.id || `inb_${Date.now()}`;
    const createdAt = data.created_at || body.created_at || new Date().toISOString();

    return {
      id: `msg_inb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      senderType: 'user',
      senderName: senderName || 'Art Collector',
      senderEmail,
      recipientEmail,
      subject,
      message: textContent || 'Received new message from collector via email.',
      html: htmlContent,
      createdAt,
      status: 'received',
      tags: ['Inbound Email', 'Resend Webhook'],
      emailId,
      inquiryId,
    };
  } catch (err) {
    console.error('[Resend Webhook Parser] Error parsing webhook payload:', err);
    return null;
  }
}

