import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import dotenv from 'dotenv'
import { GetObjectCommand, DeleteObjectCommand} from "@aws-sdk/client-s3"
import * as presigner  from "@aws-sdk/s3-request-presigner"

dotenv.config()



const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY


const s3Client = new S3Client({
    region,
     credentials: {
        accessKeyId,
        secretAccessKey
  }
});

export async function uploadImage(imageBuffer, imageName, mimetype) {


    
    // Create params that the S3 client will use to upload the image
    const params = {
      Bucket: bucketName,
      Key: imageName,
      Body: imageBuffer,
      ContentType: mimetype
    }
  
    console.log("params         ",params)
    // Upload the image to S3
    const command = new PutObjectCommand(params)
    
    const data = await s3Client.send(command)
  
    return data
  }
  //Getting objects from S3

export async function getSignedUrl(fileName) {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName
    })
  
    const signedUrl = await presigner.getSignedUrl(s3Client, command, { expiresIn: 60 * 60 * 24 })
  
    return signedUrl
  }
  
//write function to delete object from s3

  export async function deleteImage(fileName) {

    const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: fileName,
    });
    const data = await s3Client.send(command);
    return data;
}