import * as React from 'react';
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';

import AnchorIcon from '@mui/icons-material/Anchor';

import PracticePlanRowMenu from '../components/PracticePlanRowMenu';
import usePracticePlansListPage, {
  type PracticePlanRow,
  type TabKey,
} from '../hooks/usePracticePlansListPage';
import { formatHeaderTimestamp } from '../utils/formatHeaderTimestamp';

type TabMeta = {
  key: TabKey;
  label: string;
  icon: React.ReactElement;
};

const TABS: Record<TabKey, TabMeta> = {
  my: { key: 'my', label: 'My Plans', icon: <LibraryBooksIcon /> },
  invited: { key: 'invited', label: 'Invited', icon: <MailOutlineIcon /> },
  prebuilt: { key: 'prebuilt', label: 'Prebuilt Plans', icon: <AutoAwesomeMosaicIcon /> },
};

const TAB_META = Object.values(TABS);

export default function PracticePlansListPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const { tab, setTab, search, setSearch, rows, activeLoading, activeError, canEdit } =
    usePracticePlansListPage();

  const onOpenPlan = (row: PracticePlanRow) => {
    navigate(`/practice-plans/${row.id}`);
  };

  const onEditPlan = (row: PracticePlanRow) => {
    navigate(`/practice-plans/${row.id}/edit`);
  };

  const onCreate = () => {
    navigate('/practice-plans/new');
  };

  return (
    <Box>
      <Paper square elevation={0} sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Tabs
          value={tab}
          onChange={(_, v: TabKey) => setTab(v)}
          variant="scrollable"
          allowScrollButtonsMobile
          scrollButtons={isMobile ? 'auto' : false}
        >
          {TAB_META.map((t) => (
            <Tab
              key={t.key}
              value={t.key}
              icon={t.icon}
              iconPosition="start"
              label={t.label}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            />
          ))}
        </Tabs>
      </Paper>

      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, flex: 1 }}>
            {TABS[tab].label}
          </Typography>

          {tab === 'my' && (
            <IconButton
              onClick={onCreate}
              aria-label="create plan"
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '999px',
              }}
            >
              <AddIcon />
            </IconButton>
          )}
        </Stack>

        <TextField
          fullWidth
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1.5 }}
        />

        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          {activeLoading ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Loading plans...
              </Typography>
            </Box>
          ) : activeError ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="error">
                {activeError}
              </Typography>
            </Box>
          ) : rows.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No plans found.
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {rows.map((row, idx) => (
                <React.Fragment key={row.id}>
                  <ListItemButton
                    alignItems="flex-start"
                    onClick={() => onOpenPlan(row)}
                    sx={{ py: 1.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 44, mt: 0.5 }}>
                      <AnchorIcon />
                    </ListItemIcon>

                    <ListItemText
                      primary={
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 800, letterSpacing: 0.2 }}
                        >
                          {formatHeaderTimestamp(row.updated_at)}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 900, color: 'text.primary' }}
                        >
                          {row.name}
                        </Typography>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />

                    <Stack
                      direction={isMobile ? 'column' : 'row'}
                      spacing={1}
                      sx={{ alignSelf: 'center', mr: 1 }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPlan(row);
                        }}
                      >
                        View
                      </Button>
                      {canEdit && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditPlan(row);
                          }}
                        >
                          Edit
                        </Button>
                      )}
                    </Stack>

                    <PracticePlanRowMenu row={row} onOpen={onOpenPlan} />
                  </ListItemButton>

                  {idx !== rows.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
