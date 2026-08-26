type Validator = (value: string) => boolean

const validators: Record<string, Validator> = {
  required: (v) => v.length > 0,
  email: (v) => /\S+@\S+\.\S+/.test(v),
  phone: (v) => /^1\d{10}$/.test(v)
}

export function validate(type: keyof typeof validators, value: string) {
  return validators[type](value)
}