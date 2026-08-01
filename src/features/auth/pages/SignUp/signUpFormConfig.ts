import {
  email,
  emailWhenPresent,
  notEqualToField,
  number,
  passwordMatch,
  passwordMinLength,
  phone,
} from '../../../../lib/common/form/stringFieldValidators';
import { required } from '../../../../lib/common/form/validationCommon';
import { FormFieldConfig } from '../../../../lib/common/form/types';

const PASSWORD_MIN_LENGTH = 8;

type Role = 'athlete' | 'coach';
export const Roles: Role[] = ['athlete', 'coach'];

type CommonFormData = {
  joinCode: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  cellNumber?: string | null;
  termsAccepted: boolean;

  confirmPassword: string;
};

export type AthleteSignUpFormData = CommonFormData & {
  graduationYear: string;
  position_id: string;
  parentEmail: string;
};

export type CoachSignUpFormData = CommonFormData;

const createCommonFieldConfig = <TData extends CommonFormData>(): Pick<
  FormFieldConfig<TData>,
  keyof CommonFormData
> => ({
  joinCode: {
    label: 'Type code',
    validators: [required()],
  },
  email: {
    label: 'Email',
    validators: [required(), email()],
  },
  password: {
    label: 'Password',
    validators: [required(), passwordMinLength(PASSWORD_MIN_LENGTH)],
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
  termsAccepted: { label: 'Terms accepted', validators: [required()] },
});

export const ATHLETE_FIELD_CONFIG: FormFieldConfig<AthleteSignUpFormData> = {
  ...createCommonFieldConfig<AthleteSignUpFormData>(),
  graduationYear: { label: 'Graduation year', validators: [required(), number()] },
  position_id: { label: 'Position', validators: [required()] },
  parentEmail: {
    label: 'Parent email',
    validators: [
      emailWhenPresent(),
      notEqualToField('email', 'Parent email must be different from your email.', {
        caseInsensitive: true,
      }),
    ],
  },
} as const;

export const COACH_FIELD_CONFIG: FormFieldConfig<CoachSignUpFormData> = {
  ...createCommonFieldConfig<CoachSignUpFormData>(),
} as const;

export const getEmptyCommonFormData = (): CommonFormData => {
  return {
    joinCode: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    cellNumber: '',
    termsAccepted: false,
    confirmPassword: '',
  };
};

export const getEmptyAthleteSignUpFormData = (): AthleteSignUpFormData => {
  return {
    ...getEmptyCommonFormData(),
    graduationYear: '',
    position_id: '',
    parentEmail: '',
  };
};

export const getEmptyCoachSignUpFormData = (): CoachSignUpFormData => {
  return {
    ...getEmptyCommonFormData(),
  };
};
