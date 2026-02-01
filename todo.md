# NormaIA - TODO List

## Fase 1: Configuração Base
- [x] Configurar variáveis de ambiente (Supabase, OpenAI, Qdrant, AbacatePay)
- [x] Criar schema de banco de dados (profiles, subscriptions, chat_history, norms, documents)
- [x] Implementar migrações do Drizzle ORM
- [x] Configurar conexão com Supabase
- [x] Testar conexão com banco de dados

## Fase 2: Landing Page Pública
- [x] Criar layout da landing page em português
- [x] Implementar seção Hero com título e descrição
- [x] Adicionar seção de Benefícios
- [x] Implementar seção de Preços (R$89/mês, 7 dias grátis)
- [x] Criar CTA "Comece grátis por 7 dias"
- [x] Implementar modal de signup na landing page
- [x] Responsividade mobile-first

## Fase 3: Autenticação Supabase
- [x] Integrar Supabase Auth (email/password + Google)
- [x] Criar página de Login em português
- [x] Criar página de Registro em português
- [x] Implementar fluxo de logout
- [x] Criar perfil de usuário automaticamente no signup
- [x] Criar subscription com trial de 7 dias no signup
- [x] Validação de formulários em português
- [x] Proteção de rotas (redirect para login se não autenticado)

## Fase 4: Dashboard Protegido
- [x] Criar layout do dashboard com sidebar
- [x] Implementar navegação: Chat, Histórico, Perfil, Assinatura
- [x] Criar interface de chat (estilo WhatsApp)
- [x] Implementar input de mensagens em português
- [x] Adicionar display de mensagens do usuário e IA
- [x] Implementar loading states durante respostas
- [x] Responsividade mobile-first

## Fase 5: Integração RAG (Qdrant + OpenAI)
- [ ] Configurar conexão com Qdrant
- [ ] Implementar embedding de perguntas com OpenAI
- [ ] Criar busca vetorial em Qdrant (collection "normas")
- [ ] Implementar retrieval de top 5-8 chunks relevantes
- [ ] Criar prompt para GPT-4o-mini com citações de normas
- [x] Implementar salva de question + answer em chat_history
- [ ] Tratamento de respostas quando não há normas carregadas

## Fase 6: Sistema de Assinaturas (AbacatePay)
- [ ] Integrar AbacatePay API
- [x] Criar lógica de verificação de trial ativo
- [ ] Implementar bloqueio de chat quando trial expirado
- [ ] Criar billing com AbacatePay (MULTIPLE_PAYMENTS, R$89/mês)
- [ ] Implementar webhook para billing.paid
- [ ] Atualizar status de subscription após pagamento
- [x] Página de Assinatura com status e link de pagamento
- [ ] Exibir "Renove sua assinatura" quando trial expirado

## Fase 7: Upload de Normas PDF
- [ ] Criar página de upload de PDFs (admin/protected)
- [ ] Implementar extração de texto de PDFs
- [ ] Implementar chunking de texto por seção/parágrafo
- [ ] Criar embedding de chunks com OpenAI
- [ ] Fazer upsert de chunks em Qdrant com metadata (filename, page, section)
- [ ] Armazenar PDFs em S3
- [ ] Salvar metadata de documentos no banco de dados
- [ ] Validação de tipos de arquivo

## Fase 8: Histórico e Perfil
- [ ] Criar página de Histórico com lista de conversas anteriores
- [ ] Implementar funcionalidade de clicar em conversa para resumir
- [ ] Criar página de Perfil do usuário
- [ ] Permitir edição de nome e certificações
- [ ] Exibir informações de assinatura no perfil
- [ ] Implementar funcionalidade de deletar conta

## Fase 9: PWA e Instalabilidade
- [ ] Criar manifest.json com metadata da app
- [ ] Implementar service worker para offline
- [ ] Adicionar ícones para iOS e Android
- [ ] Configurar theme-color e display
- [ ] Testar instalabilidade em mobile
- [ ] Implementar atualização automática de SW

## Fase 10: Notificações para Proprietário
- [ ] Implementar notificação de novo cadastro
- [ ] Implementar notificação de upload de normas
- [ ] Implementar notificação de eventos críticos
- [ ] Usar sistema de notificações built-in do Manus
- [ ] Testar entrega de notificações

## Fase 11: Testes e Deploy
- [ ] Escrever testes unitários com Vitest
- [ ] Testar fluxo completo de autenticação
- [ ] Testar fluxo de chat e RAG
- [ ] Testar fluxo de pagamento
- [ ] Testar responsividade mobile
- [ ] Testar PWA em mobile
- [ ] Otimizar performance
- [ ] Preparar para deploy em Vercel
- [ ] Deploy e obter URL ao vivo

## Funcionalidades Adicionais
- [ ] Dark mode opcional
- [ ] Suporte a múltiplos idiomas (começar com PT-BR)
- [ ] Analytics e tracking de uso
- [ ] Backup automático de dados
- [ ] Rate limiting para API
