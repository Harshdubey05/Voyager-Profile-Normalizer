# 🚀 Voyager Profile Normalizer

[![GitHub license](https://img.shields.io/github/license/HarshDubey/Voyager-Profile-Normalizer?style=for-the-badge)](https://github.com/HarshDubey/Voyager-Profile-Normalizer/blob/main/LICENSE)
[![Fastify](https://img.shields.io/badge/fastify-v5.0.0-black?style=for-the-badge&logo=fastify)](https://www.fastify.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.0.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-57%20passed-brightgreen?style=for-the-badge)](https://github.com/HarshDubey/Voyager-Profile-Normalizer)

> **High-performance LinkedIn profile data cleaning API built with Fastify and TypeScript.**

---

## 🔎 About the Project

**Voyager Profile Normalizer** is a specialized microservice designed to solve the "messy data" problem when working with LinkedIn's internal Voyager API responses. It acts as a middleware that transforms complex, nested, and emoji-heavy profile objects into a developer-friendly, flattened JSON schema.

### Key Benefits 💡
- **Clean Output**: Strips emojis and visual noise automatically.
- **Rich Context**: Parses locations and calculates tenure-in-months that isn't provided by the raw API.
- **Extreme Speed**: Optimized for sub-millisecond processing with high-performance Fastify routing.
- **Robust Type-Safety**: Fully built with TypeScript for enterprise-grade stability.

---

## ✨ Features
- 🧼 **Headline Cleaning** — Strips emojis, separators (`|`, `•`, `★`), hashtags, and filler phrases ("Open to Work") to extract the core job title
- 🎯 **Location Parsing** — Converts strings like `"Bengaluru, Karnataka, India"` into structured `{ city, state, country }` objects
- ⏳ **Current Role Detection** — Identifies the active position and calculates tenure in months
- 🆔 **URN Extraction** — Parses LinkedIn URN strings (`urn:li:fs_profile:ABC123`) to extract unique IDs
- 📦 **Profile Detection** — Auto-detects full vs. mini profiles and normalizes accordingly
- 🧹 **Skills Dedup** — Removes case-insensitive duplicates
- 🖼️ **Image Resolution** — Picks the highest-quality profile picture URL from vector image artifacts

---

## 🛠️ Tech Stack
- **Runtime**: Node.js (ESModules)
- **Framework**: Fastify (Fast, low-overhead web framework)
- **Language**: TypeScript (Strongly typed)
- **Validation**: Zod (Schema-first validation)
- **Testing**: Vitest (Unit and integration tests)
- **Logging**: Pino (High-speed JSON logger)

---

## Quick Start

```bash
# Install dependencies
npm install

# Run in development (hot-reload)
npm run dev

# Run tests
npm test

# Type-check
npm run typecheck

# Build for production
npm run build
npm start
```

## 🔌 API Reference

### `POST /api/v1/normalize`
Send raw LinkedIn profile JSON and receive cleaned data.


**Query Parameters:**
| Param  | Type   | Description |
|--------|--------|-------------|
| `type` | `full` \| `mini` | Force profile type (auto-detected by default) |

**Example Request:**
```bash
curl -X POST http://localhost:3210/api/v1/normalize \
  -H "Content-Type: application/json" \
  -d '{
    "urn": "urn:li:fs_profile:AbCdEf123",
    "firstName": "Harsh",
    "lastName": "Dubey",
    "headline": "🚀 Senior Software Engineer | AI/ML | Open to Work 💼",
    "locationName": "Bengaluru, Karnataka, India",
    "experience": [{
      "companyName": "Google",
      "title": "Senior Software Engineer",
      "timePeriod": { "startDate": { "month": 3, "year": 2022 } }
    }]
  }'
```

**Example Response:**
```json
{
  "success": true,
  "profileType": "full",
  "processingTimeMs": 0.42,
  "data": {
    "id": "AbCdEf123",
    "fullName": "Harsh Dubey",
    "cleanHeadline": "Senior Software Engineer",
    "location": {
      "city": "Bengaluru",
      "state": "Karnataka",
      "country": "India"
    },
    "currentRole": {
      "title": "Senior Software Engineer",
      "company": "Google",
      "tenureMonths": 49
    }
  }
}
```

### `GET /api/v1/health`

Returns server health status.

---

## 📁 Project Structure
```
voyager-profile-normalizer/


```
src/
├── server.ts                    # Fastify entry point
├── routes/
│   └── normalize.route.ts       # POST /normalize + GET /health
├── schemas/
│   └── normalize.schema.ts      # Zod validation schemas
├── services/
│   └── normalizer.service.ts    # Core normalization pipeline
├── types/
│   └── profile.types.ts         # TypeScript type definitions
└── utils/
    ├── text.utils.ts            # Emoji/separator/headline cleaning
    ├── location.utils.ts        # Location string parsing
    ├── urn.utils.ts             # LinkedIn URN parsing
    ├── date.utils.ts            # Duration/tenure calculations
    └── image.utils.ts           # Profile picture URL resolution
tests/
├── text.utils.test.ts
├── location.utils.test.ts
├── urn.utils.test.ts
├── date.utils.test.ts
└── normalizer.service.test.ts
```

## Configuration

| Env Variable | Default | Description |
|-------------|---------|-------------|
| `PORT`      | `3210`  | Server port |
| `HOST`      | `0.0.0.0` | Bind address |
| `LOG_LEVEL` | `info`  | Pino log level |
| `NODE_ENV`  | —       | Set to `production` for prod logging |
