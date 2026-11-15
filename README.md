# OneDoor

**A privacy-first, multilingual support-navigation platform for survivors of violence and harassment.**

OneDoor helps individuals affected by sexual violence, domestic abuse, physical violence, or harassment identify their support needs, find local resources, and generate consent-controlled referral summaries—eliminating the trauma of repeatedly retelling their story to multiple providers.

> **⚠️ Important Safety & Prototype Disclaimer:** 
> *This project is a hackathon prototype and does not provide medical, legal, or professional advice.* OneDoor is **not** an emergency dispatch service and is not currently connected to live clinics or emergency responders. **If you are in immediate danger, please call your local emergency services.**

---

## 💡 The Problem & Our Solution

Survivors seeking help often face fragmented services, language barriers, and the exhausting, retraumatizing requirement to recount their experiences repeatedly at every intake point. 

**OneDoor solves this in three steps:**
1. **Assess Needs Privately:** Users describe their situation in a safe, localized interface with instant safety controls.
2. **Match with Local Resources:** The platform identifies relevant support pathways and matches users with verified local services.
3. **Share on Their Terms:** Users generate a customizable, consent-gated referral summary with a unique reference code that they can download, share, or permanently delete at any time.

---

## ✨ Key Features

### 1. Safety-First, 20-Language Interface (with RTL Support)
* **Instant Quick Exit:** A persistent **Quick Exit** button in the header allows users to leave the site immediately.
* **Global Accessibility:** Supports 20 languages out of the box—including Right-to-Left (RTL) layouts for Arabic and Urdu—via a searchable language selector positioned right next to the Quick Exit button.
* **Supported Languages:** English, Amharic, Spanish, French, Arabic (RTL), Portuguese, German, Italian, Chinese (Simplified & Traditional), Japanese, Korean, Hindi, Bengali, Urdu (RTL), Swahili, Russian, Turkish, Indonesian, and Vietnamese.
* **Persistent Preferences:** Saves language selections across sessions via `localStorage` and dynamically updates `<html lang dir>` attributes.

### 2. Privacy-Preserving Location & Service Matching
* **Flexible Location Entry:** Users can search manually by city, region, postal code, or country via international geocoding autocomplete (`GET /api/location/search`).
* **Opt-In Geolocation:** Optional browser geolocation (`Use my current location`) uses server-side reverse geocoding (`POST /api/location/reverse`) to protect user IP/metadata and requires explicit confirmation before applying.
* **Transparent Matching:** Strict country/region/city matching (`src/lib/matching.ts`) connects users with relevant support services and honestly communicates when no verified local providers are onboarded yet for a selected area.

### 3. Transparent Machine-Learning Triage (English)
* **Pathway & Urgency Classification:** Powered by a lightweight, client-compatible TF-IDF + L2 Logistic Regression model (`ml/model_weights.json`, `src/lib/mlInference.ts`).
* **Actionable Insights:** Predicts **6 distinct support pathways** alongside non-diagnostic urgency indicators.
* **Built-In Transparency:** Explicitly surfaces model uncertainty indicators and clearly distinguishes between the 20-language UI localization and the English-trained ML classifier.

### 4. Consent-Gated Referral Summaries
* **Full User Control:** Survivors can review and edit their generated summary before sharing, using granular toggles to include or exclude sensitive details (such as exact location or urgency notes).
* **Portable & Ephemeral:** Summaries can be copied or downloaded as a `.txt` file and are assigned a local reference code (`OD-REF-XXXXXX`).
* **Right to Be Forgotten:** Users can permanently revoke and delete their referral record at any time (`DELETE /api/referrals/:referenceCode`).

---

## 🏗️ Project Architecture Overview

```text
├── ml/
│   └── model_weights.json      # Pre-trained TF-IDF + Logistic Regression weights
├── src/
│   ├── lib/
│   │   ├── matching.ts         # Country/region/city provider matching logic
│   │   └── mlInference.ts      # Pathway & urgency classification engine
│   └── app/api/
│       ├── location/           # Geocoding search & privacy-safe reverse lookup
│       └── referrals/          # Consent-gated referral lifecycle & deletion

```
