// Native constraint validation messages in Spanish (es-AR).
// The document already declares lang="es-AR", but browsers still report their
// own built-in messages in English; this module swaps them for Spanish ones
// without touching the rest of the app.

export const SPANISH_VALIDATION = {
  valueMissing: 'Completá este campo.',
  typeMismatch: 'Revisá el formato de este campo.',
  rangeUnderflow: 'Este valor es demasiado bajo.',
  rangeOverflow: 'Este valor es demasiado alto.',
  patternMismatch: 'Este valor no tiene el formato esperado.',
  tooLong: 'Este texto es demasiado largo.',
  customError: 'Revisá este campo.',
}

// Order in which the field states are checked. customError is checked last:
// applying our own message flips validity.customError on, so resolving it last
// keeps the message identical across validation passes. States without an
// entry (badInput, tooShort) fall through to that same customError text for
// the same reason.
const STATE_ORDER = ['valueMissing','typeMismatch','rangeUnderflow','rangeOverflow','patternMismatch','tooLong']

function messageFor(el) {
  const validity = el.validity
  // The app's own custom message (data-error-msg) wins: never overwrite it.
  if (validity.customError && el.dataset.errorMsg) return el.dataset.errorMsg
  for (const state of STATE_ORDER) {
    if (validity[state]) return SPANISH_VALIDATION[state]
  }
  return SPANISH_VALIDATION.customError
}

function reportFirstInvalid(el) {
  const form = el.form
  if (!form) return el.reportValidity()
  const first = Array.from(form.elements).find(control => control.willValidate && !control.validity.valid)
  if (first === el) el.reportValidity()
}

function applyInvalid(el, event) {
  const message = messageFor(el)
  // Second pass (triggered by the reportFirstInvalid call below): the field
  // already carries the Spanish message, so don't cancel — the browser then
  // displays it, while the first pass had suppressed the English bubble.
  if (el.validationMessage === message) return
  event.preventDefault()
  el.setCustomValidity(message)
  reportFirstInvalid(el)
}

export function applySpanishValidity(form) {
  const fields = form?.querySelectorAll('input, textarea, select')
  if (!fields) return
  fields.forEach(el => {
    if (!('validity' in el) || el.dataset.esValidity === '1') return
    el.addEventListener('invalid', event => applyInvalid(el, event))
    const clearMessage = () => el.setCustomValidity('')
    el.addEventListener('input', clearMessage)
    el.addEventListener('change', clearMessage)
    el.dataset.esValidity = '1'
  })
}
