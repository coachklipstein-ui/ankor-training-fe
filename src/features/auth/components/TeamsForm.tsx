import * as React from 'react';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import type { Sport } from '../services/sportsService';

const FormGrid = styled(Grid)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

type TeamRow = {
  id: string;
  sport: string;
  name: string;
};

export default function TeamsForm({
  sports,
  sportsLoading = false,
  sportsError = null,
  selectedSport,
  onSportChange,
  sportError = '',
  initial = [{ id: crypto.randomUUID?.() ?? String(Date.now()), sport: '', name: '' }],
}: {
  sports?: Sport[];
  sportsLoading?: boolean;
  sportsError?: string | null;
  selectedSport: string;
  onSportChange: (value: string) => void;
  sportError?: string;
  initial?: TeamRow[];
}) {
  const [rows, setRows] = React.useState<TeamRow[]>(
    initial.map((r) => ({ ...r, sport: selectedSport })),
  );

  const propagate = (next: TeamRow[]) => {
    setRows(next);
  };

  const handleAddRow = () => {
    propagate([
      ...rows,
      {
        id: crypto.randomUUID?.() ?? `${Date.now()}-${rows.length + 1}`,
        sport: selectedSport,
        name: '',
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    propagate(rows.filter((r) => r.id !== id));
  };

  const handleNameChange = (id: string, value: string) => {
    propagate(rows.map((r) => (r.id === id ? { ...r, name: value } : r)));
  };

  return (
    <Grid container spacing={3}>
      <FormGrid size={{ xs: 12 }}>
        <FormLabel required>Sport</FormLabel>
        <Select
          size="small"
          fullWidth
          displayEmpty
          value={selectedSport}
          autoComplete="off"
          required
          error={!!sportError}
          onChange={(e) => onSportChange(e.target.value as string)}
          disabled={sportsLoading || Boolean(sportsError) || !sports?.length}
        >
          <MenuItem value="">
            <em>{sportsLoading ? 'Loading sports...' : 'Select sport'}</em>
          </MenuItem>
          {(sports ?? []).map((sport) => (
            <MenuItem key={sport.id} value={sport.id}>
              {sport.name}
            </MenuItem>
          ))}
        </Select>
        {sportError && (
          <FormHelperText error>{sportError}</FormHelperText>
        )}
        {sportsError && !sportError && (
          <Typography color="error" variant="caption" sx={{ mt: 0.75 }}>
            {sportsError}
          </Typography>
        )}
      </FormGrid>

      <FormGrid size={{ xs: 12 }}>
        <FormLabel required sx={{ mt: 2 }}>
          Teams
        </FormLabel>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" aria-label="teams grid">
            <TableHead>
              <TableRow>
                <TableCell width="90%">Name of the team</TableCell>
                <TableCell width="10%" align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <OutlinedInput
                      size="small"
                      fullWidth
                      placeholder="e.g., U14 Girls Blue"
                      value={row.name}
                      name={`teams[${row.id}].name`}
                      autoComplete="off"
                      required
                      onChange={(e) => handleNameChange(row.id, e.target.value)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label="remove row"
                      onClick={() => handleRemoveRow(row.id)}
                      disabled={rows.length === 1}
                      size="small"
                    >
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Stack direction="row" justifyContent="flex-start" p={1.5}>
            <Button
              variant="text"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              onClick={handleAddRow}
              size="small"
              disabled={!selectedSport}
            >
              Add team
            </Button>
          </Stack>
        </TableContainer>
      </FormGrid>

      {/* Hidden inputs for form serialization */}
      <input type="hidden" name="teamsSport" value={selectedSport} />
      <input type="hidden" name="teamsJson" value={JSON.stringify(rows)} />
    </Grid>
  );
}
