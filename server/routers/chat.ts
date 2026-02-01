import { router, subscriberProcedure } from "../_core/trpc";
import { z } from "zod";
import { saveChatMessage, getChatHistoryByUserId } from "../db-sqlite";
import { searchSimilarDocuments } from "../_core/embeddings";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const chatRouter = router({
  sendMessage: subscriberProcedure
    .input(
      z.object({
        question: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Buscar documentos relevantes no Qdrant
        const relevantDocs = await searchSimilarDocuments(input.question, 5);
        
        let context = "";
        if (relevantDocs.length > 0) {
          context = relevantDocs.map(doc => 
            `Fonte: ${doc.filename} (${doc.section})\n${doc.text}`
          ).join('\n\n');
        }
        
        // Criar prompt para o GPT-4o-mini
        const systemPrompt = `Você é um assistente especializado em normas técnicas e regulamentações brasileiras. 
Use o contexto fornecido para responder às perguntas do usuário de forma precisa e citando as fontes.

Regras:
- Responda sempre em português brasileiro
- Baseie suas respostas apenas no contexto fornecido
- Se não houver informação suficiente no contexto, informe que não encontrou a resposta nas normas disponíveis
- Cite sempre as fontes (nome do arquivo e seção) quando usar informações do contexto
- Seja objetivo e claro nas respostas

Contexto relevante:
${context}

Pergunta do usuário: ${input.question}`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user", 
              content: input.question
            }
          ],
          max_tokens: 1000,
          temperature: 0.3,
        });
        
        const answer = completion.choices[0]?.message?.content || 
          "Desculpe, não consegui processar sua pergunta no momento.";
        
        // Salvar mensagem no histórico
        await saveChatMessage(ctx.user.id, input.question, answer);
        
        return { 
          success: true, 
          answer,
          sources: relevantDocs.map(doc => ({
            filename: doc.filename,
            section: doc.section,
            score: doc.score
          }))
        };
        
      } catch (error) {
        console.error('Error in chat sendMessage:', error);
        
        const fallbackAnswer = "Desculpe, estou com dificuldade processar sua pergunta no momento. Por favor, tente novamente.";
          
        await saveChatMessage(ctx.user.id, input.question, fallbackAnswer);
        
        return { 
          success: true, 
          answer: fallbackAnswer,
          sources: []
        };
      }
    }),

  getHistory: subscriberProcedure
    .query(async ({ ctx }) => {
      return await getChatHistoryByUserId(ctx.user.id, 50);
    }),
});
