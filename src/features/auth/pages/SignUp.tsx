import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppTheme from '../theme/AppTheme';
import ColorModeSelect from '../theme/ColorModeSelect';
import { signUp, CoachSignUp, AthleteSignUp } from '../services/signupService';
import { useNavigate } from 'react-router-dom';
import {
  ATHLETE_FIELD_CONFIG,
  AthleteSignUpFormData,
  COACH_FIELD_CONFIG,
  CoachSignUpFormData,
  getEmptyAthleteSignUpFormData,
  getEmptyCoachSignUpFormData,
} from './SignUp/signUpFormConfig';
import { AthleteSignUpForm } from './SignUp/AthleteSignUpForm';
import { CoachSignUpForm } from './SignUp/CoachSignUpForm';

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

export default function SignUp(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  const [role, setRole] = React.useState<'athlete' | 'coach'>('athlete');
  const [athleteFormData, setAthleteFormData] = React.useState(getEmptyAthleteSignUpFormData());
  const [coachFormData, setCoachFormData] = React.useState(getEmptyCoachSignUpFormData());

  const handleSubmit = async (input: AthleteSignUp | CoachSignUp) => {
    try {
      await signUp(input);
      navigate('/');
    } catch (err: any) {
      console.error('Signup error:', err);
      alert(err?.message || 'Signup failed');
    }
  };

  const handleChangeRole = (
    role: 'athlete' | 'coach',
    data: AthleteSignUpFormData | CoachSignUpFormData,
  ) => {
    setRole(role);
    // sync form data
    if (role === 'athlete') {
      setAthleteFormData((prev) => ({
        ...prev,
        ...data,
      }));
    } else {
      setCoachFormData((prev) => ({
        ...prev,
        ...data,
      }));
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

          {role === 'athlete' ? (
            <AthleteSignUpForm
              data={athleteFormData}
              config={ATHLETE_FIELD_CONFIG}
              onSubmit={handleSubmit}
              onChangeRole={handleChangeRole}
            />
          ) : (
            <CoachSignUpForm
              data={coachFormData}
              config={COACH_FIELD_CONFIG}
              onSubmit={handleSubmit}
              onChangeRole={handleChangeRole}
            />
          )}

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
