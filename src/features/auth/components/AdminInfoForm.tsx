import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import OutlinedInput from '@mui/material/OutlinedInput';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const FormGrid = styled(Grid)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

type FormState = {
  values: Record<string, string>;
  errors: Record<string, string>;
  handleChange: (name: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleBlur: (name: string) => () => void;
};

type Props = {
  form: FormState;
};

export default function AdminInfoForm({ form }: Props) {
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;

  return (
    <Grid container spacing={3}>
      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="adminFirstName" required>Admin First</FormLabel>
        <OutlinedInput
          id="adminFirstName"
          name="adminFirstName"
          value={form.values.adminFirstName}
          onChange={form.handleChange('adminFirstName')}
          onBlur={form.handleBlur('adminFirstName')}
          error={!!form.errors.adminFirstName}
          type="text"
          placeholder="John"
          autoComplete="given-name"
          required
          size="small"
        />
      </FormGrid>

      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="adminLastName" required>Admin Last</FormLabel>
        <OutlinedInput
          id="adminLastName"
          name="adminLastName"
          value={form.values.adminLastName}
          onChange={form.handleChange('adminLastName')}
          onBlur={form.handleBlur('adminLastName')}
          error={!!form.errors.adminLastName}
          type="text"
          placeholder="Doe"
          autoComplete="family-name"
          required
          size="small"
        />
      </FormGrid>

      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="adminEmail" required>Admin Email</FormLabel>
        <OutlinedInput
          id="adminEmail"
          name="adminEmail"
          value={form.values.adminEmail}
          onChange={form.handleChange('adminEmail')}
          onBlur={form.handleBlur('adminEmail')}
          error={!!form.errors.adminEmail}
          type="email"
          placeholder="admin@ankorapp.com"
          autoComplete="email"
          required
          size="small"
        />
      </FormGrid>

      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="adminPhoneNumber" required>Admin Phone Number</FormLabel>
        <OutlinedInput
          id="adminPhoneNumber"
          name="adminPhoneNumber"
          value={form.values.adminPhoneNumber}
          onChange={form.handleChange('adminPhoneNumber')}
          onBlur={form.handleBlur('adminPhoneNumber')}
          error={!!form.errors.adminPhoneNumber}
          type="tel"
          placeholder="+1 555 555 5555"
          autoComplete="tel"
          required
          size="small"
        />
      </FormGrid>

      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="adminPassword" required>Password</FormLabel>
        <OutlinedInput
          id="adminPassword"
          name="adminPassword"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            form.handleChange('adminPassword')(e);
          }}
          onBlur={form.handleBlur('adminPassword')}
          error={!!form.errors.adminPassword}
          type={showPw ? 'text' : 'password'}
          placeholder="Create a password"
          autoComplete="new-password"
          required
          size="small"
          inputProps={{ minLength: 8 }}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label={showPw ? 'Hide password' : 'Show password'}
                onClick={() => setShowPw((s) => !s)}
                edge="end"
                size="small"
              >
                {showPw ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
        />
        <FormHelperText>At least 8 characters.</FormHelperText>
      </FormGrid>

      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="adminPasswordConfirm" required>Confirm Password</FormLabel>
        <OutlinedInput
          id="adminPasswordConfirm"
          name="adminPasswordConfirm"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            form.handleChange('adminPasswordConfirm')(e);
          }}
          onBlur={form.handleBlur('adminPasswordConfirm')}
          error={mismatch || !!form.errors.adminPasswordConfirm}
          type={showConfirm ? 'text' : 'password'}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          required
          size="small"
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                onClick={() => setShowConfirm((s) => !s)}
                edge="end"
                size="small"
              >
                {showConfirm ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
        />
        {mismatch && <FormHelperText error>Passwords do not match.</FormHelperText>}
      </FormGrid>

      <FormGrid size={{ xs: 12 }}>
        <FormControl>
          <FormLabel id="gender-label" required>Gender</FormLabel>
          <RadioGroup row aria-labelledby="gender-label" name="gender" defaultValue="coed">
            <FormControlLabel value="girls" control={<Radio />} label="Girls" />
            <FormControlLabel value="boys" control={<Radio />} label="Boys" />
            <FormControlLabel value="coed" control={<Radio />} label="Coed" />
          </RadioGroup>
        </FormControl>
      </FormGrid>
    </Grid>
  );
}
