import crypto from 'crypto-js'
import hex_encode from 'crypto-js/enc-hex'
import { BUCKET_REGION, ACCESS_KEY_ID, ACCESS_SECRET_ACCESS_KEY, S3_DEV_BUCKET, S3_PROD_BUCKET } from '@/config/server'

const bucket =
  process.env.NODE_ENV === 'development' ||
  process.env.VERCEL_ENV === 'development' ||
  process.env.VERCEL_ENV === 'preview'
    ? S3_DEV_BUCKET
    : S3_PROD_BUCKET

const PERDAY = 24 * 60 * 60 * 1000
const expiration = new Date(Date.now() + PERDAY).toISOString()
const bucketUrl =
  process.env.NODE_ENV === 'development'
    ? `http://${bucket}.s3.${BUCKET_REGION}.amazonaws.com`
    : `https://${bucket}.s3.amazonaws.com`
const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
const credentials = `${ACCESS_KEY_ID}/${date}/${BUCKET_REGION}/s3/aws4_request`

const getSignature = () => {
  const kDate = crypto.HmacSHA256(date, `AWS4${ACCESS_SECRET_ACCESS_KEY}`)
  const kRegion = crypto.HmacSHA256(BUCKET_REGION, kDate)
  const kService = crypto.HmacSHA256('s3', kRegion)
  const kSigning = crypto.HmacSHA256('aws4_request', kService)
  return kSigning
}

const getPolicy = (userId: string, type: string) => {
  return {
    expiration,
    conditions: [
      { bucket },
      ['starts-with', '$key', `user/${userId}/`],
      { acl: 'public-read' },
      ['starts-with', '$Content-Type', `image/${type || 'jpg'}`],
      { 'x-amz-credential': credentials },
      { 'x-amz-algorithm': 'AWS4-HMAC-SHA256' },
      { 'x-amz-date': `${date}T000000Z` },
    ],
  }
}

export default async function signature(req: NextApiRequest, res: NextApiResponse) {
  const { userId, type } = req.body
  const policy = getPolicy(userId, type)
  const policyB64 = Buffer.from(JSON.stringify(policy), 'utf-8').toString('base64')
  const signatureKey = getSignature()
  const signature = hex_encode.stringify(crypto.HmacSHA256(policyB64, signatureKey))

  res.status(200).json({
    signature,
    url: bucketUrl,
    policyB64,
    credentials,
    date: `${date}T000000Z`,
  })
}
