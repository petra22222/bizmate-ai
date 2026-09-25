import React, { useState } from 'react';
import { Table, Download, Search, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { GoogleSheetsData } from '../../types';
import { useI18n } from '../../i18n';

interface GoogleSheetsCardProps {
  data: GoogleSheetsData;
}

export const GoogleSheetsCard: React.FC<GoogleSheetsCardProps> = ({ data }) => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Filter rows based on search
  const filteredRows = data.rows.filter((row: (string | number)[]) =>
    row.some((cell: string | number) => String(cell).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Copy cell value
  const handleCopyCell = (val: string | number, coord: string) => {
    navigator.clipboard.writeText(String(val));
    setCopiedCell(coord);
    setTimeout(() => setCopiedCell(null), 1500);
  };

  // Download CSV
  const handleDownloadCsv = () => {
    const csvContent = [
      data.headers.map((h: string) => `"${h.replace(/"/g, '""')}"`).join(','),
      ...data.rows.map((row: (string | number)[]) =>
        row.map((c: string | number) => `"${String(c).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${data.sheetName || 'google_sheets_data'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-3 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-950 p-4 shadow-lg shadow-emerald-950/20 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-emerald-500/20 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
              Google Sheets
            </span>
            <h4 className="text-sm font-semibold text-white leading-tight">
              {data.sheetName || t('tools.sheetsLoaded')}
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadCsv}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>CSV</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="py-2.5 flex items-center justify-between gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={t('common.search')}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-8 pr-3 rtl:pr-8 rtl:pl-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <span className="text-[11px] text-slate-400 shrink-0">
          {filteredRows.length} / {data.rows.length} {t('tools.totalRows')}
        </span>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60 max-w-full">
        <table className="w-full text-xs text-left text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
            <tr>
              {data.headers.map((head: string, idx: number) => (
                <th key={idx} className="px-3.5 py-2.5 font-semibold whitespace-nowrap">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row: (string | number)[], rIdx: number) => (
                <tr key={rIdx} className="hover:bg-slate-900/60 transition-colors">
                  {row.map((cell: string | number, cIdx: number) => {
                    const coord = `${rIdx}-${cIdx}`;
                    return (
                      <td
                        key={cIdx}
                        onClick={() => handleCopyCell(cell, coord)}
                        title="Click to copy cell value"
                        className="px-3.5 py-2 whitespace-nowrap cursor-pointer hover:text-white transition-colors relative group font-sans"
                      >
                        <span className="truncate block max-w-xs">{String(cell)}</span>
                        {copiedCell === coord && (
                          <span className="absolute right-1 top-1 bg-emerald-950 text-emerald-300 text-[9px] px-1 py-0.5 rounded border border-emerald-500/40">
                            Copied!
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={data.headers.length} className="px-4 py-6 text-center text-slate-500">
                  No matching rows found for "{searchTerm}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-2.5 flex items-center justify-between text-xs text-slate-400">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
