import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import MuiCard from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { activateParentProfile } from '../services/activateParentService';
import AppTheme from '../theme/AppTheme';
import ColorModeSelect from '../theme/ColorModeSelect';
import { ActivateParentForm } from './Activate/ActivateParentForm';
import {
  ACTIVATE_PARENT_FIELD_CONFIG,
  getEmptyActivateParentFormData,
  type ActivateParentFormData,
} from './Activate/activateFormConfig';

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
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

export default function ActivateParentPage(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  const { loading, isAuthenticated, updatePassword, refreshSession } = useAuth();
  const [formData] = React.useState(getEmptyActivateParentFormData());
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    void refreshSession();
    // Intentionally run once on mount to pick up invite-link session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (data: ActivateParentFormData) => {
    setError(null);
    setBusy(true);
    try {
      const { error: passwordError } = await updatePassword(data.password);
      if (passwordError) {
        setError(passwordError.message || 'Unable to set password.');
        return;
      }

      await activateParentProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        cellNumber: data.cellNumber,
      });

      setSuccess(true);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Activation failed.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
      <Box
        sx={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 4,
        }}
      >
        <Card variant="outlined">
          <Typography component="h1" variant="h4" sx={{ fontSize: 'clamp(1.8rem, 8vw, 2.15rem)' }}>
            Activate parent account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Set your password and complete your profile to finish setup.
          </Typography>

          {loading ? (
            <Alert severity="info">Checking your invite session…</Alert>
          ) : !isAuthenticated ? (
            <Stack spacing={2}>
              <Alert severity="warning">
                Open the invite link from your email to activate this account. If the link expired,
                ask your organization to send a new invite.
              </Alert>
              <Button component={RouterLink} to="/sign-in" variant="outlined">
                Back to sign in
              </Button>
            </Stack>
          ) : success ? (
            <Alert severity="success">Account activated. Redirecting…</Alert>
          ) : (
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <ActivateParentForm
                data={formData}
                config={ACTIVATE_PARENT_FIELD_CONFIG}
                busy={busy}
                onSubmit={handleSubmit}
              />
            </Stack>
          )}
        </Card>
      </Box>
    </AppTheme>
  );
}
