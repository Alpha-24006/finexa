import type { Expense } from '../types/expense';
import { formatCurrency } from './currency';
import { formatDate } from './formatter';

/**
 * Creates an invoice-style print document from expenses and launches the native print dialog.
 */
export function exportExpensesToPDF(expenses: Expense[], reportName = 'Expense Report'): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF/Print documents.');
    return;
  }

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category for summary
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const categorySummaryHtml = Object.keys(categoryTotals)
    .map(cat => `
      <div class="summary-box">
        <span class="summary-cat">${cat}</span>
        <span class="summary-val">${formatCurrency(categoryTotals[cat])}</span>
      </div>
    `).join('');

  const tableRowsHtml = expenses.map((e, index) => `
    <tr class="${index % 2 === 0 ? 'even-row' : ''}">
      <td>${formatDate(e.date)}</td>
      <td>${e.title}</td>
      <td>${e.category}</td>
      <td style="text-transform: uppercase;">${e.payment_method.replace('_', ' ')}</td>
      <td class="amount-cell">${formatCurrency(e.amount)}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>${reportName}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #334155;
            padding: 40px;
            margin: 0;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            color: #8b5cf6;
          }
          .meta {
            text-align: right;
            font-size: 14px;
            color: #64748b;
          }
          .title {
            font-size: 28px;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 10px 0;
          }
          .total-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .total-label {
            font-size: 16px;
            color: #64748b;
            font-weight: 500;
          }
          .total-amount {
            font-size: 32px;
            font-weight: 800;
            color: #8b5cf6;
          }
          .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 15px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 5px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 15px;
            margin-bottom: 40px;
          }
          .summary-box {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 15px;
            display: flex;
            flex-direction: column;
          }
          .summary-cat {
            font-size: 13px;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 5px;
          }
          .summary-val {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 14px;
          }
          th {
            background-color: #f1f5f9;
            color: #475569;
            font-weight: 600;
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid #cbd5e1;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
          }
          .even-row {
            background-color: #f8fafc;
          }
          .amount-cell {
            text-align: right;
            font-weight: 700;
            color: #0f172a;
          }
          th.amount-header {
            text-align: right;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
          }
          @media print {
            body {
              padding: 20px 0;
            }
            .total-card {
              background-color: #f8fafc !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .summary-box {
              border: 1px solid #e2e8f0 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            th {
              background-color: #f1f5f9 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">FINANCE AI</div>
            <h1 class="title">${reportName}</h1>
          </div>
          <div class="meta">
            Date Generated: ${new Date().toLocaleDateString()}<br>
            Time Range: Historical Log
          </div>
        </div>

        <div class="total-card">
          <span class="total-label">AGGREGATE EXPENDITURE</span>
          <span class="total-amount">${formatCurrency(totalSpent)}</span>
        </div>

        <div class="section-title">Category Spending Breakdown</div>
        <div class="summary-grid">
          ${categorySummaryHtml}
        </div>

        <div class="section-title">Transaction Details</div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Payment Method</th>
              <th class="amount-header">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <div class="footer">
          Generated automatically by AI-Based Expense Prediction System. All rights reserved.
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  
  // Wait for document to load before printing
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, 500);
}
