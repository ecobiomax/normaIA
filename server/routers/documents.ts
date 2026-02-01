import { router, subscriberProcedure } from "../_core/trpc";
import { z } from "zod";
import { processPDFDocument, uploadDocumentChunks } from "../_core/documentProcessor";

export const documentsRouter = router({
  uploadPDF: subscriberProcedure
    .input(
      z.object({
        filename: z.string().min(1),
        fileData: z.string(), // Base64 encoded file
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Convert base64 to buffer
        const buffer = Buffer.from(input.fileData, 'base64');
        
        // Process PDF document
        const chunks = await processPDFDocument(input.filename, buffer);
        
        // Upload chunks to Qdrant
        await uploadDocumentChunks(chunks);
        
        return {
          success: true,
          message: `Documento "${input.filename}" processado com sucesso!`,
          chunksProcessed: chunks.length,
        };
        
      } catch (error) {
        console.error('Error uploading PDF:', error);
        
        return {
          success: false,
          message: 'Erro ao processar o documento. Verifique se o arquivo é um PDF válido.',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  getDocuments: subscriberProcedure
    .query(async ({ ctx }) => {
      // TODO: Implementar listagem de documentos do banco de dados
      return {
        documents: [],
        message: 'Funcionalidade em desenvolvimento',
      };
    }),
});
