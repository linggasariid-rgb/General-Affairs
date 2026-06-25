# GA Enterprise System

Sistem manajemen General Affairs untuk mengelola aset, ATK, maintenance, procurement, dan perjalanan dinas seluruh cabang.

## Tech Stack

- **Frontend**: React + Vite + Bootstrap 5 + Chart.js (Cloudflare Pages)
- **Backend**: Hono (TypeScript) — Cloudflare Workers
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Storage**: Supabase Storage (bukti pengeluaran, dll.)

## Fitur

| Modul | Deskripsi |
|-------|-----------|
| **Dashboard** | Overview KPI: total aset, open ticket, PR pending, vendor aktif, biaya maintenance |
| **Asset** | Manajemen aset perusahaan, tracking status (aktif/rusak/dipinjam/hapus) per cabang |
| **ATK** | Manajemen stok ATK, transaksi masuk/keluar, distribusi ke cabang |
| **Maintenance** | Ticket maintenance asset, SLA tracking, penugasan vendor/teknisi |
| **Procurement** | Purchase Request (PR), approval, tracking |
| **Master** | Data master: cabang, gudang (pusat & cabang), vendor, users |
| **Perjalanan Dinas** | SPK (Surat Perintah Kerja), E-Toll peminjaman & pengeluaran, upload bukti |
| **Pengajuan Non Rutin** | Pengajuan barang/jasa non-rutin dengan approval |

## Struktur Proyek

```
├── frontend/              # React app (Vite)
│   ├── src/
│   │   ├── components/    # Shared components (KPICard, layout, dll.)
│   │   ├── layouts/       # DashboardLayout
│   │   ├── pages/         # Halaman per modul
│   │   ├── services/      # API client & auth
│   │   ├── styles/        # Global CSS
│   │   └── contexts/      # AuthContext
│   ├── functions/         # Cloudflare Pages Functions (API proxy)
│   └── public/            # Static assets
│
├── backend/               # Hono API (Cloudflare Workers)
│   └── src/
│       └── api/v1/atk/    # ATK & Perjalanan Dinas endpoints
│
├── database/
│   └── migrations/        # SQL migration files
│
└── docs/                  # Documentation & screenshots
```

## Setup Lokal

### Prerequisites

- Node.js 18+
- npm
- Akun Supabase
- Akun Cloudflare (untuk deploy)

### Frontend

```bash
cd frontend
npm install
cp .env.example .env    # Isi VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY
npm run dev
```

### Backend

```bash
cd backend
npm install
cp .env.example .env    # Isi SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

## Environment Variables

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

### Backend (`backend/.env` / `wrangler.jsonc`)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key (admin) |
| `JWT_SECRET` | Supabase JWT secret for token verification |

## Deployment

### Frontend (Cloudflare Pages)

```bash
cd frontend
npx vite build
npx wrangler pages deploy dist --project-name ga-enterprise --branch main
```

### Backend (Cloudflare Workers)

```bash
cd backend
npx wrangler deploy
```

### Database Migrations

Jalankan SQL di folder `database/migrations/` via Supabase SQL Editor.

## Role & Akses

| Role | Akses |
|------|-------|
| `SA` / `HGA` / `SGA` | Full akses: dashboard, asset, ATK, maintenance, procurement, perjalanan dinas, pengajuan non rutin |
| `KCB` | Terbatas: laporan stok cabang |
| `PCB` | Terbatas: pengajuan pembelian |
