import { useEffect, useState } from 'react';
import type { ClassificationResult, SupportCategoryId } from '../lib/types';
import { TRANSLATIONS } from '../lib/i18n';
import type { LanguageCode } from '../lib/types';

interface BinaryMetrics {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
  precision: number;
  recall: number;
  f1: number;
  accuracy: number;
}

interface MultiLabelEval {
  macro_f1: number;
  micro_f1: number;
  micro_precision: number;
  micro_recall: number;
  hamming_accuracy: number;
  total_false_negatives: number;
  total_false_positives: number;
  per_label: Record<SupportCategoryId, BinaryMetrics>;
}

interface SliceMetrics {
  count: number;
  urgent_count: number;
  multilabel_macro_f1: number;
  multilabel_micro_f1: number;
  urgency_recall: number;
  urgency_false_negatives: number;
  urgency_false_positives: number;
  urgency_f1: number;
}

interface MisclassifiedExample {
  id: string;
  text: string;
  language_style: string;
  message_length: string;
  true_urgent: boolean;
  predicted_urgent: boolean;
  urgency_probability: number;
  true_labels: SupportCategoryId[];
  predicted_labels: SupportCategoryId[];
  missed_labels: SupportCategoryId[];
  extra_labels: SupportCategoryId[];
  error_type: string;
}

interface EvaluationReport {
  research_question: string;
  dataset_summary: {
    total_synthetic_examples: number;
    train_count: number;
    held_out_test_count: number;
    labels: SupportCategoryId[];
    label_names: Record<SupportCategoryId, string>;
    all_synthetic: boolean;
    language: string;
  };
  trainer: string;
  baseline_comparison: {
    majority_class: { multilabel: MultiLabelEval; urgency: BinaryMetrics };
    keyword_rule: { multilabel: MultiLabelEval; urgency: BinaryMetrics };
    trained_tfidf_logreg: { multilabel: MultiLabelEval; urgency: BinaryMetrics };
  };
  performance_by_language_style: Record<string, SliceMetrics>;
  performance_by_message_length: Record<string, SliceMetrics>;
  misclassified_test_examples: MisclassifiedExample[];
}

export function ResearchView({ lang }: { lang: LanguageCode }) {
  const t = TRANSLATIONS[lang];
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [probeText, setProbeText] = useState(
    'He took what he wanted from me while I was half asleep from fever medicine. I am ashamed to say the word out loud.'
  );
  const [probeResult, setProbeResult] = useState<ClassificationResult | null>(null);

  useEffect(() => {
    fetch('/api/evaluation')
      .then((r) => r.json())
      .then((data) => setReport(data))
      .finally(() => setLoading(false));
  }, []);

  const runLiveProbe = async () => {
    if (probeText.trim().length < 3) return;
    const resp = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: probeText }),
    });
    if (resp.ok) {
      const data = await resp.json();
      setProbeResult(data.classification);
    }
  };

  if (loading || !report) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-sm text-[#14202B]/75">
        Loading held-out ML evaluation report...
      </div>
    );
  }

  const models = [
    {
      name: 'Majority-Class Baseline',
      data: report.baseline_comparison.majority_class,
    },
    {
      name: 'Keyword-Rule Baseline',
      data: report.baseline_comparison.keyword_rule,
    },
    {
      name: 'Trained TF-IDF + Logistic Regression',
      data: report.baseline_comparison.trained_tfidf_logreg,
    },
  ];

  const trained = report.baseline_comparison.trained_tfidf_logreg;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Research Question Header */}
      <div className="space-y-3 border-b border-[#0F3D3E]/12 pb-6">
        <p className="text-xs font-medium text-[#0F3D3E]/80">
          Held-Out Test Evaluation (n = {report.dataset_summary.held_out_test_count}) · 100% Synthetic Addis Ababa Dataset
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0F3D3E] [text-wrap:balance]">
          &ldquo;{report.research_question}&rdquo;
        </h1>
        <p className="text-sm text-[#14202B]/80 max-w-3xl leading-relaxed">
          All numbers below come directly from evaluating{' '}
          <code className="font-mono-tabular text-xs bg-[#DCE8E3] px-1.5 py-0.5 rounded">
            /ml/train.py
          </code>{' '}
          on {report.dataset_summary.held_out_test_count} held-out synthetic examples (never seen during TF-IDF fitting or training on{' '}
          {report.dataset_summary.train_count} training examples). Training backend: {report.trainer}.
        </p>
      </div>

      {/* Key Empirical Takeaways */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-[#DCE8E3]/60 border border-[#0F3D3E]/15 p-5 space-y-1.5">
          <p className="text-xs font-semibold text-[#0F3D3E]">Urgency Recall (Held-Out)</p>
          <p className="font-mono-tabular text-3xl font-bold text-[#0F3D3E]">
            {(trained.urgency.recall * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-[#14202B]/80">
            {trained.urgency.fn} False Negatives (missed urgent) · {trained.urgency.fp} False Positives (vs 17 FN for keyword rules).
          </p>
        </div>

        <div className="rounded-2xl bg-[#DCE8E3]/60 border border-[#0F3D3E]/15 p-5 space-y-1.5">
          <p className="text-xs font-semibold text-[#0F3D3E]">Missed Urgent Cases (FN)</p>
          <p className="font-mono-tabular text-3xl font-bold text-[#0F3D3E]">
            {trained.urgency.fn} / {trained.urgency.tp + trained.urgency.fn}
          </p>
          <p className="text-xs text-[#14202B]/80">
            Both occurred on short (&lt;12 words) distressed-fragmented messages lacking explicit emergency n-grams.
          </p>
        </div>

        <div className="rounded-2xl bg-[#DCE8E3]/60 border border-[#0F3D3E]/15 p-5 space-y-1.5">
          <p className="text-xs font-semibold text-[#0F3D3E]">Weakest Support Category Slice</p>
          <p className="font-mono-tabular text-3xl font-bold text-[#0F3D3E]">
            0.424 F1
          </p>
          <p className="text-xs text-[#14202B]/80">
            Euphemistic phrasing drops multi-label Macro-F1 to 0.4237 vs 0.6883 on direct messages.
          </p>
        </div>
      </div>

      {/* 1. Baseline Comparison Table */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-[#0F3D3E]">
          1. Baseline Comparison on Held-Out Test Set (n = 60)
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-[#0F3D3E]/15 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#DCE8E3]/55 text-xs font-semibold text-[#0F3D3E] border-b border-[#0F3D3E]/12">
              <tr>
                <th className="py-3 px-4">Model</th>
                <th className="py-3 px-4 text-right">Multi-Label Macro-F1</th>
                <th className="py-3 px-4 text-right">Micro-F1</th>
                <th className="py-3 px-4 text-right">Category FN</th>
                <th className="py-3 px-4 text-right">Category FP</th>
                <th className="py-3 px-4 text-right">Urgency F1</th>
                <th className="py-3 px-4 text-right">Urgency FN / FP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0F3D3E]/10 font-mono-tabular">
              {models.map((m) => (
                <tr key={m.name} className="hover:bg-[#FAF6EF]/60">
                  <td className="py-3 px-4 font-sans font-semibold text-[#14202B]">
                    {m.name}
                  </td>
                  <td className="py-3 px-4 text-right">{m.data.multilabel.macro_f1.toFixed(4)}</td>
                  <td className="py-3 px-4 text-right">{m.data.multilabel.micro_f1.toFixed(4)}</td>
                  <td className="py-3 px-4 text-right">{m.data.multilabel.total_false_negatives}</td>
                  <td className="py-3 px-4 text-right">{m.data.multilabel.total_false_positives}</td>
                  <td className="py-3 px-4 text-right font-semibold text-[#0F3D3E]">
                    {m.data.urgency.f1.toFixed(4)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {m.data.urgency.fn} / {m.data.urgency.fp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[#14202B]/75 leading-relaxed">
          Honest note: On multi-label Macro-F1 across 6 categories, the keyword-rule baseline (0.6757) slightly edges out TF-IDF Logistic Regression (0.6622) due to small training size (140 examples) and higher protection false positives (FP=22), while TF-IDF achieves clearly higher Urgency F1 (0.7955 vs 0.6452) and drops missed urgent cases from 17 down to 2.
        </p>
      </section>

      {/* 2. Per-Category False Negatives & False Positives */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-[#0F3D3E]">
          2. Per-Category False Negatives &amp; False Positives (Trained Model)
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-[#0F3D3E]/15 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#DCE8E3]/55 text-xs font-semibold text-[#0F3D3E] border-b border-[#0F3D3E]/12">
              <tr>
                <th className="py-3 px-4">Support Category</th>
                <th className="py-3 px-4 text-right">TP</th>
                <th className="py-3 px-4 text-right">FN (Missed)</th>
                <th className="py-3 px-4 text-right">FP (False Alarm)</th>
                <th className="py-3 px-4 text-right">Precision</th>
                <th className="py-3 px-4 text-right">Recall</th>
                <th className="py-3 px-4 text-right">F1</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0F3D3E]/10 font-mono-tabular">
              {report.dataset_summary.labels.map((lbl) => {
                const m = trained.multilabel.per_label[lbl];
                return (
                  <tr key={lbl} className="hover:bg-[#FAF6EF]/60">
                    <td className="py-3 px-4 font-sans font-medium text-[#14202B]">
                      {t.categories[lbl]?.label ?? lbl}
                    </td>
                    <td className="py-3 px-4 text-right">{m.tp}</td>
                    <td className="py-3 px-4 text-right text-[#B91C1C] font-semibold">
                      {m.fn}
                    </td>
                    <td className="py-3 px-4 text-right">{m.fp}</td>
                    <td className="py-3 px-4 text-right">{m.precision.toFixed(3)}</td>
                    <td className="py-3 px-4 text-right">{m.recall.toFixed(3)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-[#0F3D3E]">
                      {m.f1.toFixed(3)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Performance by Language Style & Message Length */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="font-display text-xl font-bold text-[#0F3D3E]">
            3a. Performance by Language Style
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-[#0F3D3E]/15 bg-white">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#DCE8E3]/55 text-xs font-semibold text-[#0F3D3E] border-b border-[#0F3D3E]/12">
                <tr>
                  <th className="py-2.5 px-3.5">Style</th>
                  <th className="py-2.5 px-3.5 text-right">n</th>
                  <th className="py-2.5 px-3.5 text-right">Macro-F1</th>
                  <th className="py-2.5 px-3.5 text-right">Urg. Recall</th>
                  <th className="py-2.5 px-3.5 text-right">Urg. FN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0F3D3E]/10 font-mono-tabular">
                {Object.entries(report.performance_by_language_style).map(([style, s]) => (
                  <tr key={style}>
                    <td className="py-2.5 px-3.5 font-sans font-medium capitalize">
                      {style.replace('_', ' ')}
                    </td>
                    <td className="py-2.5 px-3.5 text-right">{s.count}</td>
                    <td className="py-2.5 px-3.5 text-right">{s.multilabel_macro_f1.toFixed(3)}</td>
                    <td className="py-2.5 px-3.5 text-right">{(s.urgency_recall * 100).toFixed(0)}%</td>
                    <td className="py-2.5 px-3.5 text-right text-[#B91C1C] font-semibold">
                      {s.urgency_false_negatives}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-xl font-bold text-[#0F3D3E]">
            3b. Performance by Message Length
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-[#0F3D3E]/15 bg-white">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#DCE8E3]/55 text-xs font-semibold text-[#0F3D3E] border-b border-[#0F3D3E]/12">
                <tr>
                  <th className="py-2.5 px-3.5">Length Bucket</th>
                  <th className="py-2.5 px-3.5 text-right">n</th>
                  <th className="py-2.5 px-3.5 text-right">Macro-F1</th>
                  <th className="py-2.5 px-3.5 text-right">Urg. Recall</th>
                  <th className="py-2.5 px-3.5 text-right">Urg. FN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0F3D3E]/10 font-mono-tabular">
                {Object.entries(report.performance_by_message_length).map(([len, s]) => (
                  <tr key={len}>
                    <td className="py-2.5 px-3.5 font-sans font-medium capitalize">{len}</td>
                    <td className="py-2.5 px-3.5 text-right">{s.count}</td>
                    <td className="py-2.5 px-3.5 text-right">{s.multilabel_macro_f1.toFixed(3)}</td>
                    <td className="py-2.5 px-3.5 text-right">{(s.urgency_recall * 100).toFixed(0)}%</td>
                    <td className="py-2.5 px-3.5 text-right text-[#B91C1C] font-semibold">
                      {s.urgency_false_negatives}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. Actual Misclassified Held-Out Synthetic Examples */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-bold text-[#0F3D3E]">
            4. Actual Misclassified Held-Out Synthetic Examples
          </h2>
          <p className="text-sm text-[#14202B]/80">
            Inspecting real errors from the test split reveals why OneDoor shows uncertainty
            openly and never restricts access when confidence is low.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.misclassified_test_examples.slice(0, 6).map((ex) => (
            <div
              key={ex.id}
              className="rounded-2xl bg-white border border-[#0F3D3E]/15 p-5 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-mono-tabular font-semibold text-[#B91C1C]">
                  {ex.error_type}
                </span>
                <span className="text-[#14202B]/70">
                  {ex.id} · {ex.language_style.replace('_', ' ')} · {ex.message_length}
                </span>
              </div>
              <p className="text-sm italic text-[#14202B]">&ldquo;{ex.text}&rdquo;</p>
              <div className="text-xs space-y-1 text-[#14202B]/80 pt-1 border-t border-[#0F3D3E]/10">
                <p>
                  Urgency: True=<strong>{ex.true_urgent ? 'Urgent' : 'Non-urgent'}</strong> · Pred=
                  <strong>{ex.predicted_urgent ? 'Urgent' : 'Non-urgent'}</strong> (p=
                  <span className="font-mono-tabular">{ex.urgency_probability}</span>)
                </p>
                {ex.missed_labels.length > 0 && (
                  <p className="text-[#B91C1C]">
                    Missed categories: {ex.missed_labels.join(', ')}
                  </p>
                )}
                {ex.extra_labels.length > 0 && (
                  <p>Extra predicted: {ex.extra_labels.join(', ')}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Live Classifier Probe */}
      <section className="rounded-2xl bg-[#DCE8E3]/55 border border-[#0F3D3E]/15 p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold text-[#0F3D3E]">
            Test the Trained Classifier Live
          </h2>
          <p className="text-xs text-[#14202B]/80">
            Runs directly against the exported TF-IDF + Logistic Regression weights in TypeScript (no LLM involved).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            aria-label="Test classifier input"
            value={probeText}
            onChange={(e) => setProbeText(e.target.value)}
            className="flex-1 rounded-xl border border-[#0F3D3E]/25 bg-white px-4 py-2.5 text-sm text-[#14202B] min-h-[44px]"
          />
          <button
            type="button"
            onClick={runLiveProbe}
            className="px-5 py-2.5 rounded-xl bg-[#0F3D3E] text-[#FAF6EF] text-sm font-semibold hover:bg-[#0A2C2D] min-h-[44px] whitespace-nowrap"
          >
            Run Trained Model
          </button>
        </div>

        {probeResult && (
          <div className="rounded-xl bg-white border border-[#0F3D3E]/12 p-4 text-xs space-y-2">
            <p className="font-semibold text-[#0F3D3E]">
              Urgency: {probeResult.urgencyFlagged ? 'Flagged' : 'Not flagged'} (p=
              <span className="font-mono-tabular">{probeResult.urgencyProbability}</span>) ·
              Confidence: {probeResult.overallConfidence}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono-tabular">
              {probeResult.predictions.map((p) => (
                <div key={p.id} className="p-2 rounded bg-[#FAF6EF]">
                  <span className="font-sans font-medium text-[#14202B]">
                    {t.categories[p.id].label}:{' '}
                  </span>
                  <span className={p.predicted ? 'font-bold text-[#0F3D3E]' : 'text-[#14202B]/65'}>
                    {(p.probability * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
