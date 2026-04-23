const fs = require('fs');
const path = require('path');
const STORE_PATH = path.join(__dirname, '.storage.json');

function _read() {
  try {
    if (!fs.existsSync(STORE_PATH)) return {};
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('storage read error', e);
    return {};
  }
}

function _write(data) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('storage write error', e);
    return false;
  }
}

function setStorage(key, value) {
  if (!key) {
    console.error('setStorage: key required');
    return false;
  }
  const store = _read();
  store[key] = value;
  return _write(store);
}

function getStorage(key, defaultValue = null) {
  if (!key) return defaultValue;
  const store = _read();
  if (!(key in store)) return defaultValue;
  return store[key];
}

function removeStorage(key) {
  if (!key) return false;
  const store = _read();
  if (key in store) {
    delete store[key];
    return _write(store);
  }
  return true;
}

function clearStorage() {
  return _write({});
}

function getAllKeys() {
  const store = _read();
  return Object.keys(store);
}

function getStorageInfo() {
  const store = _read();
  const keys = Object.keys(store);
  const json = JSON.stringify(store);
  return {
    currentSize: Buffer.byteLength(json, 'utf8'),
    limitSize: Infinity,
    keys,
    keyCount: keys.length,
  };
}

function hasKey(key) {
  if (!key) return false;
  const store = _read();
  return key in store;
}

function getMultipleStorage(keys) {
  const out = {};
  if (!Array.isArray(keys)) return out;
  const store = _read();
  keys.forEach(k => { out[k] = k in store ? store[k] : null });
  return out;
}

function setMultipleStorage(data) {
  if (typeof data !== 'object') return false;
  const store = _read();
  Object.keys(data).forEach(k => store[k] = data[k]);
  return _write(store);
}

function debugStorage() {
  return _read();
}

function appendToList(key, item, maxCount = 100) {
  if (!key) return false;
  const store = _read();
  let list = store[key] || [];
  if (!Array.isArray(list)) list = [list];
  list.unshift(item);
  if (list.length > maxCount) list = list.slice(0, maxCount);
  store[key] = list;
  return _write(store);
}

function addToList(key, item, maxCount = 100) {
  return appendToList(key, item, maxCount);
}

module.exports = {
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
  getAllKeys,
  getStorageInfo,
  hasKey,
  getMultipleStorage,
  setMultipleStorage,
  debugStorage,
  appendToList,
  addToList,
};
