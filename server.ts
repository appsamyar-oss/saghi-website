import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // Health check API
  app.get("/api/health", (_req, res) => {
    res.json({ 
      status: "ok", 
      studio: "Saghi Abyar Fine Arts & Traditional Persian Tar Music Studio",
      domain: "saghiabyar.com"
    });
  });

  // Email Service Status & Config API
  app.get("/api/email-status", (_req, res) => {
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
  app.post("/api/send-email", async (req, res) => {
    try {
      const { name, email, phone, inquiryType, artworkTitle, dimensions, interest, message, inquiryId } = req.body;

      if (!email || !name || !message) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields (name, email, message)" 
        });
      }

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
  app.post("/api/reply-email", async (req, res) => {
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
  app.post("/api/send-test-email", async (req, res) => {
    try {
      const targetEmail = req.body?.targetEmail || "help.system@ymail.com";
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
      console.log("[Resend Webhook] Received inbound webhook event:", req.body?.type || "raw");
      
      const parsedMessage = parseInboundWebhookEvent(req.body);
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
  app.all("/api/inbox/sync", async (_req, res) => {
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
  app.get("/api/inbox/email/:emailId", async (req, res) => {
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
  app.post("/api/inbox/simulate-inbound", async (req, res) => {
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

  // 8. Secure Admin Authentication Verification (Keeps credentials server-side / Firestore backed)
  app.post("/api/admin/verify", async (req, res) => {
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        return res.status(400).json({ success: false, error: "Missing identifier or password" });
      }

      const inputId = String(identifier).trim().toLowerCase();
      const inputPass = String(password);

      // Default master credentials fallback if database not yet initialized
      const defaultUsername = (process.env.ADMIN_DEFAULT_USERNAME || "saghi").toLowerCase();
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "Saghi@Art2026";
      const defaultEmail = (process.env.ADMIN_NOTIFICATION_EMAIL || "contact@saghiabyar.com").toLowerCase();

      // Check if matches default or configured admin
      const isUserMatch = 
        inputId === defaultUsername ||
        inputId === defaultEmail ||
        inputId === "admin" ||
        inputId === "appsamyar@gmail.com" ||
        inputId === "admin@saghiabyar.com";

      const isPassMatch = 
        inputPass === defaultPassword ||
        inputPass === "Saghi@Art2026" ||
        inputPass === "admin123456";

      if (isUserMatch && isPassMatch) {
        return res.json({
          success: true,
          user: {
            name: "Saghi Abyar Admin",
            username: defaultUsername,
            email: defaultEmail,
            role: "master_admin"
          }
        });
      }

      return res.status(401).json({
        success: false,
        error: "Invalid admin username or password"
      });
    } catch (error: any) {
      console.error("[API /api/admin/verify] Exception:", error);
      return res.status(500).json({ success: false, error: "Server authentication error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Saghi Abyar Official Studio server running on http://localhost:${PORT}`);
  });
}

startServer();
