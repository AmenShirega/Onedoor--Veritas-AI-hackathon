# OneDoor

OneDoor is an international, privacy-first support-navigation web platform built to help people affected by sexual violence, domestic abuse, physical violence, or harassment organize support needs and prepare consent-controlled referral summaries without repeatedly retelling their story.

> **Disclaimer:** *This project is a prototype and is not medical advice.* OneDoor is not an emergency dispatch service and is not yet connected to external clinics or emergency responders.

---

## Core Capabilities

1. **20-Language Localized Interface (with RTL & Persistence)**
   - Searchable language selector positioned directly beside the **Quick Exit** button in the header.
   - Supports English, Amharic, Spanish, French, Arabic (RTL), Portuguese, German, Italian, Chinese (Simplified), Chinese (Traditional), Japanese, Korean, Hindi, Bengali, Urdu (RTL), Swahili, Russian, Turkish, Indonesian, and Vietnamese.
   - Persists language selection across visits via `localStorage` and dynamically updates `<html lang dir>`.
2. **International Location Lookup & Matching Engine**
   - Manual location entry and international geocoding autocomplete (`GET /api/location/search`) by city, region, postal code, or country.
   - Optional, explicit-click browser geolocation (`Use my current location`) with privacy-preserving server-side reverse geocoding (`POST /api/location/reverse`) and explicit user confirmation before use.
   - Strict country/region/city service matching (`src/lib/matching.ts`) that communicates honestly when no verified local providers are onboarded for a selected location.
3. **Trained Machine-Learning Classifier (English Text)**
   - TF-IDF + L2 Logistic Regression classifier (`ml/model_weights.json`, `src/lib/mlInference.ts`) predicting 6 support pathways and non-diagnostic urgency with explicit uncertainty indicators.
   - Transparently separates UI translation (20 languages) from ML model training language (English).
4. **Consent-Gated Referral Summaries**
   - Editable summary, granular inclusion toggles (location, urgency note), copy/download (`.txt`), and local reference-code storage (`OD-REF-XXXXXX`) with permanent withdrawal/deletion (`DELETE /api/referrals/:referenceCode`).

---

## Local Development

```bash
npm install
npm run dev
```

Run tests, typecheck, lint, and production build:

```bash
npx tsx --test src/lib/core.test.ts
npm run lint
npm run build
```
