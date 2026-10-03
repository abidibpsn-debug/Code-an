(function () {
  // Dev-only shim: the Blink preview renders the popup in a plain iframe where
  // the chrome.* extension APIs do not exist. No-op when they do (real install).
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) return

  var store = {}
  window.chrome = {
    runtime: {
      id: undefined,
      sendMessage: function (_msg, cb) { var r = { ok: false, status: 0, data: null }; if (cb) cb(r); return Promise.resolve(r) },
      onMessage: { addListener: function () {} },
    },
    storage: {
      local: {
        // Callback AND promise form, like real MV3 — popup code that awaits
        // chrome.storage would otherwise throw "cb is not a function" here.
        get: function (keys, cb) { var r = typeof keys === 'string' ? { [keys]: store[keys] } : store; if (cb) cb(r); return Promise.resolve(r) },
        set: function (items, cb) { Object.assign(store, items); if (cb) cb(); return Promise.resolve() },
        remove: function (keys, cb) { (typeof keys === 'string' ? [keys] : keys).forEach(function (k) { delete store[k] }); if (cb) cb(); return Promise.resolve() },
        clear: function (cb) { Object.keys(store).forEach(function (k) { delete store[k] }); if (cb) cb(); return Promise.resolve() },
      },
    },
    // Returns one stub tab, not []: popup code universally destructures
    // `const [tab] = await chrome.tabs.query(...)` then reads tab.url.
    tabs: {
      query: function (_q, cb) {
        var t = [{ id: 1, url: 'https://example.com', title: 'Preview tab', active: true, windowId: 1 }]
        if (cb) cb(t); return Promise.resolve(t)
      },
      sendMessage: function (_id, _m, cb) { if (cb) cb(undefined); return Promise.resolve(undefined) },
    },
  }
})()
