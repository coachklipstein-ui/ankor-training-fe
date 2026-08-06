import {
  passwordMatch,
  passwordMinLength,
  phone,
} from '../../../../lib/common/form/stringFieldValidators';
import { required } from '../../../../lib/common/form/validationCommon';
import type { FormFieldConfig } from '../../../../lib/common/form/types';

export type ActivateParentFormData = {
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  cellNumber: string;
};

export const ACTIVATE_PARENT_FIELD_CONFIG: FormFieldConfig<ActivateParentFormData> = {
  password: {
    label: 'Password',
    validators: [required(), passwordMinLength()],
  },
  confirmPassword: {
    label: 'Confirm password',
    validators: [required(), passwordMatch('password')],
  },
  firstName: { label: 'First name', validators: [required()] },
  lastName: { label: 'Last name', validators: [required()] },
  cellNumber: {
    label: 'Cell number',
    validators: [required(), phone()],
  },
} as const;

export const getEmptyActivateParentFormData = (): ActivateParentFormData => ({
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  cellNumber: '',
});
