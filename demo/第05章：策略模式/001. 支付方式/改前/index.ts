export function validate(type: string, value: string): boolean {
  if (type === "required") {
    return value.length > 0
  }

  if (type === "email") {
    return /\S+@\S+\.\S+/.test(value)
  }

  if (type === "phone") {
    return /^1\d{10}$/.test(value)
  }

  return false
}

export { }
