import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppTheme from '../theme/AppTheme';
import ColorModeSelect from '../theme/ColorModeSelect';
import MenuItem from '@mui/material/MenuItem';
import { signUp, makeAthleteInput, makeCoachInput } from '../services/signupService';
import { useNavigate } from 'react-router-dom';
import { listPositions, type Position } from '../../athletes/services/positionsService';
import { useFormValidation } from '../hooks/useFormValidation';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  maxWidth: 560,
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    maxWidth: 900,
  },
  maxHeight: '85dvh',
  overflowY: 'auto',
  scrollbarGutter: 'stable',
  [theme.breakpoints.up('md')]: {
    maxHeight: 'none',
    overflowY: 'visible',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage: 'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage: 'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

const PASSWORD_MIN_LENGTH = 8;
const EMAIL_RE = /\S+@\S+\.\S+/;
const PHONE_RE = /^\+?\d{7,}$/;

const FIELD_CONFIG = {
  typecode: {
    label: 'Type code',
    required: true,
  },
  email: {
    label: 'Email',
    required: true,
    validate: (v: string) => (!EMAIL_RE.test(v) ? 'Please enter a valid email address.' : null),
  },
  password: {
    label: 'Password',
    required: true,
    validate: (v: string) =>
      v.length < PASSWORD_MIN_LENGTH
        ? `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`
        : null,
  },
  confirmPassword: {
    label: 'Confirm password',
    required: true,
    validate: (_v: string, all: Record<string, string>) =>
      _v !== all.password ? 'Passwords do not match.' : null,
  },
  firstName: { label: 'First name', required: true },
  lastName: { label: 'Last name', required: true },
  cellNumber: {
    label: 'Cell number',
    required: true,
    validate: (v: string) => (!PHONE_RE.test(v) ? 'Please enter a valid phone number.' : null),
  },
} as const;

export default function SignUp(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  const [role, setRole] = React.useState<'athlete' | 'coach'>('athlete');
  const [positionError, setPositionError] = React.useState(false);
  const [positionErrorMessage, setPositionErrorMessage] = React.useState('');

  const form = useFormValidation(FIELD_CONFIG);

  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [graduationYear, setGraduationYear] = React.useState('');
  const [graduationYearError, setGraduationYearError] = React.useState('');

  // Positions
  const [positions, setPositions] = React.useState<Position[]>([]);
  const [positionsLoading, setPositionsLoading] = React.useState(false);
  const [positionsError, setPositionsError] = React.useState<string | null>(null);
  const [selectedPositionId, setSelectedPositionId] = React.useState('');

  const debugOrgId = (import.meta.env.VITE_DEBUG_ORG_ID as string | undefined)?.trim() || '';

  const positionsAuthHeaders = React.useMemo(() => {
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!anon) return {};
    return { apikey: anon, Authorization: `Bearer ${anon}` };
  }, []);

  React.useEffect(() => {
    if (role !== 'athlete') {
      setPositions([]);
      setPositionsError(null);
      setPositionsLoading(false);
      setSelectedPositionId('');
      setPositionError(false);
      setPositionErrorMessage('');
      return;
    }

    let active = true;
    const resolvedOrgId = debugOrgId;

    if (!resolvedOrgId) {
      setPositions([]);
      setPositionsError('Missing org_id for positions.');
      setPositionsLoading(false);
      return () => { active = false; };
    }

    setPositionsLoading(true);
    setPositionsError(null);

    listPositions({ orgId: resolvedOrgId, limit: 50, offset: 0 }, undefined, {
      requireAuth: false,
      headers: positionsAuthHeaders,
    })
      .then(({ items }) => { if (active) setPositions(items); })
      .catch((err: any) => {
        if (active) {
          setPositions([]);
          setPositionsError(err?.message || 'Failed to load positions.');
        }
      })
      .finally(() => { if (active) setPositionsLoading(false); });

    return () => { active = false; };
  }, [role, debugOrgId, positionsAuthHeaders]);

  const positionOptions = React.useMemo(
    () => [...positions].sort((a, b) => a.name.localeCompare(b.name)),
    [positions],
  );

  const positionHelperText = positionsError
    ? positionsError
    : positionsLoading
      ? 'Loading positions...'
      : positionOptions.length === 0
        ? 'No positions available.'
        : '';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.validate()) return;

    if (role === 'athlete' && !selectedPositionId.trim()) {
      setPositionError(true);
      setPositionErrorMessage('Position is required.');
      return;
    }
    setPositionError(false);
    setPositionErrorMessage('');

    if (role === 'athlete') {
      const year = Number(graduationYear);
      if (!graduationYear || Number.isNaN(year)) {
        setGraduationYearError('Graduation year is required.');
        return;
      }
      setGraduationYearError('');
    }

    const v = form.getValues();
    const username = v.email.includes('@') ? v.email.split('@')[0] : '';

    try {
      if (role === 'athlete') {
        const input = makeAthleteInput({
          joinCode: v.typecode,
          email: v.email,
          password: v.password,
          firstName: v.firstName,
          lastName: v.lastName,
          username,
          cellNumber: v.cellNumber,
          termsAccepted,
          graduationYear: Number(graduationYear),
          position_id: selectedPositionId,
        });
        await signUp(input);
      } else {
        const input = makeCoachInput({
          joinCode: v.typecode,
          email: v.email,
          password: v.password,
          firstName: v.firstName,
          lastName: v.lastName,
          username,
          cellNumber: v.cellNumber,
          termsAccepted,
        });
        await signUp(input);
      }
      navigate('/');
    } catch (err: any) {
      console.error('Signup error:', err);
      alert(err?.message || 'Signup failed');
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Create Account
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="typecode">TypeCode</FormLabel>
              <TextField
                name="typecode"
                id="typecode"
                value={form.values.typecode}
                onChange={form.handleChange('typecode')}
                onBlur={form.handleBlur('typecode')}
                error={!!form.errors.typecode}
                helperText={form.errors.typecode || ''}
                autoComplete="off"
                required
                fullWidth
                placeholder="BOU-LAX-2026A-COACH-1"
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="role">Role</FormLabel>
              <TextField
                id="role"
                name="role"
                select
                fullWidth
                value={role}
                onChange={(e) => setRole(e.target.value as 'athlete' | 'coach')}
              >
                <MenuItem value="athlete">Athlete</MenuItem>
                <MenuItem value="coach">Coach</MenuItem>
              </TextField>
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                name="email"
                id="email"
                value={form.values.email}
                onChange={form.handleChange('email')}
                onBlur={form.handleBlur('email')}
                error={!!form.errors.email}
                helperText={form.errors.email || ''}
                required
                fullWidth
                placeholder="your@email.com"
                autoComplete="email"
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                name="password"
                id="password"
                value={form.values.password}
                onChange={form.handleChange('password')}
                onBlur={form.handleBlur('password')}
                error={!!form.errors.password}
                helperText={form.errors.password || ''}
                required
                fullWidth
                placeholder="••••••"
                type="password"
                autoComplete="new-password"
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="confirmPassword">Confirm password</FormLabel>
              <TextField
                name="confirmPassword"
                id="confirmPassword"
                value={form.values.confirmPassword}
                onChange={form.handleChange('confirmPassword')}
                onBlur={form.handleBlur('confirmPassword')}
                error={!!form.errors.confirmPassword}
                helperText={form.errors.confirmPassword || ''}
                required
                fullWidth
                type="password"
                autoComplete="new-password"
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="firstName">First name</FormLabel>
              <TextField
                name="firstName"
                id="firstName"
                value={form.values.firstName}
                onChange={form.handleChange('firstName')}
                onBlur={form.handleBlur('firstName')}
                error={!!form.errors.firstName}
                helperText={form.errors.firstName || ''}
                autoComplete="given-name"
                required
                fullWidth
                placeholder="Jose"
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="lastName">Last name</FormLabel>
              <TextField
                name="lastName"
                id="lastName"
                value={form.values.lastName}
                onChange={form.handleChange('lastName')}
                onBlur={form.handleBlur('lastName')}
                error={!!form.errors.lastName}
                helperText={form.errors.lastName || ''}
                autoComplete="family-name"
                required
                fullWidth
                placeholder="Cruz"
              />
            </FormControl>

            {role === 'athlete' && (
              <>
                <FormControl>
                  <FormLabel htmlFor="graduationYear">Graduation year</FormLabel>
                  <TextField
                    type="number"
                    name="graduationYear"
                    id="graduationYear"
                    fullWidth
                    placeholder="2026"
                    value={graduationYear}
                    onChange={(e) => {
                      setGraduationYear(e.target.value);
                      if (graduationYearError) setGraduationYearError('');
                    }}
                    error={!!graduationYearError}
                    helperText={graduationYearError}
                    inputProps={{ min: 1900, max: 2100 }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor="position_id">Position</FormLabel>
                  <TextField
                    id="position_id"
                    name="position_id"
                    select
                    fullWidth
                    required
                    value={selectedPositionId}
                    onChange={(e) => {
                      setSelectedPositionId(e.target.value);
                      if (positionError) {
                        setPositionError(false);
                        setPositionErrorMessage('');
                      }
                    }}
                    error={positionError || Boolean(positionsError)}
                    helperText={positionErrorMessage || positionHelperText}
                    disabled={positionsLoading}
                  >
                    <MenuItem value="">Select position</MenuItem>
                    {positionOptions.map((pos) => (
                      <MenuItem key={pos.id} value={pos.id}>
                        {pos.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormControl>
              </>
            )}

            <FormControl>
              <FormLabel htmlFor="cellNumber">Cell number</FormLabel>
              <TextField
                name="cellNumber"
                id="cellNumber"
                value={form.values.cellNumber}
                onChange={form.handleChange('cellNumber')}
                onBlur={form.handleBlur('cellNumber')}
                error={!!form.errors.cellNumber}
                helperText={form.errors.cellNumber || ''}
                type="tel"
                autoComplete="tel"
                required
                fullWidth
                placeholder="555-222-3333"
              />
            </FormControl>

            <FormControlLabel
              sx={{ gridColumn: { sm: '1 / -1' } }}
              control={
                <Checkbox
                  name="termsAccepted"
                  color="primary"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
              }
              label="I agree to the Terms of Service and Privacy Policy."
            />

            <Button
              sx={{ gridColumn: { sm: '1 / -1' } }}
              type="submit"
              fullWidth
              variant="contained"
            >
              Sign up
            </Button>
          </Box>
          <Typography sx={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <Link
              component="button"
              type="button"
              onClick={() => navigate('/sign-in')}
              variant="body2"
              sx={{ alignSelf: 'center' }}
            >
              Sign In
            </Link>
          </Typography>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}
