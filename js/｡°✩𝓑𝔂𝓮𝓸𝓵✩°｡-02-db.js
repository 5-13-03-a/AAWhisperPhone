// ==========================================
// IndexedDB 数据库引擎 - 图标位置持久化存储
// ==========================================

const HomeDB = (() => {
  const DB_NAME = 'ByeolPhone_DB';
  const STORE_NAME = 'homescreen';
  const DB_VERSION = 2;

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
        if (!db.objectStoreNames.contains('contacts')) {
          db.createObjectStore('contacts', { keyPath: 'id' });
        }
      };
      
      req.onsuccess = e => resolve(e.target.result);
      req.onerror = e => reject(e.target.error);
    });
  }

  async function setItem(key, val) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(val, key);
        req.onsuccess = () => resolve(true);
        req.onerror = e => {
          console.error(`[DB Error] Key: ${key}`, e);
          resolve(false);
        };
        tx.oncomplete = () => db.close();
      });
    } catch (e) {
      console.error(`[DB Error] Key: ${key}`, e);
      return false;
    }
  }

  async function getItem(key) {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = e => resolve(e.target.result ?? null);
        req.onerror = () => resolve(null);
        tx.oncomplete = () => db.close();
      });
    } catch {
      return null;
    }
  }

  async function getAllKeys() {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAllKeys();
        req.onsuccess = e => resolve(e.target.result || []);
        req.onerror = () => resolve([]);
        tx.oncomplete = () => db.close();
      });
    } catch {
      return [];
    }
  }

  return { setItem, getItem, getAllKeys };
})();
