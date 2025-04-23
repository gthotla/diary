import { Binary } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const base64DataKeyId = process.env.DATA_KEY_ID;
const dataKeyId = new Binary(Buffer.from(base64DataKeyId, 'base64'), 4);

export const schemaMap = {
  'diary.Diary': {  // 👈 change to your actual DB and collection name
    bsonType: 'object',
    encryptMetadata: {
      keyId: [dataKeyId],
    },
    properties: {
      entry: {
        encrypt: {
          bsonType: 'string',
          algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic',
        },
      },
    },
  },
};
