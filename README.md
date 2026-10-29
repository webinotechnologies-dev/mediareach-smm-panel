# 🚀 MediaReach - India's #1 Automated SMM Growth Platform

An enterprise-grade, high-profit, ultra-modern Social Media Marketing (SMM) Panel with dedicated Admin Control Studio, Customer Experience Hub, Multi-Provider Auto-Routing Engine, Dynamic Margin Locks, Instant UPI Auto-Payments, 1-Click Auto Refills, and standard Reseller API v2.

---

## 🌟 Key Architecture & Highlights

- **👤 Dedicated Customer Portal**:
  - Instant Single & Mass Orders (Instagram, YouTube, Telegram, Facebook, etc.)
  - Live Start Counter & Remains Tracker
  - 1-Click Auto-Refill & Cancel buttons
  - Instant Auto Dynamic UPI QR Code Scanner with 12-digit UTR verification
  - Standard Reseller API v2 with cURL, Node.js, Python, and PHP snippets
  - Interactive Support Ticket Desk

- **🛠️ Dedicated Admin Studio (`/admin/*`)**:
  - Executive Financial Analytics (Gross Revenue, Wholesale Costs, Net Profit, Margin %)
  - Multi-Provider Wholesale API Hub with 1-Click 500+ Service Importer (+50% profit lock)
  - Service & Rate Margins Control
  - Master Orders Dispatch Desk with manual status overrides & 100% wallet auto-refunds
  - Users & Wallets Manager with balance adjustment (+/- ₹), custom VIP discounts, and bans
  - Manual Deposit Approvals Desk

- **👑 Seamless Dual-Role Switching**:
  - Admin accounts can toggle between Admin Control Studio and Customer View with 1 click.
  - Strict route-guard middleware preventing non-admin access to `/admin/*`.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Frontend**: React 18, Tailwind CSS, Lucide Icons, Canvas Confetti, QRCodeSVG
- **Backend**: Next.js Server Actions & API Routes (Standard SMM API v2)
- **Database & ORM**: SQLite / PostgreSQL with Prisma ORM (ACID Atomic Transactions)
- **Authentication**: JWT Cookies & Bcrypt Password Hashing

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/webinotechnologies-dev/mediareach-smm-panel.git
cd mediareach-smm-panel
npm install
```

### 2. Setup Database
```bash
npx prisma db push
node prisma/seed.js
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Credentials (Pre-seeded)

- **Admin Account**: `mediareachsmm@gmail.com` / `admin12345password` (Pre-loaded with ₹10,000 balance)
- **Demo Customer**: `demo@smmpanel.com` / `demo12345password` (Pre-loaded with ₹500 balance)

---

## 💳 Payment Gateway
- **Configured UPI ID**: `shubhambhati3187@upi`
- **Payee Name**: `MediaReach`

---

## 📄 License
MIT License. Built for high-volume automated social growth.
