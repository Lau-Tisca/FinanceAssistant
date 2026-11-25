import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Wallet,
} from 'lucide-react';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../api/client';
import { transactionsApi } from '../api/transactionsApi';
import { Navbar } from '../components/Navbar';
import { SmartTxInput } from '../components/SmartTxInput';
import { TransactionForm } from '../components/TransactionForm';
import { useAuth } from '../context/AuthContext';
import type {
  AccountSummaryDTO,
  CreateTransactionDTO,
  TransactionType,
  TransactionViewDTO,
  UpdateTransactionDTO,
} from '../types';

type FilterOption = 'ALL' | TransactionType;
type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function DashboardPage() {
  const { user } = useAuth();

  const [summary, setSummary] = useState<AccountSummaryDTO | null>(null);
  const [transactions, setTransactions] = useState<TransactionViewDTO[]>([]);
  const [allTransactions, setAllTransactions] = useState<TransactionViewDTO[]>([]);
  const [filterType, setFilterType] = useState<FilterOption>('ALL');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<TransactionViewDTO | null>(null);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    const [sortBy, order] = sortOption.split('-') as ['date' | 'amount', 'asc' | 'desc'];
    try {
      const [summaryData, filteredList, fullList] = await Promise.all([
        authApi.getAccountSummary(user.id).catch(() => null),
        transactionsApi.getUserTransactions(user.id, {
          type: filterType === 'ALL' ? undefined : filterType,
          sortBy,
          order,
        }),
        transactionsApi.getUserTransactions(user.id),
      ]);
      setSummary(summaryData);
      setTransactions(filteredList);
      setAllTransactions(fullList);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load dashboard data.'));
    } finally {
      setIsLoading(false);
    }
  }, [user, filterType, sortOption]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const kpis = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const tx of allTransactions) {
      if (tx.type === 'INCOME') {
        income += tx.amount;
      } else {
        expense += tx.amount;
      }
    }
    const netBalance = summary?.totalBalanceCalculated ?? income - expense;
    return { income, expense, netBalance };
  }, [allTransactions, summary]);

  const handleCreate = async (payload: CreateTransactionDTO) => {
    try {
      await transactionsApi.createTransaction(payload);
      await loadDashboardData();
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to create transaction.'));
    }
  };

  const handleUpdate = async (id: number, payload: UpdateTransactionDTO) => {
    try {
      await transactionsApi.updateTransaction(id, payload);
      await loadDashboardData();
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Failed to update transaction.'));
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setError(null);
    try {
      await transactionsApi.deleteTransaction(id);
      await loadDashboardData();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete transaction.'));
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateModal = () => {
    setEditingTx(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tx: TransactionViewDTO) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Financial Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Overview for {summary?.userName ?? user.userName} ({user.email})
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Total Income</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {formatCurrency(kpis.income)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Total Expense</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <ArrowDownRight className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {formatCurrency(kpis.expense)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Net Balance</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Wallet className="h-5 w-5" />
              </span>
            </div>
            <p
              className={`mt-3 text-2xl font-bold ${
                kpis.netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'
              }`}
            >
              {formatCurrency(kpis.netBalance)}
            </p>
          </div>
        </section>

        {/* Smart AI Transaction Bar */}
        <SmartTxInput userEmail={user.email} onSuccess={loadDashboardData} />

        {/* Error Banner */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Transactions Table Card */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-1.5">
              {(['ALL', 'INCOME', 'EXPENSE'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilterType(option)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    filterType === option
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-xs font-medium text-slate-500">
                Sort by:
              </label>
              <select
                id="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
              >
                <option value="date-desc">Date (Newest)</option>
                <option value="date-asc">Date (Oldest)</option>
                <option value="amount-desc">Amount (High to Low)</option>
                <option value="amount-asc">Amount (Low to High)</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
              <span>Loading transactions...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <DollarSign className="h-6 w-6" />
              </span>
              <h3 className="text-sm font-semibold text-slate-900">No transactions found</h3>
              <p className="mt-1 text-xs text-slate-500">
                Add a transaction manually or use the Smart AI bar above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80">
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{tx.date}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {tx.description || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                          {tx.categoryName || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            tx.type === 'INCOME'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td
                        className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${
                          tx.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {tx.type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(tx)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                            aria-label={`Edit transaction ${tx.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === tx.id}
                            onClick={() => handleDelete(tx.id)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                            aria-label={`Delete transaction ${tx.id}`}
                          >
                            {deletingId === tx.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <TransactionForm
        isOpen={isModalOpen}
        userId={user.id}
        initialTransaction={editingTx}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
