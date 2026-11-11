const formulaLikeText = /^[\u0000-\u0020\uFEFF]*[=+\-@]/;

function encodeCell(value) {
  let text = value === null || value === undefined ? '' : String(value);
  if (typeof value === 'string' && formulaLikeText.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

/** Serialize app-export rows while neutralizing formula-leading user text in spreadsheet apps. */
export function serializeCsv(rows, columns) {
  return rows.map(row => columns.map((key, index) => encodeCell(Array.isArray(row) ? row[index] : row?.[key])).join(',')).join('\n');
}
