// Captured from the current DTO validators; keep examples aligned with runtime errors.
export const LOGIN_VALIDATION_EXAMPLES = {
  email: {
    summary: 'email: required field',
    value: {
      errors: [
        {
          code: 'isEmail',
          field: 'email',
          message: 'email must be an email',
        },
        {
          code: 'isNotEmpty',
          field: 'email',
          message: 'email should not be empty',
        },
      ],
    },
  },
  password: {
    summary: 'password: required field',
    value: {
      errors: [
        {
          code: 'isNotEmpty',
          field: 'password',
          message: 'password should not be empty',
        },
      ],
    },
  },
  invalidEmail: {
    summary: 'email: invalid format',
    value: {
      errors: [
        {
          code: 'isEmail',
          field: 'email',
          message: 'email must be an email',
        },
      ],
    },
  },
  unknownField: {
    summary: 'Unknown field',
    value: {
      errors: [
        {
          code: 'whitelistValidation',
          field: 'extra',
          message: 'property extra should not exist',
        },
      ],
    },
  },
};
export const REGISTER_VALIDATION_EXAMPLES = {
  name: {
    summary: 'name: required field',
    value: {
      errors: [
        {
          code: 'isNotEmpty',
          field: 'name',
          message: 'This field is required',
        },
        {
          code: 'isString',
          field: 'name',
          message: 'This field must be a string',
        },
        {
          code: 'minLength',
          field: 'name',
          message: 'This field must be at least 2 characters',
        },
        {
          code: 'maxLength',
          field: 'name',
          message: 'This field must not exceed 50 characters',
        },
      ],
    },
  },
  email: {
    summary: 'email: required field',
    value: {
      errors: [
        {
          code: 'isEmail',
          field: 'email',
          message: 'Please provide a valid email address',
        },
        {
          code: 'isNotEmpty',
          field: 'email',
          message: 'This field is required',
        },
        {
          code: 'isString',
          field: 'email',
          message: 'This field must be a string',
        },
      ],
    },
  },
  countryCode: {
    summary: 'countryCode: required field',
    value: {
      errors: [
        {
          code: 'isNotEmpty',
          field: 'countryCode',
          message: 'This field is required',
        },
        {
          code: 'isString',
          field: 'countryCode',
          message: 'This field must be a string',
        },
      ],
    },
  },
  phone: {
    summary: 'phone: required field',
    value: {
      errors: [
        {
          code: 'isNotEmpty',
          field: 'phone',
          message: 'This field is required',
        },
        {
          code: 'isString',
          field: 'phone',
          message: 'This field must be a string',
        },
      ],
    },
  },
  password: {
    summary: 'password: required field',
    value: {
      errors: [
        {
          code: 'isNotEmpty',
          field: 'password',
          message: 'This field is required',
        },
        {
          code: 'isString',
          field: 'password',
          message: 'This field must be a string',
        },
        {
          code: 'minLength',
          field: 'password',
          message: 'This field must be at least 8 characters',
        },
        {
          code: 'maxLength',
          field: 'password',
          message: 'This field must not exceed 128 characters',
        },
      ],
    },
  },
  invalidEmail: {
    summary: 'email: invalid format',
    value: {
      errors: [
        {
          code: 'isEmail',
          field: 'email',
          message: 'Please provide a valid email address',
        },
      ],
    },
  },
  unknownField: {
    summary: 'Unknown field',
    value: {
      errors: [
        {
          code: 'whitelistValidation',
          field: 'extra',
          message: 'property extra should not exist',
        },
      ],
    },
  },
};
export const REFRESH_TOKEN_VALIDATION_EXAMPLES = {
  token: {
    summary: 'token: required field',
    value: {
      errors: [
        {
          code: 'isString',
          field: 'token',
          message: 'token must be a string',
        },
        {
          code: 'isNotEmpty',
          field: 'token',
          message: 'token should not be empty',
        },
      ],
    },
  },
  unknownField: {
    summary: 'Unknown field',
    value: {
      errors: [
        {
          code: 'whitelistValidation',
          field: 'extra',
          message: 'property extra should not exist',
        },
      ],
    },
  },
};
export const CREATE_USER_VALIDATION_EXAMPLES = {
  name: {
    summary: 'name: required field',
    value: {
      errors: [
        {
          code: 'isNotEmpty',
          field: 'name',
          message: 'This field is required',
        },
        {
          code: 'isString',
          field: 'name',
          message: 'This field must be a string',
        },
        {
          code: 'minLength',
          field: 'name',
          message: 'This field must be at least 2 characters',
        },
        {
          code: 'maxLength',
          field: 'name',
          message: 'This field must not exceed 50 characters',
        },
      ],
    },
  },
  email: {
    summary: 'email: required field',
    value: {
      errors: [
        {
          code: 'isEmail',
          field: 'email',
          message: 'Please provide a valid email address',
        },
        {
          code: 'isNotEmpty',
          field: 'email',
          message: 'This field is required',
        },
        {
          code: 'isString',
          field: 'email',
          message: 'This field must be a string',
        },
      ],
    },
  },
  phone: {
    summary: 'phone: required field',
    value: {
      errors: [
        {
          code: 'isNotEmpty',
          field: 'phone',
          message: 'This field is required',
        },
        {
          code: 'isString',
          field: 'phone',
          message: 'This field must be a string',
        },
      ],
    },
  },
  password: {
    summary: 'password: required field',
    value: {
      errors: [
        {
          code: 'isNotEmpty',
          field: 'password',
          message: 'This field is required',
        },
        {
          code: 'isString',
          field: 'password',
          message: 'This field must be a string',
        },
        {
          code: 'minLength',
          field: 'password',
          message: 'This field must be at least 8 characters',
        },
        {
          code: 'maxLength',
          field: 'password',
          message: 'This field must not exceed 128 characters',
        },
      ],
    },
  },
  invalidEmail: {
    summary: 'email: invalid format',
    value: {
      errors: [
        {
          code: 'isEmail',
          field: 'email',
          message: 'Please provide a valid email address',
        },
      ],
    },
  },
  unknownField: {
    summary: 'Unknown field',
    value: {
      errors: [
        {
          code: 'whitelistValidation',
          field: 'extra',
          message: 'property extra should not exist',
        },
      ],
    },
  },
};
