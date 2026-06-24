// Mirrors the web FormValidation rules so client-side checks match the backend.

const EMAIL_RE = /^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/;
// 8-15 chars, at least one lower, upper, digit and special char.
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,15}$/;

export const validateField = (name, value) => {
  switch (name) {
    case 'name':
      return value?.trim() ? '' : 'Name is required';
    case 'email':
      if (!value?.trim()) return 'Email is required';
      return EMAIL_RE.test(value) ? '' : 'Enter a valid email';
    case 'password':
      if (!value) return 'Password is required';
      return PASSWORD_RE.test(value)
        ? ''
        : 'Password must be 8-15 chars with upper, lower, digit & special character';
    default:
      return '';
  }
};

export const validateSignup = ({ name, email, password, confirmPassword }) => {
  const errors = {};
  ['name', 'email', 'password'].forEach((f) => {
    const msg = validateField(f, { name, email, password }[f]);
    if (msg) errors[f] = msg;
  });
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
};

export const validateLogin = ({ email, password }) => {
  const errors = {};
  if (!email?.trim()) errors.email = 'Email is required';
  if (!password) errors.password = 'Password is required';
  return errors;
};
