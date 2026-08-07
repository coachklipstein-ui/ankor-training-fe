import * as React from 'react';
import {
  IconButton,
  Typography,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { supabase } from '../../../lib/supabaseClient';
import {
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NotificationItem,
} from '../services/notificationService';

export default function NotificationBell() {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [items, setItems] = React.useState<NotificationItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  const open = Boolean(anchorEl);
  const unreadCount = items.filter((n) => !n.read).length;
  const userId = user?.id ?? null;

  React.useEffect(() => {
    if (!userId) {
      setItems([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    listNotifications({ limit: 50 })
      .then(({ items: fetched }) => {
        if (!cancelled) setItems(fetched);
      })
      .catch((err) => {
        console.error('Failed to load notifications', err);
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  React.useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        () => {
          listNotifications({ limit: 50 })
            .then(({ items: fresh }) => setItems(fresh))
            .catch((err) => console.error('Failed to refresh notifications', err));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleItemClick = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
    handleClose();
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton color="inherit" onClick={handleOpen} sx={{ mr: 1 }}>
          <Badge color="error" badgeContent={unreadCount || undefined} overlap="circular">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { minWidth: 320, maxWidth: 360 } }}
      >
        <Box sx={{ px: 2, pt: 1.5, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Notifications
          </Typography>
          {items.length > 0 && unreadCount > 0 && (
            <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }} onClick={handleMarkAllRead}>
              Mark all as read
            </Typography>
          )}
        </Box>
        <Divider />

        {loading && items.length === 0 && (
          <MenuItem disabled>
            <ListItemText primary="Loading notifications..." secondary="Fetching the latest updates." />
          </MenuItem>
        )}

        {!loading && items.length === 0 && (
          <MenuItem disabled>
            <ListItemText primary="No notifications yet" secondary="You'll see evaluation reports and updates here." />
          </MenuItem>
        )}

        {items.map((n) => (
          <MenuItem
            key={n.id}
            onClick={() => handleItemClick(n.id)}
            component={RouterLink}
            to={n.link ?? '/reports/evaluation-reports'}
            sx={{ alignItems: 'flex-start', ...(n.read ? {} : { bgcolor: 'action.hover' }) }}
          >
            <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
              <AssignmentIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Typography variant="body2" fontWeight={n.read ? 400 : 600} noWrap>
                    {n.title}
                  </Typography>
                </Box>
              }
              secondary={
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mt: 0.25,
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  {n.description}
                </Typography>
              }
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
