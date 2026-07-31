export type FormData = Record<string, string | number | boolean | null | undefined>;

export type Nillable<T> = T | null | undefined;

export type FormErrors<TData extends FormData> = Partial<Record<keyof TData, string>>;

export type FormState<TData extends FormData> = {
  values: TData;
  errors: FormErrors<TData>;
  touched: Partial<Record<keyof TData, boolean>>;
};

export type FormFieldEvents<TData extends FormData> = {
  onChange: (
    name: keyof TData,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: (name: keyof TData) => () => void;
};

export type FieldValidator<TData extends FormData, TValue> = (
  value: TValue,
  allValues: TData,
  field: keyof TData,
  config: FormFieldConfig<TData>,
) => string | null;

export type FormFieldOption = {
  label: string;
  value: string;
};

export type FormFieldDefinition<TData extends FormData, K extends keyof TData> = {
  label: string;
  required?: boolean;
  validators?: FieldValidator<TData, TData[K]>[];
  options?: FormFieldOption[];
};

export type FormFieldConfig<TData extends FormData> = {
  [K in keyof TData]-?: FormFieldDefinition<TData, K>;
};
