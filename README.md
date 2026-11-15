# OneDoor Prototype

OneDoor is a privacy-first support entry point prototype designed around a young woman in Addis Ababa seeking help after violence or harassment without having to repeat her story across multiple institutions, alongside a simulated helping-center caseworker dashboard.

**Disclaimer:** This project is a prototype and is not medical advice. OneDoor is not an emergency service.

## Architecture Overview

1. **ML Classifier (`/ml/train.py`, `/ml/train.ipynb`, `/ml/model_weights.json`)**:
   - Multi-label TF-IDF (unigrams + bigrams) + L2-regularized Logistic Regression classifier trained on 200 synthetic Addis Ababa support descriptions (`/ml/synthetic_dataset.json`, 70/30 stratified split).
   - Evaluates against Majority-Class and Keyword-Rule baselines on a strictly held-out test set (`n = 60`), including False Negatives, False Positives, language-style slices, and message-length slices (`/ml/evaluation_results.json`).
   - Performs inference directly in TypeScript (`/src/lib/mlInference.ts`) from exported weights (`/ml/model_weights.json`).
2. **Separate Matching Algorithm (`/src/lib/matching.ts`)**:
   - Ranks clearly marked synthetic Addis Ababa helping centers (`/src/lib/directory.ts`) by category alignment, manual sub-city, 24/7 urgent hours, and minor safeguarding capability—never denying support options when model confidence is low.
3. **Optional Gemini Explanation & Summary (`/server.ts` `/api/explain`)**:
   - Uses `@google/genai` (`gemini-4-hydrogen`) when `GEMINI_API_KEY` is configured to draft empathetic explanations and referral summaries; falls back seamlessly to deterministic templates when no key is set.
   - Never used as the primary classifier and never makes safety decisions.
4. **Consent-Gated Referral & Simulated Caseworker View (`/data/referrals.json`)**:
   - Nothing is shared until the person reviews, edits, and explicitly checks consent approval.

## Setup & Commands

```bash
# Install Node dependencies
npm install

# Train & evaluate ML model (exports weights & held-out metrics)
python3 ml/train.py

# Run unit tests
npx --yes tsx --test src/lib/core.test.ts

# Start full-stack dev server (port 3000)
npm run dev

# Build for production
npm run build
npm start
```
