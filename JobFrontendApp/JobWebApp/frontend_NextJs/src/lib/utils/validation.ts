export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,15}$/;
export const PASSWORD_HINT =
  'Password must be 8-15 characters with an uppercase, a lowercase, a number and a special character.';

/** Same rules as the React app's FormValidation.tsx. Returns '' when valid. */
export function signupValidation(name: string, value: string): string {
  switch (name) {
    case 'name':
      return value.trim() ? '' : 'Name is required.';
    case 'email':
      if (!value) return 'Email is required.';
      return EMAIL_PATTERN.test(value) ? '' : 'Email is invalid.';
    case 'password':
      if (!value) return 'Password is required.';
      return PASSWORD_PATTERN.test(value) ? '' : PASSWORD_HINT;
    default:
      return '';
  }
}

export function loginValidation(name: string, value: string): string {
  if (name === 'email') return value ? '' : 'Email is required.';
  if (name === 'password') return value ? '' : 'Password is required.';
  return '';
}
