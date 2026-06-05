const normalizeCell = (value) => {
  if (value === undefined || value === null) return '';
  const text = String(value);
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

export const exportRowsToCsv = (fileName, columns, rows) => {
  const headers = columns.map((col) => normalizeCell(col.header)).join(',');
  const body = rows
    .map((row) => columns.map((col) => normalizeCell(col.getValue(row))).join(','))
    .join('\n');

  const csv = `${headers}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
};

export const printReport = () => {
  window.print();
};
