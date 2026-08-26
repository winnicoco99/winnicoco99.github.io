/* ============================================================
   藏书馆的存储层 —— IndexedDB
   ------------------------------------------------------------
   为什么不用工作台通用的 storage.js（localStorage）？

   localStorage 只有 5MB。实测算过：500 本书 + 每本 10 条摘录 2 篇感想
   就要 4.78MB，占满 96%。摘录这东西一旦写顺手是没有上限的，
   撑爆之后再迁移比一开始就做对麻烦得多。IndexedDB 可用空间通常是
   磁盘剩余空间的一定比例，几百 MB 到 GB 级，写多少都不虚。

   三张表：
     books    一本书一条。ISBN 建唯一索引之外的普通索引，用来查重
     excerpts 摘录，bookId 索引
     thoughts 感想，bookId 索引

   打卡日期直接存在 books.checkins 里（['2026-08-25', ...]），
   不单独建表 —— 一本书的打卡天数最多几百个短字符串，
   放一起读写更简单，也省掉一次 join。

   导出/导入沿用 storage.js 的备份文件格式（{tool, data, ...}），
   这样和工作台其他工具的备份文件长一个样，用户不用记两套。
   ============================================================ */

const DB_NAME = 'workbench.library';
const DB_VERSION = 1;

let _db = null;

/** 打开数据库。首次打开会建表，之后复用同一个连接。 */
function open() {
  if (_db) return Promise.resolve(_db);

  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('这个浏览器不支持 IndexedDB'));
      return;
    }

    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = e => {
      const db = e.target.result;

      if (!db.objectStoreNames.contains('books')) {
        const s = db.createObjectStore('books', { keyPath: 'id' });
        // 查重靠这个索引。ISBN 可能为空（老书没条码），所以不设 unique，
        // 由业务层判断，避免多本无 ISBN 的书互相冲突写不进去。
        s.createIndex('isbn', 'isbn', { unique: false });
        s.createIndex('status', 'status', { unique: false });
        s.createIndex('at', 'at', { unique: false });
      }

      if (!db.objectStoreNames.contains('excerpts')) {
        const s = db.createObjectStore('excerpts', { keyPath: 'id' });
        s.createIndex('bookId', 'bookId', { unique: false });
      }

      if (!db.objectStoreNames.contains('thoughts')) {
        const s = db.createObjectStore('thoughts', { keyPath: 'id' });
        s.createIndex('bookId', 'bookId', { unique: false });
      }
    };

    req.onsuccess = () => {
      _db = req.result;
      // 别的标签页要升级版本时，得先把这个连接放开，否则它会一直卡住
      _db.onversionchange = () => { _db.close(); _db = null; };
      resolve(_db);
    };

    req.onerror = () => reject(req.error || new Error('数据库打不开'));
  });
}

export const DB = {

  /* ---------- 书 ---------- */

  async allBooks() {
    const db = await open();
    return new Promise((resolve, reject) => {
      const t = db.transaction(['books'], 'readonly');
      const r = t.objectStore('books').getAll();
      r.onsuccess = () => resolve(r.result || []);
      r.onerror = () => reject(r.error);
    });
  },

  async getBook(id) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const r = db.transaction(['books'], 'readonly').objectStore('books').get(id);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => reject(r.error);
    });
  },

  /** 按 ISBN 找已有的书 —— 防重复买的核心 */
  async findByISBN(isbn) {
    if (!isbn) return null;
    const db = await open();
    return new Promise((resolve, reject) => {
      const idx = db.transaction(['books'], 'readonly')
                    .objectStore('books').index('isbn');
      const r = idx.get(String(isbn));
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => reject(r.error);
    });
  },

  async putBook(book) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const t = db.transaction(['books'], 'readwrite');
      t.objectStore('books').put(book);
      t.oncomplete = () => resolve(book);
      t.onerror = () => reject(t.error);
    });
  },

  /** 删书时把它的摘录和感想一起删掉，别留孤儿数据 */
  async deleteBook(id) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const t = db.transaction(['books', 'excerpts', 'thoughts'], 'readwrite');
      t.objectStore('books').delete(id);

      ['excerpts', 'thoughts'].forEach(name => {
        const idx = t.objectStore(name).index('bookId');
        const cur = idx.openCursor(IDBKeyRange.only(id));
        cur.onsuccess = e => {
          const c = e.target.result;
          if (!c) return;
          c.delete();
          c.continue();
        };
      });

      t.oncomplete = () => resolve(true);
      t.onerror = () => reject(t.error);
    });
  },

  /* ---------- 摘录 / 感想（两张表结构一样，共用实现） ---------- */

  async listBy(store, bookId) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const idx = db.transaction([store], 'readonly')
                    .objectStore(store).index('bookId');
      const r = idx.getAll(IDBKeyRange.only(bookId));
      r.onsuccess = () => resolve(r.result || []);
      r.onerror = () => reject(r.error);
    });
  },

  async put(store, row) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const t = db.transaction([store], 'readwrite');
      t.objectStore(store).put(row);
      t.oncomplete = () => resolve(row);
      t.onerror = () => reject(t.error);
    });
  },

  async remove(store, id) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const t = db.transaction([store], 'readwrite');
      t.objectStore(store).delete(id);
      t.oncomplete = () => resolve(true);
      t.onerror = () => reject(t.error);
    });
  },

  async countAll(store) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const r = db.transaction([store], 'readonly').objectStore(store).count();
      r.onsuccess = () => resolve(r.result || 0);
      r.onerror = () => reject(r.error);
    });
  },

  async allOf(store) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const r = db.transaction([store], 'readonly').objectStore(store).getAll();
      r.onsuccess = () => resolve(r.result || []);
      r.onerror = () => reject(r.error);
    });
  },

  /* ---------- 备份 ---------- */

  /** 三张表整体导出。格式对齐 storage.js，方便用户理解。 */
  async exportAll() {
    const [books, excerpts, thoughts] = await Promise.all([
      this.allBooks(), this.allOf('excerpts'), this.allOf('thoughts')
    ]);
    return { books, excerpts, thoughts };
  },

  /**
   * 导入。
   * @param {Object} data {books, excerpts, thoughts}
   * @param {'merge'|'replace'} mode
   *   merge   —— 保留现有，按 id 去重后追加
   *   replace —— 清空后写入
   */
  async importAll(data, mode = 'merge') {
    const db = await open();
    const books = Array.isArray(data.books) ? data.books : [];
    const exs = Array.isArray(data.excerpts) ? data.excerpts : [];
    const ths = Array.isArray(data.thoughts) ? data.thoughts : [];

    let existing = new Set();
    if (mode === 'merge') {
      const cur = await this.allBooks();
      existing = new Set(cur.map(b => b.id));
    }

    return new Promise((resolve, reject) => {
      const t = db.transaction(['books', 'excerpts', 'thoughts'], 'readwrite');
      const B = t.objectStore('books');
      const E = t.objectStore('excerpts');
      const T = t.objectStore('thoughts');

      if (mode === 'replace') {
        B.clear(); E.clear(); T.clear();
      }

      let added = 0;
      books.forEach(b => {
        if (mode === 'merge' && existing.has(b.id)) return;
        B.put(b); added++;
      });
      // 摘录感想直接 put，同 id 覆盖即可，不用去重判断
      exs.forEach(r => E.put(r));
      ths.forEach(r => T.put(r));

      t.oncomplete = () => resolve({ added, total: books.length });
      t.onerror = () => reject(t.error);
    });
  },

  /** 查一下还剩多少空间，给用户一个交代 */
  async quota() {
    if (!navigator.storage || !navigator.storage.estimate) return null;
    try {
      const { usage, quota } = await navigator.storage.estimate();
      return { usage, quota };
    } catch {
      return null;
    }
  },

  /**
   * 请求持久化存储。
   * iOS Safari 的 ITP 会清理「七天没交互过」的站点数据，
   * 拿到 persisted 授权能降低被清掉的概率。不保证成功，失败也无妨。
   */
  async persist() {
    if (!navigator.storage || !navigator.storage.persist) return false;
    try {
      if (await navigator.storage.persisted()) return true;
      return await navigator.storage.persist();
    } catch {
      return false;
    }
  }
};

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
