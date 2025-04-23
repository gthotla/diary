import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { schemaMap } from './SchemaMap.js';

dotenv.config();

const localMasterKey = Buffer.from(process.env.LOCAL_MASTER_KEY, 'base64');
const keyVaultNamespace = 'encryption.__keyVault';

const kmsProviders = {
  local: {
    key: localMasterKey,
  },
};

export const getEncryptedClient = async () => {
  const client = new MongoClient(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoEncryption: {
      keyVaultNamespace,
      kmsProviders,
      schemaMap,
    },
  });

  await client.connect();
  return client;
};
