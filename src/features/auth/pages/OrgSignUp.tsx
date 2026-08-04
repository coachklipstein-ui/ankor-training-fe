import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useNavigate } from 'react-router-dom';

import AdminInfoForm from '../components/AdminInfoForm';
import OrganizationForm from '../components/OrganizationForm';
import TeamsForm from '../components/TeamsForm';
import AppTheme from '../theme/AppTheme';
import ColorModeIconDropdown from '../theme/ColorModeIconDropdown';
import AnkorBrandPanel from '../components/AnkorBrandPanel';

import { buildOrgSignupPayload, submitOrgSignupJson } from '../services/orgSignUpService';
import { listSports, type Sport } from '../services/sportsService';
import { useFormValidation } from '../../../lib/common/form/useFormValidation';

const steps = ['Admin Info', 'Organization', 'Teams'];

const STEP_0_FIELDS = {
  adminFirstName: { label: 'Admin First Name', required: true },
  adminLastName: { label: 'Admin Last Name', required: true },
  adminEmail: {
    label: 'Admin Email',
    required: true,
    validate: (v: string) => (!/\S+@\S+\.\S+/.test(v) ? 'Please enter a valid email address.' : null),
  },
  adminPhoneNumber: {
    label: 'Admin Phone Number',
    required: true,
    validate: (v: string) => (!/^\+?\d{7,}$/.test(v) ? 'Please enter a valid phone number.' : null),
  },
  adminPassword: {
    label: 'Password',
    required: true,
    validate: (v: string) => (v.length < 8 ? 'Password must be at least 8 characters long.' : null),
  },
  adminPasswordConfirm: {
    label: 'Confirm Password',
    required: true,
    validate: (_v: string, all: Record<string, string>) =>
      _v !== all.adminPassword ? 'Passwords do not match.' : null,
  },
} as const;

const STEP_1_FIELDS = {
  organizationName: { label: 'Organization Name', required: true },
  address1: { label: 'Address', required: true },
  city: { label: 'City', required: true },
  state: { label: 'State', required: true },
  zip: { label: 'Zip Code', required: true },
  country: { label: 'Country', required: true },
} as const;

const ALL_FIELDS = { ...STEP_0_FIELDS, ...STEP_1_FIELDS };

export default function OrgSignUp(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = React.useState<string | null>(null);

  const [sports, setSports] = React.useState<Sport[]>([]);
  const [sportsLoading, setSportsLoading] = React.useState(true);
  const [sportsError, setSportsError] = React.useState<string | null>(null);

  const [selectedSport, setSelectedSport] = React.useState('');
  const [sportTouched, setSportTouched] = React.useState(false);

  const form = useFormValidation(ALL_FIELDS);

  const handleBack = () => {
    setServerError(null);
    setActiveStep((s) => Math.max(0, s - 1));
  };

  React.useEffect(() => {
    let cancelled = false;
    async function loadSports() {
      setSportsLoading(true);
      setSportsError(null);
      try {
        const result = await listSports();
        if (!cancelled) setSports(result.items);
      } catch (err: any) {
        if (!cancelled) {
          setSports([]);
          setSportsError(err?.message ?? 'Failed to load sports.');
        }
      } finally {
        if (!cancelled) setSportsLoading(false);
      }
    }
    loadSports();
    return () => { cancelled = true; };
  }, []);

  const validateCurrentStep = (): string | null => {
    if (activeStep === 0 || activeStep === 1) {
      const stepFields = activeStep === 0 ? Object.keys(STEP_0_FIELDS) : Object.keys(STEP_1_FIELDS);
      for (const name of stepFields) {
        const def = ALL_FIELDS[name as keyof typeof ALL_FIELDS];
        const value = form.values[name] ?? '';
        if (def.required && !value.trim()) return `${def.label} is required.`;
        if ('validate' in def && def.validate) {
          const msg = (def.validate as (v: string, all: Record<string, string>) => string | null)(value, form.values);
          if (msg) return msg;
        }
      }
      return null;
    }
    if (activeStep === 2) {
      if (!sportTouched) return null;
      if (!selectedSport) return 'Please select a sport.';
      return null;
    }
    return null;
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (activeStep < steps.length - 1) {
      const err = validateCurrentStep();
      if (err) { setServerError(err); return; }
      setActiveStep((s) => s + 1);
      return;
    }

    setSportTouched(true);
    const err = validateCurrentStep();
    if (err) { setServerError(err); return; }

    if (!form.validate()) return;

    setSubmitting(true);
    setServerSuccess(null);
    try {
      const payload = buildOrgSignupPayload(e.currentTarget);
      const result = await submitOrgSignupJson(payload);
      if (!result.ok) {
        setServerError(result.error || 'Signup failed');
        return;
      }
      setServerSuccess(`Organization created! orgId: ${result.orgId}`);
      setActiveStep(steps.length);
    } catch (err: any) {
      setServerError(err?.message ?? String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />

      <Box sx={{ position: 'fixed', top: '1rem', right: '1rem' }}>
        <ColorModeIconDropdown />
      </Box>

      <Grid
        container
        sx={{
          height: { xs: '100%', sm: 'calc(100dvh - var(--template-frame-height, 0px))' },
          mt: { xs: 4, sm: 0 },
        }}
      >
        <Grid
          size={{ xs: 12, sm: 5, lg: 4 }}
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            backgroundColor: 'background.paper',
            borderRight: { sm: 'none', md: '1px solid' },
            borderColor: { sm: 'none', md: 'divider' },
            alignItems: 'start',
            pt: 16,
            px: 10,
            gap: 4,
          }}
        >
          <AnkorBrandPanel />
        </Grid>

        <Grid
          size={{ sm: 12, md: 7, lg: 8 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '100%',
            width: '100%',
            backgroundColor: { xs: 'transparent', sm: 'background.default' },
            alignItems: 'start',
            pt: { xs: 0, sm: 16 },
            px: { xs: 2, sm: 10 },
            gap: { xs: 4, md: 8 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: { sm: 'space-between', md: 'flex-end' },
              alignItems: 'center',
              width: '100%',
              maxWidth: { sm: '100%', md: 600 },
            }}
          >
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                flexGrow: 1,
              }}
            >
              <Stepper
                id="desktop-stepper"
                activeStep={activeStep}
                sx={{ width: '100%', height: 40 }}
              >
                {steps.map((label) => (
                  <Step sx={{ ':first-child': { pl: 0 }, ':last-child': { pr: 0 } }} key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              width: '100%',
              maxWidth: { sm: '100%', md: 600 },
              maxHeight: '720px',
              gap: { xs: 5, md: 'none' },
            }}
          >
            <Stepper
              id="mobile-stepper"
              activeStep={activeStep}
              alternativeLabel
              sx={{ display: { sm: 'flex', md: 'none' } }}
            >
              {steps.map((label) => (
                <Step
                  sx={{
                    ':first-child': { pl: 0 },
                    ':last-child': { pr: 0 },
                    '& .MuiStepConnector-root': { top: { xs: 6, sm: 12 } },
                  }}
                  key={label}
                >
                  <StepLabel sx={{ '.MuiStepLabel-labelContainer': { maxWidth: '70px' } }}>
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <form ref={form.formRef} onSubmit={handleSubmit} autoComplete="off">
              {activeStep === steps.length ? (
                <Stack spacing={2} useFlexGap>
                  <Typography variant="h1">🎉</Typography>
                  <Typography variant="h5">Organization created!</Typography>
                  {serverSuccess && <Typography>{serverSuccess}</Typography>}
                  <Button
                    variant="contained"
                    onClick={() => navigate('/sign-in')}
                    sx={{ width: { xs: '100%', sm: 'fit-content' } }}
                  >
                    Go to login
                  </Button>
                </Stack>
              ) : (
                <React.Fragment>
                  <Box sx={{ display: activeStep === 0 ? 'block' : 'none' }}>
                    <AdminInfoForm form={form} />
                  </Box>
                  <Box sx={{ display: activeStep === 1 ? 'block' : 'none' }}>
                    <OrganizationForm form={form} />
                  </Box>
                  <Box sx={{ display: activeStep === 2 ? 'block' : 'none' }}>
                    <TeamsForm
                      sports={sports}
                      sportsLoading={sportsLoading}
                      sportsError={sportsError}
                      selectedSport={selectedSport}
                      onSportChange={(v) => {
                        setSelectedSport(v);
                        setSportTouched(true);
                      }}
                      sportError={sportTouched && !selectedSport ? 'Please select a sport.' : ''}
                    />
                  </Box>

                  {serverError && (
                    <Typography color="error" sx={{ mt: 2 }}>
                      {serverError}
                    </Typography>
                  )}
                  {serverSuccess && (
                    <Typography color="success.main" sx={{ mt: 2 }}>
                      {serverSuccess}
                    </Typography>
                  )}

                  <Box
                    sx={[
                      {
                        display: 'flex',
                        flexDirection: { xs: 'column-reverse', sm: 'row' },
                        alignItems: 'end',
                        flexGrow: 1,
                        gap: 1,
                        pb: { xs: 12, sm: 0 },
                        mt: { xs: 2, sm: 2 },
                        mb: '60px',
                      },
                      activeStep !== 0
                        ? { justifyContent: 'space-between' }
                        : { justifyContent: 'flex-end' },
                    ]}
                  >
                    {activeStep !== 0 && (
                      <Button
                        startIcon={<ChevronLeftRoundedIcon />}
                        onClick={handleBack}
                        variant="text"
                        sx={{ display: { xs: 'none', sm: 'flex' } }}
                        disabled={submitting}
                        type="button"
                      >
                        Previous
                      </Button>
                    )}
                    {activeStep !== 0 && (
                      <Button
                        startIcon={<ChevronLeftRoundedIcon />}
                        onClick={handleBack}
                        variant="outlined"
                        fullWidth
                        sx={{ display: { xs: 'flex', sm: 'none' } }}
                        disabled={submitting}
                        type="button"
                      >
                        Previous
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      endIcon={activeStep < steps.length - 1 ? <ChevronRightRoundedIcon /> : undefined}
                      type="button"
                      onClick={() => {
                        setServerError(null);
                        const err = validateCurrentStep();
                        if (err) { setServerError(err); return; }
                        if (activeStep < steps.length - 1) {
                          setActiveStep((s) => s + 1);
                        } else {
                          setSportTouched(true);
                          form.formRef.current?.requestSubmit();
                        }
                      }}
                      sx={{ width: { xs: '100%', sm: 'fit-content' } }}
                      disabled={submitting}
                    >
                      {activeStep < steps.length - 1 ? 'Next' : (submitting ? 'Saving…' : 'Save')}
                    </Button>
                  </Box>
                </React.Fragment>
              )}
            </form>
          </Box>
        </Grid>
      </Grid>
    </AppTheme>
  );
}
