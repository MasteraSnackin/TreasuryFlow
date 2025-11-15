# TreasuryFlow Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Layers](#architecture-layers)
3. [Component Diagrams](#component-diagrams)
4. [Data Flow](#data-flow)
5. [Security Architecture](#security-architecture)
6. [Deployment Architecture](#deployment-architecture)

---

## System Overview

TreasuryFlow is a multi-layered blockchain-based treasury management system built on Arc Network, featuring AI-powered automation and enterprise-grade security.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACES                           │
├─────────────────────────────────────────────────────────────────┤
│  Web App (Next.js)  │  Mobile App (React Native)  │  API Clients│
└──────────────┬──────────────────┬────────────────────────┬──────┘
               │                  │                        │
               ▼                  ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  • Payment Scheduler    • Analytics Engine   • Notification Hub │
│  • Invoice Processor    • Fraud Detection    • Report Generator │
│  • Wallet Manager       • Currency Optimizer • Audit Logger     │
└──────────────┬──────────────────┬────────────────────────┬──────┘
               │                  │                        │
               ▼                  ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BLOCKCHAIN LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Arc Network (Layer 2)                                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │ TreasuryVault    │  │   AutoSwap       │  │  Token (USDC) │ │
│  │ Smart Contract   │  │ Smart Contract   │  │  Token (EURC) │ │
│  └──────────────────┘  └──────────────────┘  └───────────────┘ │
└──────────────┬──────────────────┬────────────────────────┬──────┘
               │                  │                        │
               ▼                  ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  • RPC Providers (Arc)  • IPFS Storage      • CDN (Cloudflare)  │
│  • Database (PostgreSQL)• Redis Cache       • Monitoring (Sentry)│
│  • AI Services (Claude) • Email (SendGrid)  • Analytics         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture Layers

### 1. Presentation Layer

**Web Application (Next.js 14)**
```
frontend/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Main dashboard
│   ├── payments/          # Payment management
│   ├── analytics/         # Analytics views
│   └── api/               # API routes
├── components/            # React components
│   ├── Dashboard.tsx
│   ├── PaymentScheduler.tsx
│   ├── TransactionHistory.tsx
│   ├── FraudReviewQueue.tsx
│   └── [40+ components]
├── lib/                   # Utilities
│   ├── useWallet.ts       # Wallet connection
│   ├── contracts.ts       # Contract interactions
│   ├── errorHandler.ts    # Error management
│   └── cache.ts           # Performance caching
└── styles/                # Styling
    └── globals.css        # Tailwind CSS
```

**Mobile Application (React Native)**
```
mobile/
├── App.tsx                # Main app entry
├── screens/               # Screen components
│   ├── HomeScreen.tsx
│   ├── PaymentsScreen.tsx
│   ├── AnalyticsScreen.tsx
│   └── SettingsScreen.tsx
├── components/            # Reusable components
├── navigation/            # Navigation setup
├── services/              # API services
└── utils/                 # Utilities
```

### 2. Application Layer

**Core Services Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION SERVICES                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │ Payment Service  │────────▶│  Scheduler       │             │
│  │                  │         │  (Cron Jobs)     │             │
│  │ • Schedule       │         └──────────────────┘             │
│  │ • Execute        │                                           │
│  │ • Batch Process  │         ┌──────────────────┐             │
│  │ • Approve        │────────▶│  Notification    │             │
│  └──────────────────┘         │  Service         │             │
│           │                   │                  │             │
│           │                   │ • Email          │             │
│           ▼                   │ • Push           │             │
│  ┌──────────────────┐         │ • Telegram       │             │
│  │ Fraud Detection  │         │ • Discord        │             │
│  │                  │         └──────────────────┘             │
│  │ • ML Models      │                                           │
│  │ • Risk Scoring   │         ┌──────────────────┐             │
│  │ • Anomaly Check  │────────▶│  Analytics       │             │
│  │ • Pattern Match  │         │  Engine          │             │
│  └──────────────────┘         │                  │             │
│           │                   │ • Metrics        │             │
│           │                   │ • Reports        │             │
│           ▼                   │ • Forecasting    │             │
│  ┌──────────────────┐         │ • Health Score   │             │
│  │ AI Services      │         └──────────────────┘             │
│  │                  │                                           │
│  │ • Invoice OCR    │         ┌──────────────────┐             │
│  │ • Currency Rec.  │────────▶│  Audit Logger    │             │
│  │ • Chat Assistant │         │                  │             │
│  │ • Forecasting    │         │ • All Actions    │             │
│  └──────────────────┘         │ • Immutable Log  │             │
│                               │ • Compliance     │             │
│                               └──────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Blockchain Layer

**Smart Contract Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                    SMART CONTRACT LAYER                          │
│                      (Arc Network)                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │              TreasuryVault.sol                         │     │
│  │  ┌──────────────────────────────────────────────────┐  │     │
│  │  │  Core Functions                                  │  │     │
│  │  │  • schedulePayment()                             │  │     │
│  │  │  • executePayment()                              │  │     │
│  │  │  • batchExecutePayments()                        │  │     │
│  │  │  • cancelPayment()                               │  │     │
│  │  └──────────────────────────────────────────────────┘  │     │
│  │  ┌──────────────────────────────────────────────────┐  │     │
│  │  │  Approval Workflow                               │  │     │
│  │  │  • approvePayment()                              │  │     │
│  │  │  • addApprover()                                 │  │     │
│  │  │  • removeApprover()                              │  │     │
│  │  │  • approvalThreshold                             │  │     │
│  │  └──────────────────────────────────────────────────┘  │     │
│  │  ┌──────────────────────────────────────────────────┐  │     │
│  │  │  FX Management                                   │  │     │
│  │  │  • setFXThreshold()                              │  │     │
│  │  │  • checkAndRebalance()                           │  │     │
│  │  │  • autoRebalance                                 │  │     │
│  │  └──────────────────────────────────────────────────┘  │     │
│  │  ┌──────────────────────────────────────────────────┐  │     │
│  │  │  Supplier Management                             │  │     │
│  │  │  • addSupplier()                                 │  │     │
│  │  │  • updateSupplier()                              │  │     │
│  │  │  • getSupplierStats()                            │  │     │
│  │  └──────────────────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────────────┘     │
│                              │                                   │
│                              │ Interacts with                    │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │              AutoSwap.sol                              │     │
│  │  • swap()           - Exchange USDC ↔ EURC            │     │
│  │  • getRate()        - Get current exchange rate        │     │
│  │  • addLiquidity()   - Add liquidity to pool           │     │
│  │  • removeLiquidity()- Remove liquidity                │     │
│  └────────────────────────────────────────────────────────┘     │
│                              │                                   │
│                              │ Uses                              │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │         ERC20 Tokens (USDC, EURC)                      │     │
│  │  • transfer()       - Send tokens                      │     │
│  │  • approve()        - Approve spending                 │     │
│  │  • balanceOf()      - Check balance                    │     │
│  │  • transferFrom()   - Transfer on behalf              │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Diagrams

### Payment Flow Diagram

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Initiate Payment
     ▼
┌─────────────────────┐
│  PaymentScheduler   │
│  Component          │
└────┬────────────────┘
     │
     │ 2. Validate Input
     ▼
┌─────────────────────┐
│  AI Currency        │
│  Recommender        │◀────── Analyzes recipient location,
└────┬────────────────┘       amount, and fees
     │
     │ 3. Get Recommendation
     ▼
┌─────────────────────┐
│  Fraud Detection    │
│  Service            │◀────── ML model checks for anomalies
└────┬────────────────┘
     │
     │ 4. Risk Score: PASS
     ▼
┌─────────────────────┐
│  Wallet Connection  │
│  (useWallet hook)   │
└────┬────────────────┘
     │
     │ 5. Sign Transaction
     ▼
┌─────────────────────┐
│  TreasuryVault      │
│  Smart Contract     │
└────┬────────────────┘
     │
     │ 6. schedulePayment()
     ▼
┌─────────────────────┐
│  Approval Required? │
└────┬────────────────┘
     │
     ├─── YES (>$10K) ──▶ ┌──────────────────┐
     │                    │ Multi-sig        │
     │                    │ Approval Queue   │
     │                    └────┬─────────────┘
     │                         │
     │                         │ 7. Approvers Sign
     │                         ▼
     │                    ┌──────────────────┐
     │                    │ approvePayment() │
     │                    └────┬─────────────┘
     │                         │
     └─── NO (<$10K) ──────────┘
                               │
                               │ 8. Payment Scheduled
                               ▼
                          ┌──────────────────┐
                          │ Notification     │
                          │ Service          │
                          └────┬─────────────┘
                               │
                               │ 9. Notify User
                               ▼
                          ┌──────────────────┐
                          │ Email/Push/      │
                          │ Telegram/Discord │
                          └──────────────────┘
```

### Batch Payment Execution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    BATCH PAYMENT EXECUTION                       │
└─────────────────────────────────────────────────────────────────┘

Time: T0 (Scheduled)
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│Payment #1│  │Payment #2│  │Payment #3│  │Payment #4│  │Payment #5│
│ $1,000   │  │ $2,500   │  │ $800     │  │ $3,200   │  │ $1,500   │
│ USDC     │  │ EURC     │  │ USDC     │  │ USDC     │  │ EURC     │
│ Ready    │  │ Ready    │  │ Ready    │  │ Ready    │  │ Ready    │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │             │             │
     └─────────────┴─────────────┴─────────────┴─────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │ Cron Job / Scheduler   │
                    │ Checks every 5 minutes │
                    └────────┬───────────────┘
                             │
                             │ Identifies ready payments
                             ▼
                    ┌────────────────────────┐
                    │ batchExecutePayments() │
                    │ [1, 2, 3, 4, 5]        │
                    └────────┬───────────────┘
                             │
                             │ Single transaction
                             ▼
                    ┌────────────────────────┐
                    │  Smart Contract        │
                    │  Processes all 5       │
                    │  Gas: ~85,000          │
                    │  Cost: $0.085 USDC     │
                    └────────┬───────────────┘
                             │
                             ▼
        ┌────────────────────┴────────────────────┐
        │                                         │
        ▼                                         ▼
┌──────────────┐                         ┌──────────────┐
│ USDC Token   │                         │ EURC Token   │
│ Transfer     │                         │ Transfer     │
│ $5,000 total │                         │ $4,000 total │
└──────┬───────┘                         └──────┬───────┘
       │                                        │
       ▼                                        ▼
┌──────────────┐                         ┌──────────────┐
│ Recipient #1 │                         │ Recipient #2 │
│ Recipient #3 │                         │ Recipient #5 │
│ Recipient #4 │                         │              │
└──────────────┘                         └──────────────┘

Result: 5 payments executed in 1 transaction
        60% gas savings vs individual transactions
        Total cost: $0.085 vs $0.425 (individual)
```

---

## Data Flow

### User Authentication & Wallet Connection

```
┌──────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                            │
└──────────────────────────────────────────────────────────────────┘

User Opens App
     │
     ▼
┌─────────────────┐
│ Check Session   │
└────┬────────────┘
     │
     ├─── Session Valid ───▶ Load Dashboard
     │
     └─── No Session ───▶ ┌──────────────────┐
                          │ Connect Wallet   │
                          │ Button           │
                          └────┬─────────────┘
                               │
                               │ User clicks
                               ▼
                          ┌──────────────────┐
                          │ Detect Wallet    │
                          │ • MetaMask       │
                          │ • WalletConnect  │
                          │ • Coinbase       │
                          └────┬─────────────┘
                               │
                               ▼
                          ┌──────────────────┐
                          │ Request          │
                          │ Connection       │
                          └────┬─────────────┘
                               │
                               ▼
                          ┌──────────────────┐
                          │ User Approves    │
                          │ in Wallet        │
                          └────┬─────────────┘
                               │
                               ▼
                          ┌──────────────────┐
                          │ Verify Network   │
                          │ Arc Testnet?     │
                          └────┬─────────────┘
                               │
                               ├─── Wrong Network ───▶ Prompt Switch
                               │
                               └─── Correct ───▶ ┌──────────────────┐
                                                 │ Sign Message     │
                                                 │ (Authentication) │
                                                 └────┬─────────────┘
                                                      │
                                                      ▼
                                                 ┌──────────────────┐
                                                 │ Create Session   │
                                                 │ JWT Token        │
                                                 └────┬─────────────┘
                                                      │
                                                      ▼
                                                 ┌──────────────────┐
                                                 │ Load User Data   │
                                                 │ • Balances       │
                                                 │ • Payments       │
                                                 │ • History        │
                                                 └────┬─────────────┘
                                                      │
                                                      ▼
                                                 ┌──────────────────┐
                                                 │ Dashboard Ready  │
                                                 └──────────────────┘
```

### Transaction Lifecycle

```
┌──────────────────────────────────────────────────────────────────┐
│                    TRANSACTION LIFECYCLE                          │
└──────────────────────────────────────────────────────────────────┘

1. INITIATION
   ┌──────────────┐
   │ User submits │
   │ payment form │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Frontend     │
   │ validation   │
   └──────┬───────┘
          │
          ▼

2. PREPARATION
   ┌──────────────┐
   │ Build TX     │
   │ parameters   │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Estimate gas │
   │ ~85,000 gas  │
   └──────┬───────┘
          │
          ▼

3. SIGNING
   ┌──────────────┐
   │ Send to      │
   │ wallet       │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ User signs   │
   │ in MetaMask  │
   └──────┬───────┘
          │
          ▼

4. BROADCASTING
   ┌──────────────┐
   │ Submit to    │
   │ Arc Network  │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ TX Hash      │
   │ 0x123...     │
   └──────┬───────┘
          │
          ▼

5. CONFIRMATION
   ┌──────────────┐
   │ Wait for     │
   │ block        │
   │ (~2 seconds) │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Confirmed    │
   │ Block #12345 │
   └──────┬───────┘
          │
          ▼

6. POST-PROCESSING
   ┌──────────────┐
   │ Update UI    │
   │ Show success │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Send         │
   │ notification │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Log to       │
   │ audit trail  │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Update       │
   │ analytics    │
   └──────────────┘
```

---

## Security Architecture

### Multi-Layer Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 1: Network Security                                       │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ • DDoS Protection (Cloudflare)                         │     │
│  │ • Rate Limiting (100 req/min per IP)                   │     │
│  │ • Firewall Rules                                       │     │
│  │ • SSL/TLS Encryption                                   │     │
│  └────────────────────────────────────────────────────────┘     │
│                           │                                      │
│                           ▼                                      │
│  Layer 2: Application Security                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ • Input Validation & Sanitization                      │     │
│  │ • XSS Protection                                       │     │
│  │ • CSRF Tokens                                          │     │
│  │ • SQL Injection Prevention                             │     │
│  │ • Content Security Policy                              │     │
│  └────────────────────────────────────────────────────────┘     │
│                           │                                      │
│                           ▼                                      │
│  Layer 3: Authentication & Authorization                         │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ • Wallet Signature Authentication                      │     │
│  │ • JWT Session Tokens                                   │     │
│  │ • 2FA (TOTP)                                           │     │
│  │ • Biometric (Mobile)                                   │     │
│  │ • Role-Based Access Control                            │     │
│  └────────────────────────────────────────────────────────┘     │
│                           │                                      │
│                           ▼                                      │
│  Layer 4: Smart Contract Security                                │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ • ReentrancyGuard (OpenZeppelin)                       │     │
│  │ • Access Control (Ownable)                             │     │
│  │ • Multi-sig Approval (2-of-3)                          │     │
│  │ • Emergency Pause Mechanism                            │     │
│  │ • Upgrade Proxy Pattern                                │     │
│  └────────────────────────────────────────────────────────┘     │
│                           │                                      │
│                           ▼                                      │
│  Layer 5: Fraud Detection                                        │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ • ML Anomaly Detection                                 │     │
│  │ • Risk Scoring (0-100)                                 │     │
│  │ • Pattern Matching                                     │     │
│  │ • Velocity Checks                                      │     │
│  │ • Blacklist Screening                                  │     │
│  └────────────────────────────────────────────────────────┘     │
│                           │                                      │
│                           ▼                                      │
│  Layer 6: Monitoring & Audit                                     │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ • Real-time Monitoring (Sentry)                        │     │
│  │ • Immutable Audit Logs                                 │     │
│  │ • Alert System (Critical Events)                       │     │
│  │ • Compliance Reporting                                 │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Multi-Signature Approval Workflow

```
┌──────────────────────────────────────────────────────────────────┐
│              MULTI-SIG APPROVAL WORKFLOW                          │
└──────────────────────────────────────────────────────────────────┘

Payment Amount: $15,000 (exceeds $10K threshold)

Step 1: Payment Initiated
┌──────────────┐
│ Treasurer    │
│ (Initiator)  │
└──────┬───────┘
       │
       │ schedulePayment()
       ▼
┌──────────────────────┐
│ TreasuryVault        │
│ requiresApproval=true│
│ approved=false       │
└──────┬───────────────┘
       │
       │ Event: PaymentScheduled
       ▼
┌──────────────────────┐
│ Notification Service │
│ Alerts approvers     │
└──────────────────────┘

Step 2: Approval Process
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Approver #1  │     │ Approver #2  │     │ Approver #3  │
│ (CFO)        │     │ (CEO)        │     │ (Controller) │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │ Reviews payment    │                    │
       │ details            │                    │
       ▼                    │                    │
┌──────────────┐            │                    │
│ Approves     │            │                    │
│ (1 of 2)     │            │                    │
└──────┬───────┘            │                    │
       │                    │                    │
       │ approvePayment()   │                    │
       ▼                    │                    │
┌──────────────────────┐    │                    │
│ Smart Contract       │    │                    │
│ approvalCount = 1    │    │                    │
└──────────────────────┘    │                    │
       │                    │                    │
       │                    │ Reviews            │
       │                    ▼                    │
       │             ┌──────────────┐            │
       │             │ Approves     │            │
       │             │ (2 of 2)     │            │
       │             └──────┬───────┘            │
       │                    │                    │
       │                    │ approvePayment()   │
       │                    ▼                    │
       │             ┌──────────────────────┐    │
       │             │ Smart Contract       │    │
       │             │ approvalCount = 2    │    │
       │             │ ✅ APPROVED          │    │
       │             └──────┬───────────────┘    │
       │                    │                    │
       └────────────────────┴────────────────────┘
                            │
                            │ Event: PaymentApproved
                            ▼
                     ┌──────────────────────┐
                     │ Payment Ready for    │
                     │ Execution            │
                     └──────────────────────┘

Step 3: Execution
┌──────────────┐
│ Anyone can   │
│ execute now  │
└──────┬───────┘
       │
       │ executePayment()
       ▼
┌──────────────────────┐
│ Funds transferred    │
│ to recipient         │
└──────────────────────┘

Required: 2 of 3 approvers
Timeout: 7 days (auto-cancel if not approved)
Emergency: Owner can cancel anytime
```

---

## Deployment Architecture

### Production Infrastructure

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                         │
└─────────────────────────────────────────────────────────────────┘

                         ┌──────────────┐
                         │   Users      │
                         └──────┬───────┘
                                │
                                │ HTTPS
                                ▼
                    ┌───────────────────────┐
                    │   Cloudflare CDN      │
                    │   • DDoS Protection   │
                    │   • SSL/TLS           │
                    │   • Caching           │
                    └───────────┬───────────┘
                                │
                                ▼
        ┌───────────────────────────────────────────┐
        │                                           │
        ▼                                           ▼
┌──────────────────┐                    ┌──────────────────┐
│  Vercel (Web)    │                    │  Expo (Mobile)   │
│  • Next.js App   │                    │  • React Native  │
│  • Edge Runtime  │                    │  • iOS App       │
│  • Auto-scaling  │                    │  • Android App   │
└────────┬─────────┘                    └────────┬─────────┘
         │                                       │
         │                                       │
         └───────────────┬───────────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │   API Gateway          │
            │   • Rate Limiting      │
            │   • Authentication     │
            │   • Load Balancing     │
            └────────┬───────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
┌────────────┐ ┌────────────┐ ┌────────────┐
│ Arc RPC    │ │ Database   │ │ Redis      │
│ Provider   │ │ PostgreSQL │ │ Cache      │
└────────────┘ └────────────┘ └────────────┘
         │
         │
         ▼
┌─────────────────────────────────────┐
│      Arc Network (Mainnet)          │
│  ┌──────────────────────────────┐   │
│  │  TreasuryVault Contract      │   │
│  │  0x742d35Cc6634C0532925a...  │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  AutoSwap Contract           │   │
│  │  0x8f3a9C45D93e7B6c2A1b8... │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘

External Services:
┌────────────┐  ┌────────────┐  ┌────────────┐
│ Sentry     │  │ SendGrid   │  │ Anthropic  │
│ Monitoring │  │ Email      │  │ AI/ML      │
└────────────┘  └────────────┘  └────────────┘
```

### Continuous Deployment Pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│                    CI/CD PIPELINE                                 │
└──────────────────────────────────────────────────────────────────┘

Developer Workflow:
┌──────────────┐
│ Developer    │
│ commits code │
└──────┬───────┘
       │
       │ git push
       ▼
┌──────────────────┐
│ GitHub           │
│ Repository       │
└──────┬───────────┘
       │
       │ Webhook trigger
       ▼
┌──────────────────────────────────────────────────────────────┐
│                    GitHub Actions                             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Stage 1: Build & Test                                        │
│  ┌────────────────────────────────────────────────────┐      │
│  │ • npm install                                      │      │
│  │ • npm run lint                                     │      │
│  │ • npm run compile (contracts)                      │      │
│  │ • npm run test                                     │      │
│  │ • npm run build (frontend)                         │      │
│  └────────────────────────────────────────────────────┘      │
│                           │                                   │
│                           │ All tests pass                    │
│                           ▼                                   │
│  Stage 2: Security Scan                                       │
│  ┌────────────────────────────────────────────────────┐      │
│  │ • npm audit                                        │      │
│  │ • Snyk security scan                               │      │
│  │ • Contract security analysis                       │      │
│  └────────────────────────────────────────────────────┘      │
│                           │                                   │
│                           │ No vulnerabilities                │
│                           ▼                                   │
│  Stage 3: Deploy (if main branch)                             │
│  ┌────────────────────────────────────────────────────┐      │
│  │ • Deploy contracts to Arc Mainnet                  │      │
│  │ • Verify contracts on explorer                     │      │
│  │ • Deploy frontend to Vercel                        │      │
│  │ • Update environment variables                     │      │
│  │ • Run smoke tests                                  │      │
│  └────────────────────────────────────────────────────┘      │
│                           │                                   │
│                           ▼                                   │
│  Stage 4: Post-Deployment                                     │
│  ┌────────────────────────────────────────────────────┐      │
│  │ • Create Git tag                                   │      │
│  │ • Generate changelog                               │      │
│  │ • Send deployment notification                     │      │
│  │ • Update documentation                             │      │
│  └────────────────────────────────────────────────────┘      │
│                                                               │
└───────────────────────────────────────────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Production   │
                    │ Live! 🚀     │
                    └──────────────┘
```

---

## Performance Optimization

### Caching Strategy

```
┌──────────────────────────────────────────────────────────────────┐
│                    CACHING ARCHITECTURE                           │
└──────────────────────────────────────────────────────────────────┘

Request Flow:
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ Request: Get balances
     ▼
┌─────────────────┐
│ Frontend        │
└────┬────────────┘
     │
     │ 1. Check browser cache
     ▼
┌─────────────────┐
│ Browser Cache   │
│ (5 min TTL)     │
└────┬────────────┘
     │
     ├─── HIT ───▶ Return cached data (instant)
     │
     └─── MISS ──▶ ┌─────────────────┐
                   │ API Request     │
                   └────┬────────────┘
                        │
                        │ 2. Check Redis
                        ▼
                   ┌─────────────────┐
                   │ Redis Cache     │
                   │ (1 min TTL)     │
                   └────┬────────────┘
                        │
                        ├─── HIT ───▶ Return cached (fast)
                        │
                        └─── MISS ──▶ ┌─────────────────┐
                                      │ Database Query  │
                                      └────┬────────────┘
                                           │
                                           │ 3. Query DB
                                           ▼
                                      ┌─────────────────┐
                                      │ PostgreSQL      │
                                      └────┬────────────┘
                                           │
                                           │ 4. Fetch from blockchain
                                           ▼
                                      ┌─────────────────┐
                                      │ Arc Network     │
                                      │ RPC Call        │
                                      └────┬────────────┘
                                           │
                                           │ 5. Return & cache
                                           ▼
                                      ┌─────────────────┐
                                      │ Cache at all    │
                                      │ levels          │
                                      └─────────────────┘

Cache Invalidation:
• On new transaction: Clear related caches
• On payment execution: Clear balance cache
• On schedule update: Clear payment list cache
• Manual: Admin can clear all caches
```

### Load Balancing

```
┌──────────────────────────────────────────────────────────────────┐
│                    LOAD BALANCING                                 │
└──────────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │ Load Balancer│
                    │ (Vercel Edge)│
                    └──────┬───────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ Instance 1   │ │ Instance 2   │ │ Instance 3   │
    │ US-East      │ │ EU-West      │ │ Asia-Pacific │
    └──────────────┘ └──────────────┘ └──────────────┘

Routing Strategy:
• Geographic: Route to nearest instance
• Health: Skip unhealthy instances
• Load: Distribute based on current load
• Sticky: Keep user on same instance

Auto-scaling:
• Scale up: CPU > 70% for 5 minutes
• Scale down: CPU < 30% for 10 minutes
• Min instances: 2
• Max instances: 10
```

---

## Monitoring & Observability

### Monitoring Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│                    MONITORING DASHBOARD                           │
└──────────────────────────────────────────────────────────────────┘

Real-time Metrics:
┌────────────────────────────────────────────────────────────┐
│  System Health                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Frontend │  │ Backend  │  │ Database │  │ Blockchain│  │
│  │   🟢     │  │   🟢     │  │   🟢     │  │   🟢      │  │
│  │  99.9%   │  │  99.8%   │  │  100%    │  │  99.9%    │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  Transaction Metrics (Last 24h)                             │
│  • Total Transactions: 1,247                                │
│  • Successful: 1,238 (99.3%)                                │
│  • Failed: 9 (0.7%)                                         │
│  • Average Gas: 0.082 USDC                                  │
│  • Total Volume: $487,320                                   │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  Performance Metrics                                        │
│  • API Response Time: 145ms (avg)                           │
│  • Page Load Time: 1.2s                                     │
│  • Time to Interactive: 2.1s                                │
│  • Largest Contentful Paint: 1.8s                           │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  Error Tracking (Sentry)                                    │
│  • Total Errors: 23                                         │
│  • Critical: 0                                              │
│  • High: 2                                                  │
│  • Medium: 8                                                │
│  • Low: 13                                                  │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  Security Alerts                                            │
│  • Fraud Attempts Blocked: 5                                │
│  • Rate Limit Hits: 12                                      │
│  • Failed Auth Attempts: 8                                  │
│  • Suspicious Patterns: 2 (under review)                    │
└────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                                │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│      Users          │
├─────────────────────┤
│ id (PK)             │
│ wallet_address      │◀────────┐
│ email               │         │
│ created_at          │         │
│ last_login          │         │
│ role                │         │
└─────────────────────┘         │
                                │
                                │
┌─────────────────────┐         │
│    Payments         │         │
├─────────────────────┤         │
│ id (PK)             │         │
│ user_id (FK)        │─────────┘
│ recipient_address   │
│ amount              │
│ currency            │
│ frequency           │
│ next_execution      │
│ status              │
│ requires_approval   │
│ approved            │
│ created_at          │
│ updated_at          │
└─────────────────────┘
         │
         │
         ▼
┌─────────────────────┐
│   Transactions      │
├─────────────────────┤
│ id (PK)             │
│ payment_id (FK)     │
│ tx_hash             │
│ block_number        │
│ gas_used            │
│ gas_price           │
│ status              │
│ timestamp           │
└─────────────────────┘

┌─────────────────────┐
│    Suppliers        │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ wallet_address      │
│ preferred_currency  │
│ total_paid          │
│ payment_count       │
│ tags                │
│ created_at          │
└─────────────────────┘

┌─────────────────────┐
│   Audit_Logs        │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │
│ action              │
│ resource_type       │
│ resource_id         │
│ details (JSON)      │
│ ip_address          │
│ timestamp           │
└─────────────────────┘

┌─────────────────────┐
│  Fraud_Alerts       │
├─────────────────────┤
│ id (PK)             │
│ payment_id (FK)     │
│ risk_score          │
│ alert_type          │
│ details (JSON)      │
│ status              │
│ reviewed_by         │
│ reviewed_at         │
│ created_at          │
└─────────────────────┘
```

---

This architecture documentation provides a comprehensive view of TreasuryFlow's system design, from high-level overview to detailed component interactions. All diagrams are created using ASCII art for maximum compatibility and clarity.