// Professional Anti-Spam HTML Email Templates for Saghi Abyar Fine Art & Tar Studio
// Meets CAN-SPAM, CASL, and GDPR email standards with high text-to-image ratio and standardized footers.

export const OFFICIAL_STUDIO_LOGO_URL = 'https://qf1mwtdvcbajjjdk.public.blob.vercel-storage.com/Art%20Gallery/saghi%20logo%20Transparent.png';

export const STUDIO_CONTACT_INFO = {
  name: 'Saghi Abyar Fine Art & Tar Studio',
  artist: 'Saghi Abyar',
  email: 'contact@saghiabyar.com',
  phone: '+98 919 0059314',
  location: 'Tehran, Iran',
  fullLocation: 'Tehran Studio & Global Art Archive, Tehran, Iran',
  website: 'https://saghiabyar.com',
  instagram: 'https://instagram.com/saghiabyar__art',
  instagramHandle: '@saghiabyar__art',
};

export interface UserInquiryEmailData {
  name: string;
  email: string;
  phone?: string;
  inquiryType?: string;
  artworkTitle?: string;
  dimensions?: string;
  interest: string;
  message: string;
  inquiryId?: string;
  createdAt?: string;
}

export interface AdminReplyEmailData {
  toName: string;
  toEmail: string;
  subject: string;
  message: string;
  originalMessage?: string;
  inquiryId?: string;
}

/**
 * Standardized CAN-SPAM and global regulation compliant email footer
 */
function renderStandardEmailFooter(): string {
  return `
    <div style="padding: 28px 32px; background-color: #050507; border-top: 1px solid #1f1f23; text-align: center; font-size: 11px; color: #71717a; line-height: 1.6;">
      <div style="margin-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <a href="${STUDIO_CONTACT_INFO.website}" style="color: #f59e0b; text-decoration: none; font-weight: 600; margin: 0 8px;">Official Atelier</a>
        <span style="color: #3f3f46;">&bull;</span>
        <a href="${STUDIO_CONTACT_INFO.instagram}" style="color: #f59e0b; text-decoration: none; font-weight: 600; margin: 0 8px;">Instagram ${STUDIO_CONTACT_INFO.instagramHandle}</a>
        <span style="color: #3f3f46;">&bull;</span>
        <a href="mailto:${STUDIO_CONTACT_INFO.email}" style="color: #f59e0b; text-decoration: none; font-weight: 600; margin: 0 8px;">${STUDIO_CONTACT_INFO.email}</a>
      </div>
      
      <p style="margin: 0 0 6px 0; color: #a1a1aa; font-size: 12px; font-weight: 500;">
        ${STUDIO_CONTACT_INFO.name}
      </p>
      
      <p style="margin: 0 0 8px 0; color: #71717a; font-size: 11px;">
        ${STUDIO_CONTACT_INFO.fullLocation} &bull; Tel: <a href="tel:${STUDIO_CONTACT_INFO.phone}" style="color: #a1a1aa; text-decoration: none;">${STUDIO_CONTACT_INFO.phone}</a>
      </p>
      
      <p style="margin: 0; color: #52525b; font-size: 10px; line-height: 1.4;">
        You received this notification because an inquiry or communication request was initiated through saghiabyar.com.<br>
        &copy; ${new Date().getFullYear()} Saghi Abyar Studio. All rights reserved.
      </p>
    </div>
  `;
}

/**
 * Standardized Brand Header containing the Official Studio Logo
 */
function renderBrandHeader(): string {
  return `
    <div style="height: 4px; background: linear-gradient(90deg, #d97706, #f59e0b, #fbbf24, #f59e0b);"></div>
    <div style="padding: 32px 24px 24px; text-align: center; background: #0c0a09; border-bottom: 1px solid #1c1917;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center">
            <a href="${STUDIO_CONTACT_INFO.website}" target="_blank" style="text-decoration: none; display: inline-block;">
              <img 
                src="${OFFICIAL_STUDIO_LOGO_URL}" 
                alt="Saghi Abyar Fine Art & Tar Studio" 
                width="160" 
                height="auto" 
                style="display: block; width: 160px; max-width: 160px; height: auto; margin: 0 auto 14px; border: 0; outline: none; text-decoration: none;"
              />
            </a>
          </td>
        </tr>
      </table>
      <h1 style="margin: 0 0 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 800; letter-spacing: 3.5px; color: #fef08a; text-transform: uppercase;">
        SAGHI ABYAR
      </h1>
      <p style="margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 10px; letter-spacing: 2px; color: #a1a1aa; text-transform: uppercase;">
        Fine Art &bull; Modern Painting &bull; Classical Tar Resonance
      </p>
    </div>
  `;
}

/**
 * 1. User Confirmation Email HTML Template
 */
export function generateUserConfirmationEmailHtml(data: UserInquiryEmailData): string {
  const dateStr = data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : new Date().toLocaleDateString('en-US');

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="dark light">
  <meta name="supported-color-schemes" content="dark light">
  <title>Your Inquiry at Saghi Abyar Studio</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #09090b;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f4f4f5;
      -webkit-font-smoothing: antialiased;
      line-height: 1.6;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
    }
    a {
      color: #f59e0b;
    }
    @media only screen and (max-width: 600px) {
      .container-table {
        width: 100% !important;
        border-radius: 0 !important;
      }
      .content-padding {
        padding: 20px 16px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; color: #f4f4f5;">
  <!-- Anti-Spam Preview Text (Hidden in body, visible in inbox preview) -->
  <div style="display: none; font-size: 1px; color: #09090b; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Thank you for contacting Saghi Abyar Studio. We have received your inquiry and our atelier will review your request.
  </div>

  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #09090b; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Wrapper -->
        <table class="container-table" width="600" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #0c0a09; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          
          <!-- Logo & Header -->
          <tr>
            <td>
              ${renderBrandHeader()}
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td class="content-padding" style="padding: 32px 32px 24px;">
              <p style="margin: 0 0 16px 0; font-size: 17px; font-weight: 600; color: #ffffff;">
                Dear ${escapeHtml(data.name)},
              </p>
              
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #d4d4d8; line-height: 1.7;">
                Thank you for your interest in <strong>Saghi Abyar Fine Art &amp; Tar Studio</strong>. We have safely received your inquiry regarding our contemporary art collections and classical Persian Tar recordings. Our atelier is reviewing your request with the utmost attention.
              </p>

              <!-- Structured Inquiry Summary Card -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px 12px; border-bottom: 1px solid #27272a;">
                    <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #f59e0b;">
                      Inquiry Record &amp; Details
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px;">
                      <tr>
                        <td style="color: #71717a; padding: 6px 0; font-weight: 500;">Scope / Topic:</td>
                        <td style="color: #fef08a; font-weight: 600; text-align: right; padding: 6px 0;">${escapeHtml(data.interest)}</td>
                      </tr>
                      ${data.artworkTitle ? `
                      <tr>
                        <td style="color: #71717a; padding: 6px 0; font-weight: 500;">Selected Artwork:</td>
                        <td style="color: #ffffff; font-weight: 600; text-align: right; padding: 6px 0;">${escapeHtml(data.artworkTitle)}</td>
                      </tr>` : ''}
                      ${data.dimensions ? `
                      <tr>
                        <td style="color: #71717a; padding: 6px 0; font-weight: 500;">Dimensions / Space:</td>
                        <td style="color: #d4d4d8; text-align: right; padding: 6px 0;">${escapeHtml(data.dimensions)}</td>
                      </tr>` : ''}
                      <tr>
                        <td style="color: #71717a; padding: 6px 0; font-weight: 500;">Submission Date:</td>
                        <td style="color: #a1a1aa; text-align: right; padding: 6px 0;">${dateStr}</td>
                      </tr>
                    </table>

                    <!-- Client Message Excerpt -->
                    <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #27272a;">
                      <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 10px; color: #71717a; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">
                        Your Submitted Note:
                      </span>
                      <div style="padding: 12px; background-color: #09090b; border-left: 3px solid #f59e0b; border-radius: 6px; font-size: 13px; color: #a1a1aa; font-style: italic; line-height: 1.6; white-space: pre-wrap;">
                        "${escapeHtml(data.message)}"
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Bilingual Notice (Persian & English) -->
              <div style="padding: 16px; background-color: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 10px; margin-bottom: 24px; text-align: right; direction: rtl; font-family: 'Tahoma', 'Segoe UI', sans-serif;">
                <strong style="color: #fbbf24; font-size: 13px; display: block; margin-bottom: 6px;">
                  دریافت استعلام شما با موفقیت در آتلیه ساقی آبیار ثبت شد
                </strong>
                <span style="font-size: 12px; color: #fde68a; line-height: 1.7; display: block;">
                  درخواست شما به دقت توسط تیم آتلیه بررسی شده و حداکثر ظرف مدت ۲۴ الی ۴۸ ساعت آینده جهت ارائه اطلاعات فنی و هماهنگی‌های لازم با شما تماس گرفته خواهد شد.
                </span>
              </div>

              <p style="margin: 0 0 24px 0; font-size: 13px; color: #a1a1aa; line-height: 1.7;">
                If you have immediate questions, additional visual references, or wish to schedule an appointment, you may reply directly to this email (<a href="mailto:${STUDIO_CONTACT_INFO.email}" style="color: #f59e0b; text-decoration: none;">${STUDIO_CONTACT_INFO.email}</a>) or reach out via telephone at <a href="tel:${STUDIO_CONTACT_INFO.phone}" style="color: #f59e0b; text-decoration: none;">${STUDIO_CONTACT_INFO.phone}</a>.
              </p>

              <!-- Artist Signature Sign-off -->
              <div style="padding-top: 16px; border-top: 1px solid #1c1917; font-size: 13px; color: #a1a1aa;">
                Sincerely,<br>
                <strong style="color: #fef08a; font-size: 14px;">Saghi Abyar</strong><br>
                <span style="font-size: 11px; color: #71717a;">Visual Artist &amp; Classical Persian Tar Soloist</span>
              </div>
            </td>
          </tr>

          <!-- Standardized CAN-SPAM Footer -->
          <tr>
            <td>
              ${renderStandardEmailFooter()}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 2. Admin Notification Email HTML Template
 */
export function generateAdminNotificationEmailHtml(data: UserInquiryEmailData): string {
  const dateStr = data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : new Date().toLocaleDateString('en-US');

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="dark light">
  <meta name="supported-color-schemes" content="dark light">
  <title>New Inquiry Notification - Saghi Abyar Atelier</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #09090b;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f4f4f5;
      line-height: 1.6;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; color: #f4f4f5;">
  <div style="display: none; font-size: 1px; color: #09090b; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    New inquiry from ${escapeHtml(data.name)} regarding ${escapeHtml(data.interest)}.
  </div>

  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #09090b; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #0c0a09; border: 1px solid #27272a; border-radius: 16px; overflow: hidden;">
          
          <!-- Brand Header with Logo -->
          <tr>
            <td>
              ${renderBrandHeader()}
            </td>
          </tr>

          <!-- Notification Card Body -->
          <tr>
            <td style="padding: 28px 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                <tr>
                  <td>
                    <span style="display: inline-block; background-color: #f59e0b; color: #000000; font-weight: 800; font-size: 10px; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; font-family: ui-monospace, monospace;">
                      NEW CLIENT INQUIRY
                    </span>
                  </td>
                  <td align="right" style="font-size: 12px; color: #71717a; font-family: ui-monospace, monospace;">
                    ${dateStr}
                  </td>
                </tr>
              </table>

              <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 18px; font-weight: 700;">
                Inquiry from ${escapeHtml(data.name)}
              </h2>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; margin-bottom: 20px; font-size: 13px;">
                <tr>
                  <td style="color: #a1a1aa; padding: 6px 0; width: 130px; font-weight: 500;">Client Name:</td>
                  <td style="color: #ffffff; padding: 6px 0; font-weight: 600;">${escapeHtml(data.name)}</td>
                </tr>
                <tr>
                  <td style="color: #a1a1aa; padding: 6px 0; font-weight: 500;">Email Address:</td>
                  <td style="padding: 6px 0;"><a href="mailto:${escapeHtml(data.email)}" style="color: #38bdf8; text-decoration: none; font-weight: 600;">${escapeHtml(data.email)}</a></td>
                </tr>
                ${data.phone ? `
                <tr>
                  <td style="color: #a1a1aa; padding: 6px 0; font-weight: 500;">Telephone:</td>
                  <td style="padding: 6px 0;"><a href="tel:${escapeHtml(data.phone)}" style="color: #34d399; text-decoration: none; font-weight: 600;">${escapeHtml(data.phone)}</a></td>
                </tr>` : ''}
                <tr>
                  <td style="color: #a1a1aa; padding: 6px 0; font-weight: 500;">Scope / Category:</td>
                  <td style="color: #fde68a; padding: 6px 0; font-weight: 600;">${escapeHtml(data.interest)}</td>
                </tr>
                ${data.artworkTitle ? `
                <tr>
                  <td style="color: #a1a1aa; padding: 6px 0; font-weight: 500;">Artwork Target:</td>
                  <td style="color: #ffffff; padding: 6px 0; font-weight: 600;">${escapeHtml(data.artworkTitle)}</td>
                </tr>` : ''}
                ${data.dimensions ? `
                <tr>
                  <td style="color: #a1a1aa; padding: 6px 0; font-weight: 500;">Dimensions:</td>
                  <td style="color: #e4e4e7; padding: 6px 0;">${escapeHtml(data.dimensions)}</td>
                </tr>` : ''}
              </table>

              <div style="margin-bottom: 24px;">
                <span style="font-family: ui-monospace, monospace; font-size: 11px; color: #a1a1aa; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">
                  Message Content:
                </span>
                <div style="background-color: #09090b; border-left: 3px solid #f59e0b; padding: 16px; border-radius: 6px; font-size: 14px; color: #e4e4e7; line-height: 1.6; white-space: pre-wrap;">
                  ${escapeHtml(data.message)}
                </div>
              </div>

              <!-- Quick Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="mailto:${escapeHtml(data.email)}?subject=Re: Your Inquiry at Saghi Abyar Studio" style="display: inline-block; background-color: #f59e0b; color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 8px; text-transform: uppercase; letter-spacing: 1px;">
                      Reply Directly to ${escapeHtml(data.name)}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Standardized CAN-SPAM Footer -->
          <tr>
            <td>
              ${renderStandardEmailFooter()}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 3. Direct Admin Reply to Client Email HTML Template
 */
export function generateAdminReplyEmailHtml(data: AdminReplyEmailData): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="dark light">
  <meta name="supported-color-schemes" content="dark light">
  <title>${escapeHtml(data.subject)}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #09090b;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f4f4f5;
      line-height: 1.6;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; color: #f4f4f5;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #09090b; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #0c0a09; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          
          <!-- Brand Header with Logo -->
          <tr>
            <td>
              ${renderBrandHeader()}
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <p style="margin: 0 0 18px 0; font-size: 16px; font-weight: 600; color: #ffffff;">
                Dear ${escapeHtml(data.toName)},
              </p>

              <!-- Main Admin Message Text -->
              <div style="font-size: 15px; color: #f4f4f5; line-height: 1.8; margin-bottom: 24px; white-space: pre-wrap;">
                ${escapeHtml(data.message)}
              </div>

              ${data.originalMessage ? `
              <!-- Original Inquiry Context Box -->
              <div style="margin-top: 24px; padding: 14px 16px; background-color: #18181b; border-left: 3px solid #71717a; border-radius: 6px; font-size: 12px; color: #a1a1aa; line-height: 1.6;">
                <strong style="color: #d4d4d8; display: block; margin-bottom: 4px; font-family: ui-monospace, monospace; font-size: 11px; text-transform: uppercase;">
                  Original Inquiry Reference:
                </strong>
                <span style="font-style: italic;">"${escapeHtml(data.originalMessage)}"</span>
              </div>
              ` : ''}

              <!-- Atelier Sign-off -->
              <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #1c1917; font-size: 13px; color: #a1a1aa; line-height: 1.6;">
                Warmest regards,<br>
                <strong style="color: #fef08a; font-size: 15px;">Saghi Abyar</strong><br>
                <span style="font-size: 11px; color: #a1a1aa;">Visual Artist &amp; Classical Persian Tar Soloist</span><br>
                <span style="font-size: 11px; color: #71717a;">
                  <a href="${STUDIO_CONTACT_INFO.website}" style="color: #f59e0b; text-decoration: none;">saghiabyar.com</a> &bull; 
                  <a href="${STUDIO_CONTACT_INFO.instagram}" style="color: #f59e0b; text-decoration: none;">@saghiabyar__art</a>
                </span>
              </div>
            </td>
          </tr>

          <!-- Standardized CAN-SPAM Footer -->
          <tr>
            <td>
              ${renderStandardEmailFooter()}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 4. Verification Test Email HTML Template
 */
export function generateTestEmailHtml(targetEmail: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="dark light">
  <meta name="supported-color-schemes" content="dark light">
  <title>Verification Notice: Saghi Abyar Studio Email Service</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #09090b;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f4f4f5;
      line-height: 1.6;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; color: #f4f4f5;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #09090b; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #0c0a09; border: 1px solid #27272a; border-radius: 16px; overflow: hidden;">
          
          <!-- Brand Header with Logo -->
          <tr>
            <td>
              ${renderBrandHeader()}
            </td>
          </tr>

          <!-- Test Content -->
          <tr>
            <td style="padding: 28px 32px 24px;">
              <div style="background-color: #18181b; border-radius: 12px; padding: 20px; border-left: 4px solid #10b981; margin-bottom: 24px;">
                <h3 style="color: #34d399; margin: 0 0 8px 0; font-size: 16px; font-weight: 700;">
                  ✦ Email Infrastructure Verification Successful
                </h3>
                <p style="color: #e4e4e7; font-size: 13px; line-height: 1.6; margin: 0;">
                  This message confirms that the Saghi Abyar Atelier custom domain email infrastructure (<strong style="color: #fbbf24;">contact@saghiabyar.com</strong>) is active, authenticated, and passing anti-spam filters.
                </p>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; font-size: 12px;">
                <tr>
                  <td style="color: #71717a; padding: 6px 0; width: 140px;">Recipient Address:</td>
                  <td style="color: #ffffff; padding: 6px 0; font-weight: 700; font-family: ui-monospace, monospace;">${escapeHtml(targetEmail)}</td>
                </tr>
                <tr>
                  <td style="color: #71717a; padding: 6px 0;">Sender Identity:</td>
                  <td style="color: #38bdf8; padding: 6px 0; font-weight: 600; font-family: ui-monospace, monospace;">contact@saghiabyar.com</td>
                </tr>
                <tr>
                  <td style="color: #71717a; padding: 6px 0;">Verification Time:</td>
                  <td style="color: #a1a1aa; padding: 6px 0; font-family: ui-monospace, monospace;">${new Date().toUTCString()}</td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; color: #a1a1aa; line-height: 1.6;">
                All automated outgoing notifications are signed with standard SPF, DKIM, and DMARC configurations for optimal inbox delivery and spam filter protection.
              </p>
            </td>
          </tr>

          <!-- Standardized CAN-SPAM Footer -->
          <tr>
            <td>
              ${renderStandardEmailFooter()}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str?: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
