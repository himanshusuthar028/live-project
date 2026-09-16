function normalizePersonName(name) {
  const displayName = String(name || '').trim().replace(/\s+/g, ' ');
  return {
    key: displayName.toLocaleLowerCase(),
    displayName,
  };
}

function parseContributionAmount(value) {
  const raw = String(value ?? '').trim();
  if (!raw) throw new Error('missing amount');
  if (raw.startsWith('-')) throw new Error('negative amount');
  const cleaned = raw.replace(/^₹\s*/, '').replace(/,/g, '').replace(/\s+/g, '');
  if (!/^\d+(?:\.\d{1,2})?$/.test(cleaned)) throw new Error('invalid amount');
  const amount = Number(cleaned);
  if (!Number.isFinite(amount) || amount < 0) throw new Error('invalid amount');
  return amount;
}

function parseCsvRows(text) {
  const rows = [];
  let fields = [];
  let field = '';
  let quoted = false;
  let rowStart = 1;
  let line = 1;

  for (let index = 0; index < String(text).length; index += 1) {
    const character = text[index];
    const next = text[index + 1];
    if (character === '"') {
      if (quoted && next === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      fields.push(field);
      field = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1;
      fields.push(field);
      rows.push({ rowNumber: rowStart, fields });
      fields = [];
      field = '';
      line += 1;
      rowStart = line;
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error('unterminated quoted field');
  if (field || fields.length) {
    fields.push(field);
    rows.push({ rowNumber: rowStart, fields });
  }
  return rows;
}

function importContributions(csvText) {
  const rows = parseCsvRows(csvText);
  const report = {
    rowsRead: 0,
    imported: 0,
    duplicatesRemoved: 0,
    namesMerged: 0,
    rejected: 0,
    invalidRows: [],
    merges: [],
  };
  const people = new Map();
  const seenRows = new Set();

  rows.forEach((row, index) => {
    const trimmedFields = row.fields.map((field) => field.trim());
    const isHeader = index === 0 && trimmedFields.length >= 2 && trimmedFields[0].toLocaleLowerCase() === 'name' && trimmedFields[1].toLocaleLowerCase() === 'amount';
    if (isHeader || trimmedFields.every((field) => !field)) return;
    report.rowsRead += 1;

    const nameValue = trimmedFields[0] || '';
    const amountValue = trimmedFields.slice(1).join(',').trim();
    const original = row.fields.join(',');
    try {
      const normalizedName = normalizePersonName(nameValue);
      if (!normalizedName.displayName) throw new Error('missing name');
      if (trimmedFields.length < 2) throw new Error('missing amount');
      const amount = parseContributionAmount(amountValue);
      const duplicateKey = `${nameValue.toLocaleLowerCase()}|${amountValue}`;
      if (seenRows.has(duplicateKey)) {
        report.duplicatesRemoved += 1;
        return;
      }
      seenRows.add(duplicateKey);

      const existing = people.get(normalizedName.key);
      if (existing) {
        existing.amount += amount;
        if (existing.displayName !== normalizedName.displayName) {
          report.namesMerged += 1;
          report.merges.push({ from: normalizedName.displayName, to: existing.displayName });
        }
      } else {
        people.set(normalizedName.key, { key: normalizedName.key, displayName: normalizedName.displayName, amount });
      }
      report.imported += 1;
    } catch (error) {
      report.rejected += 1;
      report.invalidRows.push({ rowNumber: row.rowNumber, original, reason: error.message });
    }
  });

  return { people: [...people.values()], report };
}

if (typeof module !== 'undefined') module.exports = { importContributions, normalizePersonName, parseContributionAmount, parseCsvRows };
if (typeof window !== 'undefined') window.FarewellImporter = { importContributions };
