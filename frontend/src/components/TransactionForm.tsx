import { useEffect, useState, type FormEvent } from 'react';
import { Loader2, X } from 'lucide-react';
import {
  DEFAULT_CATEGORIES,
  type CreateTransactionDTO,
  type TransactionType,
  type TransactionViewDTO,
  type UpdateTransactionDTO,
} from '../types';

interface TransactionFormProps {
  isOpen: boolean;
  userId: number;
  initialTransaction: TransactionViewDTO | null;
  onClose: () => void;
  onCreate: (payload: CreateTransactionDTO) => Promise<void>;
  onUpdate: (id: number, payload: UpdateTransactionDTO) => Promise<void>;
}

function getTodayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionForm({
  isOpen,
  userId,
  initialTransaction,
  onClose,
  onCreate,
  onUpdate,
}: TransactionFormProps) {
  const isEditing = initialTransaction !== null;

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayIso());
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [categoryId, setCategoryId] = useState<number>(DEFAULT_CATEGORIES[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (initialTransaction) {
      setAmount(String(initialTransaction.amount));
      setDate(initialTransaction.date.slice(0, 10));
      setDescription(initialTransaction.description ?? '');
      setType(initialTransaction.type);
      const matched = DEFAULT_CATEGORIES.find(
        (c) => c.name.toLowerCase() === initialTransaction.categoryName?.toLowerCase()
      );
      setCategoryId(matched ? matched.id : DEFAULT_CATEGORIES[0].id);
    } else {
      setAmount('');
      setDate(getTodayIso());
      setDescription('');
      setType('EXPENSE');
      setCategoryId(DEFAULT_CATEGORIES[0].id);
    }
    setError(null);
  }, [isOpen, initialTransaction]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (isEditing && initialTransaction) {
        await onUpdate(initialTransaction.id, {
          amount: numericAmount,
          date,
          description: description.trim(),
          categoryId,
        });
      } else {
        await onCreate({
          userId,
          amount: numericAmount,
          date,
          description: description.trim(),
          type,
          categoryId,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(['EXPENSE', 'INCOME'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setType(option)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      type === option
                        ? option === 'INCOME'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-rose-600 bg-rose-50 text-rose-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {option === 'INCOME' ? 'Income' : 'Expense'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="tx-amount" className="mb-1.5 block text-sm font-medium text-slate-700">
                Amount
              </label>
              <input
                id="tx-amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="tx-date" className="mb-1.5 block text-sm font-medium text-slate-700">
                Date
              </label>
              <input
                id="tx-date"
                type="date"
                max={getTodayIso()}
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="tx-category" className="mb-1.5 block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              id="tx-category"
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            >
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tx-desc" className="mb-1.5 block text-sm font-medium text-slate-700">
              Description
            </label>
            <input
              id="tx-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Grocery shopping at Fresh Market"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
