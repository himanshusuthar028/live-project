const assert = require('node:assert/strict');
const { calculatePlan } = require('./settlement');

assert.deepEqual(calculatePlan(6000, []).people, []);
assert.equal(calculatePlan(6000, []).shareCents, 0);
assert.equal(calculatePlan(6000, [{ id: 1, name: 'Solo', paid: 6000 }]).people[0].balanceCents, 0);
assert.equal(calculatePlan(100, [{ id: 1, name: 'None', paid: 0 }]).transfers.length, 0);
assert.equal(calculatePlan(100, [{ id: 1, name: 'Exact', paid: 100 }]).transfers.length, 0);
assert.equal(calculatePlan(100, [{ id: 1, name: 'Partial', paid: 25 }]).remainingCents, 7500);
assert.equal(calculatePlan(123.45, [{ id: 1, name: 'Decimal', paid: 23.45 }]).people[0].balanceCents, -10000);
assert.throws(() => calculatePlan(-1, []), /non-negative/);
assert.throws(() => calculatePlan(100, [{ id: 1, name: 'Bad', paid: -1 }]), /non-negative/);

const requiredExample = calculatePlan(6000, [
  { id: 1, name: 'Rahul', paid: 1000 },
  { id: 2, name: 'Aman', paid: 500 },
  { id: 3, name: 'Himanshu', paid: 1500 },
  { id: 4, name: 'Rohit', paid: 0 },
  { id: 5, name: 'Priya', paid: 1000 },
  { id: 6, name: 'Neha', paid: 2000 },
]);
assert.equal(requiredExample.people.length, 6);
assert.equal(requiredExample.people.every((person) => person.shareCents === 100000), true);
assert.deepEqual(requiredExample.people.map((person) => person.balanceCents), [0, -50000, 50000, -100000, 0, 100000]);
assert.equal(requiredExample.totalCollectedCents, 600000);
assert.equal(requiredExample.remainingCents, 0);
assert.deepEqual(requiredExample.transfers, [
  { from: 'Aman', to: 'Himanshu', amountCents: 50000 },
  { from: 'Rohit', to: 'Neha', amountCents: 100000 },
]);
assert.equal(requiredExample.transfers.every((transfer) => transfer.amountCents > 0 && transfer.from !== transfer.to), true);

const underCollected = calculatePlan(8000, [
  { id: 1, name: 'Rahul', paid: 1000 },
  { id: 2, name: 'Aman', paid: 500 },
  { id: 3, name: 'Himanshu', paid: 1500 },
  { id: 4, name: 'Rohit', paid: 0 },
  { id: 5, name: 'Priya', paid: 1000 },
  { id: 6, name: 'Neha', paid: 2000 },
]);
assert.equal(underCollected.totalCollectedCents, 600000);
assert.equal(underCollected.shortfallCents, 200000);
assert.equal(underCollected.isFullyCollected, false);
assert.deepEqual(underCollected.transfers, [
  { from: 'Rahul', to: 'Himanshu', amountCents: 16667 },
  { from: 'Rahul', to: 'Neha', amountCents: 16667 },
  { from: 'Aman', to: 'Neha', amountCents: 50000 },
]);
assert.equal(underCollected.transfers.every((transfer) => transfer.amountCents > 0 && transfer.from !== transfer.to), true);

const plan = calculatePlan(6000, [
  { id: 1, name: 'Asha', paid: 2000 },
  { id: 2, name: 'Dev', paid: 0 },
  { id: 3, name: 'Mira', paid: 4000 },
  { id: 4, name: 'Ravi', paid: 0 },
]);

assert.equal(plan.people[0].balanceCents, 50000);
assert.equal(plan.people[1].balanceCents, -150000);
assert.equal(plan.remainingCents, 0);
assert.deepEqual(plan.transfers, [
  { from: 'Dev', to: 'Asha', amountCents: 50000 },
  { from: 'Dev', to: 'Mira', amountCents: 100000 },
  { from: 'Ravi', to: 'Mira', amountCents: 150000 },
]);

const rounded = calculatePlan(10, [
  { id: 1, name: 'One', paid: 0 },
  { id: 2, name: 'Two', paid: 0 },
  { id: 3, name: 'Three', paid: 0 },
]);
assert.deepEqual(rounded.people.map((person) => person.shareCents), [334, 333, 333]);
assert.equal(rounded.transfers.length, 0);

const overpaid = calculatePlan(100, [
  { id: 1, name: 'Paid', paid: 120 },
  { id: 2, name: 'Owes', paid: 0 },
]);
assert.equal(overpaid.remainingCents, 0);
assert.deepEqual(overpaid.transfers, [{ from: 'Owes', to: 'Paid', amountCents: 5000 }]);

const sixPeople = calculatePlan(6000, [
  { id: 1, name: 'Asha', paid: 0 },
  { id: 2, name: 'Bala', paid: 500 },
  { id: 3, name: 'Chen', paid: 1000 },
  { id: 4, name: 'Diya', paid: 1500 },
  { id: 5, name: 'Eshan', paid: 2000 },
  { id: 6, name: 'Farah', paid: 1000 },
]);
assert.equal(sixPeople.people.length, 6);
assert.equal(sixPeople.people.every((person) => person.shareCents === 100000), true);
assert.equal(sixPeople.totalCollectedCents, 600000);
assert.deepEqual(sixPeople.people.map((person) => person.balanceCents), [-100000, -50000, 0, 50000, 100000, 0]);
assert.deepEqual(sixPeople.transfers, [
  { from: 'Asha', to: 'Diya', amountCents: 50000 },
  { from: 'Asha', to: 'Eshan', amountCents: 50000 },
  { from: 'Bala', to: 'Eshan', amountCents: 50000 },
]);

console.log('Settlement tests passed.');