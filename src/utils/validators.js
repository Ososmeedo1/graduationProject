import * as Yup from 'yup';

export const validators = {
  email: Yup.string()
    .email('auth.errors.invalid_email')
    .required('auth.errors.email_required'),

  password: Yup.string()
    .min(6, 'auth.errors.password_weak')
    .required('auth.errors.password_required'),

  requiredString: (message = 'common.required') =>
    Yup.string().required(message),

  requiredNumber: (message = 'common.required') =>
    Yup.number().required(message),

  phone: Yup.string()
    .matches(/^\+?[0-9]{8,15}$/, 'common.errors.invalid_phone'),
};

export const createSchema = (shape) => Yup.object().shape(shape);
