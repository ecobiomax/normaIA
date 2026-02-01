import * as pdf from 'pdf-parse';
import { upsertDocument, ensureCollectionExists } from './embeddings';

export interface DocumentChunk {
  id: string;
  text: string;
  filename: string;
  page?: number;
  section?: string;
}

export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    const chunk = text.slice(i, i + chunkSize);
    if (chunk.trim().length > 50) { // Skip very small chunks
      chunks.push(chunk.trim());
    }
  }
  
  return chunks;
}

export async function extractTextFromPDF(buffer: Buffer): Promise<{ text: string; numPages: number }> {
  const data = await pdf.default(buffer);
  return {
    text: data.text,
    numPages: data.numpages,
  };
}

export function splitIntoSections(text: string): Array<{ text: string; section: string }> {
  // Try to identify sections based on common patterns in technical documents
  const sectionPatterns = [
    /^(\d+\.\s+.*$)/gm,    // 1. Section Title
    /^([A-Z][A-Z\s]+:)/gm, // SECTION TITLE:
    /^(Art\.\s*\d+)/gm,    // Art. 1º
    /^(\d+\s*-\s*.*)/gm,   // 1 - Section
  ];
  
  let sections: Array<{ text: string; section: string }> = [];
  
  for (const pattern of sectionPatterns) {
    const matches = text.split(pattern);
    if (matches.length > 1) {
      for (let i = 1; i < matches.length; i += 2) {
        const sectionTitle = matches[i].trim();
        const sectionContent = matches[i + 1]?.trim() || '';
        
        if (sectionContent.length > 100) {
          sections.push({
            section: sectionTitle,
            text: `${sectionTitle}\n${sectionContent}`,
          });
        }
      }
      break; // Use the first pattern that works
    }
  }
  
  // If no sections found, treat the whole document as one section
  if (sections.length === 0) {
    sections.push({
      section: 'Documento Completo',
      text: text,
    });
  }
  
  return sections;
}

export async function processPDFDocument(
  filename: string,
  buffer: Buffer
): Promise<DocumentChunk[]> {
  await ensureCollectionExists();
  
  const { text, numPages } = await extractTextFromPDF(buffer);
  const sections = splitIntoSections(text);
  const chunks: DocumentChunk[] = [];
  
  for (const section of sections) {
    const textChunks = chunkText(section.text);
    
    for (let i = 0; i < textChunks.length; i++) {
      const chunk: DocumentChunk = {
        id: `${filename}_${section.section}_${i}_${Date.now()}`,
        text: textChunks[i],
        filename,
        section: section.section,
      };
      
      chunks.push(chunk);
    }
  }
  
  return chunks;
}

export async function uploadDocumentChunks(chunks: DocumentChunk[]): Promise<void> {
  for (const chunk of chunks) {
    await upsertDocument(chunk.id, chunk.text, {
      filename: chunk.filename,
      section: chunk.section,
    });
  }
}
