import type { Expense } from '../types/expense';

/**
 * Compiles list of expenses into CSV format and triggers a browser download.
 */
export function exportExpensesToCSV(expenses: Expense[]): void {
  const headers = ['Title', 'Category', 'Amount', 'Payment Method', 'Date', 'Notes'];
  
  const csvRows = [
    headers.join(','),
    ...expenses.map(e => [
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      e.amount,
      `"${e.payment_method}"`,
      `"${e.date}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ].join(','))
  ];

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `expenses_report_${new Date().toISOString().substring(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
