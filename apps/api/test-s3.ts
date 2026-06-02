import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.AWS_REGION || "eu-north-1";
const bucket = process.env.S3_BUCKET || "examina2026";
const client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
  }
});

async function main() {
  console.log(`Region: ${region}, Bucket: ${bucket}`);
  console.log(`Access Key: ${process.env.AWS_ACCESS_KEY_ID}`);
  
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: "test-avatar.png",
    ContentType: "image/png"
  });

  try {
    const url = await getSignedUrl(client, command, { expiresIn: 300 });
    console.log("Presigned URL created successfully:", url);
  } catch (error) {
    console.error("Error creating presigned URL:", error);
  }
}

main();
