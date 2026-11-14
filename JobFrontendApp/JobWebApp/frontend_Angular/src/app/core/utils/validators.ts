import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,15}$/;

export const PASSWORD_HINT =
  'Password must be 8-15 characters with an uppercase, a lowercase, a number and a special character.';

export const AppValidators = {
  email: Validators.pattern(EMAIL_PATTERN),
  strongPassword: Validators.pattern(PASSWORD_PATTERN),

  /** Required for strings (trimmed), arrays (non-empty) and other values. */
  notEmpty: ((control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const empty =
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim().length === 0) ||
      (Array.isArray(value) && value.length === 0);
    return empty ? { required: true } : null;
  }) as ValidatorFn,

  /** Group validator: `controlName` must equal `matchName`. Sets `mismatch` on the group. */
  match(controlName: string, matchName: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const a = group.get(controlName)?.value;
      const b = group.get(matchName)?.value;
      return a && b && a !== b ? { mismatch: true } : null;
    };
  },
};
