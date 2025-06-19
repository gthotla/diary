import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront"
import { getSignedUrl } from "@aws-sdk/cloudfront-signer"
import { readFileSync } from 'fs'
import dotenv from 'dotenv'

dotenv.config()

const bucketName = process.env.S3_BUCKET_NAME
const region = process.env.AWS_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
const cloudfrontDistributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID
const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN // e.g., 'dwxz7pdheutva.cloudfront.net'
const cloudfrontKeyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID
const cloudfrontPrivateKeyPath = process.env.CLOUDFRONT_PRIVATE_KEY_PATH
//console.log(cloudfrontPrivateKeyPath);
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
})

const cloudFrontClient = new CloudFrontClient({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
})

export function uploadFile(fileBuffer, fileName, mimetype) {
  const uploadParams = {
    Bucket: bucketName,
    Body: fileBuffer,
    Key: fileName,
    ContentType: mimetype
  }
  return s3Client.send(new PutObjectCommand(uploadParams));
}

export async function deleteFile(fileName) {
  const deleteParams = {
    Bucket: bucketName,
    Key: fileName,
  }
  
  // Delete from S3
  await s3Client.send(new DeleteObjectCommand(deleteParams));
  
  // Invalidate CloudFront cache
  await invalidateCloudFrontCache([`/${fileName}`]);
}

export async function getCloudFrontSignedUrl(key, expiresInSeconds = 3600) {
  try {
    const privateKey = readFileSync(cloudfrontPrivateKeyPath, 'utf8');
    
    const url = `https://${cloudfrontDomain}/${key}`;
    const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
    
    const signedUrl = getSignedUrl({
      url,
       keyPairId: cloudfrontKeyPairId, 
      privateKey,
      dateLessThan: new Date( Date.now() + (1000 /*sec*/ * 60))
    });
    console.log('Generated CloudFront signed URL:', signedUrl);
    return signedUrl;
  } catch (error) {
    console.error('Error generating CloudFront signed URL:', error);
    // Fallback: return unsigned CloudFront URL
    return `https://${cloudfrontDomain}/${key}`;
  }
}

export async function invalidateCloudFrontCache(paths) {
  try {
    const params = {
      DistributionId: cloudfrontDistributionId,
      InvalidationBatch: {
        Paths: {
          Quantity: paths.length,
          Items: paths
        },
        CallerReference: `invalidation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    };
    
    const command = new CreateInvalidationCommand(params);
    const result = await cloudFrontClient.send(command);
    console.log('CloudFront invalidation created:', result.Invalidation.Id);
    return result;
  } catch (error) {
    console.error('Error invalidating CloudFront cache:', error);
    throw error;
  }
}

// Keep the original S3 signed URL function as backup
export async function getObjectSignedUrl(key) {
  const params = {
    Bucket: bucketName,
    Key: key
  }
  const command = new GetObjectCommand(params);
  const seconds = 60
  const url = await getSignedUrl(s3Client, command, { expiresIn: seconds });
  return url
}
