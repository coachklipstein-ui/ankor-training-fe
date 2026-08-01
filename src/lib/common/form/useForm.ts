import React, { useEffect } from 'react';
import { FormData, FormFieldConfig, FormState } from './types';
import { pipeValidators } from './validationCommon';

export const useForm = <TData extends FormData>(data: TData, config: FormFieldConfig<TData>) => {
  const [state, setState] = React.useState<FormState<TData>>({
    values: data,
    errors: {},
    touched: {},
  });

  const { validateField, validateForm } = useFormValidation(state, setState, config);

  const setTouched = (field: keyof TData, touched: boolean) => {
    setState((prev) => ({ ...prev, touched: { ...prev.touched, [field]: touched } }));
  };

  const setValue = (field: keyof TData, value: TData[keyof TData]) => {
    setState((prev) => ({ ...prev, values: { ...prev.values, [field]: value } }));
  };

  useEffect(() => {
    setState((prev) => ({ ...prev, values: data }));
  }, [data]);

  const handleChange = (name: keyof TData, value: TData[keyof TData]) => {
    setValue(name, value);
    if (state.touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (field: keyof TData) => () => {
    setTouched(field, true);
    validateField(field, state.values[field]);
  };

  return { state, handleChange, handleBlur, validateForm, validateField };
};

const useFormValidation = <TData extends FormData>(
  state: FormState<TData>,
  setState: React.Dispatch<React.SetStateAction<FormState<TData>>>,
  config: FormFieldConfig<TData>,
) => {
  const setError = (field: keyof TData, error: string) => {
    setState((prev) => ({ ...prev, errors: { ...prev.errors, [field]: error } }));
  };

  const clearError = (field: keyof TData) => {
    setState((prev) => ({ ...prev, errors: { ...prev.errors, [field]: undefined } }));
  };

  const validateField = (field: keyof TData, value: TData[keyof TData]): boolean => {
    const definition = config[field];
    if (!definition) return true;

    if (definition.validators) {
      var message = pipeValidators(definition.validators)(value, state.values, field, config);
      if (message) {
        setError(field, message);
        return false;
      }
    }

    clearError(field);
    return true;
  };

  const validateForm = (): boolean => {
    var fields = Object.keys(config) as (keyof TData)[];
    let hasErrors = false;
    fields.forEach((field) => {
      if (!validateField(field, state.values[field])) {
        hasErrors = true;
      }
    });

    return !hasErrors;
  };

  return { validateField, validateForm };
};
