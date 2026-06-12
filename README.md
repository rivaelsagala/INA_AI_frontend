# INA AI — Medical AI Frontend

Antarmuka web untuk asisten kesehatan berbasis AI yang terhubung dengan backend RAG (Retrieval-Augmented Generation) untuk menjawab pertanyaan medis berdasarkan dataset penyakit umum di Indonesia.

## Fitur Utama

| #   | Fitur                                             | Status |
| --- | ------------------------------------------------- | ------ |
| 1   | Chat Interface (real-time conversation)           | ✅     |
| 2   | Multi-model Selection (GPT-4o-mini, Gemini, dll.) | ✅     |
| 3   | Session Management (create, select, delete)       | ✅     |
| 4   | Chat History per Session                          | ✅     |
| 5   | Inline Source Citations Display                   | ✅     |
| 6   | Confidence Disclaimer Display                     | ✅     |
| 7   | Responsive Design (mobile & desktop)              | ✅     |
| 8   | Dark Mode UI                                      | ✅     |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + custom CSS variables
- **UI Components**: shadcn/ui + Base UI React
- **Icons**: Lucide React
- **Font**: Geist Sans & Geist Mono
- **Analytics**: Vercel Analytics (production only)

## Arsitektur Komponen

```
app/
├── layout.tsx          # Root layout (metadata, fonts, analytics)
├── page.tsx            # Halaman utama — state management & API calls
└── globals.css         # Design system (CSS variables, tema, animasi)

components/
├── Header.tsx          # Navbar — model selector dropdown + user avatar
├── Sidebar.tsx         # Sidebar — riwayat percakapan + navigasi sesi
├── ChatArea.tsx        # Area chat — daftar pesan + typing indicator
├── InputArea.tsx       # Input area — textarea + tombol kirim/hapus
└── ui/
    └── button.tsx      # Reusable button component (shadcn)

lib/
└── utils.ts            # Utility functions (cn helper)
```

## Alur Kerja Aplikasi

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Sidebar   │────▶│   page.tsx   │────▶│  Backend API    │
│  (sessions) │     │  (state mgr) │     │  /api/chat      │
└─────────────┘     └──────┬───────┘     │  /api/sessions  │
                           │             └─────────────────┘
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  Header  │ │ ChatArea │ │InputArea │
        │ (model)  │ │ (pesan)  │ │ (input)  │
        └──────────┘ └──────────┘ └──────────┘
```

## Setup & Instalasi

### 1. Clone & Install

```bash
git clone https://github.com/rivaelsagala/INA_AI_frontend.git
cd fe
npm install
```

### 2. Environment Variables

Buat file `.env` di root:

```env
# URL Backend Flask API
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# NextAuth (untuk autentikasi, jika diaktifkan)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random-secret-key>
NEXTAUTH_TRUST_HOST=true

# Environment
NODE_ENV=development
```

### 3. Jalankan Development Server

```bash
npm run dev
```

Aplikasi berjalan di `http://localhost:3000`.

### 4. Build untuk Production

```bash
npm run build
npm start
```

## Integrasi Backend API

Frontend berkomunikasi dengan backend Flask melalui REST API berikut:

| Method   | Endpoint                          | Fungsi di Frontend                          |
| -------- | --------------------------------- | ------------------------------------------- |
| `GET`    | `/api/chat-sessions?user_id=1`    | `fetchSessions()` — load semua sesi         |
| `POST`   | `/api/chat-sessions`              | `handleNewChat()` — buat sesi baru          |
| `GET`    | `/api/chat-history/<session_id>`  | `handleSelectConversation()` — load riwayat |
| `POST`   | `/api/chat`                       | `handleSendMessage()` — kirim pesan         |
| `DELETE` | `/api/chat-sessions/<session_id>` | `handleClearChat()` — hapus sesi            |

### Model Mapping

Frontend mengirim `model_id` (integer) ke backend berdasarkan pilihan user:

| Model (Frontend) | model_id (Backend) |
| ---------------- | ------------------ |
| GPT-4o-mini      | 4                  |
| Gemini           | 4                  |
| Claude           | —                  |
| Llama            | 1                  |

## Struktur Response yang Ditampilkan

Frontend mem-parsing response dari `/api/chat` dan menampilkan:

1. **Jawaban utama** (`data.answer`) — teks jawaban AI
2. **Sumber referensi** (`data.citations`) — daftar sumber dengan `[1]`, `[2]`, dst.
3. **Confidence disclaimer** (`data.confidence_disclaimer`) — peringatan jika confidence rendah

## Scripts

| Script      | Perintah        | Deskripsi                        |
| ----------- | --------------- | -------------------------------- |
| Development | `npm run dev`   | Jalankan dev server (hot reload) |
| Build       | `npm run build` | Build production bundle          |
| Start       | `npm start`     | Jalankan production server       |
| Lint        | `npm run lint`  | Jalankan ESLint                  |

## Dependencies

### Production

| Package                    | Versi   | Fungsi                          |
| -------------------------- | ------- | ------------------------------- |
| `next`                     | 16.2.9  | Framework React (App Router)    |
| `react`                    | 19.2.4  | UI library                      |
| `react-dom`                | 19.2.4  | React DOM renderer              |
| `lucide-react`             | ^1.16.0 | Icon library                    |
| `shadcn`                   | ^4.8.0  | UI component system             |
| `@base-ui/react`           | ^1.5.0  | Headless UI primitives          |
| `class-variance-authority` | ^0.7.1  | Variant-based styling           |
| `clsx`                     | ^2.1.1  | Conditional classnames          |
| `tailwind-merge`           | ^3.3.1  | Merge Tailwind classes          |
| `tw-animate-css`           | ^1.4.0  | Tailwind animation utilities    |
| `@vercel/analytics`        | 1.6.1   | Web analytics (production only) |

### Dev Dependencies

| Package                | Versi  | Fungsi                        |
| ---------------------- | ------ | ----------------------------- |
| `tailwindcss`          | ^4     | CSS framework                 |
| `@tailwindcss/postcss` | ^4     | PostCSS plugin untuk Tailwind |
| `typescript`           | ^5     | Type checking                 |
| `eslint`               | ^9     | Code linting                  |
| `eslint-config-next`   | 16.2.9 | ESLint rules untuk Next.js    |
