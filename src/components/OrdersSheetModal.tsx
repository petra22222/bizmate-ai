import React from 'react';
import { X, Table, Download, Plus, CheckCircle2, Clock, RefreshCw, ExternalLink } from 'lucide-react';

export interface OrderRow {
  id: string;
  client: string;
  item: string;
  amount: string;
  status: 'Overdue (5 days)' | 'Paid' | 'Pending Review' | 'Sent' | 'Processing';
  email: string;
  date: string;
}

interface OrdersSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderRow[];
  onAddDummyOrder: () => void;
}

export const OrdersSheetModal: React.FC<OrdersSheetModalProps> = ({
  isOpen,
  onClose,
  orders,
  onAddDummyOrder,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">
                  Q3_Customer_Orders_2026.xlsx
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  Live Synced to Google Drive
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connected Sheet for BizMate AI automatic order tracking & invoice reconciliation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-slate-400">
              Showing <span className="font-semibold text-white">{orders.length} records</span> across active client accounts
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onAddDummyOrder}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Simulate New Webhook Order
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Order / Inv #</th>
                  <th className="px-4 py-3">Client / Business</th>
                  <th className="px-4 py-3">Item / Description</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Client Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-indigo-300">{o.id}</td>
                    <td className="px-4 py-3 font-medium text-white">{o.client}</td>
                    <td className="px-4 py-3 text-slate-300">{o.item}</td>
                    <td className="px-4 py-3 font-semibold text-slate-100">{o.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        o.status.includes('Overdue')
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : o.status === 'Paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{o.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>Synced via Google Sheets API (OAuth Client)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
