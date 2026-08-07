import * as React from 'react';
import { Divider, IconButton, Menu, MenuItem } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import type { PracticePlanRow } from '../types';

type PracticePlanRowMenuProps = {
  readonly row: PracticePlanRow;
  readonly onOpen: (row: PracticePlanRow) => void;
  readonly onDuplicate?: (row: PracticePlanRow) => void;
  readonly onDelete?: (row: PracticePlanRow) => void;
};

export default function PracticePlanRowMenu({
  row,
  onOpen,
  onDuplicate,
  onDelete,
}: PracticePlanRowMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const close = () => setAnchorEl(null);

  const runAction = (action: () => void) => (event: React.MouseEvent) => {
    event.stopPropagation();
    close();
    action();
  };

  // Prevents the MenuItem click from "falling through" onto ListItemButton after the portal closes.
  const preventRowClickThrough = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <>
      <IconButton
        edge="end"
        aria-label="more"
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
        sx={{ alignSelf: 'center' }}
      >
        <MoreHorizIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={preventRowClickThrough}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onMouseDown={preventRowClickThrough} onClick={runAction(() => onOpen(row))}>
          Open
        </MenuItem>
        <MenuItem
          onMouseDown={preventRowClickThrough}
          onClick={runAction(() => onDuplicate?.(row))}
        >
          Duplicate
        </MenuItem>
        <Divider />
        <MenuItem
          onMouseDown={preventRowClickThrough}
          onClick={runAction(() => onDelete?.(row))}
          sx={{ color: 'error.main' }}
        >
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}
