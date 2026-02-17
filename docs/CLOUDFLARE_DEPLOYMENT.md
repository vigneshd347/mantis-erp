# Deploying Manti ERP to Cloudflare

This guide explains how to leverage **Cloudflare** for your SaaS ERP system.

**Recommended Architecture:**
1.  **Frontend (Next.js)**: Deployed to **Cloudflare Pages** (Global CDN, Edge networking).
2.  **Backend (Node.js/Express)**: Hosted on a VPS/PaaS (AWS, DigitalOcean, Railway) but **proxied through Cloudflare**.
3.  **Database**: Hosted on AWS RDS or specific DB provider (Neon/Supabase), accessed by Backend.
4.  **DNS & Security**: Managed by Cloudflare (DDoS protection, SSL).

> **Why not Cloudflare Workers for Backend?**
> Your backend uses `Express`, `PDFKit`, and standard Node.js libraries. While Cloudflare Workers are powerful, they run in a different environment (Edge Runtime) that doesn't support all Node.js APIs natively. For an enterprise ERP, keeping the backend in a standard Node.js container (Docker) is safer and easier to maintain.

---

## Part 1: Deploy Frontend to Cloudflare Pages

Cloudflare Pages is the best place to host your Next.js frontend.

1.  **Push Code to GitHub/GitLab**
    *   Ensure your project is in a repository.

2.  **Connect to Cloudflare**
    *   Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com).
    *   Go to **Workers & Pages** > **Create Application** > **Pages** > **Connect to Git**.
    *   Select your repository (`manti-erp`).

3.  **Build Configuration**
    *   **Project Name**: `manti-erp`
    *   **Framework Preset**: `Next.js`
    *   **Build Command**: `npx @cloudflare/next-on-pages@1` (Standard static export) OR `npm run build`
    *   **Output Directory**: `.vercel/output/static` (if using static export) or `.next`

    *> **Important for Next.js**: You may need to add `@cloudflare/next-on-pages` to your frontend dependencies to ensure full compatibility with edge rendering.*

4.  **Environment Variables**
    *   Add `NEXT_PUBLIC_API_URL` pointing to your backend (e.g., `https://api.yourdomain.com`).

5.  **Click "Save and Deploy"**.

---

## Part 2: Backend & DNS Configuration

Since the backend is on a server (e.g., AWS EC2 with IP `1.2.3.4`), we will protect it with Cloudflare.

1.  **Add Site to Cloudflare**
    *   In Cloudflare Dashboard, click **Add a Site** and enter your domain (e.g., `manti.app`).
    *   Update your domain registrar's Nameservers to the ones Cloudflare provides.

2.  **DNS Records**
    *   **Frontend**: (Automatic if using Pages). Setup a Custom Domain in Pages settings: `app.manti.app`.
    *   **Backend**: Create an **A Record**.
        *   **Name**: `api` (result: `api.manti.app`)
        *   **Content**: `1.2.3.4` (Your AWS/DigitalOcean Server IP)
        *   **Proxy Status**: **Proxied (Orange Cloud)** - *This hides your server IP and enables DDoS protection.*

3.  **Strict SSL/TLS**
    *   Go to **SSL/TLS** > **Overview**.
    *   Set mode to **Full (Strict)**.
    *   Ensure your Backend Server has a valid SSL certificate (can be Let's Encrypt or a Cloudflare Origin Certificate).

---

## Part 3: Optimize & Secure

1.  **Web Application Firewall (WAF)**
    *   Go to **Security** > **WAF**.
    *   Create a rule to Block requests from suspicious countries if your ERP is local.
    *   Enable "Bot Fight Mode" to prevent scrapers.

2.  **Page Rules (Optional)**
    *   **Cache Level**: For `api.manti.app/*`, set Cache Level to **Bypass** (APIs should not be cached).
    *   **Always Online**: Enable to serve static pages even if the backend briefly hiccups.

3.  **Access Rules (Zero Trust)**
    *   For internal Admin Panels, you can use **Cloudflare Access** to require a strict separate login (like Google Auth) before even reaching your app login page.

---

## Summary of URLs

*   **App URL**: `https://app.manti.app` (Hosted on Cloudflare Pages)
*   **API URL**: `https://api.manti.app` (Proxied to AWS/VPS)
