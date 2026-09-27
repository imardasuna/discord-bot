const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../../data/spotify-tokens.json');

function readAll() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeAll(data) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function get(userId) {
  return readAll()[userId] || null;
}

function set(userId, tokens) {
  const all = readAll();
  all[userId] = {
    ...tokens,
    updatedAt: Date.now(),
  };
  writeAll(all);
}

function remove(userId) {
  const all = readAll();
  delete all[userId];
  writeAll(all);
}

module.exports = { get, set, remove };
