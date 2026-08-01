import type { FormFieldConfig } from '../../../../lib/common/form/types';
import type { AthleteSignUpFormData } from './signUpFormConfig';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { useForm } from '../../../../lib/common/form/useForm';
import { makeAthleteInput, type AthleteSignUp, type Role } from '../../services/signupService';
import { RoleField } from './RoleField';
import { TextFormField } from './TextFormField';
import { usePositions } from './usePositions';

type Props = {
  data: AthleteSignUpFormData;
  config: FormFieldConfig<AthleteSignUpFormData>;
  onSubmit: (data: AthleteSignUp) => void;
  onChangeRole: (role: Role, data: AthleteSignUpFormData) => void;
};

type TextFieldProps = React.ComponentProps<typeof TextField>;

const getSafeNumberValue = (value: string) => {
  const numValue = Number(value);
  return Number.isNaN(numValue) ? 0 : numValue;
};

export const AthleteSignUpForm = ({ data, config, onSubmit, onChangeRole }: Props) => {
  const { handleChange, handleBlur, state, validateForm } = useForm(data, config);
  const { positionHelperText, positionOptions, positionsLoading } = usePositions();

  const renderTextField = (field: keyof AthleteSignUpFormData, textFieldProps: TextFieldProps) => {
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

    const input = makeAthleteInput({
      joinCode: state.values.joinCode,
      email: state.values.email,
      password: state.values.password,
      firstName: state.values.firstName,
      lastName: state.values.lastName,
      username: username,
      cellNumber: state.values.cellNumber,
      termsAccepted: state.values.termsAccepted,
      graduationYear: getSafeNumberValue(state.values.graduationYear),
      position_id: state.values.position_id,
      parentEmail: state.values.parentEmail.trim() || null,
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

      <RoleField role={'athlete'} onChangeRole={(role) => onChangeRole(role, state.values)} />

      {renderTextField('email', {
        autoComplete: 'email',
        required: true,
        placeholder: 'your@email.com',
      })}

      {renderTextField('parentEmail', {
        autoComplete: 'email',
        placeholder: 'parent@email.com',
        helperText: state.errors.parentEmail || 'Optional',
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

      {renderTextField('graduationYear', {
        type: 'number',
        required: true,
        placeholder: '2026',
        inputProps: { min: 1900, max: 2100 },
      })}

      <TextFormField
        field="position_id"
        config={config}
        state={state}
        onChange={(e) => handleChange('position_id', e.target.value)}
        onBlur={handleBlur('position_id')}
        select
        required
        helperText={state.errors.position_id || positionHelperText}
        disabled={positionsLoading}
      >
        <MenuItem value="">Select position</MenuItem>
        {positionOptions.map((pos) => (
          <MenuItem key={pos.value} value={pos.value}>
            {pos.label}
          </MenuItem>
        ))}
      </TextFormField>

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
