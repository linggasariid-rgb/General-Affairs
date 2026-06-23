# PROJECT STRUCTURE
## General Affairs Enterprise System

---

**Dokumen Versi:** 1.0
**Tanggal:** 23 Juni 2026

---

## 1. REPOSITORY STRUCTURE

```
ga-enterprise/
│
├── .github/
│   └── workflows/
│       ├── deploy-frontend.yml       # Cloudflare Pages deploy
│       └── deploy-backend.yml        # Cloudflare Workers deploy
│
├── frontend/                         # CLOUDFLARE PAGES
│   │
│   ├── public/
│   │   ├── favicon.ico
│   │   └── manifest.json
│   │
│   ├── src/
│   │   ├── main.jsx                  # Entry point
│   │   ├── App.jsx                   # Router + Layout
│   │   │
│   │   ├── layouts/
│   │   │   ├── AuthLayout.jsx        # Layout halaman login
│   │   │   ├── DashboardLayout.jsx   # Layout dashboard (sidebar + navbar)
│   │   │   └── PrintLayout.jsx       # Layout untuk cetak laporan
│   │   │
│   │   ├── components/               # Shared components
│   │   │   ├── ui/                   # UI primitives
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── DataTable.jsx
│   │   │   │   ├── FormInput.jsx
│   │   │   │   ├── FormSelect.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Alert.jsx
│   │   │   │   └── Loading.jsx
│   │   │   │
│   │   │   ├── layout/               # Layout components
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Breadcrumb.jsx
│   │   │   │   └── Footer.jsx
│   │   │   │
│   │   │   ├── dashboard/            # Dashboard widgets
│   │   │   │   ├── KPICard.jsx
│   │   │   │   ├── BarChart.jsx
│   │   │   │   ├── LineChart.jsx
│   │   │   │   ├── DonutChart.jsx
│   │   │   │   ├── ActivityFeed.jsx
│   │   │   │   └── RecentTable.jsx
│   │   │   │
│   │   │   └── shared/               # Business components
│   │   │       ├── QRCodeModal.jsx
│   │   │       ├── FotoUploader.jsx
│   │   │       ├── StatusBadge.jsx
│   │   │       ├── ConfirmDialog.jsx
│   │   │       ├── FilterPanel.jsx
│   │   │       └── ExportButton.jsx
│   │   │
│   │   ├── pages/                    # Halaman per modul
│   │   │   ├── auth/
│   │   │   │   └── LoginPage.jsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── HeadGADashboard.jsx
│   │   │   │   ├── StaffGADashboard.jsx
│   │   │   │   ├── KacabDashboard.jsx
│   │   │   │   └── KagudDashboard.jsx
│   │   │   │
│   │   │   ├── master/
│   │   │   │   ├── CabangPage.jsx
│   │   │   │   ├── GudangPage.jsx
│   │   │   │   ├── UserPage.jsx
│   │   │   │   ├── VendorPage.jsx
│   │   │   │   ├── VendorFormPage.jsx
│   │   │   │   ├── KategoriAssetPage.jsx
│   │   │   │   ├── LokasiAssetPage.jsx
│   │   │   │   ├── KendaraanPage.jsx
│   │   │   │   └── JenisMaintenancePage.jsx
│   │   │   │
│   │   │   ├── asset/
│   │   │   │   ├── AssetListPage.jsx
│   │   │   │   ├── AssetFormPage.jsx
│   │   │   │   ├── AssetDetailPage.jsx
│   │   │   │   ├── AssetMutasiPage.jsx
│   │   │   │   ├── AssetMutasiFormPage.jsx
│   │   │   │   ├── AssetStockOpnamePage.jsx
│   │   │   │   ├── AssetStockOpnameFormPage.jsx
│   │   │   │   ├── AssetPenyusutanPage.jsx
│   │   │   │   └── AssetPenghapusanPage.jsx
│   │   │   │
│   │   │   ├── maintenance/
│   │   │   │   ├── TicketListPage.jsx
│   │   │   │   ├── TicketFormPage.jsx
│   │   │   │   ├── TicketDetailPage.jsx
│   │   │   │   ├── TicketAssignPage.jsx
│   │   │   │   ├── PreventivePage.jsx
│   │   │   │   └── SLAMonitoringPage.jsx
│   │   │   │
│   │   │   ├── procurement/
│   │   │   │   ├── PRListPage.jsx
│   │   │   │   ├── PRFormPage.jsx
│   │   │   │   ├── PRDetailPage.jsx
│   │   │   │   ├── PRApprovalPage.jsx
│   │   │   │   ├── POListPage.jsx
│   │   │   │   ├── POFormPage.jsx
│   │   │   │   ├── PODetailPage.jsx
│   │   │   │   ├── PenerimaanListPage.jsx
│   │   │   │   └── PenerimaanFormPage.jsx
│   │   │   │
│   │   │   ├── vendor/
│   │   │   │   ├── VendorListPage.jsx
│   │   │   │   ├── VendorDetailPage.jsx
│   │   │   │   ├── KontrakListPage.jsx
│   │   │   │   ├── KontrakFormPage.jsx
│   │   │   │   ├── EvaluasiPage.jsx
│   │   │   │   └── EvaluasiFormPage.jsx
│   │   │   │
│   │   │   ├── vehicle/
│   │   │   │   ├── KendaraanListPage.jsx
│   │   │   │   ├── KendaraanDetailPage.jsx
│   │   │   │   ├── BookingListPage.jsx
│   │   │   │   ├── BookingFormPage.jsx
│   │   │   │   ├── BBMPage.jsx
│   │   │   │   ├── ServicePage.jsx
│   │   │   │   └── ReminderPage.jsx
│   │   │   │
│   │   │   ├── building/
│   │   │   │   ├── ChecklistPage.jsx
│   │   │   │   ├── IssueListPage.jsx
│   │   │   │   ├── IssueFormPage.jsx
│   │   │   │   └── MonitoringPage.jsx
│   │   │   │
│   │   │   ├── report/
│   │   │   │   ├── ReportAssetPage.jsx
│   │   │   │   ├── ReportMaintenancePage.jsx
│   │   │   │   ├── ReportProcurementPage.jsx
│   │   │   │   ├── ReportVendorPage.jsx
│   │   │   │   ├── ReportVehiclePage.jsx
│   │   │   │   ├── ReportBuildingPage.jsx
│   │   │   │   └── ReportAuditPage.jsx
│   │   │   │
│   │   │   ├── audit/
│   │   │   │   └── AuditLogPage.jsx
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   ├── ProfilePage.jsx
│   │   │   │   ├── RoleManagementPage.jsx
│   │   │   │   └── NotificationsPage.jsx
│   │   │   │
│   │   │   └── NotFoundPage.jsx
│   │   │
│   │   ├── services/                # API layer
│   │   │   ├── api.js               # Supabase client config
│   │   │   ├── auth.js              # Auth functions
│   │   │   ├── masterApi.js
│   │   │   ├── assetApi.js
│   │   │   ├── maintenanceApi.js
│   │   │   ├── procurementApi.js
│   │   │   ├── vendorApi.js
│   │   │   ├── vehicleApi.js
│   │   │   ├── buildingApi.js
│   │   │   ├── dashboardApi.js
│   │   │   ├── reportApi.js
│   │   │   └── auditApi.js
│   │   │
│   │   ├── hooks/                   # Custom hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useCabang.js
│   │   │   ├── useDataTable.js
│   │   │   └── useNotifications.js
│   │   │
│   │   ├── utils/                   # Utility functions
│   │   │   ├── format.js            # Currency, date, etc.
│   │   │   ├── validators.js
│   │   │   ├── constants.js
│   │   │   └── permissions.js
│   │   │
│   │   ├── context/                 # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   │
│   │   └── styles/
│   │       ├── main.css
│   │       ├── sidebar.css
│   │       ├── dashboard.css
│   │       └── print.css
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── wrangler.toml
│   └── tsconfig.json
│
├── backend/                          # CLOUDFLARE WORKERS
│   │
│   ├── src/
│   │   ├── index.ts                  # Entry: Hono app + middleware
│   │   │
│   │   ├── config/
│   │   │   ├── database.ts           # Supabase client
│   │   │   ├── constants.ts          # Constants & enums
│   │   │   └── cors.ts               # CORS config
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.ts               # JWT verification
│   │   │   ├── rbac.ts               # Role-based access
│   │   │   ├── audit.ts              # Audit logging
│   │   │   ├── validator.ts          # Input validation
│   │   │   └── error.ts              # Error handler
│   │   │
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── auth.ts           # POST /login, /logout, /me
│   │   │   │   │
│   │   │   │   ├── master/
│   │   │   │   │   ├── cabang.ts
│   │   │   │   │   ├── gudang.ts
│   │   │   │   │   ├── user.ts
│   │   │   │   │   ├── vendor.ts
│   │   │   │   │   ├── vendor-kontrak.ts
│   │   │   │   │   ├── vendor-evaluasi.ts
│   │   │   │   │   ├── kategori-asset.ts
│   │   │   │   │   ├── lokasi-asset.ts
│   │   │   │   │   ├── kendaraan.ts
│   │   │   │   │   └── jenis-maintenance.ts
│   │   │   │   │
│   │   │   │   ├── asset/
│   │   │   │   │   ├── index.ts       # CRUD + generate kode
│   │   │   │   │   ├── mutasi.ts
│   │   │   │   │   ├── penyusutan.ts
│   │   │   │   │   ├── penghapusan.ts
│   │   │   │   │   ├── stock-opname.ts
│   │   │   │   │   ├── foto.ts
│   │   │   │   │   └── qrcode.ts
│   │   │   │   │
│   │   │   │   ├── maintenance/
│   │   │   │   │   ├── ticket.ts
│   │   │   │   │   ├── tracking.ts
│   │   │   │   │   ├── foto.ts
│   │   │   │   │   ├── preventive.ts
│   │   │   │   │   └── sla.ts
│   │   │   │   │
│   │   │   │   ├── procurement/
│   │   │   │   │   ├── purchase-request.ts
│   │   │   │   │   ├── purchase-order.ts
│   │   │   │   │   ├── penerimaan.ts
│   │   │   │   │   └── approval.ts
│   │   │   │   │
│   │   │   │   ├── vehicle/
│   │   │   │   │   ├── booking.ts
│   │   │   │   │   ├── service.ts
│   │   │   │   │   └── bbm.ts
│   │   │   │   │
│   │   │   │   ├── building/
│   │   │   │   │   ├── checklist.ts
│   │   │   │   │   └── issue.ts
│   │   │   │   │
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── head-ga.ts
│   │   │   │   │   ├── staff.ts
│   │   │   │   │   ├── cabang.ts
│   │   │   │   │   └── gudang.ts
│   │   │   │   │
│   │   │   │   ├── report/
│   │   │   │   │   ├── asset.ts
│   │   │   │   │   ├── maintenance.ts
│   │   │   │   │   ├── procurement.ts
│   │   │   │   │   ├── vendor.ts
│   │   │   │   │   ├── vehicle.ts
│   │   │   │   │   ├── building.ts
│   │   │   │   │   └── audit.ts
│   │   │   │   │
│   │   │   │   └── audit/
│   │   │   │       └── index.ts
│   │   │   │
│   │   │   └── router.ts             # Route aggregator
│   │   │
│   │   ├── utils/
│   │   │   ├── response.ts           # Standard response format
│   │   │   ├── generator.ts          # Kode generator
│   │   │   ├── pdf.ts                # PDF generation
│   │   │   ├── excel.ts              # Excel generation
│   │   │   ├── storage.ts            # Supabase Storage helpers
│   │   │   └── notification.ts       # Notifikasi helper
│   │   │
│   │   └── types/
│   │       ├── index.ts              # All TypeScript interfaces
│   │       └── enums.ts
│   │
│   ├── package.json
│   ├── wrangler.toml
│   ├── tsconfig.json
│   └── .env.example
│
├── database/                          # SUPABASE MIGRATIONS
│   │
│   ├── migrations/
│   │   ├── 001_schema_master.sql      # Master tables
│   │   ├── 002_schema_asset.sql       # Asset tables
│   │   ├── 003_schema_maintenance.sql # Maintenance tables
│   │   ├── 004_schema_procurement.sql # Procurement tables
│   │   ├── 005_schema_vehicle.sql     # Vehicle tables
│   │   ├── 006_schema_building.sql    # Building tables
│   │   ├── 007_schema_support.sql     # Audit, notification, settings
│   │   ├── 008_indexes.sql            # Indexes
│   │   ├── 009_rls_policies.sql       # Row Level Security
│   │   └── 010_seed_data.sql          # Seed data
│   │
│   └── functions/
│       ├── generate_kode_asset.sql
│       ├── calculate_penyusutan.sql
│       └── update_nilai_buku.sql
│
└── docs/
    ├── 01_BUSINESS_ANALYSIS.md
    ├── 02_WORKFLOW.md
    ├── 03_ROLE_PERMISSION_MATRIX.md
    ├── 04_MENU_SITEMAP.md
    ├── 05_DATABASE_PLANNING.md
    ├── 06_DASHBOARD_REPORTING.md
    ├── 07_IMPLEMENTATION_ROADMAP.md
    └── 08_PROJECT_STRUCTURE.md
```

---

## 2. NAMING CONVENTIONS

| Item | Convention | Example |
|------|-----------|---------|
| **Files** | kebab-case | `purchase-request.ts` |
| **Components** | PascalCase | `AssetFormPage.jsx` |
| **Functions** | camelCase | `getAssetList()` |
| **API Routes** | kebab-case | `/api/v1/asset-mutasi` |
| **DB Tables** | snake_case | `purchase_request_item` |
| **DB Columns** | snake_case | `id_cabang` |
| **JSON Keys** | camelCase | `{ kodeAsset: "AST-001" }` |
| **Env Variables** | UPPER_SNAKE | `SUPABASE_URL` |

## 3. API CONTRACT

### 3.1 Base URL
```
Development: http://localhost:8787/api/v1
Production:  https://ga-api.company.com/api/v1
```

### 3.2 Standard Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Data berhasil diambil",
  "meta": {
    "page": 1,
    "perPage": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Nama cabang harus diisi",
    "details": { "field": "nama", "rule": "required" }
  }
}
```

### 3.3 HTTP Status Codes
| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

> **Lanjut ke implementasi kode setelah struktur project disetujui.**
