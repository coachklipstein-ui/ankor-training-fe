import { FieldValidator, FormData, FormFieldConfig, Nillable } from './types';

const EMAIL_RE = /\S+@\S+\.\S+/;
const PHONE_RE = /^\+?\d{7,}$/;

export const email =
  <TData extends FormData>(): FieldValidator<TData, string> =>
  (value: string, allValues: TData) => {
    if (!EMAIL_RE.test(value)) {
      return 'Please enter a valid email address.';
    }
    return null;
  };

export const emailWhenPresent =
  <TData extends FormData>(): FieldValidator<TData, Nillable<string>> =>
  (value, allValues, field, config) => {
    const trimmed = typeof value === 'string' ? value.trim() : '';
    if (!trimmed) return null;
    return email<TData>()(trimmed, allValues, field, config);
  };

export const notEqualToField =
  <TData extends FormData>(
    otherField: keyof TData,
    message: string,
    options?: { readonly caseInsensitive?: boolean },
  ): FieldValidator<TData, Nillable<string>> =>
  (value: Nillable<string>, allValues: TData) => {
    const trimmed = typeof value === 'string' ? value.trim() : '';
    if (!trimmed) return null;

    const other = String(allValues[otherField] ?? '').trim();
    if (!other) return null;

    const left = options?.caseInsensitive ? trimmed.toLowerCase() : trimmed;
    const right = options?.caseInsensitive ? other.toLowerCase() : other;

    if (left === right) return message;
    return null;
  };

export const phone =
  <TData extends FormData>(): FieldValidator<TData, Nillable<string>> =>
  (value: Nillable<string>, allValues: TData) => {
    if (!value || !PHONE_RE.test(value)) {
      return 'Please enter a valid phone number.';
    }
    return null;
  };

export const PASSWORD_MIN_LENGTH = 8;

export const passwordMinLength =
  <TData extends FormData>(
    minLength: number = PASSWORD_MIN_LENGTH,
  ): FieldValidator<TData, string> =>
  (value: string) => {
    if (value.length < minLength) {
      return `Password must be at least ${minLength} characters long.`;
    }
    return null;
  };

export const passwordMatch =
  <TData extends FormData>(checkField: keyof TData): FieldValidator<TData, string> =>
  (value: string, allValues: TData) => {
    if (value !== allValues[checkField]) {
      return 'Passwords do not match.';
    }
    return null;
  };

export const number =
  <TData extends FormData>(): FieldValidator<TData, string> =>
  (value: string, allValues: TData) => {
    if (Number.isNaN(Number(value))) {
      return 'Please enter a valid number.';
    }
    return null;
  };
