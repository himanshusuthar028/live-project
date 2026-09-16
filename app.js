const calculateFundPlan = window.FarewellFund.calculatePlan;
const formatFundMoney = window.FarewellFund.formatMoney;
const storageKey = 'farewell-fund-state';
const defaultState = {
  name: 'Farewell gift',
  total: 0,
  people: [],
};

function normalizeState(value) {
  if (!value || typeof value !== 'object') return { ...defaultState, people: [] };
  const people = Array.isArray(value.people) ? value.people.filter((person) => person && typeof person === 'object').map((person, index) => ({
    id: String(person.id || `${Date.now()}-${index}`),
    name: String(person.name || '').trim(),
    paid: Number.isFinite(Number(person.paid)) && Number(person.paid) >= 0 ? Number(person.paid) : 0,
  })) : [];
  return {
    name: typeof value.name === 'string' ? value.name : defaultState.name,
    total: Number.isFinite(Number(value.total)) && Number(value.total) >= 0 ? Number(value.total) : 0,
    people,
  };
}

let state;
try {
  const savedState = JSON.parse(localStorage.getItem(storageKey));
  state = normalizeState(savedState || defaultState);
} catch {
  state = normalizeState(defaultState);
}

function initApp() {
const elements = {
  name: document.querySelector('#fund-name'),
  title: document.querySelector('#fund-title'),
  total: document.querySelector('#fund-total'),
  totalError: document.querySelector('#fund-total-error'),
  remaining: document.querySelector('#remaining'),
  collectionNote: document.querySelector('#collection-note'),
  collected: document.querySelector('#collected'),
  collectedNote: document.querySelector('#collected-note'),
  share: document.querySelector('#share'),
  peopleCount: document.querySelector('#people-count'),
  peopleList: document.querySelector('#people-list'),
  peopleEmpty: document.querySelector('#people-empty'),
  transfers: document.querySelector('#transfers-list'),
  transferCount: document.querySelector('#transfer-count'),
  settlementStatus: document.querySelector('#settlement-status'),
  settlementCaption: document.querySelector('#settlement-caption'),
  saved: document.querySelector('#saved-note'),
  addButton: document.querySelector('#add-person'),
  addForm: document.querySelector('#add-person-form'),
  newPersonName: document.querySelector('#new-person-name'),
  newPersonPaid: document.querySelector('#new-person-paid'),
  addPersonError: document.querySelector('#add-person-error'),
};

function saveAndRender() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    elements.saved.textContent = 'Changes apply for this session';
  }
  render();
  if (elements.saved.textContent !== 'Changes apply for this session') elements.saved.textContent = 'Saved just now';
}

function render() {
  elements.name.value = state.name;
  elements.title.textContent = state.name || 'Untitled fund';
  elements.total.value = state.total;
  const plan = calculateFundPlan(state.total, state.people);
  elements.remaining.textContent = formatFundMoney(plan.remainingCents);
  elements.remaining.classList.toggle('complete', plan.remainingCents === 0);
  elements.collectionNote.textContent = plan.remainingCents ? `${formatFundMoney(plan.remainingCents)} left to reach the target` : 'Target fully covered';
  elements.collected.textContent = formatFundMoney(plan.totalCollectedCents);
  elements.collectedNote.textContent = `of ${formatFundMoney(plan.totalCents)} target`;
  if (plan.totalCollectedCents > plan.totalCents) {
    elements.collectionNote.textContent = `${formatFundMoney(plan.totalCollectedCents - plan.totalCents)} collected over target`;
  }
  elements.share.textContent = formatFundMoney(plan.people.length ? plan.people[0].shareCents : 0);
  elements.peopleCount.textContent = `${plan.people.length} ${plan.people.length === 1 ? 'person' : 'people'}`;
  elements.peopleEmpty.hidden = plan.people.length > 0;
  elements.transferCount.textContent = `${plan.transfers.length} ${plan.transfers.length === 1 ? 'transfer' : 'transfers'}`;
  elements.settlementStatus.innerHTML = plan.shortfallCents > 0
    ? `<div class="settlement-alert">${formatFundMoney(plan.shortfallCents)} still needs to be collected before everyone can be fully settled.</div>`
    : '';
  elements.settlementCaption.textContent = plan.shortfallCents > 0
    ? 'Transfers below only redistribute credits already in the pool.'
    : 'A compact plan that gets every balance back to zero.';

  elements.peopleList.innerHTML = plan.people.map((person) => {
    const balanceClass = person.balanceCents > 0 ? 'positive' : person.balanceCents < 0 ? 'negative' : 'even';
    const balanceLabel = person.balanceCents > 0 ? `${formatFundMoney(person.balanceCents)} ahead` : person.balanceCents < 0 ? `${formatFundMoney(-person.balanceCents)} to pay` : 'All square';
    return `<div class="person-row" data-id="${person.id}">
      <input class="person-name" aria-label="Person name" maxlength="40" value="${escapeHtml(person.name)}" placeholder="Name">
      <label class="paid-input"><span>₹</span><input class="person-paid" aria-label="Amount paid by ${escapeHtml(person.name)}" type="number" min="0" step="0.01" value="${(person.paidCents / 100).toFixed(2)}"></label>
      <span class="balance ${balanceClass}">${balanceLabel}</span>
      <button class="icon-button remove-person" aria-label="Remove ${escapeHtml(person.name || 'person')}" type="button">&times;</button>
    </div>`;
  }).join('');
  elements.transfers.innerHTML = plan.transfers.length
    ? plan.transfers.map((transfer) => `<div class="transfer"><div><strong>${escapeHtml(transfer.from)}</strong><span>pays</span><strong>${escapeHtml(transfer.to)}</strong></div><b>${formatFundMoney(transfer.amountCents)}</b></div>`).join('')
    : `<div class="settled"><span class="settled-icon">${plan.shortfallCents > 0 ? '!' : '✓'}</span><strong>${plan.shortfallCents > 0 ? 'No credits to redistribute yet' : plan.people.length ? 'Everyone is settled' : 'Add your group first'}</strong><p>${plan.shortfallCents > 0 ? 'Collect the outstanding amount before the group can be fully settled.' : plan.people.length ? 'No transfers are needed right now.' : 'Your simplest settlement plan will appear here.'}</p></div>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
}

elements.name.addEventListener('input', (event) => { state.name = event.target.value; saveAndRender(); });
elements.total.addEventListener('input', (event) => {
  const value = Number(event.target.value);
  if (!Number.isFinite(value) || value < 0) {
    elements.totalError.textContent = 'Enter a valid non-negative budget.';
    elements.totalError.hidden = false;
    return;
  }
  elements.totalError.hidden = true;
  state.total = value;
  saveAndRender();
});
elements.addButton.addEventListener('click', () => {
  elements.addForm.hidden = false;
  elements.addPersonError.hidden = true;
  elements.newPersonName.focus();
});
document.querySelector('#cancel-add-person').addEventListener('click', () => {
  elements.addForm.reset();
  elements.addForm.hidden = true;
  elements.addPersonError.hidden = true;
});
elements.addForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = elements.newPersonName.value.trim();
  const paid = Number(elements.newPersonPaid.value);
  if (!name) {
    elements.addPersonError.textContent = 'Enter a name to add this person.';
    elements.addPersonError.hidden = false;
    elements.newPersonName.focus();
    return;
  }
  if (!Number.isFinite(paid) || paid < 0) {
    elements.addPersonError.textContent = 'Payment must be zero or more.';
    elements.addPersonError.hidden = false;
    elements.newPersonPaid.focus();
    return;
  }
  state.people.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, name, paid });
  elements.addForm.reset();
  elements.addForm.hidden = true;
  elements.addPersonError.hidden = true;
  saveAndRender();
});
document.querySelector('#reset-button').addEventListener('click', () => {
  if (window.confirm('Reset this fund and remove all saved contributions?')) {
    state = normalizeState(defaultState);
    saveAndRender();
  }
});
elements.peopleList.addEventListener('input', (event) => {
  const row = event.target.closest('.person-row');
  const person = state.people.find((item) => String(item.id) === row.dataset.id);
  if (!person) return;
  const inputType = event.target.classList.contains('person-name') ? 'name' : 'paid';
  const cursorPosition = event.target.selectionStart;
  if (event.target.classList.contains('person-name')) {
    if (!event.target.value.trim()) {
      event.target.setCustomValidity('Person name cannot be empty.');
      event.target.classList.add('invalid');
      elements.saved.textContent = 'Person name cannot be empty';
      return;
    }
    event.target.setCustomValidity('');
    event.target.classList.remove('invalid');
    person.name = event.target.value;
  }
  if (event.target.classList.contains('person-paid')) {
    const paid = Number(event.target.value);
    if (!Number.isFinite(paid) || paid < 0) {
      event.target.setCustomValidity('Payment must be zero or more.');
      event.target.classList.add('invalid');
      elements.saved.textContent = 'Payment must be zero or more';
      return;
    }
    event.target.setCustomValidity('');
    event.target.classList.remove('invalid');
    person.paid = paid;
  }
  saveAndRender();
  const refreshedInput = document.querySelector(`[data-id="${row.dataset.id}"] .person-${inputType}`);
  if (refreshedInput) {
    refreshedInput.focus();
    if (inputType === 'name') refreshedInput.setSelectionRange(cursorPosition, cursorPosition);
  }
});
elements.peopleList.addEventListener('click', (event) => {
  if (!event.target.classList.contains('remove-person')) return;
  const row = event.target.closest('.person-row');
  state.people = state.people.filter((person) => String(person.id) !== row.dataset.id);
  saveAndRender();
});

render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp, { once: true });
} else {
  initApp();
}