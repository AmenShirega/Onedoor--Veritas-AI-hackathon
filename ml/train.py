"""
OneDoor ML Training & Honest Evaluation Pipeline
------------------------------------------------
Trains a multi-label support-need classifier + urgency classifier on synthetic
Addis Ababa survivor and bystander descriptions.

Important design principles:
1. Held-out test set (30%) is strictly isolated before TF-IDF fitting or training.
2. Evaluates against two explicit baselines:
   - Majority-class baseline
   - Transparent keyword-rule baseline
3. Reports False Negatives (missed cases), False Positives (false alarms),
   and slices performance by language style and message length to answer:
   "Which urgent cases does the model miss, and for what kinds of messages?"
4. Uses scikit-learn + joblib when installed; falls back cleanly to an equivalent
   pure-Python TF-IDF + L2-regularized Logistic Regression solver in environments
   where scikit-learn is not pre-installed, and exports model_weights.json for
   TypeScript runtime inference.
"""

from __future__ import annotations

import json
import math
import os
import random
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Dict, List, Tuple

LABELS = [
    "medical_support",
    "psychological_support",
    "protection_safeguarding",
    "legal_support",
    "sexual_violence_support",
    "social_support",
]

LABEL_NAMES = {
    "medical_support": "Medical support",
    "psychological_support": "Psychological support",
    "protection_safeguarding": "Protection and safeguarding",
    "legal_support": "Legal support",
    "sexual_violence_support": "Sexual-violence support",
    "social_support": "Social support",
}

KEYWORD_RULES: Dict[str, List[str]] = {
    "medical_support": [
        "bleeding", "blood", "bruise", "bruised", "bruises", "pain", "hurt", "hurts",
        "hurting", "swollen", "hospital", "clinic", "doctor", "nurse", "pep", "hiv",
        "pregnant", "pregnancy", "ear", "rib", "ribs", "wrist", "ankle", "head",
        "dizzy", "nauseous", "vomiting", "burn", "burning", "blistered", "cut",
        "choked", "throat", "medical", "sti", "contraception", "fainted", "sore",
    ],
    "psychological_support": [
        "scared", "afraid", "terrified", "panic", "nightmare", "nightmares", "cry",
        "crying", "sleep", "anxious", "anxiety", "depressed", "hopeless", "numb",
        "shaking", "trembling", "counselor", "counseling", "therapist", "therapy",
        "trauma", "flashbacks", "stress", "alone", "ashamed", "disappear", "live",
        "mental", "upset", "shaken", "exhausted",
    ],
    "protection_safeguarding": [
        "safe", "unsafe", "shelter", "locked", "lock", "escape", "escaped", "hide",
        "hiding", "tonight", "outside", "knife", "rod", "threat", "threatened",
        "threatening", "trapped", "follow", "follows", "following", "stalker",
        "protection", "restraining", "minor", "14", "15", "16", "17", "children",
        "kids", "baby", "kicked out", "hit", "beat", "beating", "slapped", "choked",
    ],
    "legal_support": [
        "legal", "lawyer", "police", "report", "court", "custody", "divorce",
        "restraining", "protection order", "charges", "rights", "harassment",
        "blackmail", "evict", "lease", "complaint", "evidence", "forensic",
        "documents", "salary", "manager", "supervisor", "professor", "labor",
        "guardianship", "withdraw", "settlement",
    ],
    "sexual_violence_support": [
        "rape", "raped", "sexual", "sexually", "assault", "assaulted", "consent",
        "non-consensual", "groped", "touched", "inappropriately", "forced",
        "pep", "contraception", "hiv", "sex", "intimacy", "pregnancy",
    ],
    "social_support": [
        "shelter", "house", "housing", "room", "rent", "money", "cash", "food",
        "eat", "eaten", "groceries", "transport", "bus", "fare", "ticket", "tickets",
        "job", "work", "vocational", "training", "childcare", "school", "fees",
        "clothes", "shoes", "blankets", "nowhere to stay", "nowhere to sleep",
        "financial", "support group",
    ],
}

URGENT_KEYWORDS = [
    "tonight", "right now", "now", "hours ago", "hour ago", "today", "bleeding",
    "knife", "choked", "fainted", "dizzy", "locked", "outside", "pep", "rape",
    "raped", "banging", "pregnant", "cramping", "burning", "deep cut", "nowhere to sleep",
    "nowhere safe", "disappear", "not to wake up", "dont want to live",
]


def tokenize(text: str) -> List[str]:
    clean = re.sub(r"[^a-z0-9\s]", " ", text.lower())
    words = [w for w in clean.split() if len(w) >= 2]
    bigrams = [f"{words[i]}_{words[i + 1]}" for i in range(len(words) - 1)]
    return words + bigrams


def length_bucket(text: str) -> str:
    wc = len(text.split())
    if wc < 12:
        return "short"
    if wc <= 28:
        return "medium"
    return "long"


def stratified_split(
    records: List[dict], test_ratio: float = 0.30, seed: int = 42
) -> Tuple[List[dict], List[dict]]:
    rng = random.Random(seed)
    buckets: Dict[Tuple[str, int], List[dict]] = defaultdict(list)
    for row in records:
        buckets[(row["language_style"], int(row["is_urgent"]))].append(row)

    train, test = [], []
    for key in sorted(buckets.keys()):
        group = list(buckets[key])
        rng.shuffle(group)
        n_test = max(1, round(len(group) * test_ratio))
        test.extend(group[:n_test])
        train.extend(group[n_test:])
    rng.shuffle(train)
    rng.shuffle(test)
    return train, test


def compute_binary_metrics(y_true: List[int], y_pred: List[int]) -> dict:
    tp = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 1 and yp == 1)
    fp = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 0 and yp == 1)
    fn = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 1 and yp == 0)
    tn = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 0 and yp == 0)
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0
    accuracy = (tp + tn) / len(y_true) if y_true else 0.0
    return {
        "tp": tp,
        "fp": fp,
        "fn": fn,
        "tn": tn,
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1": round(f1, 4),
        "accuracy": round(accuracy, 4),
    }


def evaluate_multilabel(
    y_true_matrix: List[List[int]], y_pred_matrix: List[List[int]]
) -> dict:
    per_label = {}
    f1s = []
    total_tp = total_fp = total_fn = total_tn = 0
    for idx, label in enumerate(LABELS):
        yt = [row[idx] for row in y_true_matrix]
        yp = [row[idx] for row in y_pred_matrix]
        m = compute_binary_metrics(yt, yp)
        per_label[label] = m
        f1s.append(m["f1"])
        total_tp += m["tp"]
        total_fp += m["fp"]
        total_fn += m["fn"]
        total_tn += m["tn"]

    micro_p = total_tp / (total_tp + total_fp) if (total_tp + total_fp) > 0 else 0.0
    micro_r = total_tp / (total_tp + total_fn) if (total_tp + total_fn) > 0 else 0.0
    micro_f1 = (2 * micro_p * micro_r / (micro_p + micro_r)) if (micro_p + micro_r) > 0 else 0.0
    macro_f1 = sum(f1s) / len(f1s)
    hamming_acc = (total_tp + total_tn) / (
        total_tp + total_fp + total_fn + total_tn
    )
    return {
        "macro_f1": round(macro_f1, 4),
        "micro_f1": round(micro_f1, 4),
        "micro_precision": round(micro_p, 4),
        "micro_recall": round(micro_r, 4),
        "hamming_accuracy": round(hamming_acc, 4),
        "total_false_negatives": total_fn,
        "total_false_positives": total_fp,
        "per_label": per_label,
    }


class PurePythonTfidfLogReg:
    """
    Deterministic TF-IDF (sublinear TF, smooth IDF, L2-normalized) + L2-regularized
    Logistic Regression trained with Adam. Matches scikit-learn's formulation
    so model_weights.json is directly usable for TypeScript inference.
    """

    def __init__(self, min_df: int = 2, max_features: int = 1200, l2: float = 0.004):
        self.min_df = min_df
        self.max_features = max_features
        self.l2 = l2
        self.vocab: Dict[str, int] = {}
        self.idf: List[float] = []
        self.models: Dict[str, dict] = {}

    def fit_tfidf(self, texts: List[str]) -> List[Dict[int, float]]:
        n_docs = len(texts)
        df_counter: Counter = Counter()
        tokenized_docs = []
        for text in texts:
            toks = tokenize(text)
            tokenized_docs.append(toks)
            for t in set(toks):
                df_counter[t] += 1

        eligible = [
            (tok, df)
            for tok, df in df_counter.items()
            if df >= self.min_df
        ]
        eligible.sort(key=lambda x: (-x[1], x[0]))
        eligible = eligible[: self.max_features]

        self.vocab = {tok: i for i, (tok, _) in enumerate(eligible)}
        self.idf = [
            math.log((1.0 + n_docs) / (1.0 + df)) + 1.0
            for _, df in eligible
        ]
        return self.transform_tfidf(texts)

    def transform_tfidf(self, texts: List[str]) -> List[Dict[int, float]]:
        vectors = []
        for text in texts:
            tf = Counter(t for t in tokenize(text) if t in self.vocab)
            vec: Dict[int, float] = {}
            norm_sq = 0.0
            for tok, count in tf.items():
                idx = self.vocab[tok]
                val = (1.0 + math.log(count)) * self.idf[idx]
                vec[idx] = val
                norm_sq += val * val
            norm = math.sqrt(norm_sq) if norm_sq > 0 else 1.0
            for idx in vec:
                vec[idx] /= norm
            vectors.append(vec)
        return vectors

    @staticmethod
    def _sigmoid(z: float) -> float:
        if z >= 0:
            ez = math.exp(-min(z, 30.0))
            return 1.0 / (1.0 + ez)
        ez = math.exp(max(z, -30.0))
        return ez / (1.0 + ez)

    def fit_binary(
        self,
        X: List[Dict[int, float]],
        y: List[int],
        epochs: int = 240,
        lr: float = 0.08,
        pos_weight: float = 1.35,
    ) -> Tuple[List[float], float]:
        dim = len(self.vocab)
        w = [0.0] * dim
        b = 0.0
        m_w = [0.0] * dim
        v_w = [0.0] * dim
        m_b = 0.0
        v_b = 0.0
        beta1, beta2, eps = 0.9, 0.999, 1e-8
        n = len(X)

        for step in range(1, epochs + 1):
            grad_w = [self.l2 * wi for wi in w]
            grad_b = 0.0
            for vec, yi in zip(X, y):
                z = b + sum(w[idx] * val for idx, val in vec.items())
                p = self._sigmoid(z)
                sample_w = pos_weight if yi == 1 else 1.0
                err = sample_w * (p - yi) / n
                grad_b += err
                for idx, val in vec.items():
                    grad_w[idx] += err * val

            b1_corr = 1.0 - (beta1 ** step)
            b2_corr = 1.0 - (beta2 ** step)

            m_b = beta1 * m_b + (1.0 - beta1) * grad_b
            v_b = beta2 * v_b + (1.0 - beta2) * (grad_b * grad_b)
            b -= lr * (m_b / b1_corr) / (math.sqrt(v_b / b2_corr) + eps)

            for i in range(dim):
                g = grad_w[i]
                if g != 0.0:
                    m_w[i] = beta1 * m_w[i] + (1.0 - beta1) * g
                    v_w[i] = beta2 * v_w[i] + (1.0 - beta2) * (g * g)
                    w[i] -= lr * (m_w[i] / b1_corr) / (math.sqrt(v_w[i] / b2_corr) + eps)

        return w, b

    def predict_proba_binary(
        self, X: List[Dict[int, float]], w: List[float], b: float
    ) -> List[float]:
        probs = []
        for vec in X:
            z = b + sum(w[idx] * val for idx, val in vec.items())
            probs.append(self._sigmoid(z))
        return probs


def keyword_predict(text: str) -> Tuple[List[int], int]:
    lower = text.lower()
    preds = []
    for label in LABELS:
        hit = any(
            re.search(r"\b" + re.escape(kw) + r"\b", lower)
            for kw in KEYWORD_RULES[label]
        )
        preds.append(1 if hit else 0)
    urgent = 1 if any(
        re.search(r"\b" + re.escape(kw) + r"\b", lower)
        for kw in URGENT_KEYWORDS
    ) else 0
    return preds, urgent


def try_sklearn_training(
    train_texts: List[str],
    train_y: List[List[int]],
    train_urgent: List[int],
    test_texts: List[str],
    root_dir: Path,
):
    try:
        import joblib
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.linear_model import LogisticRegression
        from sklearn.multiclass import OneVsRestClassifier
    except ImportError:
        return None

    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        min_df=2,
        max_features=1200,
        sublinear_tf=True,
        lowercase=True,
    )
    X_train = vectorizer.fit_transform(train_texts)
    X_test = vectorizer.transform(test_texts)

    clf = OneVsRestClassifier(
        LogisticRegression(C=2.5, max_iter=1000, class_weight="balanced", random_state=42)
    )
    clf.fit(X_train, train_y)
    test_probs_matrix = clf.predict_proba(X_test).tolist()

    urg_clf = LogisticRegression(C=2.5, max_iter=1000, class_weight="balanced", random_state=42)
    urg_clf.fit(X_train, train_urgent)
    test_urg_probs = urg_clf.predict_proba(X_test)[:, 1].tolist()

    joblib.dump(
        {"vectorizer": vectorizer, "label_clf": clf, "urgency_clf": urg_clf},
        root_dir / "onedoor_model.joblib",
    )

    vocab = {str(k): int(v) for k, v in vectorizer.vocabulary_.items()}
    idf = [float(x) for x in vectorizer.idf_.tolist()]
    weights = {}
    for idx, label in enumerate(LABELS):
        est = clf.estimators_[idx]
        weights[label] = {
            "coef": [round(float(c), 6) for c in est.coef_[0].tolist()],
            "intercept": round(float(est.intercept_[0]), 6),
            "threshold": 0.48,
        }
    urg_weights = {
        "coef": [round(float(c), 6) for c in urg_clf.coef_[0].tolist()],
        "intercept": round(float(urg_clf.intercept_[0]), 6),
        "threshold": 0.48,
    }
    return {
        "backend": "scikit-learn (TfidfVectorizer + OneVsRest LogisticRegression)",
        "vocab": vocab,
        "idf": [round(x, 6) for x in idf],
        "weights": weights,
        "urgency_weights": urg_weights,
        "test_probs_matrix": test_probs_matrix,
        "test_urg_probs": test_urg_probs,
    }


def main():
    ml_dir = Path(__file__).resolve().parent
    dataset_path = ml_dir / "synthetic_dataset.json"
    with dataset_path.open("r", encoding="utf-8") as f:
        records = json.load(f)

    for r in records:
        r["message_length"] = length_bucket(r["text"])

    train_rows, test_rows = stratified_split(records, test_ratio=0.30, seed=42)

    train_texts = [r["text"] for r in train_rows]
    test_texts = [r["text"] for r in test_rows]
    train_y = [[1 if lbl in r["labels"] else 0 for lbl in LABELS] for r in train_rows]
    test_y = [[1 if lbl in r["labels"] else 0 for lbl in LABELS] for r in test_rows]
    train_urgent = [int(r["is_urgent"]) for r in train_rows]
    test_urgent = [int(r["is_urgent"]) for r in test_rows]

    # Try scikit-learn first; fall back to pure Python equivalent if not installed
    sk_result = try_sklearn_training(
        train_texts, train_y, train_urgent, test_texts, ml_dir
    )

    if sk_result is not None:
        trainer_name = sk_result["backend"]
        vocab = sk_result["vocab"]
        idf = sk_result["idf"]
        label_weights = sk_result["weights"]
        urgency_weights = sk_result["urgency_weights"]
        test_probs_matrix = sk_result["test_probs_matrix"]
        test_urg_probs = sk_result["test_urg_probs"]
    else:
        trainer_name = "Pure-Python TF-IDF + L2 Logistic Regression (scikit-learn mathematical equivalent; sklearn not installed in container)"
        model = PurePythonTfidfLogReg(min_df=2, max_features=1200, l2=0.0035)
        X_train = model.fit_tfidf(train_texts)
        X_test = model.transform_tfidf(test_texts)

        label_weights = {}
        test_probs_per_label: List[List[float]] = []
        for idx, label in enumerate(LABELS):
            y_col = [row[idx] for row in train_y]
            pos_rate = sum(y_col) / len(y_col)
            pos_w = max(1.0, min(2.5, (1.0 - pos_rate) / max(pos_rate, 0.05) * 0.65))
            w, b = model.fit_binary(X_train, y_col, epochs=260, lr=0.08, pos_weight=pos_w)
            label_weights[label] = {
                "coef": [round(float(c), 6) for c in w],
                "intercept": round(float(b), 6),
                "threshold": 0.48,
            }
            test_probs_per_label.append(model.predict_proba_binary(X_test, w, b))

        test_probs_matrix = [
            [test_probs_per_label[col][row_i] for col in range(len(LABELS))]
            for row_i in range(len(test_rows))
        ]

        urg_w, urg_b = model.fit_binary(
            X_train, train_urgent, epochs=260, lr=0.08, pos_weight=1.15
        )
        urgency_weights = {
            "coef": [round(float(c), 6) for c in urg_w],
            "intercept": round(float(urg_b), 6),
            "threshold": 0.48,
        }
        test_urg_probs = model.predict_proba_binary(X_test, urg_w, urg_b)
        vocab = model.vocab
        idf = [round(x, 6) for x in model.idf]

    # 1. Majority-Class Baseline (computed purely from training split)
    majority_labels = [
        1 if sum(row[idx] for row in train_y) >= (len(train_y) / 2.0) else 0
        for idx in range(len(LABELS))
    ]
    majority_urg = 1 if sum(train_urgent) >= (len(train_urgent) / 2.0) else 0
    maj_test_y = [list(majority_labels) for _ in test_rows]
    maj_test_urg = [majority_urg for _ in test_rows]

    # 2. Keyword-Rule Baseline
    kw_test_y = []
    kw_test_urg = []
    for text in test_texts:
        p, u = keyword_predict(text)
        kw_test_y.append(p)
        kw_test_urg.append(u)

    # 3. Trained Model predictions at decision threshold 0.48
    model_test_y = [
        [
            1 if probs[idx] >= label_weights[LABELS[idx]]["threshold"] else 0
            for idx in range(len(LABELS))
        ]
        for probs in test_probs_matrix
    ]
    model_test_urg = [
        1 if p >= urgency_weights["threshold"] else 0 for p in test_urg_probs
    ]

    # Aggregate evaluation metrics
    maj_ml = evaluate_multilabel(test_y, maj_test_y)
    kw_ml = evaluate_multilabel(test_y, kw_test_y)
    model_ml = evaluate_multilabel(test_y, model_test_y)

    maj_urg_eval = compute_binary_metrics(test_urgent, maj_test_urg)
    kw_urg_eval = compute_binary_metrics(test_urgent, kw_test_urg)
    model_urg_eval = compute_binary_metrics(test_urgent, model_test_urg)

    # Slice analysis across language styles and message lengths
    def slice_metrics(field: str, values: List[str]) -> dict:
        out = {}
        for val in values:
            indices = [i for i, r in enumerate(test_rows) if r[field] == val]
            if not indices:
                continue
            yt_sub = [test_y[i] for i in indices]
            yp_sub = [model_test_y[i] for i in indices]
            ut_sub = [test_urgent[i] for i in indices]
            up_sub = [model_test_urg[i] for i in indices]
            ml_sub = evaluate_multilabel(yt_sub, yp_sub)
            urg_sub = compute_binary_metrics(ut_sub, up_sub)
            out[val] = {
                "count": len(indices),
                "urgent_count": sum(ut_sub),
                "multilabel_macro_f1": ml_sub["macro_f1"],
                "multilabel_micro_f1": ml_sub["micro_f1"],
                "urgency_recall": urg_sub["recall"],
                "urgency_false_negatives": urg_sub["fn"],
                "urgency_false_positives": urg_sub["fp"],
                "urgency_f1": urg_sub["f1"],
            }
        return out

    by_style = slice_metrics(
        "language_style",
        ["direct", "euphemistic", "distressed_fragmented", "third_person"],
    )
    by_length = slice_metrics("message_length", ["short", "medium", "long"])

    # Collect actual misclassified held-out test examples (prioritize missed urgent & FN cases)
    misclassified = []
    for i, r in enumerate(test_rows):
        true_lbls = [LABELS[j] for j, v in enumerate(test_y[i]) if v == 1]
        pred_lbls = [LABELS[j] for j, v in enumerate(model_test_y[i]) if v == 1]
        missed_lbls = [l for l in true_lbls if l not in pred_lbls]
        extra_lbls = [l for l in pred_lbls if l not in true_lbls]
        urg_fn = test_urgent[i] == 1 and model_test_urg[i] == 0
        urg_fp = test_urgent[i] == 0 and model_test_urg[i] == 1
        if urg_fn or missed_lbls or urg_fp:
            error_type = (
                "Missed Urgent Case (False Negative)"
                if urg_fn
                else "False Urgent Alarm (False Positive)"
                if urg_fp
                else "Missed Support Category (False Negative)"
            )
            misclassified.append(
                {
                    "id": r["id"],
                    "text": r["text"],
                    "language_style": r["language_style"],
                    "message_length": r["message_length"],
                    "true_urgent": bool(test_urgent[i]),
                    "predicted_urgent": bool(model_test_urg[i]),
                    "urgency_probability": round(float(test_urg_probs[i]), 3),
                    "true_labels": true_lbls,
                    "predicted_labels": pred_lbls,
                    "missed_labels": missed_lbls,
                    "extra_labels": extra_lbls,
                    "error_type": error_type,
                    "_priority": (3 if urg_fn else 2 if len(missed_lbls) >= 2 else 1),
                }
            )

    misclassified.sort(key=lambda x: (-x["_priority"], x["id"]))
    for m in misclassified:
        del m["_priority"]

    # Export trained weights for TypeScript inference
    model_weights_payload = {
        "model_version": "onedoor-tfidf-logreg-v1",
        "trainer": trainer_name,
        "labels": LABELS,
        "vocab": vocab,
        "idf": idf,
        "label_models": label_weights,
        "urgency_model": urgency_weights,
        "uncertainty_band": {"low": 0.35, "high": 0.65},
    }
    with (ml_dir / "model_weights.json").open("w", encoding="utf-8") as f:
        json.dump(model_weights_payload, f, indent=2)

    # Export honest held-out evaluation report
    eval_payload = {
        "research_question": "Which urgent cases does the model miss, and for what kinds of messages?",
        "dataset_summary": {
            "total_synthetic_examples": len(records),
            "train_count": len(train_rows),
            "held_out_test_count": len(test_rows),
            "labels": LABELS,
            "label_names": LABEL_NAMES,
            "all_synthetic": True,
            "language": "English only (Amharic UI translation does not alter classifier input)",
        },
        "trainer": trainer_name,
        "baseline_comparison": {
            "majority_class": {
                "multilabel": maj_ml,
                "urgency": maj_urg_eval,
            },
            "keyword_rule": {
                "multilabel": kw_ml,
                "urgency": kw_urg_eval,
            },
            "trained_tfidf_logreg": {
                "multilabel": model_ml,
                "urgency": model_urg_eval,
            },
        },
        "performance_by_language_style": by_style,
        "performance_by_message_length": by_length,
        "misclassified_test_examples": misclassified[:8],
    }
    with (ml_dir / "evaluation_results.json").open("w", encoding="utf-8") as f:
        json.dump(eval_payload, f, indent=2)

    print("Training & held-out evaluation complete.")
    print(f"Trainer: {trainer_name}")
    print(f"Train size: {len(train_rows)}, Held-out test size: {len(test_rows)}, Vocab size: {len(vocab)}")
    print(f"Majority Macro-F1: {maj_ml['macro_f1']} | Urgency F1: {maj_urg_eval['f1']}")
    print(f"Keyword  Macro-F1: {kw_ml['macro_f1']} | Urgency F1: {kw_urg_eval['f1']}")
    print(f"TF-IDF   Macro-F1: {model_ml['macro_f1']} | Urgency F1: {model_urg_eval['f1']}")
    print(f"TF-IDF Urgency FN={model_urg_eval['fn']}, FP={model_urg_eval['fp']}, Recall={model_urg_eval['recall']}")


if __name__ == "__main__":
    main()
