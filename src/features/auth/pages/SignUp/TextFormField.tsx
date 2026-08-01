import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import { FormData, FormFieldConfig, FormState } from '../../../../lib/common/form/types';

type TextFieldProps = React.ComponentProps<typeof TextField>;

type Props<TData extends FormData> = {
  field: keyof TData;
  config: FormFieldConfig<TData>;
  state: FormState<TData>;
} & Omit<TextFieldProps, 'name' | 'id' | 'value' | 'error'>;

export const TextFormField = <TData extends FormData>({
  field,
  config,
  state,
  ...props
}: Props<TData>) => {
  var fieldName = field.toString();

  return (
    <FormControl>
      <FormLabel htmlFor={fieldName}>{config[field].label}</FormLabel>
      <TextField
        name={fieldName}
        id={fieldName}
        value={state.values[field]}
        error={!!state.errors[field]}
        helperText={state.errors[field] || props.helperText}
        fullWidth
        {...props}
      />
    </FormControl>
  );
};
