import OpenAI from 'openai';
import { QdrantClient } from '@qdrant/js-client-rest';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

export const COLLECTION_NAME = 'normas';

export async function ensureCollectionExists() {
  try {
    await qdrant.getCollection(COLLECTION_NAME);
  } catch (error) {
    // Collection doesn't exist, create it
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 1536, // OpenAI text-embedding-3-small dimension
        distance: 'Cosine',
      },
    });
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  
  return response.data[0].embedding;
}

export async function searchSimilarDocuments(query: string, limit: number = 5) {
  const queryEmbedding = await generateEmbedding(query);
  
  const searchResult = await qdrant.search(COLLECTION_NAME, {
    vector: queryEmbedding,
    limit: limit,
    with_payload: true,
  });
  
  return searchResult.map(result => ({
    id: result.id,
    score: result.score,
    text: result.payload?.text || '',
    filename: result.payload?.filename || '',
    page: result.payload?.page || 0,
    section: result.payload?.section || '',
  }));
}

export async function upsertDocument(
  id: string,
  text: string,
  metadata: {
    filename: string;
    page?: number;
    section?: string;
  }
) {
  const embedding = await generateEmbedding(text);
  
  await qdrant.upsert(COLLECTION_NAME, {
    points: [
      {
        id,
        vector: embedding,
        payload: {
          text,
          ...metadata,
        },
      },
    ],
  });
}

export async function deleteDocument(id: string) {
  await qdrant.delete(COLLECTION_NAME, {
    points: [id],
  });
}
