# Saghi Abyar — saghiabyar.com

Portfolio, gallery and inquiry site for Saghi Abyar (React + Vite front end, Express API, Firebase Firestore, Resend email).

## Local development

```bash
npm install
cp .env.example .env   # fill in the values
npm run dev            # http://localhost:3000
npm run lint           # type check
npm run build          # production build into dist/
```

## Admin access setup (one time)

Admin sign-in uses Firebase Authentication. Only users listed in the Firestore `admins` collection can edit content or read inquiries.

1. **Create the admin user.** Firebase console → project `clever-environs-484401-r0` → Authentication → Sign-in method → enable **Email/Password**. Then Authentication → Users → **Add user** with the admin email and a strong password. Copy the new user's **UID**.
2. **Grant admin rights.** Firestore → database `ai-studio-saghiabyarfinear-…` → Data → start collection `admins` → document ID = the UID from step 1 → add any field (for example `role: "owner"`).
3. **Publish the security rules.** Firestore → Rules → replace the contents with [`firestore.rules`](firestore.rules) → Publish.
4. **Delete the old password document.** Firestore → Data → `config` → delete the `admin_auth` document (it stored the old admin password in plain text).
5. **Server environment variables** (Vercel → Project → Settings → Environment Variables, then redeploy):
   - `ADMIN_UIDS` — the UID from step 1 (comma-separate several admins)
   - `RESEND_API_KEY`, `SENDER_EMAIL`, `ADMIN_NOTIFICATION_EMAIL` — as before
   - `RESEND_WEBHOOK_SECRET` — signing secret of the Resend inbound webhook, if you use it

To change the admin password later, use **Change Password** in the admin panel's settings tab (a reset link is emailed).

## How content is published

Artworks, categories and site settings are stored in Firestore and loaded by every visitor. The first time an admin signs in while the database is still empty, the content they currently see is published automatically. Visitors can only create inquiries; reading and answering them is admin-only.
