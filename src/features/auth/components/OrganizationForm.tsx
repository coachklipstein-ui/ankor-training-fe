import * as React from 'react';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/material/styles';

const FormGrid = styled(Grid)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

type FormState = {
  values: Record<string, string>;
  errors: Record<string, string>;
  handleChange: (name: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleBlur: (name: string) => () => void;
};

type Props = {
  form: FormState;
};

export default function OrganizationForm({ form }: Props) {
  return (
    <Grid container spacing={3}>
      <FormGrid size={{ xs: 12 }}>
        <FormLabel htmlFor="organizationName" required>Organization Name</FormLabel>
        <OutlinedInput
          id="organizationName"
          name="organizationName"
          value={form.values.organizationName}
          onChange={form.handleChange('organizationName')}
          onBlur={form.handleBlur('organizationName')}
          error={!!form.errors.organizationName}
          type="text"
          placeholder="Ankor Lacrosse Academy"
          autoComplete="organization"
          required
          size="small"
        />
      </FormGrid>

      <FormGrid size={{ xs: 12 }}>
        <FormLabel htmlFor="logo">Logo</FormLabel>
        <OutlinedInput
          id="logo"
          name="logo"
          type="file"
          inputProps={{ accept: 'image/*' }}
          size="small"
        />
      </FormGrid>

      <FormGrid size={{ xs: 12 }}>
        <FormLabel htmlFor="address1" required>Address line 1</FormLabel>
        <OutlinedInput
          id="address1"
          name="address1"
          value={form.values.address1}
          onChange={form.handleChange('address1')}
          onBlur={form.handleBlur('address1')}
          error={!!form.errors.address1}
          type="text"
          placeholder="Street name and number"
          autoComplete="address-line1"
          required
          size="small"
        />
      </FormGrid>

      <FormGrid size={{ xs: 12 }}>
        <FormLabel htmlFor="address2">Address line 2</FormLabel>
        <OutlinedInput
          id="address2"
          name="address2"
          type="text"
          placeholder="Apartment, suite, unit, etc. (optional)"
          autoComplete="address-line2"
          size="small"
        />
      </FormGrid>

      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="city" required>City</FormLabel>
        <OutlinedInput
          id="city"
          name="city"
          value={form.values.city}
          onChange={form.handleChange('city')}
          onBlur={form.handleBlur('city')}
          error={!!form.errors.city}
          type="text"
          placeholder="New York"
          autoComplete="address-level2"
          required
          size="small"
        />
      </FormGrid>

      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="state" required>State</FormLabel>
        <OutlinedInput
          id="state"
          name="state"
          value={form.values.state}
          onChange={form.handleChange('state')}
          onBlur={form.handleBlur('state')}
          error={!!form.errors.state}
          type="text"
          placeholder="NY"
          autoComplete="address-level1"
          required
          size="small"
        />
      </FormGrid>

      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="zip" required>Zip / Postal code</FormLabel>
        <OutlinedInput
          id="zip"
          name="zip"
          value={form.values.zip}
          onChange={form.handleChange('zip')}
          onBlur={form.handleBlur('zip')}
          error={!!form.errors.zip}
          type="text"
          placeholder="12345"
          autoComplete="postal-code"
          required
          size="small"
        />
      </FormGrid>

      <FormGrid size={{ xs: 12, md: 6 }}>
        <FormLabel htmlFor="country" required>Country</FormLabel>
        <OutlinedInput
          id="country"
          name="country"
          value={form.values.country}
          onChange={form.handleChange('country')}
          onBlur={form.handleBlur('country')}
          error={!!form.errors.country}
          type="text"
          placeholder="United States"
          autoComplete="country-name"
          required
          size="small"
        />
      </FormGrid>
    </Grid>
  );
}
