module.exports = {
  db: process.env.db || 'localhost',
  clientSecret: process.env.clientSecret,
  tokenSecret: process.env.tokenSecret,
  FACEBOOK_SECRET: process.env.FACEBOOK_SECRET,
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
  AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
  S3_BUCKET: process.env.S3_BUCKET,
  SENDGRID_USERNAME: process.env.SENDGRID_USERNAME,
  SENDGRID_PASSWORD: process.env.SENDGRID_PASSWORD,
  PAYPAL_DEV_CLIENT_ID: process.env.PAYPAL_DEV_CLIENT_ID,
  PAYPAL_DEV_SECRET: process.env.PAYPAL_DEV_SECRET
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY
};
