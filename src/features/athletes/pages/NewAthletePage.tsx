import * as React from 'react';
import { Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { createAthlete } from '../services/athleteService';
import AthleteFormFields from '../components/AthleteFormFields';
import { relationshipOptions } from '../utils/relationshipOptions';
import { getAllTeams, type Team } from '../../teams/services/teamsService';
import { listPositions, type Position } from '../services/positionsService';
import { useFormValidation } from '../../../lib/common/form/useFormValidation';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hasAnyParentField = (all: Record<string, string>) =>
  Boolean(all.parentFullName?.trim() || all.parentEmail?.trim() || all.parentMobilePhone?.trim() || all.relationship?.trim());

const FIELD_CONFIG = {
  teamId: { label: 'Team', required: true },
  firstName: { label: 'First name', required: true },
  lastName: { label: 'Last name', required: true },
  email: {
    label: 'Email',
    required: true,
    validate: (v: string) => (!EMAIL_RE.test(v.trim()) ? 'Enter a valid email address.' : null),
  },
  username: { label: 'Username', required: true },
  password: {
    label: 'Password',
    required: true,
    validate: (v: string) => (v.trim().length < 8 ? 'Password must be at least 8 characters.' : null),
  },
  confirmPassword: {
    label: 'Confirm password',
    required: true,
    validate: (_v: string, all: Record<string, string>) =>
      _v.trim() !== all.password?.trim() ? 'Passwords do not match.' : null,
  },
  graduationYear: {
    label: 'Graduation year',
    validate: (v: string) => {
      if (!v.trim()) return null;
      const n = Number(v.trim());
      if (!Number.isFinite(n) || !Number.isInteger(n)) return 'Graduation year must be an integer.';
      if (n < 1900 || n > 2100) return 'Graduation year must be between 1900 and 2100.';
      return null;
    },
  },
  age: {
    label: 'Age',
    validate: (v: string) => {
      if (!v.trim()) return null;
      const n = Number(v.trim());
      if (!Number.isFinite(n)) return 'Age must be a number.';
      if (n <= 0) return 'Age must be greater than 0.';
      return null;
    },
  },
  gender: {
    label: 'Gender',
    required: true,
  },
  parentFullName: {
    label: 'Parent full name',
    validate: (_v: string, all: Record<string, string>) =>
      hasAnyParentField(all) && !_v.trim() ? 'Parent full name is required when parent info is provided.' : null,
  },
  parentEmail: {
    label: 'Parent email',
    validate: (v: string, all: Record<string, string>) => {
      if (hasAnyParentField(all) && !v.trim()) return 'Parent email is required when parent info is provided.';
      if (v.trim() && !EMAIL_RE.test(v.trim())) return 'Enter a valid email address.';
      return null;
    },
  },
  parentMobilePhone: {
    label: 'Parent mobile phone',
    validate: (_v: string, all: Record<string, string>) =>
      hasAnyParentField(all) && !_v.trim() ? 'Parent mobile phone is required when parent info is provided.' : null,
  },
  relationship: {
    label: 'Relationship',
    validate: (_v: string, all: Record<string, string>) =>
      hasAnyParentField(all) && !_v.trim() ? 'Relationship is required when parent info is provided.' : null,
  },
} as const;

export default function NewAthletePage() {
  const navigate = useNavigate();
  const { orgId, loading: authLoading } = useAuth();
  const form = useFormValidation(FIELD_CONFIG);

  const [teams, setTeams] = React.useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = React.useState(false);
  const [teamsError, setTeamsError] = React.useState<string | null>(null);

  const [positions, setPositions] = React.useState<Position[]>([]);
  const [positionsLoading, setPositionsLoading] = React.useState(false);
  const [positionsError, setPositionsError] = React.useState<string | null>(null);
  const [selectedPositionId, setSelectedPositionId] = React.useState('');

  const [saving, setSaving] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  React.useEffect(() => {
    form.setFieldValue('teamId', '');
    setSelectedPositionId('');
  }, [orgId]);

  React.useEffect(() => {
    if (authLoading) return;
    let active = true;

    const resolvedOrgId = orgId?.trim() || '';
    if (!resolvedOrgId) {
      setTeams([]);
      setTeamsError('Missing org_id. Please sign in again.');
      setTeamsLoading(false);
      return () => { active = false; };
    }

    setTeamsLoading(true);
    setTeamsError(null);

    getAllTeams({ orgId: resolvedOrgId })
      .then((items) => { if (active) setTeams(items); })
      .catch((err: any) => {
        if (active) {
          setTeams([]);
          setTeamsError(err?.message || 'Failed to load teams.');
        }
      })
      .finally(() => { if (active) setTeamsLoading(false); });

    return () => { active = false; };
  }, [authLoading, orgId]);

  React.useEffect(() => {
    if (authLoading) return;
    let active = true;

    const resolvedOrgId = orgId?.trim() || '';
    if (!resolvedOrgId) {
      setPositions([]);
      setPositionsError('Missing org_id. Please sign in again.');
      setPositionsLoading(false);
      return () => { active = false; };
    }

    setPositionsLoading(true);
    setPositionsError(null);

    listPositions({ orgId: resolvedOrgId, limit: 50, offset: 0 })
      .then(({ items }) => { if (active) setPositions(items); })
      .catch((err: any) => {
        if (active) {
          setPositions([]);
          setPositionsError(err?.message || 'Failed to load positions.');
        }
      })
      .finally(() => { if (active) setPositionsLoading(false); });

    return () => { active = false; };
  }, [authLoading, orgId]);

  const teamOptions = React.useMemo(
    () => [...teams].sort((a, b) => a.name.localeCompare(b.name)),
    [teams],
  );

  const positionOptions = React.useMemo(
    () => [...positions].sort((a, b) => a.name.localeCompare(b.name)),
    [positions],
  );

  const teamHelperText = teamsError
    ? teamsError
    : teamsLoading
      ? 'Loading teams...'
      : teamOptions.length === 0
        ? 'No teams available.'
        : '';

  const positionHelperText = positionsError
    ? positionsError
    : positionsLoading
      ? 'Loading positions...'
      : positionOptions.length === 0
        ? 'No positions available.'
        : 'Optional';

  const toOptionalNumber = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!form.validate()) return;

    if (!orgId) {
      setSubmitError('Missing org_id. Please sign in again.');
      return;
    }

    const v = form.getValues();

    try {
      setSaving(true);
      const created = await createAthlete({
        org_id: orgId,
        email: v.email.trim(),
        password: v.password.trim(),
        first_name: v.firstName.trim(),
        last_name: v.lastName.trim(),
        full_name: [v.firstName, v.lastName].filter(Boolean).join(' ').trim(),
        username: v.username.trim(),
        graduation_year: toOptionalNumber(v.graduationYear),
        team_id: v.teamId.trim() || null,
        position_id: selectedPositionId.trim() || null,
        age: toOptionalNumber(v.age),
        gender: v.gender.trim() || null,
        parent_email: v.parentEmail.trim() || null,
        parent_full_name: v.parentFullName.trim() || null,
        parent_mobile_phone: v.parentMobilePhone.trim() || null,
        relationship: v.relationship.trim() || null,
      });

      if (created?.id) {
        navigate(`/athletes/${created.id}/edit`);
      } else {
        navigate('/athletes');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create athlete.';
      setSubmitError(message);
    } finally {
      setSaving(false);
    }
  };

  // Adapt form object to AthleteFormFields' expected props
  const athleteFormState = {
    firstName: form.values.firstName,
    lastName: form.values.lastName,
    email: form.values.email,
    password: form.values.password,
    cellNumber: '',
    username: form.values.username,
    graduationYear: form.values.graduationYear,
  };

  const athleteErrors: Record<string, string> = {};
  if (form.errors.firstName) athleteErrors.first_name = form.errors.firstName;
  if (form.errors.lastName) athleteErrors.last_name = form.errors.lastName;
  if (form.errors.email) athleteErrors.email = form.errors.email;
  if (form.errors.username) athleteErrors.username = form.errors.username;
  if (form.errors.password) athleteErrors.password = form.errors.password;
  if (form.errors.graduationYear) athleteErrors.graduation_year = form.errors.graduationYear;
  if (form.errors.confirmPassword) athleteErrors.confirm_password = form.errors.confirmPassword;

  const handleFieldChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      form.handleChange(field)(event);
    };

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
      <Stack
        spacing={3}
        component="form"
        onSubmit={handleSubmit}
        sx={{ maxWidth: 1200, width: '100%', mx: 'auto' }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h4" fontWeight={700}>
              New Athlete
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add an athlete to your organization.
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button variant="outlined" onClick={() => navigate('/athletes')}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Stack>
        </Stack>

        {submitError && (
          <Typography color="error" variant="body2">
            {submitError}
          </Typography>
        )}

        <AthleteFormFields
          form={athleteFormState}
          errors={athleteErrors}
          onFieldChange={handleFieldChange}
          showPassword
          passwordLabel="Password (required)"
          passwordRequired
          showCellNumber={false}
          showConfirmPassword
          confirmPassword={form.values.confirmPassword}
          onConfirmPasswordChange={form.handleChange('confirmPassword') as (e: React.ChangeEvent<HTMLInputElement>) => void}
          confirmPasswordLabel="Confirm password (required)"
          confirmPasswordRequired
        >
          <TextField
            label="Age"
            type="number"
            value={form.values.age}
            onChange={form.handleChange('age')}
            onBlur={form.handleBlur('age')}
            error={!!form.errors.age}
            helperText={form.errors.age}
            fullWidth
            inputProps={{ min: 1, max: 120 }}
          />
          <TextField
            select
            label="Gender"
            value={form.values.gender}
            onChange={form.handleChange('gender')}
            onBlur={form.handleBlur('gender')}
            error={!!form.errors.gender}
            helperText={form.errors.gender}
            required
            fullWidth
          >
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="nonbinary">Non-binary</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
          <TextField
            select
            label="Position"
            value={selectedPositionId}
            onChange={(event) => setSelectedPositionId(event.target.value)}
            error={Boolean(positionsError)}
            helperText={positionHelperText}
            fullWidth
            disabled={positionsLoading}
          >
            <MenuItem value="">No position</MenuItem>
            {positionOptions.map((pos) => (
              <MenuItem key={pos.id} value={pos.id}>
                {pos.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Team"
            value={form.values.teamId}
            onChange={form.handleChange('teamId')}
            onBlur={form.handleBlur('teamId')}
            error={!!form.errors.teamId || Boolean(teamsError)}
            helperText={form.errors.teamId || teamHelperText}
            required
            fullWidth
            disabled={teamsLoading}
          >
            <MenuItem value="">No team</MenuItem>
            {teamOptions.map((team) => (
              <MenuItem key={team.id} value={team.id}>
                {team.name}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Parent/Guardian
            </Typography>
          </Box>
          <TextField
            label="Parent full name"
            value={form.values.parentFullName}
            onChange={form.handleChange('parentFullName')}
            onBlur={form.handleBlur('parentFullName')}
            error={!!form.errors.parentFullName}
            helperText={form.errors.parentFullName}
            fullWidth
          />
          <TextField
            label="Parent email"
            type="email"
            value={form.values.parentEmail}
            onChange={form.handleChange('parentEmail')}
            onBlur={form.handleBlur('parentEmail')}
            error={!!form.errors.parentEmail}
            helperText={form.errors.parentEmail}
            fullWidth
          />
          <TextField
            label="Parent mobile phone"
            value={form.values.parentMobilePhone}
            onChange={form.handleChange('parentMobilePhone')}
            onBlur={form.handleBlur('parentMobilePhone')}
            error={!!form.errors.parentMobilePhone}
            helperText={form.errors.parentMobilePhone}
            fullWidth
          />
          <TextField
            select
            label="Relationship"
            value={form.values.relationship}
            onChange={form.handleChange('relationship')}
            onBlur={form.handleBlur('relationship')}
            error={!!form.errors.relationship}
            helperText={form.errors.relationship}
            fullWidth
          >
            <MenuItem value="">No relationship</MenuItem>
            {relationshipOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </AthleteFormFields>
      </Stack>
    </Box>
  );
}
