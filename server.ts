import express from "express";
import path from "path";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { requireAdmin } from "./server/adminAuth";
import { 
  sendInquiryEmails, 
  sendAdminReplyEmail, 
  sendTestEmail, 
  fetchInboundEmailsFromResend,
  fetchInboundEmailDetails,
  parseInboundWebhookEvent,
  getResendClient 
} from "./server/resendService";

dotenv.config();

const inquirySchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(100),
  phone: z.string().trim().max(40).optional(),
  inquiryType: z.string().trim().max(50).optional(),
  artworkTitle: z.string().trim().max(300).optional(),
  dimensions: z.string().trim().max(200).optional(),
  interest: z.string().trim().max(300).optional(),
  message: z.string().trim().min(1).max(5000),
  inquiryId: z.string().trim().max(128).optional(),
});

// Public inquiry form: limit how many confirmation emails one visitor can trigger
const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again later." },
});

export const app = express();
app.disable("x-powered-by");
// Behind Vercel / Cloud Run proxies: use the client IP for rate limiting
app.set("trust proxy", 1);

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  // Webhook signature verification needs the raw body, so parse it before express.json
  app.use("/api/webhooks/resend", express.raw({ type: "*/*", limit: "1mb" }));
  app.use(express.json({ limit: "1mb" }));

  // Health check API
  app.get("/api/health", (_req, res) => {
    res.json({ 
      status: "ok", 
      studio: "Saghi Abyar Fine Arts & Traditional Persian Tar Music Studio",
      domain: "saghiabyar.com"
    });
  });

  // Email Service Status & Config API
  app.get("/api/email-status", requireAdmin, (_req, res) => {
    const isConfigured = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim() !== "");
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "appsamyar@gmail.com";
    const senderEmail = process.env.SENDER_EMAIL || "Saghi Abyar Studio <contact@saghiabyar.com>";
    
    res.json({
      configured: isConfigured,
      adminEmail,
      senderEmail,
      mode: isConfigured ? "live" : "simulated",
      service: "Resend (https://resend.com)"
    });
  });

  // 1. Submit Inquiry & Dispatch Auto-Confirmation + Admin Alert
  app.post("/api/send-email", inquiryLimiter, async (req, res) => {
    try {
      const parsed = inquirySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing or invalid fields (name, email, message)" 
        });
      }
      const { name, email, phone, inquiryType, artworkTitle, dimensions, interest, message, inquiryId } = parsed.data;

      const result = await sendInquiryEmails({
        name,
        email,
        phone,
        inquiryType,
        artworkTitle,
        dimensions,
        interest: interest || artworkTitle || "General Studio Inquiry",
        message,
        inquiryId,
        createdAt: new Date().toISOString(),
      });

      return res.json(result);
    } catch (error: any) {
      console.error("[API /api/send-email] Exception:", error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to process inquiry email dispatch" 
      });
    }
  });

  // 2. Admin Direct Reply to Customer Inquiry
  app.post("/api/reply-email", requireAdmin, async (req, res) => {
    try {
      const { toEmail, toName, subject, message, originalMessage, inquiryId } = req.body;

      if (!toEmail || !subject || !message) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields (toEmail, subject, message)" 
        });
      }

      const result = await sendAdminReplyEmail({
        toEmail,
        toName: toName || "Valued Art Collector",
        subject,
        message,
        originalMessage,
        inquiryId,
      });

      return res.json(result);
    } catch (error: any) {
      console.error("[API /api/reply-email] Exception:", error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to dispatch reply email" 
      });
    }
  });

  // 3. Test Email Dispatch to verify custom domain (e.g., help.system@ymail.com)
  app.post("/api/send-test-email", requireAdmin, async (req, res) => {
    try {
      const targetEmail = String(req.body?.targetEmail || (req as any).adminUser?.email || "").trim();
      if (!z.string().email().safeParse(targetEmail).success) {
        return res.status(400).json({ success: false, error: "A valid targetEmail is required" });
      }
      const result = await sendTestEmail(targetEmail);
      return res.json(result);
    } catch (error: any) {
      console.error("[API /api/send-test-email] Exception:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to dispatch test email"
      });
    }
  });

  // 4. Inbound Email Webhook (Resend Webhook Endpoint)
  // Receives real-time incoming collector messages sent to studio domain
  app.post("/api/webhooks/resend", async (req, res) => {
    try {
      const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : JSON.stringify(req.body || {});
      const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
      const resend = getResendClient();
      if (webhookSecret && resend) {
        try {
          resend.webhooks.verify({
            payload: rawBody,
            headers: {
              id: String(req.headers["svix-id"] || req.headers["webhook-id"] || ""),
              timestamp: String(req.headers["svix-timestamp"] || req.headers["webhook-timestamp"] || ""),
              signature: String(req.headers["svix-signature"] || req.headers["webhook-signature"] || ""),
            },
            webhookSecret,
          });
        } catch {
          return res.status(401).json({ success: false, error: "Invalid webhook signature" });
        }
      } else if (process.env.NODE_ENV === "production") {
        return res.status(503).json({ success: false, error: "Webhook secret not configured" });
      }

      let body: any;
      try {
        body = JSON.parse(rawBody);
      } catch {
        return res.status(400).json({ success: false, error: "Invalid JSON" });
      }
      console.log("[Resend Webhook] Received inbound webhook event:", body?.type || "raw");
      
      const parsedMessage = parseInboundWebhookEvent(body);
      if (!parsedMessage) {
        return res.status(400).json({ success: false, error: "Invalid webhook payload format" });
      }

      console.log(`[Resend Webhook] Parsed inbound email from ${parsedMessage.senderEmail} - Subject: ${parsedMessage.subject}`);

      return res.json({
        success: true,
        message: "Inbound email processed and queued for thread synchronization",
        receivedMessage: parsedMessage,
      });
    } catch (error: any) {
      console.error("[Resend Webhook] Error processing incoming payload:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to process inbound webhook",
      });
    }
  });

  // 5. Inbound Sync API (On-demand pull from Resend Receiving API)
  app.get("/api/inbox/sync", requireAdmin, async (_req, res) => {
    try {
      const result = await fetchInboundEmailsFromResend();
      return res.json(result);
    } catch (error: any) {
      console.error("[API /api/inbox/sync] Exception:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to sync inbound inbox from Resend",
      });
    }
  });

  // 6. Inbound Email Detail API
  app.get("/api/inbox/email/:emailId", requireAdmin, async (req, res) => {
    try {
      const emailId = req.params.emailId;
      const result = await fetchInboundEmailDetails(emailId);
      return res.json(result);
    } catch (error: any) {
      console.error("[API /api/inbox/email] Exception:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch email details",
      });
    }
  });

  // 7. Simulated Collector Inbound Reply (For development and testing)
  app.post("/api/inbox/simulate-inbound", requireAdmin, async (req, res) => {
    try {
      const { inquiryId, senderName, senderEmail, message, subject } = req.body;
      const createdAt = new Date().toISOString();
      const mockMessage = {
        id: `msg_sim_${Date.now()}`,
        senderType: "user" as const,
        senderName: senderName || "Collector / Patron",
        senderEmail: senderEmail || "collector@artspace.org",
        recipientEmail: "contact@saghiabyar.com",
        subject: subject || "Re: Studio Inquiry & Acquisition Confirmation",
        message: message || "Hello Saghi, thank you for the response! We would love to move forward with the acquisition.",
        createdAt,
        status: "received" as const,
        tags: ["Inbound Reply", "Collector Response"],
        inquiryId,
      };

      return res.json({
        success: true,
        message: "Simulated inbound message created successfully",
        receivedMessage: mockMessage,
      });
    } catch (error: any) {
      console.error("[API /api/inbox/simulate-inbound] Exception:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to simulate inbound message",
      });
    }
  });

  // Disable caching for HTML entry points to ensure instant client updates
  app.use((req, res, next) => {
    if (req.path === "/" || req.path.endsWith(".html") || req.path.startsWith("/api/")) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Surrogate-Control", "no-store");
    }
    next();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    // Hashed build assets never change, so let browsers cache them for a year
    app.use("/assets", express.static(path.join(distPath, "assets"), { immutable: true, maxAge: "1y" }));
    app.use(express.static(distPath, { index: false }));
    app.get("*", (_req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Saghi Abyar Official Studio server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
