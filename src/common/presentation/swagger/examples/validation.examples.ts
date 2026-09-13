// Captured from the current DTO validators; keep examples aligned with runtime errors.
export const LOGIN_VALIDATION_EXAMPLES = {
  email: {
    summary: 'email ? required field',
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
    summary: 'password ? required field',
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
    summary: 'email ? invalid format',
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
    summary: 'name ? required field',
    value: {
      errors: [
        {
          code: 'isNotEmpty',
          field: 'name',
          message: 'validation.isNotEmpty|{}',
        },
        {
          code: 'isString',
          field: 'name',
          message: 'validation.isString|{}',
        },
        {
          code: 'minLength',
          field: 'name',
          message: 'validation.minLength|{"constraints":[2]}',
        },
        {
          code: 'maxLength',
          field: 'name',
          message: 'validation.maxLength|{"constraints":[50]}',
        },
      ],
    },
  },
  email: {
    summary: 'email ? required field',
    value: {
      errors: [
        {
          code: 'isEmail',
          field: 'email',
          message:
            'validation.isEmail|{"constraints":[{"allow_display_name":false,"allow_underscores":false,"require_display_name":false,"allow_utf8_local_part":true,"require_tld":true,"blacklisted_chars":"","ignore_max_length":false,"host_blacklist":[],"host_whitelist":[]}]}',
        },
        {
          code: 'isNotEmpty',
          field: 'email',
          message: 'validation.isNotEmpty|{}',
        },
        {
          code: 'isString',
          field: 'email',
          message: 'validation.isString|{}',
        },
      ],
    },
  },
  countryCode: {
    summary: 'countryCode ? required field',
    value: {
      errors: [
        {
          code: 'isNotEmpty',
          field: 'countryCode',
          message: 'validation.isNotEmpty|{}',
        },
        {
          code: 'isString',
          field: 'countryCode',
          message: 'validation.isString|{}',
        },
      ],
    },
  },
  phone: {
    summary: 'phone ? required field',
    value: {
      errors: [
        {
          code: 'isNotEmpty',
          field: 'phone',
          message: 'validation.isNotEmpty|{}',
        },
        {
          code: 'isString',
          field: 'phone',
          message: 'validation.isString|{}',
        },
      ],
    },
  },
  password: {
    summary: 'password ? required field',
    value: {
      errors: [
        {
          code: 'isNotEmpty',
          field: 'password',
          message: 'validation.isNotEmpty|{}',
        },
        {
          code: 'isString',
          field: 'password',
          message: 'validation.isString|{}',
        },
        {
          code: 'minLength',
          field: 'password',
          message: 'validation.minLength|{"constraints":[8]}',
        },
        {
          code: 'maxLength',
          field: 'password',
          message: 'validation.maxLength|{"constraints":[128]}',
        },
      ],
    },
  },
  invalidEmail: {
    summary: 'email ? invalid format',
    value: {
      errors: [
        {
          code: 'isEmail',
          field: 'email',
          message:
            'validation.isEmail|{"value":"invalid-email","constraints":[{"allow_display_name":false,"allow_underscores":false,"require_display_name":false,"allow_utf8_local_part":true,"require_tld":true,"blacklisted_chars":"","ignore_max_length":false,"host_blacklist":[],"host_whitelist":[]}]}',
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
    summary: 'token ? required field',
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
    summary: 'name ? required field',
    value: {
      errors: [
        {
          code: 'isNotEmpty',
          field: 'name',
          message: 'validation.isNotEmpty|{}',
        },
        {
          code: 'isString',
          field: 'name',
          message: 'validation.isString|{}',
        },
        {
          code: 'minLength',
          field: 'name',
          message: 'validation.minLength|{"constraints":[2]}',
        },
        {
          code: 'maxLength',
          field: 'name',
          message: 'validation.maxLength|{"constraints":[50]}',
        },
      ],
    },
  },
  email: {
    summary: 'email ? required field',
    value: {
      errors: [
        {
          code: 'isEmail',
          field: 'email',
          message:
            'validation.isEmail|{"constraints":[{"allow_display_name":false,"allow_underscores":false,"require_display_name":false,"allow_utf8_local_part":true,"require_tld":true,"blacklisted_chars":"","ignore_max_length":false,"host_blacklist":[],"host_whitelist":[]}]}',
        },
        {
          code: 'isNotEmpty',
          field: 'email',
          message: 'validation.isNotEmpty|{}',
        },
        {
          code: 'isString',
          field: 'email',
          message: 'validation.isString|{}',
        },
      ],
    },
  },
  phone: {
    summary: 'phone ? required field',
    value: {
      errors: [
        {
          code: 'isNotEmpty',
          field: 'phone',
          message: 'validation.isNotEmpty|{}',
        },
        {
          code: 'isString',
          field: 'phone',
          message: 'validation.isString|{}',
        },
      ],
    },
  },
  password: {
    summary: 'password ? required field',
    value: {
      errors: [
        {
          code: 'isNotEmpty',
          field: 'password',
          message: 'validation.isNotEmpty|{}',
        },
        {
          code: 'isString',
          field: 'password',
          message: 'validation.isString|{}',
        },
        {
          code: 'minLength',
          field: 'password',
          message: 'validation.minLength|{"constraints":[8]}',
        },
        {
          code: 'maxLength',
          field: 'password',
          message: 'validation.maxLength|{"constraints":[128]}',
        },
      ],
    },
  },
  invalidEmail: {
    summary: 'email ? invalid format',
    value: {
      errors: [
        {
          code: 'isEmail',
          field: 'email',
          message:
            'validation.isEmail|{"value":"invalid-email","constraints":[{"allow_display_name":false,"allow_underscores":false,"require_display_name":false,"allow_utf8_local_part":true,"require_tld":true,"blacklisted_chars":"","ignore_max_length":false,"host_blacklist":[],"host_whitelist":[]}]}',
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
