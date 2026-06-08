const fs = require('fs');
const path = require('path');

// File-persisted platform metrics: uptime, users, analyzed contracts.
const STATS_FILE = path.join(__dirname, '..', 'data', 'stats.json');

const startTime = Date.now();

const state = {
  analyzedContracts: 0,
  users: [], // unique anonymous user ids
};

function load() {
  try {
    const parsed = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
    state.analyzedContracts = Number(parsed.analyzedContracts) || 0;
    state.users = Array.isArray(parsed.users) ? parsed.users : [];
  } catch {
    // No file yet.
  }
}

function persist() {
  try {
    fs.mkdirSync(path.dirname(STATS_FILE), { recursive: true });
    fs.writeFileSync(
      STATS_FILE,
      JSON.stringify(
        { analyzedContracts: state.analyzedContracts, users: state.users },
        null,
        2
      )
    );
  } catch (err) {
    console.error('Failed to persist stats:', err.message);
  }
}

load();

// Count analyzed contracts.
function recordAnalysis(count = 1) {
  state.analyzedContracts += count;
  persist();
}

// Add a user; returns true if new.
function recordUser(userId) {
  if (!userId || typeof userId !== 'string') return false;
  if (state.users.includes(userId)) return false;
  state.users.push(userId);
  persist();
  return true;
}

function getStats() {
  return {
    status: 'ok',
    startedAt: new Date(startTime).toISOString(),
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    users: state.users.length,
    analyzedContracts: state.analyzedContracts,
  };
}

module.exports = { recordAnalysis, recordUser, getStats };
