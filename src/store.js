// In-memory user store — keyed by email for O(1) duplicate checks
const users = new Map(); // email -> { id, email, passwordHash }
let nextId = 1;

function createUser(email, passwordHash) {
  const user = { id: nextId++, email, passwordHash };
  users.set(email, user);
  return user;
}

function findByEmail(email) {
  return users.get(email) ?? null;
}

function findById(id) {
  for (const user of users.values()) {
    if (user.id === id) return user;
  }
  return null;
}

// Exposed for test teardown — wipe state between test suites
function reset() {
  users.clear();
  nextId = 1;
}

module.exports = { createUser, findByEmail, findById, reset };
