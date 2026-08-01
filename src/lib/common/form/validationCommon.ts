import { FieldValidator, FormData, FormFieldConfig, Nillable } from './types';

export const pipeValidators = <TData extends FormData, TValue>(
  validators: FieldValidator<TData, TValue>[],
): FieldValidator<TData, TValue> => {
  return (value: TValue, allValues: TData, field: keyof TData, config: FormFieldConfig<TData>) => {
    for (const validator of validators) {
      const result = validator(value, allValues, field, config);
      if (result !== null) {
        return result;
      }
    }
    return null;
  };
};

const getFieldRequiredErrorMessage = (label: string) => `${label} is required.`;

export const required =
  <TData extends FormData>(
    considerZeroAsEmpty: boolean = false,
  ): FieldValidator<TData, Nillable<unknown>> =>
  (
    value: Nillable<unknown>,
    allValues: TData,
    field: keyof TData,
    config: FormFieldConfig<TData>,
  ) => {
    if (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (typeof value === 'boolean' && !value) ||
      (considerZeroAsEmpty && typeof value === 'number' && value === 0)
    ) {
      return getFieldRequiredErrorMessage(config[field].label);
    }
    return null;
  };
