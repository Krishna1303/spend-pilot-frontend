/**
 * Statement upload API service.
 *   POST /api/statements/upload  (multipart, field `statement`, a PDF)
 *     → { extracted: { statementBalance, minimumPayment, dueDate, apr }, rawPreview, needsReview }
 *
 * Mapped into the shape the Upload review screen renders. Confidence is derived
 * from whether each field was extracted (non-null) or needs manual entry.
 */
import { api, toDateStr } from './client';

const conf = (v) => (v == null ? 'manual' : 'found');

function mapExtracted({ extracted = {}, rawPreview = '' } = {}) {
  return {
    bankName: '',
    cardName: '',
    balance: extracted.statementBalance ?? '',
    minimumPayment: extracted.minimumPayment ?? '',
    dueDate: toDateStr(extracted.dueDate),
    apr: extracted.apr ?? '',
    confidence: {
      balance: conf(extracted.statementBalance),
      minimumPayment: conf(extracted.minimumPayment),
      dueDate: conf(extracted.dueDate),
      apr: conf(extracted.apr),
    },
    rawTextPreview: rawPreview || '',
  };
}

export async function uploadStatement(file) {
  const formData = new FormData();
  formData.append('statement', file);
  const data = await api('/statements/upload', { method: 'POST', formData });
  return mapExtracted(data);
}

// Client-side sample so the "Use demo statement" button works without a PDF.
const DEMO_STATEMENT = {
  extracted: {
    statementBalance: 2450.75,
    minimumPayment: 85.0,
    dueDate: '2026-07-05',
    apr: 28.99,
  },
  rawPreview: `CHASE FREEDOM UNLIMITED
Account Summary
New Balance:            $2,450.75
Minimum Payment Due:      $85.00
Payment Due Date:      07/05/2026
Purchase APR: 28.99% Variable`,
};

export async function useDemoStatement() {
  await new Promise((r) => setTimeout(r, 600));
  const parsed = mapExtracted(DEMO_STATEMENT);
  return { ...parsed, bankName: 'Chase', cardName: 'Freedom Unlimited' };
}
