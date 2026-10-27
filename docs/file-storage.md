# File storage

Uploads continue to use `POST /api/files/images`: the API validates one JPEG,
PNG or WebP image (maximum 5 MiB) and uploads its buffer. Direct browser uploads
and multiple-image uploads are not implemented. The response remains `{ key, url }`
inside the API's `data` envelope. Save the delivery URL in a unit's `photos` field.
Keep the storage key if calling storage deletion; never pass the URL as a key.
Switching providers does not migrate existing files or keys.

## Cloudinary (default)

Set `FILE_STORAGE_PROVIDER=cloudinary` (or omit it) and configure
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

## S3 with private origin and stable delivery

```dotenv
FILE_STORAGE_PROVIDER=s3
AWS_REGION=eu-west-1
AWS_S3_BUCKET=your-private-bucket
AWS_S3_KEY_PREFIX=airbnb/units
AWS_S3_BASE_URL=https://your-distribution.cloudfront.net
```

The HTTPS base URL must point to a delivery service already configured to read
this bucket. It may include a path prefix; that prefix must map to the bucket's
root so appending `airbnb/units/<uuid>.<extension>` addresses the uploaded object.
Trailing slashes are removed. Object key segments are URL encoded. Credentials,
query strings, and fragments are not allowed in the base URL.
The adapter does not generate presigned URLs or set a public-read ACL.

`AWS_S3_KEY_PREFIX` defaults to `airbnb/units`. Use slash-separated segments
containing letters, numbers, underscores or hyphens, without leading/trailing
slashes. If changed, update both the API IAM permissions and CloudFront bucket
policy below to allow the configured prefix. Existing stored keys remain valid
for deletion; changing the prefix only affects new uploads.

Required AWS setup (created separately; this repository does not provision it):

1. Create a private S3 bucket in `AWS_REGION`. Keep S3 Block Public Access enabled
   and use Bucket owner enforced object ownership (ACLs disabled).
2. Create a CloudFront distribution with the bucket's regular S3 REST origin,
   not an S3 website endpoint. Configure Origin Access Control (OAC) to sign
   origin requests. Keep viewer HTTPS enabled and allow viewers to read images
   without expiring signatures, since the application persists delivery URLs.
3. Grant the CloudFront service principal `s3:GetObject` on
   `arn:aws:s3:::YOUR_BUCKET/airbnb/units/*` in the bucket policy, restricted by
   `AWS:SourceArn` to your distribution ARN. Do not grant anonymous bucket access.
4. Grant the API's IAM role `s3:PutObject` and `s3:DeleteObject` on that same
   object prefix. No ListBucket permission is needed by this adapter. If your
   bucket requires a customer-managed KMS key, configure its policy and the
   necessary KMS permissions for both writers and CloudFront separately.
5. Set `AWS_S3_BASE_URL` to the distribution's HTTPS domain (or configured custom
   domain). Check that a deployed upload is viewable there while direct anonymous
   S3 access is denied. Browser-to-S3 CORS is unnecessary because the API uploads.

Use the SDK's default credential chain: an IAM role in AWS or a configured local
AWS profile. Alternatively set both `AWS_ACCESS_KEY_ID` and
`AWS_SECRET_ACCESS_KEY`; set `AWS_SESSION_TOKEN` too for temporary credentials.
Leave the pair unset or blank for role/profile credentials. Never commit real
credentials or use root account access keys.

Deleting an absent key succeeds. With bucket versioning enabled, deletion creates
a delete marker rather than removing old versions. CloudFront may retain cached
images until their cache TTL expires; immediate invalidations are not implemented.

No AWS account is required to run the mocked adapter tests. Actual upload,
delivery-policy and deletion verification requires the AWS resources above.

References: [CloudFront OAC setup](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)
and [SDK credentials](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html).
