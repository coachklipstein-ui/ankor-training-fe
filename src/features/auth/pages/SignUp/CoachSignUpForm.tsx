import { FormFieldConfig } from '../../../../lib/common/form/types';
import { CoachSignUpFormData } from './signUpFormConfig';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import { useForm } from '../../../../lib/common/form/useForm';
import { CoachSignUp, makeCoachInput, Role } from '../../services/signupService';
import { RoleField } from './RoleField';
import { TextFormField } from './TextFormField';

type Props = {
  data: CoachSignUpFormData;
  config: FormFieldConfig<CoachSignUpFormData>;
  onSubmit: (data: CoachSignUp) => void;
  onChangeRole: (role: Role, data: CoachSignUpFormData) => void;
};

type TextFieldProps = React.ComponentProps<typeof TextField>;

export const CoachSignUpForm = ({ data, config, onSubmit, onChangeRole }: Props) => {
  const { handleChange, handleBlur, state, validateForm } = useForm(data, config);

  const renderTextField = (field: keyof CoachSignUpFormData, textFieldProps: TextFieldProps) => {
    return (
      <TextFormField
        field={field}
        config={config}
        state={state}
        onChange={(e) => handleChange(field, e.target.value)}
        onBlur={handleBlur(field)}
        {...textFieldProps}
      />
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    const username = state.values.email.includes('@') ? state.values.email.split('@')[0] : '';

    const input = makeCoachInput({
      joinCode: state.values.joinCode,
      email: state.values.email,
      password: state.values.password,
      firstName: state.values.firstName,
      lastName: state.values.lastName,
      username: username,
      cellNumber: state.values.cellNumber,
      termsAccepted: state.values.termsAccepted,
    });

    onSubmit(input);
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
      {renderTextField('joinCode', {
        autoComplete: 'off',
        required: true,
        placeholder: 'BOU-LAX-2026A-COACH-1',
      })}

      <RoleField role={'coach'} onChangeRole={(role) => onChangeRole(role, state.values)} />

      {renderTextField('email', {
        autoComplete: 'email',
        required: true,
        placeholder: 'your@email.com',
      })}

      {renderTextField('password', {
        type: 'password',
        autoComplete: 'new-password',
        required: true,
        placeholder: '••••••',
      })}

      {renderTextField('confirmPassword', {
        type: 'password',
        autoComplete: 'new-password',
        required: true,
        placeholder: '••••••',
      })}

      {renderTextField('firstName', {
        autoComplete: 'given-name',
        required: true,
        placeholder: 'Jose',
      })}

      {renderTextField('lastName', {
        autoComplete: 'family-name',
        required: true,
        placeholder: 'Cruz',
      })}

      {renderTextField('cellNumber', {
        type: 'tel',
        autoComplete: 'tel',
        required: true,
        placeholder: '555-222-3333',
      })}

      <FormControlLabel
        sx={{ gridColumn: { sm: '1 / -1' } }}
        control={
          <Checkbox
            name="termsAccepted"
            color="primary"
            required
            checked={state.values.termsAccepted}
            onChange={(e) => handleChange('termsAccepted', e.target.checked)}
          />
        }
        label="I agree to the Terms of Service and Privacy Policy."
      />

      <Button sx={{ gridColumn: { sm: '1 / -1' } }} type="submit" fullWidth variant="contained">
        Sign up
      </Button>
    </Box>
  );
};
