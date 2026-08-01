import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';

import MenuItem from '@mui/material/MenuItem';
import { Role } from '../../services/signupService';
import { Roles } from './signUpFormConfig';

type Props = {
  role: Role;
  onChangeRole: (role: Role) => void;
};

export const RoleField = ({ role, onChangeRole }: Props) => {
  return (
    <FormControl>
      <FormLabel htmlFor="role">Role</FormLabel>
      <TextField
        id="role"
        name="role"
        select
        fullWidth
        value={role}
        onChange={(e) => onChangeRole(e.target.value as Role)}
      >
        {Roles.map((role) => (
          <MenuItem key={role} value={role}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </MenuItem>
        ))}
      </TextField>
    </FormControl>
  );
};
