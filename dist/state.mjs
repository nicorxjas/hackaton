const UI_KEY = 'trexo-ui-v1'
const UI_KEYS = ['role', 'page', 'filter', 'query', 'searchOpen']

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key)
}

// Serializes a value as a double-quoted CSS string so attribute selectors stay valid.
function cssStr(value) {
  const escaped = String(value).replace(/[\\"\u0000-\u001F\u007F]/g, ch => {
    if (ch === '\\') return '\\\\'
    if (ch === '"') return '\\"'
    return '\\' + ch.charCodeAt(0).toString(16) + ' '
  })
  return '"' + escaped + '"'
}

// Stable selector for the element that had focus: id, then name, then
// data-action+data-id, then aria-label. Empty string when none applies.
function focusSelector(element) {
  if (element.id) return '[id=' + cssStr(element.id) + ']'
  if (element.name) return '[name=' + cssStr(element.name) + ']'
  const get = typeof element.getAttribute === 'function'
    ? name => element.getAttribute(name)
    : () => null
  const action = get('data-action')
  const itemId = get('data-id')
  if (action && itemId) return '[data-action=' + cssStr(action) + '][data-id=' + cssStr(itemId) + ']'
  const label = get('aria-label')
  if (label) return '[aria-label=' + cssStr(label) + ']'
  return ''
}

function isTextEntry(element) {
  return element.tagName === 'INPUT' || element.tagName === 'TEXTAREA'
}

// Merges the saved UI preferences over the given defaults. Only keys present in
// defaults are considered; anything malformed in storage falls back to defaults.
export function loadUi(defaults) {
  const merged = isPlainObject(defaults) ? { ...defaults } : {}
  try {
    const raw = localStorage.getItem(UI_KEY)
    if (!raw) return merged
    const saved = JSON.parse(raw)
    if (!isPlainObject(saved)) return merged
    for (const key of Object.keys(merged)) {
      if (hasOwn(saved, key)) merged[key] = saved[key]
    }
    return merged
  } catch {
    return merged
  }
}

// Persists only the known UI keys; storage failures are ignored on purpose.
export function saveUi(ui) {
  try {
    const out = {}
    if (isPlainObject(ui)) {
      for (const key of UI_KEYS) {
        if (hasOwn(ui, key)) out[key] = ui[key]
      }
    }
    localStorage.setItem(UI_KEY, JSON.stringify(out))
  } catch {
    // The demo keeps working even when storage is unavailable.
  }
}

// Runs renderFn and restores focus plus text selection afterwards when the
// previously focused element (or its equivalent) is still in the document.
export function preserveFocus(renderFn) {
  if (typeof document === 'undefined') {
    renderFn()
    return
  }
  const active = document.activeElement
  const tracked = active && active !== document.body && active !== document.documentElement && active.tagName
    ? active
    : null
  const selector = tracked ? focusSelector(tracked) : ''
  let start = null
  let end = null
  let keepSelection = false
  if (tracked && isTextEntry(tracked)) {
    try {
      const selectionStart = tracked.selectionStart
      const selectionEnd = tracked.selectionEnd
      if (typeof selectionStart === 'number' && typeof selectionEnd === 'number') {
        start = selectionStart
        end = selectionEnd
        keepSelection = true
      }
    } catch {
      // Input types without a selection API simply skip selection restore.
    }
  }
  renderFn()
  if (!selector) return
  let target = null
  try {
    target = document.querySelector(selector)
  } catch {
    return
  }
  if (!target || !document.contains(target)) return
  target.focus()
  if (keepSelection && typeof target.setSelectionRange === 'function') {
    try {
      target.setSelectionRange(start, end)
    } catch {
      // Selection restore is best effort; focus is already back in place.
    }
  }
}

export { UI_KEY, UI_KEYS }
