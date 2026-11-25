import { useEffect, useState } from 'react';
import { BarChart3, Loader2, Shield, Users } from 'lucide-react';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../api/client';
import { transactionsApi } from '../api/transactionsApi';
import { Navbar } from '../components/Navbar';
import type { AccountResponseDTO } from '../types';

export function AdminPage() {
  const [globalSummary, setGlobalSummary] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<AccountResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAdminData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [summaryLines, accountList] = await Promise.all([
          transactionsApi.getGlobalSummary(),
          authApi.getAllAccounts(),
        ]);
        setGlobalSummary(summaryLines);
        setAccounts(accountList);
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load admin overview.'));
      } finally {
        setIsLoading(false);
      }
    };

    void loadAdminData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Shield className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Console</h1>
            <p className="text-sm text-slate-500">
              Read-only platform metrics and registered accounts
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-20 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            <span>Loading admin data...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Global Summary */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Global Transactions Summary
              </h2>
              {globalSummary.length === 0 ? (
                <p className="text-sm text-slate-500">No global summary entries available.</p>
              ) : (
                <ul className="space-y-2">
                  {globalSummary.map((line, index) => (
                    <li
                      key={`${index}-${line}`}
                      className="rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Accounts Table */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-4">
                <Users className="h-5 w-5 text-indigo-600" />
                <h2 className="text-base font-semibold text-slate-900">
                  Registered Accounts ({accounts.length})
                </h2>
              </div>

              {accounts.length === 0 ? (
                <p className="p-6 text-sm text-slate-500">No accounts found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-6 py-3">ID</th>
                        <th className="px-6 py-3">Username</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Created At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {accounts.map((acc) => (
                        <tr key={acc.id} className="hover:bg-slate-50/80">
                          <td className="px-6 py-3 font-mono text-xs text-slate-500">#{acc.id}</td>
                          <td className="px-6 py-3 font-medium text-slate-900">{acc.userName}</td>
                          <td className="px-6 py-3 text-slate-600">{acc.email}</td>
                          <td className="px-6 py-3 text-slate-500">{acc.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
