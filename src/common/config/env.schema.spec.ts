import { envSchema } from './env.schema';

describe('storage environment validation', () => {
  const required = {
    MONGO_URI: 'mongodb://localhost/test',
    JWT_SECRET: 'test',
    REFRESH_TOKEN_SECRET: 'test',
    INITIAL_ADMIN_PASSWORD: 'test-password',
  };
  const s3 = {
    ...required,
    FILE_STORAGE_PROVIDER: 's3',
    AWS_REGION: 'eu-west-1',
    AWS_S3_BUCKET: 'test-bucket',
    AWS_S3_BASE_URL: 'https://images.example.com/media/',
  };

  it('defaults to Cloudinary without requiring AWS settings', () => {
    const result = envSchema.validate({
      ...required,
      CLOUDINARY_CLOUD_NAME: 'test',
      CLOUDINARY_API_KEY: 'test',
      CLOUDINARY_API_SECRET: 'test',
      AWS_REGION: '',
      AWS_S3_BUCKET: '',
      AWS_S3_BASE_URL: '',
      AWS_ACCESS_KEY_ID: '',
      AWS_SECRET_ACCESS_KEY: '',
    });
    expect(result.error).toBeUndefined();
    expect(result.value).toMatchObject({ FILE_STORAGE_PROVIDER: 'cloudinary' });
  });

  it('accepts S3 with role credentials or a complete temporary credential pair', () => {
    expect(envSchema.validate(s3).error).toBeUndefined();
    expect(
      envSchema.validate({
        ...s3,
        AWS_ACCESS_KEY_ID: 'test',
        AWS_SECRET_ACCESS_KEY: 'test',
        AWS_SESSION_TOKEN: 'test-token',
      }).error,
    ).toBeUndefined();
  });

  it.each(['AWS_REGION', 'AWS_S3_BUCKET', 'AWS_S3_BASE_URL'])('requires %s for S3', (name) =>
    expect(envSchema.validate({ ...s3, [name]: '' }).error).toBeDefined(),
  );

  it('defaults the key prefix and accepts a custom prefix', () => {
    expect(envSchema.validate(s3).value).toMatchObject({ AWS_S3_KEY_PREFIX: 'airbnb/units' });
    expect(
      envSchema.validate({ ...s3, AWS_S3_KEY_PREFIX: 'rental/unit-images' }).error,
    ).toBeUndefined();
  });

  it.each(['/images', 'images/', '../images', 'images//units', 'images?query'])(
    'rejects invalid key prefix %s',
    (prefix) =>
      expect(envSchema.validate({ ...s3, AWS_S3_KEY_PREFIX: prefix }).error).toBeDefined(),
  );

  it.each([
    'http://images.example.com',
    'https://user:password@images.example.com',
    'https://images.example.com?signature=temporary',
    'https://images.example.com/#fragment',
  ])('rejects an unsafe delivery base URL: %s', (url) => {
    expect(envSchema.validate({ ...s3, AWS_S3_BASE_URL: url }).error).toBeDefined();
  });

  it.each(['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'])('rejects an unpaired %s', (name) =>
    expect(envSchema.validate({ ...s3, [name]: 'test' }).error).toBeDefined(),
  );
});
