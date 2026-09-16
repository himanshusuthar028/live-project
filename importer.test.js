const assert = require('node:assert/strict');
const { importContributions, parseContributionAmount } = require('./importer');

assert.equal(parseContributionAmount('1000'), 1000);
assert.equal(parseContributionAmount('1000.00'), 1000);
assert.equal(parseContributionAmount('₹1000'), 1000);
assert.equal(parseContributionAmount('₹1,000'), 1000);
assert.equal(parseContributionAmount('1,000.00'), 1000);
assert.equal(parseContributionAmount('0'), 0);
assert.throws(() => parseContributionAmount('abc'), /invalid amount/);
assert.throws(() => parseContributionAmount('₹'), /missing amount|invalid amount/);
assert.throws(() => parseContributionAmount('-500'), /negative amount/);
assert.throws(() => parseContributionAmount(''), /missing amount/);

const sample = `name,amount
Rahul,500
rahul,₹300
RAHUL,200
Aman,₹500
aman,500.00
Himanshu,1500
Rohit,0
Rohit,abc
,500
Priya,₹1,000`;
const imported = importContributions(sample);
assert.deepEqual(imported.people.map((person) => [person.displayName, person.amount]), [
  ['Rahul', 1000],
  ['Aman', 1000],
  ['Himanshu', 1500],
  ['Rohit', 0],
  ['Priya', 1000],
]);
assert.equal(imported.report.rowsRead, 10);
assert.equal(imported.report.imported, 8);
assert.equal(imported.report.duplicatesRemoved, 0);
assert.equal(imported.report.namesMerged, 3);
assert.equal(imported.report.rejected, 2);
assert.deepEqual(imported.report.invalidRows.map((row) => [row.rowNumber, row.reason]), [[9, 'invalid amount'], [10, 'missing name']]);

const duplicateRows = importContributions('name,amount\nRahul,500\nRahul,500\nrahul,500.00');
assert.deepEqual(duplicateRows.people.map((person) => person.amount), [1000]);
assert.equal(duplicateRows.report.duplicatesRemoved, 1);

const quoted = importContributions('name,amount\n"Rahul, Jr", "₹1,000"');
assert.deepEqual(quoted.people.map((person) => [person.displayName, person.amount]), [['Rahul, Jr', 1000]]);
assert.throws(() => importContributions('name,amount\n"Rahul,500'), /unterminated quoted field/);

console.log('Import tests passed.');
