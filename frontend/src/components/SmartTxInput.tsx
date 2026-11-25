import { useState, type FormEvent } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { aiApi } from '../api/aiApi';
import { getErrorMessage } from '../api/client';
import { DEFAULT_CATEGORIES, type CreateTransactionWithAIResponseDTO } from '../types';

interface SmartTxInputProps {
  userEmail: string;
  onSuccess: () => Promise<void>;
}

export function SmartTxInput({ userEmail, onSuccess }: SmartTxInputProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<number>(DEFAULT_CATEGORIES[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<CreateTransactionWithAIResponseDTO | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!description.trim()) {
      setError('Please enter a description.');
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setAiResult(null);
    try {
      const result = await aiApi.createSmartTransactionWithAI({
        email: userEmail,
        description: description.trim(),
        amount: numericAmount,
        categoryId,
      });
      setAiResult(result);
      setDescription('');
      setAmount('');
      await onSuccess();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create smart transaction.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-white to-emerald-50/50 p-4 shadow-xs">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Smart AI Transaction</h3>
          <p className="text-xs text-slate-500">
            Describe your transaction and AI will detect Income vs Expense and offer advice.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:flex-row">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Monthly freelance payout or Dinner with friends"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
        />
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none sm:w-32"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none sm:w-44"
        >
          {DEFAULT_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <span>AI Add</span>
        </button>
      </form>

      {error && (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}

      {aiResult && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-900">
          <span className="font-semibold">
            Added as {aiResult.detectedType} (${aiResult.transaction.amount.toFixed(2)}):
          </span>{' '}
          {aiResult.aiSuggestion}
        </div>
      )}
    </div>
  );
}
