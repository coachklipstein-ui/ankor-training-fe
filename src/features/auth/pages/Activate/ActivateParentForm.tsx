import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import type TextField from '@mui/material/TextField';
import { useForm } from '../../../../lib/common/form/useForm';
import type { FormFieldConfig } from '../../../../lib/common/form/types';
import { TextFormField } from '../SignUp/TextFormField';
import type { ActivateParentFormData } from './activateFormConfig';

type TextFieldProps = React.ComponentProps<typeof TextField>;

type Props = {
  data: ActivateParentFormData;
  config: FormFieldConfig<ActivateParentFormData>;
  busy?: boolean;
  onSubmit: (data: ActivateParentFormData) => void;
};

export const ActivateParentForm = ({ data, config, busy = false, onSubmit }: Props) => {
  const { handleChange, handleBlur, state, validateForm } = useForm(data, config);

  const renderTextField = (field: keyof ActivateParentFormData, textFieldProps: TextFieldProps) => {
    return (
      <TextFormField
        field={field}
        config={config}
        state={state}
        onChange={(e) => handleChange(field, e.target.value)}
        onBlur={handleBlur(field)}
        {...textFieldProps}
        disabled={busy || Boolean(textFieldProps.disabled)}
      />
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;
    onSubmit(state.values);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: 2,
      }}
    >
      {renderTextField('firstName', {
        autoComplete: 'given-name',
        required: true,
        placeholder: 'Alex',
      })}

      {renderTextField('lastName', {
        autoComplete: 'family-name',
        required: true,
        placeholder: 'Rivera',
      })}

      {renderTextField('cellNumber', {
        type: 'tel',
        autoComplete: 'tel',
        required: true,
        placeholder: '555-222-3333',
        sx: { gridColumn: { sm: '1 / -1' } },
      })}

      {renderTextField('password', {
        type: 'password',
        autoComplete: 'new-password',
        required: true,
        placeholder: '••••••••',
      })}

      {renderTextField('confirmPassword', {
        type: 'password',
        autoComplete: 'new-password',
        required: true,
        placeholder: '••••••••',
      })}

      <Button
        sx={{ gridColumn: { sm: '1 / -1' } }}
        type="submit"
        fullWidth
        variant="contained"
        disabled={busy}
      >
        {busy ? 'Activating…' : 'Activate account'}
      </Button>
    </Box>
  );
};
