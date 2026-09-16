function toCents(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('Amount must be a non-negative number.');
  }
  return Math.round(amount * 100);
}

function formatMoney(cents) {
  return (cents / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  });
}

function calculatePlan(total, people) {
  if (!Array.isArray(people) || people.length === 0) {
    const totalCents = toCents(total);
    return { totalCents, shareCents: 0, totalCollectedCents: 0, remainingCents: totalCents, shortfallCents: totalCents, isFullyCollected: totalCents === 0, people: [], transfers: [] };
  }

  const totalCents = toCents(total);
  const baseShare = Math.floor(totalCents / people.length);
  const remainder = totalCents % people.length;
  const normalized = people.map((person, index) => {
    const paidCents = toCents(person.paid);
    const shareCents = baseShare + (index < remainder ? 1 : 0);
    return {
      id: String(person.id),
      name: String(person.name || '').trim(),
      paidCents,
      shareCents,
      balanceCents: paidCents - shareCents,
    };
  });

  const totalCollectedCents = normalized.reduce((sum, person) => sum + person.paidCents, 0);
  const shortfallCents = Math.max(0, totalCents - totalCollectedCents);
  const debtors = normalized.filter((person) => person.balanceCents < 0).map((person) => ({ ...person, amountCents: -person.balanceCents }));
  const creditors = normalized.filter((person) => person.balanceCents > 0).map((person) => ({ ...person, amountCents: person.balanceCents }));
  const transfers = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amountCents = Math.min(debtor.amountCents, creditor.amountCents);
    if (amountCents > 0) {
      transfers.push({ from: debtor.name, to: creditor.name, amountCents });
    }
    debtor.amountCents -= amountCents;
    creditor.amountCents -= amountCents;
    if (debtor.amountCents === 0) debtorIndex += 1;
    if (creditor.amountCents === 0) creditorIndex += 1;
  }

  return {
    totalCents,
    shareCents: baseShare,
    totalCollectedCents,
    remainingCents: shortfallCents,
    shortfallCents,
    isFullyCollected: shortfallCents === 0,
    people: normalized,
    transfers,
  };
}

if (typeof module !== 'undefined') {
  module.exports = { calculatePlan, formatMoney, toCents };
}
if (typeof window !== 'undefined') {
  window.FarewellFund = { calculatePlan, formatMoney, toCents };
}