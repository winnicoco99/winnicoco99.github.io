/* ============================================================
   整机备份 —— 一次导出全部工具的数据，换设备时一次导入
   ------------------------------------------------------------
   为什么单独做一个：每个工具页都有自己的导出按钮，但换手机时
   要挨个点进去导一遍、再挨个导回来，六个工具就是十二次操作，
   漏一个就丢一份数据。这里把两种存储都扫一遍打成一个包。

   工作台的数据分散在两处：
     localStorage   作息/棋谱/收藏夹/随手记/美食，key 前缀 workbench.
     IndexedDB      藏书馆（摘录多，localStorage 5MB 装不下）

   ⛔ 这里刻意不 import 各工具的模块。
   藏书馆的 db.js 是 ES module 且写死了三张表，一旦它加表、
   或者以后别的工具也用 IndexedDB，这个页面不改就会漏数据。
   所以走通用路线：枚举数据库 → 枚举表 → 连表结构一起导出，
   导入时按导出的结构重建。新工具接进来这里不用动。
   ============================================================ */

(function () {
  'use strict';

  const PREFIX = 'workbench.';
  const FORMAT = 'workbench-all';
  const VERSION = 1;

  /* indexedDB.databases() 在 Safari 上长期缺失，
     枚举不到时回落到这份清单。加了用 IndexedDB 的新工具就往这儿补一条。 */
  const KNOWN_DBS = ['workbench.library'];

  /* 工具的显示名。扫出来的是 key，直接给用户看 workbench.rhythm 太生硬。
     没登记的照原样显示，不影响导出。 */
  const LABELS = {
    'workbench.rhythm':  '作息',
    'workbench.chess':   '棋谱库',
    'workbench.shelf':   '收藏夹',
    'workbench.notes':   '随手记',
    'workbench.food':    '美食地图',
    'workbench.library': '藏书馆'
  };

  const label = k => LABELS[k] || k.replace(PREFIX, '');
  const $ = id => document.getElementById(id);

  /* ---------- localStorage ---------- */

  /** 扫出所有 workbench.* 的键值。值保持原始字符串，不解析，
      避免某个工具的数据坏了就整包导不出来。 */
  function scanLocal() {
    const out = {};
    let n = 0;
    try { n = localStorage.length; } catch { return out; }

    for (let i = 0; i < n; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(PREFIX)) continue;
      try {
        const raw = localStorage.getItem(k);
        // 存成解析后的对象，备份文件可读性好；解析不了就留原字符串
        try { out[k] = JSON.parse(raw); }
        catch { out[k] = raw; }
      } catch { /* 单个键读失败就跳过，别拖累整包 */ }
    }
    return out;
  }

  /** 数一数这份数据里有多少条，纯粹为了给用户一个交代 */
  function countLocal(v) {
    if (Array.isArray(v)) return v.length;
    if (v && typeof v === 'object') return Object.keys(v).length;
    return v == null ? 0 : 1;
  }

  /* ---------- IndexedDB ---------- */

  function idbOpen(name, version) {
    return new Promise((resolve, reject) => {
      const req = version ? indexedDB.open(name, version) : indexedDB.open(name);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('打不开 ' + name));
      req.onblocked = () => reject(new Error(
        `${name} 被其他标签页占用，把其他页面关掉再试`));
    });
  }

  function idbDelete(name) {
    return new Promise(resolve => {
      const req = indexedDB.deleteDatabase(name);
      req.onsuccess = req.onerror = req.onblocked = () => resolve();
    });
  }

  /** 列出可能存在的工作台数据库。能枚举就枚举，否则用已知清单探测。 */
  async function listDbNames() {
    if (indexedDB.databases) {
      try {
        const all = await indexedDB.databases();
        const names = all.map(d => d.name).filter(n => n && n.startsWith(PREFIX));
        if (names.length) return names;
      } catch { /* 枚举失败就走下面的清单 */ }
    }
    // 探测：open 一个不存在的库会把它建出来，所以建完发现是空的就删掉
    const found = [];
    for (const name of KNOWN_DBS) {
      try {
        const db = await idbOpen(name);
        const empty = db.objectStoreNames.length === 0;
        db.close();
        if (empty) indexedDB.deleteDatabase(name);
        else found.push(name);
      } catch { /* 探测失败就当没有 */ }
    }
    return found;
  }

  /** 连表结构一起导出：导入端才能在新设备上把库重建出来 */
  async function dumpDb(name) {
    const db = await idbOpen(name);
    const storeNames = Array.from(db.objectStoreNames);

    if (!storeNames.length) { db.close(); return null; }

    const stores = await Promise.all(storeNames.map(sn => new Promise((res, rej) => {
      const os = db.transaction([sn], 'readonly').objectStore(sn);
      const indexes = Array.from(os.indexNames).map(idxName => {
        const ix = os.index(idxName);
        return {
          name: ix.name, keyPath: ix.keyPath,
          unique: ix.unique, multiEntry: ix.multiEntry
        };
      });
      const r = os.getAll();
      r.onsuccess = () => res({
        name: sn,
        keyPath: os.keyPath,
        autoIncrement: os.autoIncrement,
        indexes,
        rows: r.result || []
      });
      r.onerror = () => rej(r.error);
    })));

    const out = { version: db.version, stores };
    db.close();
    return out;
  }

  /** 按备份里的结构建库。只在 onupgradeneeded 里能建表，所以单独走一趟。 */
  function createDb(name, version, stores) {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(name, version);
      req.onupgradeneeded = () => {
        const d = req.result;
        stores.forEach(s => {
          if (d.objectStoreNames.contains(s.name)) return;
          const os = d.createObjectStore(s.name, {
            keyPath: s.keyPath,
            autoIncrement: !!s.autoIncrement
          });
          (s.indexes || []).forEach(ix => {
            try {
              os.createIndex(ix.name, ix.keyPath, {
                unique: !!ix.unique, multiEntry: !!ix.multiEntry
              });
            } catch { /* 索引建不出来不影响数据本身 */ }
          });
        });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error(`${name} 被其他标签页占用`));
    });
  }

  /**
   * 写回一个数据库。
   *
   * ⛔ 建库时**必须用备份里的原始 version，不能 +1**。
   *
   * 踩过的坑（2026-09-14 修）：一开始为了建表方便写成 db.version + 1，
   * 于是新手机上库版本变成 2，而藏书馆的 db.js 里写死
   * `DB_VERSION = 1`、走 `indexedDB.open(name, 1)`，
   * 打开时直接 VersionError：requested version (1) < existing version (2)。
   * 表现是导入看着成功、藏书馆页面一进去就报「数据库打不开」。
   *
   * 所以：新手机上库不存在时，直接按 dump.version 建，版本对齐工具自己的期望。
   * 只有本机已有库、且缺表时才不得不升版本 —— 那种情况说明本机版本本来就
   * 比备份新，工具代码也会是新的，抬版本没风险。
   */
  async function restoreDb(name, dump, mode) {
    const want = dump.stores.map(s => s.name);
    const wantVer = dump.version || 1;

    let db = await idbOpen(name);

    // 探测性 open 会把不存在的库建成一个空壳（version 1、零张表）。
    // 这种情况按备份的版本重建，而不是在空壳上 +1。
    if (db.objectStoreNames.length === 0) {
      db.close();
      await idbDelete(name);
      db = await createDb(name, wantVer, dump.stores);
    } else if (want.some(sn => !db.objectStoreNames.contains(sn))) {
      // 本机已有库但缺表：只能升版本补表
      const nextVer = Math.max(db.version + 1, wantVer);
      db.close();
      db = await createDb(name, nextVer, dump.stores);
    }

    const writable = want.filter(sn => db.objectStoreNames.contains(sn));
    let wrote = 0;

    await new Promise((resolve, reject) => {
      const t = db.transaction(writable, 'readwrite');
      dump.stores.forEach(s => {
        if (!writable.includes(s.name)) return;
        const os = t.objectStore(s.name);
        // 替换模式先清空；合并模式直接 put，同主键覆盖
        if (mode === 'replace') os.clear();
        (s.rows || []).forEach(row => { os.put(row); wrote++; });
      });
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error || new Error('写入被中断'));
    });

    db.close();
    return wrote;
  }

  /* ---------- 清单 ---------- */

  let snapshot = { local: {}, idb: {} };

  async function scanAll() {
    snapshot.local = scanLocal();
    snapshot.idb = {};

    try {
      const names = await listDbNames();
      for (const n of names) {
        const d = await dumpDb(n);
        if (d) snapshot.idb[n] = d;
      }
    } catch (e) {
      console.warn('IndexedDB 扫描失败', e);
    }
    renderList();
  }

  function renderList() {
    const rows = [];

    Object.keys(snapshot.local).sort().forEach(k => {
      rows.push({ name: label(k), where: 'localStorage', n: countLocal(snapshot.local[k]) });
    });

    Object.keys(snapshot.idb).sort().forEach(k => {
      const d = snapshot.idb[k];
      const total = d.stores.reduce((a, s) => a + (s.rows || []).length, 0);
      const detail = d.stores
        .filter(s => (s.rows || []).length)
        .map(s => `${s.name} ${s.rows.length}`)
        .join(' · ');
      rows.push({ name: label(k), where: detail || 'IndexedDB', n: total });
    });

    const listEl = $('inv-list');
    const emptyEl = $('inv-empty');
    const total = rows.reduce((a, r) => a + r.n, 0);

    $('inv-count').textContent = rows.length
      ? `${rows.length} 项 · ${total} 条` : '';

    if (!rows.length) {
      listEl.innerHTML = '';
      emptyEl.hidden = false;
      $('export-all').disabled = true;
      return;
    }

    emptyEl.hidden = true;
    $('export-all').disabled = false;
    listEl.innerHTML = '';

    rows.forEach(r => {
      const li = document.createElement('li');
      li.className = 'inv-row';
      li.innerHTML = `
        <span class="inv-name"></span>
        <span class="inv-where"></span>
        <span class="inv-n"></span>`;
      li.querySelector('.inv-name').textContent = r.name;
      li.querySelector('.inv-where').textContent = r.where;
      li.querySelector('.inv-n').textContent = r.n ? `${r.n} 条` : '空';
      listEl.appendChild(li);
    });
  }

  /* ---------- 导出 ---------- */

  function exportAll() {
    const hasLocal = Object.keys(snapshot.local).length;
    const hasIdb = Object.keys(snapshot.idb).length;
    if (!hasLocal && !hasIdb) { alert('还没有任何数据可以导出'); return; }

    const payload = {
      format: FORMAT,
      version: VERSION,
      exportedAt: new Date().toISOString(),
      // 换设备排查问题时能看出是从哪个浏览器导的
      agent: navigator.userAgent,
      local: snapshot.local,
      idb: snapshot.idb
    };

    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `工作台全量备份-${stamp}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    setNote(`已导出 ${Object.keys(snapshot.local).length + Object.keys(snapshot.idb).length} 项。` +
      '存到网盘或发给自己，新手机上用下面的导入恢复。');
  }

  /* ---------- 导入 ---------- */

  function pickFile(onText) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const f = input.files && input.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => onText(reader.result);
      reader.onerror = () => alert('读取文件失败');
      reader.readAsText(f);
    };
    input.click();
  }

  async function importAll() {
    pickFile(async text => {
      let payload;
      try { payload = JSON.parse(text); }
      catch { alert('这个文件不是有效的备份文件'); return; }

      if (!payload || typeof payload !== 'object') {
        alert('这个文件不是有效的备份文件'); return;
      }

      // 单工具的备份文件（{tool, data}）请到对应工具页导，这里只认全量包
      if (payload.format !== FORMAT) {
        alert(payload.tool
          ? `这是「${payload.tool}」的单独备份，请到该工具页面里导入。`
          : '这不是工作台的全量备份文件。');
        return;
      }

      const local = (payload.local && typeof payload.local === 'object') ? payload.local : {};
      const idb = (payload.idb && typeof payload.idb === 'object') ? payload.idb : {};
      const items = Object.keys(local).length + Object.keys(idb).length;
      if (!items) { alert('备份文件里没有数据'); return; }

      const when = payload.exportedAt ? payload.exportedAt.slice(0, 10) : '未知日期';
      const mode = confirm(
        `备份来自 ${when}，包含 ${items} 项。\n\n` +
        '确定 = 合并（保留本机现有数据，同一条以备份为准）\n' +
        '取消 = 替换（清掉本机对应数据，完全用备份的）'
      ) ? 'merge' : 'replace';

      if (mode === 'replace' &&
          !confirm('替换会清掉本机这些工具的现有数据，确定继续？')) return;

      const done = [], failed = [];

      // localStorage：整个 key 就是一个工具的全部数据，
      // 没法逐条合并，两种模式都是整体覆盖
      Object.keys(local).forEach(k => {
        try {
          const v = local[k];
          localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
          done.push(label(k));
        } catch (e) {
          failed.push(`${label(k)}（${e && e.name === 'QuotaExceededError' ? '空间不足' : '写入失败'}）`);
        }
      });

      for (const name of Object.keys(idb)) {
        const d = idb[name];
        if (!d || !Array.isArray(d.stores)) { failed.push(label(name)); continue; }
        try {
          await restoreDb(name, d, mode);
          done.push(label(name));
        } catch (e) {
          failed.push(`${label(name)}（${e && e.message ? e.message : '写入失败'}）`);
        }
      }

      await scanAll();

      const lines = [
        `恢复完成：${done.length ? done.join('、') : '无'}`,
        failed.length ? `失败：${failed.join('、')}` : ''
      ].filter(Boolean);
      setNote(lines.join('　|　') + '　各工具页刷新后就能看到。');
      alert(lines.join('\n\n'));
    });
  }

  function setNote(t) {
    const el = $('io-note');
    el.textContent = t;
    el.hidden = !t;
  }

  /* ---------- 启动 ---------- */

  $('export-all').onclick = exportAll;
  $('import-all').onclick = importAll;
  $('rescan').onclick = () => { setNote(''); scanAll(); };

  scanAll();
})();
