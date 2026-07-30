import * as React from 'react';

export type FieldValidator = (
  value: string,
  allValues: Record<string, string>,
) => string | null;

export type FieldDef = {
  label: string;
  required?: boolean;
  validate?: FieldValidator;
};

export type FieldConfig = Record<string, FieldDef>;

export function useFormValidation<T extends FieldConfig>(config: T) {
  const fieldNames = Object.keys(config);

  const initialValues = React.useMemo(
    () => Object.fromEntries(fieldNames.map((n) => [n, ''])) as Record<string, string>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const formRef = React.useRef<HTMLFormElement>(null);

  const [values, setValues] = React.useState<Record<string, string>>(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const setValue = React.useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setError = React.useCallback((name: string, msg: string) => {
    setErrors((prev) => ({ ...prev, [name]: msg }));
  }, []);

  const clearError = React.useCallback((name: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const validateField = React.useCallback(
    (name: string) => {
      const def = config[name];
      if (!def) return;

      const value = values[name] ?? '';

      if (def.required && !value.trim()) {
        setError(name, `${def.label} is required.`);
        return;
      }

      if (def.validate) {
        const msg = def.validate(value, values);
        if (msg) {
          setError(name, msg);
          return;
        }
      }

      clearError(name);
    },
    [config, values, setError, clearError],
  );

  const validateAll = React.useCallback((): boolean => {
    let valid = true;
    const newErrors: Record<string, string> = {};

    for (const name of fieldNames) {
      const def = config[name];
      const value = values[name] ?? '';

      if (def.required && !value.trim()) {
        newErrors[name] = `${def.label} is required.`;
        valid = false;
        continue;
      }

      if (def.validate) {
        const msg = def.validate(value, values);
        if (msg) {
          newErrors[name] = msg;
          valid = false;
        }
      }
    }

    setErrors(newErrors);
    return valid;
  }, [config, fieldNames, values]);

  const handleChange = React.useCallback(
    (name: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(name, e.target.value);
      if (touched[name]) {
        // Re-validate on change if already touched
        const def = config[name];
        if (!def) return;
        const value = e.target.value;
        if (def.required && !value.trim()) {
          setError(name, `${def.label} is required.`);
        } else if (def.validate) {
          const msg = def.validate(value, { ...values, [name]: value });
          if (msg) setError(name, msg);
          else clearError(name);
        } else {
          clearError(name);
        }
      }
    },
    [config, values, touched, setValue, setError, clearError],
  );

  const handleBlur = React.useCallback(
    (name: string) => () => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      validateField(name);
    },
    [validateField],
  );

  const getValues = React.useCallback(() => values, [values]);

  const setFieldValue = React.useCallback(
    (name: string, value: string) => {
      setValue(name, value);
    },
    [setValue],
  );

  return {
    formRef,
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate: validateAll,
    validateField,
    getValues,
    setFieldValue,
    setErrors,
    clearError,
  };
}
