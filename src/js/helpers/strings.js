const trim = input => (typeof input === 'string' ? input.trim() : input)
const toString = input => input + ''
const isEmpty = arg => (Array.isArray(arg) ? arg.length === 0 : arg === '')

export { trim, toString, isEmpty }
