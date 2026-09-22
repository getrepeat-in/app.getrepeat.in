import 'dotenv/config';
import path from 'path';
import sharp from 'sharp';
import mongoose from 'mongoose';
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import ImageAsset from '../models/Image.js';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const QUEUE_URL = process.env.AWS_SQS_QUEUE_URL;

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in the environment.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

function decodeS3Key(key) {
  return decodeURIComponent(key.replace(/\+/g, ' '));
}

const TARGET_SIZES = {
  thumbnail: { width: 150, height: 150, fit: 'cover' },
  card: { width: 400, height: 300, fit: 'cover' },
  detail: { width: 800, height: 600, fit: 'inside' },
};

const FORMATS = ['avif'];

async function processImage(bucketName, rawKey) {
  const decodedKey = decodeS3Key(rawKey);
  
  // Guard: Skip processed variants to avoid infinite event loops
  const isVariant = /_(thumbnail|card|detail)\.(avif|webp|jpg|jpeg|png)$/i.test(decodedKey);
  if (isVariant) {
    console.log(`Skipping processed variant S3 key: ${decodedKey}`);
    return;
  }

  const ext = path.extname(decodedKey).toLowerCase();

  console.log(`Processing S3 object: ${decodedKey}`);

  // If it's a vector graphic (SVG), skip resizing and mark READY
  if (ext === '.svg') {
    console.log('Skipping variant generation for SVG file.');
    await ImageAsset.findOneAndUpdate(
      { original: decodedKey },
      { $set: { thumbnail: decodedKey, card: decodedKey, detail: decodedKey } }
    );
    return;
  }

  // 1. Download original from S3
  const s3Response = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: decodedKey,
    })
  );
  
  const originalBuffer = await streamToBuffer(s3Response.Body);
  const originalMeta = await sharp(originalBuffer).metadata();

  // Populate original metadata info if not present
  const variants = {
    thumbnail: null,
    card: null,
    detail: null,
  };

  // 2. Generate and upload multi-size, multi-format variants
  for (const [sizeName, config] of Object.entries(TARGET_SIZES)) {
    for (const format of FORMATS) {
      try {
        let pipeline = sharp(originalBuffer).resize(config.width, config.height, {
          fit: config.fit,
        });

        if (format === 'avif') {
          pipeline = pipeline.avif({ quality: 50, effort: 4 });
        } else if (format === 'webp') {
          pipeline = pipeline.webp({ quality: 60 });
        } else if (format === 'jpg') {
          pipeline = pipeline.jpeg({ quality: 70 });
        }

        const variantBuffer = await pipeline.toBuffer();
        const variantMeta = await sharp(variantBuffer).metadata();

        // Build key like: .../logo/1234_image_thumbnail.avif
        const extname = path.extname(decodedKey);
        const base = decodedKey.substring(0, decodedKey.length - extname.length);
        const variantKey = `${base}_${sizeName}.${format}`;

        // Upload variant to S3
        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: variantKey,
            Body: variantBuffer,
            ContentType: `image/${format === 'jpg' ? 'jpeg' : format}`,
          })
        );

        console.log(`Generated and uploaded ${sizeName} (${format}) to S3.`);

        variants[sizeName] = variantKey;
      } catch (variantErr) {
        console.error(`Failed to process variant ${sizeName} in ${format}:`, variantErr);
      }
    }
  }

  // 3. Save all variant metadata
  const updatedAsset = await ImageAsset.findOneAndUpdate(
    { original: decodedKey },
    {
      $set: {
        thumbnail: variants.thumbnail,
        card: variants.card,
        detail: variants.detail,
      }
    },
    { returnDocument: 'after' }
  );

  if (updatedAsset) {
    console.log(`Successfully completed variant processing for ImageAsset (${updatedAsset._id})`);
  } else {
    console.warn(`No ImageAsset record in MongoDB found matching key: ${decodedKey}`);
  }
}

async function handleMessage(message) {
  try {
    const body = JSON.parse(message.Body);
    console.log('Received SQS Message:', message.MessageId);

    if (body.Records && Array.isArray(body.Records)) {
      for (const record of body.Records) {
        const bucketName = record.s3?.bucket?.name;
        const key = record.s3?.object?.key;

        if (bucketName && key) {
          await processImage(bucketName, key);
        }
      }
    } else {
      console.log('Skipping message: Body is not a standard S3 event record.');
    }
  } catch (error) {
    console.error('Error handling SQS message:', error);
  }
}

async function startWorker() {
  await connectDB();
  console.log(`Starting Image Worker. Listening on queue: ${QUEUE_URL}...`);

  while (true) {
    try {
      const sqsResponse = await sqsClient.send(
        new ReceiveMessageCommand({
          QueueUrl: QUEUE_URL,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 20,
        })
      );

      const messages = sqsResponse.Messages || [];
      if (messages.length === 0) continue;

      console.log(`Processing ${messages.length} messages...`);

      for (const message of messages) {
        await handleMessage(message);

        await sqsClient.send(
          new DeleteMessageCommand({
            QueueUrl: QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle,
          })
        );
        console.log('Deleted message from queue.');
      }
    } catch (error) {
      console.error('Error in SQS Polling Loop:', error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

startWorker().catch(console.error);
