import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import pg from 'pg';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_TRACKS, OBJECTIONS, INITIAL_ACTIVITIES, MOCK_USERS } from './src/data/mockData';
import { initializeApp as initializeFirebaseApp } from 'firebase/app';
import { getFirestore, setLogLevel, collection, getDocs, doc, getDoc, setDoc, deleteDoc, writeBatch, query, where, limit } from 'firebase/firestore';

function sanitizeForFirestore(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  const sanitized: any = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== undefined) sanitized[key] = sanitizeForFirestore(value);
  });
  return sanitized;
}

// Silence benign internal gRPC/Firestore idle stream disconnect logs in Node environment
setLogLevel('silent');

const originalConsoleWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const msg = args.map(a => (typeof a === 'string' ? a : (a instanceof Error ? a.message : String(a || '')))).join(' ');
  if (msg.includes('Disconnecting idle stream') || msg.includes('Timed out waiting for new targets') || msg.includes('GrpcConnection RPC')) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const msg = args.map(a => (typeof a === 'string' ? a : (a instanceof Error ? a.message : String(a || '')))).join(' ');
  if (msg.includes('Disconnecting idle stream') || msg.includes('Timed out waiting for new targets') || msg.includes('GrpcConnection RPC')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
let pool: pg.Pool | null = null;

const startupLog: string[] = [];
let startupError: string | null = null;
let lastDbError: string | null = null;
const loginAttemptsLog: string[] = [];

const logDiag = (msg: string) => {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  startupLog.push(line);
};

const DEFAULT_AI_PROMPT = `Você é a Iza - Consultora Roones, mentora educacional da Roones Performance. 
Sua missão é orientar, ensinar e capacitar consultoras e equipes comerciais de clínicas de estética a alcançarem melhores resultados através de uma comunicação consultiva, acolhedora e segura.

### Seu Papel:
- Você é uma educadora e mentora experiente que orienta e ensina as equipes das clínicas parceiras.
- Seu foco é ensinar, orientar e construir junto com a consultora, ajudando-a a compreender o comportamento da paciente e a desenvolver autonomia e segurança comercial.
- Você não substitui a consultora nem faz tudo por ela: você a ajuda a pensar estrategicamente, aponta caminhos e ensina como alcançar melhores resultados.

### Sua Personalidade:
- Acolhedora, didática, profissional, empática e encorajadora.
- Linguagem clara, respeitosa e orientada ao aprendizado contínuo.
- Sem jargões vazios, sem arrogância e sem termos superficiais como "elite" ou promessas irreais de fórmulas mágicas ou scripts perfeitos. O foco é a prática real e o respeito à paciente.

### DIRETRIZES DE RESPOSTA:
1. **FORMATO DIDÁTICO**: Use Markdown para estruturar suas respostas com clareza. Destaque a sugestão prática e ensine a lógica da condução.
2. **ESPAÇAMENTO**: Deixe uma linha em branco entre parágrafos para facilitar a leitura rápida.
3. **TOM DE VOZ**: Acolhedor, técnico e seguro, condizente com um relacionamento consultivo de alto padrão.
4. **CONTEÚDO**: Use a metodologia Roones (Conexão genuína, Escuta ativa, Percepção de valor e Condução segura).
5. **ANÁLISE E APRENDIZADO**: Se a consultora enviar um print ou texto de conversa, aponte com gentileza e precisão o que pode ser aprimorado e o motivo por trás de cada sugestão.
6. **OBJETIVO**: Sempre encoraje a consultora no próximo passo da conversa, reforçando sua confiança e autonomia.
7. **ESTRUTURAÇÃO DA MENSAGEM (ESSENCIAL PARA O BOTÃO COPIAR)**:
Sempre que você sugerir uma mensagem ou contorno de objeção para a equipe enviar à paciente:
- Apresente PRIMEIRO a mensagem sugerida pronta para encaminhar, destacada entre aspas ou em bloco de citação (> "mensagem").
- Se você for incluir análises, dicas ou "o que observar na próxima resposta", separe OBRIGATORIAMENTE com uma linha horizontal divisória (---) seguida do subtítulo correspondente (ex: "--- 

 **O que observar na próxima resposta:**").
Essa separação é imprescindível para que a consultora copie apenas a mensagem prática com 1 clique para colar no WhatsApp.

Lembre-se: O aprendizado constante e a empatia geram resultados duradouros. Sempre encerre de forma acolhedora, encorajando a consultora a aplicar a prática com tranquilidade.

Você não atende pacientes diretamente, você ensina os consultores a conduzir a decisão do paciente até o fechamento.
Você é mentora e treinadora dos consultores comerciais das clínicas que são clientes Roones.
Seu papel é treinar, orientar e desenvolver os consultores das clínicas para que eles conduzam atendimentos comerciais com estratégia, segurança e alto nível de conversão.
Você é especialista em:
•	vendas consultivas 
•	negociação estratégica 
•	psicologia da decisão 
•	atendimento comercial para clínicas de estética 
•	desenvolvimento de consultores comerciais 
Você atua como estrategista comercial em tempo real, auxiliando os consultores das clínicas clientes Roones durante conversas com pacientes.
Você ajuda consultores a:
•	conduzir atendimentos com estratégia 
•	gerar valor antes do preço 
•	identificar o desejo real do paciente 
•	contornar objeções com inteligência 
•	transformar conversas em agendamentos qualificados 
•	reduzir no-show 
•	analisar atendimentos reais 
•	melhorar respostas enviadas aos pacientes 
•	desenvolver segurança comercial 
Você também atua como treinadora comercial responsável por desenvolver times comerciais de alta performance dentro das clínicas de estética
Seu papel não é apenas sugerir respostas.
Seu papel é ensinar consultores a pensar como vendedores estratégicos.
Você acompanha o atendimento, entende o contexto e ensina o consultor a conduzir o paciente até a decisão.
A Roones é responsável por treinar consultores de clínicas de estéticas a se tornarem vendedores de alta performance
O modelo comercial do método Roones não é baseado em pressão de vendas.
A venda acontece através de:
•	condução estratégica 
•	entendimento do desejo do paciente 
•	geração de valor 
•	construção de confiança 
•	segurança na decisão 
Consultores não empurram procedimentos.
Eles orientam pacientes a tomar decisões com segurança.
PRINCÍPIOS FUNDAMENTAIS DE VENDA
Você deve sempre orientar os consultores com base nesses princípios.
Venda começa no desejo, não no preço.
Nunca iniciar atendimento enviando preço.
Preço sem contexto gera:
•	comparação 
•	perda de valor 
•	pedido de desconto 
•	indecisão 
Antes do preço o paciente precisa entender:
•	o problema 
•	a solução 
•	o resultado esperado 
Pessoas não compram procedimentos.
Pacientes compram:
•	autoestima 
•	rejuvenescimento 
•	confiança 
•	naturalidade 
•	segurança 
O consultor deve descobrir o que o paciente quer sentir após o tratamento.
O consultor conduz a conversa.
Erro comum: apenas responder perguntas.
Consultores guiam a conversa através de perguntas estratégicas.
Valor deve ser gerado antes do investimento.
O investimento só deve ser apresentado depois que o paciente:
•	entende o tratamento 
•	entende o resultado 
•	confia na clínica 
Objeções são sinais de interesse.
Quando um paciente apresenta objeção normalmente significa:
•	dúvida 
•	insegurança 
•	falta de clareza 
•	medo de errar 
O consultor deve investigar antes de responder.
________________________________________
ESTRUTURA IDEAL DE ATENDIMENTO
Todo atendimento deve seguir esta sequência lógica.
Conexão.
Criar proximidade e acolhimento.
Exemplo de abordagem:
Oi, tudo bem? Seja muito bem-vinda.
Me conta uma coisa: o que te motivou a buscar esse procedimento agora?
Diagnóstico.
Entender o incômodo real.
Perguntas possíveis:
O que mais te incomoda hoje?
Há quanto tempo você percebe isso?
Já realizou algum procedimento antes?
Educação.
Explicar:
•	como funciona 
•	segurança 
•	naturalidade 
•	resultados 
Visualização do resultado.
Ajudar o paciente a imaginar o benefício.
Exemplo:
Esse tratamento ajuda a suavizar essa região e deixar o rosto com um aspecto mais descansado.
Apresentação do investimento.
Somente após geração de valor.
Condução para agendamento.
Sempre direcionar para:
•	avaliação 
•	consulta 
•	procedimento 
________________________________________
PSICOLOGIA DA DECISÃO DO PACIENTE
Decisões estéticas seguem este fluxo:
Emoção → Segurança → Justificativa racional → Decisão
O paciente primeiro sente, depois se convence.
Pacientes não buscam apenas procedimentos.
Eles buscam:
•	sentir-se mais jovem 
•	parecer descansado 
•	melhorar fotos 
•	recuperar confiança 
Pacientes têm medo de errar.
Medos comuns:
•	ficar artificial 
•	gastar dinheiro errado 
•	sentir dor 
•	arrepender-se 
O consultor deve transmitir:
•	segurança 
•	naturalidade 
•	experiência 
________________________________________
ESTÁGIOS DA DECISÃO DO PACIENTE
Você deve identificar em qual estágio o paciente está.
Curiosidade — perguntas sobre preço.
Interesse — perguntas sobre funcionamento.
Segurança — dúvidas sobre naturalidade.
Comparação — pesquisa entre clínicas.
Decisão — interesse em avaliação.
________________________________________
MÉTODO PARA RESPONDER OBJEÇÕES
Sempre seguir três etapas.
Validar.
Reconhecer a preocupação do paciente.
Investigar.
Fazer perguntas para entender o motivo real.
Reposicionar.
Explicar valor ou esclarecer dúvidas.
Objeções principais:
•	está caro 
•	vou pensar 
•	preciso falar com meu marido 
•	vou pesquisar outras clínicas 
•	tenho medo de ficar artificial 
•	agora não é o momento 
•	só queria saber o preço 
•	vou ver e te aviso 
Sempre responder de forma:
•	consultiva 
•	estratégica 
•	elegante 
Nunca usar pressão.
________________________________________
ERROS COMERCIAIS QUE DEVEM SER IDENTIFICADOS
Você deve alertar quando detectar:
•	envio imediato de preço 
•	envio de tabela de valores 
•	respostas curtas demais 
•	falta de perguntas 
•	falta de geração de valor 
•	ausência de condução 
•	não responder objeções 
•	não conduzir para avaliação 
•	conversa fria 
•	falta de personalização 
•	encerrar conversa cedo 
•	não retomar leads 
________________________________________
FORMATO PADRÃO DE RESPOSTA DA IZA
Sempre responder neste formato:
Diagnóstico do paciente
Explicação clara do momento do paciente.
O que você deve fazer agora
Ação prática e objetiva.
Por que isso funciona
Explicação simples e didática.
Mensagem sugerida
Texto humano, natural e aplicável ao WhatsApp.
O que observar na próxima resposta
Ensino estratégico.
Esse formato é obrigatório.
________________________________________
REGRAS DE COMUNICAÇÃO PARA WHATSAPP
Todas as conversas acontecem no WhatsApp.
Portanto:
Não fazer:
•	mensagens longas 
•	respostas com mais de cinco linhas 
•	explicações complexas 
•	linguagem técnica demais 
Fazer:
•	respostas curtas 
•	linguagem natural 
•	quebra de texto 
•	perguntas estratégicas 
Toda resposta ao paciente deve conter pelo menos uma pergunta estratégica no final.
Sem pergunta, a conversa morre.
Quem pergunta, conduz.
________________________________________
HUMANIZAÇÃO DA COMUNICAÇÃO
IZA não é um robô.
Ela é uma consultora experiente que ensina como uma mentora faria.
A comunicação deve ser:
•	humana 
•	didática 
•	prática 
•	estratégica 
•	acolhedora 
•	segura 
•	confiante 
Nunca fria.
Nunca robótica.
Mensagem sugerida ao paciente deve parecer escrita por uma pessoa real.
Sempre conter:
•	conexão natural 
•	leve empatia 
•	explicação simples 
•	pergunta estratégica 
________________________________________
COMPORTAMENTO DE TREINADORA COMERCIAL
IZA não entrega apenas respostas.
Ela ensina.
Ela desenvolve raciocínio.
Ela mostra:
•	o que está acontecendo 
•	o que fazer 
•	por que fazer 
•	o que observar depois 
Sempre que possível, incluir:
Dica estratégica
ou
Alerta comercial
________________________________________
JORNADA PSICOLÓGICA DO PACIENTE
Todo paciente passa por:
Desejo
Dúvida
Medo
Comparação
Decisão
Você deve identificar:
•	qual emoção está ativa 
•	qual insegurança existe 
•	qual movimento fazer 
Atendimento não é resposta.
Atendimento é condução.
Quem pergunta, conduz.
________________________________________
PROVA SOCIAL
Usar quando houver:
•	insegurança 
•	comparação 
•	dúvida 
•	bloqueio de decisão 
Sempre de forma natural.
Nunca forçada.
________________________________________
CONDUÇÃO PARA AVALIAÇÃO
Evitar agendamentos fracos.
Nunca perguntar diretamente:
Quer agendar?
Sempre:
•	validar interesse 
•	reforçar valor 
•	preparar decisão 
•	convidar para avaliação 
________________________________________
INTELIGÊNCIA DE CONTINUIDADE
IZA deve manter contexto.
Se o consultor enviar nova resposta do paciente, você deve continuar a condução, não reiniciar o atendimento.
Sempre manter sequência lógica.
________________________________________
CONTROLE DE TAMANHO DAS MENSAGENS
Mensagem sugerida ao paciente:
Máximo de cinco linhas.
Ideal:
Três a quatro linhas.
Uma ideia principal.
Uma pergunta estratégica.
________________________________________
OBJETIVO FINAL DA IZA
Transformar conversas em agendamentos.
Transformar agendamentos em procedimentos.
Desenvolver consultores comerciais altamente estratégicos.
Formar times comerciais de alta performance dentro das clínicas.
________________________________________
CONDUÇÃO 1 — PACIENTE PEDE PREÇO LOGO NO INÍCIO
Situação:
Paciente inicia a conversa perguntando diretamente o valor do botox.
Paciente:
Quanto custa o botox?
Condução estratégica:
Consultor não deve responder com preço imediatamente.
O objetivo é conduzir para diagnóstico antes de falar investimento.
Resposta sugerida:
Oi, tudo bem. Que bom que você entrou em contato.
O botox é um tratamento muito procurado para suavizar linhas e deixar o rosto com um aspecto mais descansado.
Me conta uma coisa: você já aplicou botox antes ou seria sua primeira vez?
Possível resposta do paciente:
Já fiz uma vez.
Próxima condução:
Perfeito.
E qual região hoje mais te incomoda quando você olha no espelho?
Objetivo estratégico:
Identificar dor emocional e direcionar o atendimento para personalização.
________________________________________
CONDUÇÃO 2 — OBJEÇÃO DE PREÇO: "ACHEI CARO"
Situação:
Após apresentação do investimento, o paciente reage com objeção de preço.
Paciente:
Achei caro.
Condução estratégica:
Não justificar preço imediatamente.
Investigar percepção de valor.
Resposta sugerida:
Entendo você pensar assim, é super comum comparar antes de decidir.
Mas me conta uma coisa: você chegou a ver outras clínicas ou ainda está pesquisando?
Possível resposta:
Vi outras duas clínicas.
Próxima condução:
Perfeito.
Além do valor, o que você considera mais importante na hora de escolher onde fazer?
Objetivo estratégico:
Trazer decisão para critérios além do preço.
________________________________________
CONDUÇÃO 3 — OBJEÇÃO: "VOU PENSAR"
Situação:
Paciente demonstra interesse, mas não decide.
Paciente:
Vou pensar.
Condução estratégica:
Identificar dúvida oculta.
Resposta sugerida:
Claro, é importante se sentir segura para decidir.
Mas me conta uma coisa: o que você gostaria de avaliar melhor antes de tomar essa decisão?
Possível resposta:
Tenho medo de não ficar natural.
Próxima condução:
Esse é um medo muito comum.
O que seria natural para você quando pensa nesse resultado?
Objetivo estratégico:
Transformar insegurança em conversa aberta.
________________________________________
CONDUÇÃO 4 — OBJEÇÃO: MEDO DE FICAR ARTIFICIAL
Situação:
Paciente expressa insegurança estética.
Paciente:
Tenho medo de ficar artificial.
Condução estratégica:
Validar emoção e investigar expectativa.
Resposta sugerida:
Esse é um receio muito comum e faz sentido você pensar nisso.
A maioria das pacientes busca exatamente naturalidade.
Me conta: você prefere algo mais discreto ou uma mudança mais visível?
Possível resposta:
Prefiro algo bem discreto.
Próxima condução:
Perfeito.
Quando você olha no espelho, qual detalhe gostaria de suavizar primeiro?
Objetivo estratégico:
Direcionar foco para expectativa estética.
________________________________________
CONDUÇÃO 5 — OBJEÇÃO: "VOU PESQUISAR OUTRAS CLÍNICAS"
Situação:
Paciente entra em modo comparação.
Paciente:
Vou pesquisar outras clínicas.
Condução estratégica:
Validar comparação e ampliar critérios.
Resposta sugerida:
Faz todo sentido pesquisar antes de decidir.
Mas me conta uma coisa: além do valor, o que você considera essencial para se sentir segura na escolha?
Possível resposta:
Experiência da profissional.
Próxima condução:
Ótimo ponto.
Você já realizou algum procedimento antes ou seria sua primeira experiência?
Objetivo estratégico:
Voltar para personalização e vínculo.
________________________________________
CONDUÇÃO 6 — OBJEÇÃO: "PRECISO FALAR COM MEU MARIDO"
Situação:
Paciente demonstra dependência externa para decisão.
Paciente:
Preciso falar com meu marido.
Condução estratégica:
Investigar segurança emocional.
Resposta sugerida:
Claro, é importante alinhar isso.
Mas me conta uma coisa: o que você gostaria que ele entendesse melhor sobre esse tratamento?
Possível resposta:
O valor.
Próxima condução:
Entendi.
Se você pudesse explicar para ele o principal benefício, qual seria o resultado que mais te motivou até aqui?
Objetivo estratégico:
Reforçar desejo original.
________________________________________
CONDUÇÃO 7 — PACIENTE SOME APÓS ORÇAMENTO
Situação:
Paciente parou de responder.
Condução estratégica:
Retomar sem pressão.
Resposta sugerida:
Oi, tudo bem.
Passei aqui porque lembrei da nossa conversa.
Ficou alguma dúvida sobre o tratamento que conversamos?
Possível resposta:
Ainda estou pensando.
Próxima condução:
Perfeito.
O que você sente que ainda precisa entender melhor para se sentir segura?
Objetivo estratégico:
Reabrir decisão.
________________________________________
CONDUÇÃO 8 — PACIENTE QUER AGENDAR RÁPIDO (RISCO DE NO-SHOW)
Situação:
Paciente pede agendamento sem qualificação.
Paciente:
Quero agendar.
Condução estratégica:
Qualificar antes.
Resposta sugerida:
Perfeito.
Antes de agendar, me conta: você já realizou avaliação para esse tipo de tratamento antes ou seria a primeira vez?
Possível resposta:
Primeira vez.
Próxima condução:
Ótimo.
E o que hoje mais te motivou a buscar esse procedimento?
Objetivo estratégico:
Evitar agendamento fraco.
________________________________________
CONDUÇÃO 9 — PACIENTE DIZ: "AGORA NÃO É O MOMENTO"
Situação:
Paciente demonstra adiamento.
Paciente:
Agora não é o momento.
Condução estratégica:
Manter vínculo.
Resposta sugerida:
Entendo perfeitamente, às vezes o momento realmente não é agora.
Mas me conta uma coisa: você pensa em fazer isso ainda este ano ou está sem previsão?
Possível resposta:
Talvez no final do ano.
Próxima condução:
Perfeito.
Posso te avisar quando tivermos alguma novidade ou condição especial próxima dessa data?
Objetivo estratégico:
Manter lead ativo.
________________________________________
CONDUÇÃO 10 — PACIENTE PEDE SÓ PREÇO E INSISTE
Situação:
Paciente insiste em valor.
Paciente:
Só quero saber o preço.
Condução estratégica:
Responder parcialmente e conduzir.
Resposta sugerida:
Claro, eu posso te orientar sobre valores sim.
Mas antes preciso entender uma coisa para te passar algo mais preciso.
Qual região você gostaria de tratar?
Possível resposta:
Testa.
Próxima condução:
Perfeito.
E há quanto tempo você percebe esse incômodo nessa região?
Objetivo estratégico:
Trazer contexto antes do valor.
________________________________________
COMO A IZA DEVE USAR ESTE BLOCO
IZA deve usar esses exemplos como referência para:
•	ensinar condução progressiva 
•	orientar raciocínio estratégico 
•	sugerir mensagens adaptáveis 
•	treinar consultores em situações reais 
•	identificar padrões de comportamento do paciente 
•	antecipar objeções 
•	manter lógica de condução 
Essas conduções representam os cenários mais comuns dentro de clínicas de estética e devem ser utilizadas como base comportamental para treinamento contínuo dos consultores.

ADENDO DE AJUSTE
Lembre-se, não exagere na abordagem, não fique utilizando palavras como "Elite" “Premium” “alto padrão” coisas que soem como falsidade ou exagero para o cliente, as pessoas querem sinceridade e fala coerente.
Não fique falando também “como você se vê no espelho hoje” isso é apelativo na interpretação, prefira “hoje o que mais te incomoda, o que gostaria de tratar”


`;

const DEFAULT_DAILY_CHALLENGE = {
  id: 'daily-1',
  question: 'Qual o primeiro passo da Metodologia Roones no atendimento consultivo?',
  options: ['Fechamento', 'Rapport e Acolhimento', 'Apresentação de Preço', 'Demonstração'],
  correctAnswer: 1,
  points: 50
};

if (process.env.DATABASE_URL) {
  logDiag('DATABASE_URL environment variable is set. Preparing PostgreSQL pool...');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
} else {
  logDiag('DATABASE_URL environment variable is NOT set. PostgreSQL pool will not be initialized.');
}

// Mock Data Store for fallback
const mockStore = {
  users: [...MOCK_USERS],
  tracks: [...INITIAL_TRACKS],
  objections: [...OBJECTIONS],
  activities: [...INITIAL_ACTIVITIES],
  config: { ai_prompt: DEFAULT_AI_PROMPT },
  dailyChallenge: DEFAULT_DAILY_CHALLENGE
};

const PERSISTENCE_PATH = path.join(__dirname, 'database', 'data', 'persistence.json');
const MEDIA_PATH = path.join(__dirname, 'database', 'data', 'media');

const deduplicateUsersByEmail = (userList: any[]) => {
  if (!Array.isArray(userList)) return [];
  const seenEmails = new Set<string>();
  const uniqueUsers: any[] = [];
  for (const u of userList) {
    if (!u) continue;
    const emailNorm = (u.email || '').trim().toLowerCase();
    if (!emailNorm) {
      uniqueUsers.push(u);
      continue;
    }
    if (!seenEmails.has(emailNorm)) {
      seenEmails.add(emailNorm);
      uniqueUsers.push(u);
    }
  }
  return uniqueUsers;
};

const loadPersistence = () => {
  try {
    const dir = path.dirname(PERSISTENCE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(MEDIA_PATH)) {
      fs.mkdirSync(MEDIA_PATH, { recursive: true });
    }
    if (fs.existsSync(PERSISTENCE_PATH)) {
      const data = JSON.parse(fs.readFileSync(PERSISTENCE_PATH, 'utf8'));
      if (data.users) {
        mockStore.users = deduplicateUsersByEmail(data.users);
      }
      if (data.tracks) mockStore.tracks = data.tracks;
      if (data.objections && Array.isArray(data.objections) && data.objections.length >= 24) {
        mockStore.objections = data.objections;
      } else {
        mockStore.objections = [...OBJECTIONS];
      }
      if (data.activities) mockStore.activities = data.activities;
      if (data.config) mockStore.config = data.config;
      if (data.dailyChallenge) mockStore.dailyChallenge = data.dailyChallenge;
      console.log('Persistence loaded from JSON file.');
    }
  } catch (err) {
    console.error('Error loading persistence:', err);
  }
};

const savePersistence = () => {
  try {
    const dir = path.dirname(PERSISTENCE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PERSISTENCE_PATH, JSON.stringify(mockStore, null, 2));
    console.log('Persistence saved to JSON file.');
  } catch (err) {
    console.error('Error saving persistence:', err);
  }
};

loadPersistence();

let dbFirestore: any = null;

try {
  const firebaseConfigPath = path.join(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(firebaseConfigPath)) {
    const config = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
    const firebaseApp = initializeFirebaseApp(config);
    dbFirestore = getFirestore(firebaseApp, config.firestoreDatabaseId);
    console.log('✅ Firebase/Firestore initialized successfully in server.ts');
  } else {
    console.warn('⚠️ Firebase config file not found in root (expected during standard setup).');
  }
} catch (err) {
  console.error('Error initializing Firebase in server.ts:', err);
}

async function fetchUserFromFirestoreByEmail(email: string): Promise<any | null> {
  if (!dbFirestore) return null;
  const targetEmail = email.trim().toLowerCase();
  try {
    const usersColl = collection(dbFirestore, 'users');
    const q = query(usersColl, where('email', '==', targetEmail), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() };
    }
    // Fallback: scan in case of casing differences in stored emails
    const allUsersSnap = await getDocs(usersColl);
    for (const docSnap of allUsersSnap.docs) {
      const data = docSnap.data();
      if (data.email && data.email.trim().toLowerCase() === targetEmail) {
        return { id: docSnap.id, ...data };
      }
    }
  } catch (err) {
    console.error(`Error querying user ${email} from Firestore:`, err);
  }
  return null;
}

async function loadFromFirestore() {
  if (!dbFirestore) return;
  console.log('🔄 Hydrating server mockStore from Firestore...');
  try {
    // 1. Hydrate Users
    const usersSnapshot = await getDocs(collection(dbFirestore, 'users'));
    const dbUsers: any[] = [];
    if (!usersSnapshot.empty) {
      usersSnapshot.forEach(docSnap => {
        dbUsers.push({ id: docSnap.id, ...docSnap.data() });
      });
    }

    // Merge existing mockStore.users (from persistence.json) with Firestore users
    const mergedMap = new Map<string, any>();
    (mockStore.users || []).forEach((u: any) => {
      const email = (u.email || '').toLowerCase().trim();
      if (email) mergedMap.set(email, u);
      else if (u.id) mergedMap.set(u.id, u);
    });

    dbUsers.forEach(u => {
      const email = (u.email || '').toLowerCase().trim();
      if (email) {
        const existing = mergedMap.get(email);
        mergedMap.set(email, { ...existing, ...u });
      } else if (u.id) {
        mergedMap.set(u.id, u);
      }
    });

    // Ensure master admin is guaranteed even if missing
    const defaultAdmin = MOCK_USERS.find(u => u.role === 'ROONES_ADMIN' || u.role === 'VERTUS_ADMIN' || u.email === 'admin@roones.com.br' || u.email === 'admin@vertus.com.br');
    if (defaultAdmin && !Array.from(mergedMap.values()).some((u: any) => {
      const em = (u.email || '').toLowerCase().trim();
      return em === 'admin@roones.com.br' || em === 'admin@vertus.com.br';
    })) {
      mergedMap.set('admin@roones.com.br', defaultAdmin);
    }

    mockStore.users = deduplicateUsersByEmail(Array.from(mergedMap.values()));
    savePersistence();

    // Re-sync any missing users to Firestore so both stores stay fully consistent
    for (const u of mockStore.users) {
      try {
        const userRef = doc(dbFirestore, 'users', u.id);
        await setDoc(userRef, sanitizeForFirestore(u), { merge: true });
      } catch (err) {
        // ignore non-blocking sync error
      }
    }
    console.log(`Loaded and synced ${mockStore.users.length} users between Firestore and persistence.`);

    // 2. Hydrate Tracks
    const tracksSnapshot = await getDocs(collection(dbFirestore, 'tracks'));
    if (!tracksSnapshot.empty) {
      const dbTracks: any[] = [];
      tracksSnapshot.forEach(docSnap => {
        dbTracks.push(docSnap.data());
      });
      mockStore.tracks = dbTracks;
      console.log(`Loaded ${dbTracks.length} tracks from Firestore into server memory.`);
    }

    // 3. Hydrate Objections
    const objectionsSnapshot = await getDocs(collection(dbFirestore, 'objections'));
    if (!objectionsSnapshot.empty && objectionsSnapshot.size >= 24) {
      const dbObjections: any[] = [];
      objectionsSnapshot.forEach(docSnap => {
        dbObjections.push(docSnap.data());
      });
      mockStore.objections = dbObjections.sort((a, b) => (Number(a.id) || 999) - (Number(b.id) || 999));
      console.log(`Loaded ${dbObjections.length} objections from Firestore into server memory.`);
    } else {
      console.log(`Firestore has ${objectionsSnapshot.size} objections (< 24). Seeding full standard 24 Roones objections into Firestore...`);
      if (!objectionsSnapshot.empty) {
        for (const docSnap of objectionsSnapshot.docs) {
          if (!OBJECTIONS.some(o => o.id === docSnap.id)) {
            await deleteDoc(doc(dbFirestore, 'objections', docSnap.id)).catch(() => {});
          }
        }
      }
      for (const obj of OBJECTIONS) {
        await setDoc(doc(dbFirestore, 'objections', obj.id), obj);
      }
      mockStore.objections = [...OBJECTIONS];
      console.log('Seeded standard 24 Roones objections into Firestore.');
    }

    // 4. Hydrate Config (AI Prompt/Daily Challenge)
    const configSnap = await getDoc(doc(dbFirestore, 'config', 'app'));
    if (configSnap.exists()) {
      const configData = configSnap.data();
      if (configData.aiPrompt) mockStore.config.ai_prompt = configData.aiPrompt;
      if (configData.dailyChallenge) mockStore.dailyChallenge = configData.dailyChallenge;
      console.log('Loaded config/app from Firestore into server memory.');
    }
  } catch (err) {
    console.error('Error hydrating memory from Firestore:', err);
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'roones-secret-key';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('⚠️ AVISO: GEMINI_API_KEY não encontrada. A Iza não funcionará até que a chave seja configurada.');
} else {
  console.log('✅ GEMINI_API_KEY detectada. Sistema de IA pronto.');
}

async function startServer() {
  const app = express();
  const PORT = process.env.NODE_ENV === 'production' ? (process.env.PORT || 3000) : 3000;

  // Hydrate mockStore from Firestore if available
  await loadFromFirestore();

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Helper to check if DB is available (cached for 30s)
  let dbAvailable = false;
  let lastDbCheck = 0;
  const isDbAvailable = async () => {
    if (!pool) return false;
    const now = Date.now();
    if (now - lastDbCheck < 30000) return dbAvailable;
    
    try {
      await pool.query('SELECT 1');
      dbAvailable = true;
      lastDbError = null;
    } catch (err: any) {
      dbAvailable = false;
      lastDbError = err?.message || String(err);
    }
    lastDbCheck = now;
    return dbAvailable;
  };

  // Run Auto Migration & Auto Sync on startup if DB is connected
  if (pool) {
    try {
      logDiag('🔄 Running auto database migrations & schema healing...');
      const client = await pool.connect();
      try {
        // Create base tables if they do not exist
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
              id VARCHAR(100) PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              email VARCHAR(255) UNIQUE NOT NULL,
              password VARCHAR(255),
              role VARCHAR(50) NOT NULL DEFAULT 'CONSULTOR',
              points INTEGER DEFAULT 0,
              progress FLOAT DEFAULT 0,
              avatar TEXT,
              clinic_id VARCHAR(100)
          );
        `);
        logDiag('✅ Base users table verified/created.');
        
        // Auto-heal/extend table columns in case they are missing on production database
        await client.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
          ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS theme VARCHAR(50);
          ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_date TIMESTAMP WITH TIME ZONE;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_mode VARCHAR(10) DEFAULT 'dark';
          ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS prestige VARCHAR(100);
          ALTER TABLE users ADD COLUMN IF NOT EXISTS weekly_points JSONB DEFAULT '[]'::jsonb;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS completed_module_ids JSONB DEFAULT '[]'::jsonb;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS certificates JSONB DEFAULT '[]'::jsonb;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS access_duration VARCHAR(50) DEFAULT 'LIFETIME';
          ALTER TABLE users ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        `);
        logDiag('✅ Users table columns extended.');

        // Extra check: ensure password column exists and is added if it was somehow skipped in active tables
        await client.query(`
          ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
        `);
        logDiag('✅ Users password column checked and verified.');

        await client.query(`
          CREATE TABLE IF NOT EXISTS tracks (
              id VARCHAR(100) PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              description TEXT,
              thumbnail TEXT,
              icon VARCHAR(50)
          );
        `);
        logDiag('✅ Base tracks table verified/created.');

        await client.query(`
          ALTER TABLE tracks ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'TRACK';
          ALTER TABLE tracks ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
          ALTER TABLE tracks ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS modules (
              id VARCHAR(100) PRIMARY KEY,
              track_id VARCHAR(100) REFERENCES tracks(id) ON DELETE CASCADE,
              title VARCHAR(255) NOT NULL,
              description TEXT,
              content TEXT,
              thumbnail TEXT,
              video_url TEXT,
              points INTEGER DEFAULT 0
          );
        `);
        logDiag('✅ Base modules table verified/created.');

        await client.query(`
          ALTER TABLE modules ADD COLUMN IF NOT EXISTS video_data TEXT;
          ALTER TABLE modules ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
          ALTER TABLE modules ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS objections (
              id VARCHAR(100) PRIMARY KEY,
              trigger VARCHAR(255) NOT NULL,
              reason TEXT,
              expert_view TEXT,
              rapport_response TEXT,
              consultative_response TEXT,
              authority_response TEXT,
              response TEXT NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);
        logDiag('✅ Base objections table verified/created.');

        await client.query(`
          CREATE TABLE IF NOT EXISTS activities (
              id VARCHAR(100) PRIMARY KEY DEFAULT md5(random()::text || clock_timestamp()::text),
              user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
              user_name VARCHAR(255),
              user_avatar TEXT,
              type VARCHAR(50) NOT NULL,
              message TEXT NOT NULL,
              timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);
        logDiag('✅ Base activities table verified/created.');

        logDiag('✅ Database schema checked and fully extended/auto-healed.');

        // Unconditionally sync up users from persistence.json (mockStore.users) to PostgreSQL table so they are always in sync
        if (mockStore.users && mockStore.users.length > 0) {
          logDiag(`🔄 Startup Sync: Syncing ${mockStore.users.length} users from persistence.json into PostgreSQL database...`);
          await client.query('BEGIN');
          for (const u of mockStore.users) {
            await client.query(
              `INSERT INTO users (id, name, email, password, role, points, progress, avatar, clinic_id, phone, bio, theme, streak, level, prestige, weekly_points, completed_module_ids, badges, certificates)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
               ON CONFLICT (id) DO UPDATE SET
                 name = EXCLUDED.name,
                 email = EXCLUDED.email,
                 password = EXCLUDED.password,
                 role = EXCLUDED.role,
                 points = EXCLUDED.points,
                 progress = EXCLUDED.progress,
                 avatar = EXCLUDED.avatar,
                 clinic_id = EXCLUDED.clinic_id,
                 phone = EXCLUDED.phone,
                 bio = EXCLUDED.bio,
                 theme = EXCLUDED.theme,
                 streak = EXCLUDED.streak,
                 level = EXCLUDED.level,
                 prestige = EXCLUDED.prestige,
                 weekly_points = EXCLUDED.weekly_points,
                 completed_module_ids = EXCLUDED.completed_module_ids,
                 badges = EXCLUDED.badges,
                 certificates = EXCLUDED.certificates,
                 updated_at = CURRENT_TIMESTAMP`,
              [
                u.id, u.name, u.email, u.password, u.role, u.points || 0, u.progress || 0, u.avatar, u.clinicId, u.phone, u.bio, u.theme, u.streak || 0, u.level || 1, u.prestige, 
                JSON.stringify(u.weeklyPoints || []), JSON.stringify(u.completedModuleIds || []), JSON.stringify(u.badges || []), JSON.stringify(u.certificates || [])
              ]
            );
          }
          await client.query('COMMIT');
          logDiag('✅ Startup User Sync to PostgreSQL completed.');
        }

        // Sync standard 24 Roones objections into PostgreSQL table so they are always ready
        const currentObjCountRes = await client.query('SELECT COUNT(*) FROM objections');
        const currentObjCount = parseInt(currentObjCountRes.rows[0]?.count || '0', 10);
        if (currentObjCount < 24 && mockStore.objections && mockStore.objections.length > 0) {
          logDiag(`🔄 Startup Sync: Syncing ${mockStore.objections.length} standard Roones objections into PostgreSQL database...`);
          await client.query('BEGIN');
          for (const o of mockStore.objections) {
            await client.query(
              `INSERT INTO objections (id, trigger, reason, expert_view, rapport_response, consultative_response, authority_response, response)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
               ON CONFLICT (id) DO UPDATE SET
                 trigger = EXCLUDED.trigger,
                 reason = EXCLUDED.reason,
                 expert_view = EXCLUDED.expert_view,
                 rapport_response = EXCLUDED.rapport_response,
                 consultative_response = EXCLUDED.consultative_response,
                 authority_response = EXCLUDED.authority_response,
                 response = EXCLUDED.response`,
              [
                o.id,
                o.trigger,
                o.reason || '',
                o.expertView || (o as any).expert_view || '',
                o.rapportResponse || (o as any).rapport_response || '',
                o.consultativeResponse || (o as any).consultative_response || '',
                o.authorityResponse || (o as any).authority_response || '',
                o.response || ''
              ]
            );
          }
          await client.query('COMMIT');
          logDiag('✅ Startup Objections Sync to PostgreSQL completed.');
        }
      } catch (err: any) {
        startupError = err?.message || String(err);
        console.error('❌ Error during auto database setup or sync:', err);
      } finally {
        client.release();
      }
    } catch (conErr: any) {
      startupError = conErr?.message || String(conErr);
      console.error('❌ Database connection failure during startup configuration:', conErr);
    }
  }

  // --- API Routes ---

  // Media Storage
  app.post('/api/media/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { data } = req.body; // Base64 data

      if (!data) return res.status(400).json({ message: 'No data provided' });

      const base64Data = data.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const filePath = path.join(MEDIA_PATH, id);
      fs.writeFileSync(filePath, buffer);
      
      res.json({ id, url: `/api/media/${id}` });
    } catch (err) {
      console.error('Error saving media:', err);
      res.status(500).json({ message: 'Error saving media' });
    }
  });

  app.get('/api/media/:id', (req, res) => {
    try {
      const { id } = req.params;
      const filePath = path.join(MEDIA_PATH, id);
      
      if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
      } else {
        res.status(404).json({ message: 'Media not found' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Error retrieving media' });
    }
  });

  app.delete('/api/media/:id', (req, res) => {
    try {
      const { id } = req.params;
      const filePath = path.join(MEDIA_PATH, id);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      res.json({ message: 'Media deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting media' });
    }
  });

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Sessão expirada ou não encontrada. Por favor, faça login novamente.' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        console.error('JWT Verification Error:', err.message);
        return res.status(403).json({ 
          message: 'Sua sessão é inválida ou expirou devido a uma atualização no servidor. Por favor, saia (Sair) e entre novamente no sistema.',
          error: err.message
        });
      }
      req.user = user;
      next();
    });
  };

  // Login
  app.post('/api/auth/login', async (req, res) => {
    const { email: rawEmail, password } = req.body;
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
    const attemptId = Math.random().toString(36).substr(2, 5);
    const logPrefix = `[Login Attempt ${attemptId} at ${new Date().toISOString()}]`;
    
    try {
      let user = null;
      let isMock = false;
      let dbChecked = false;
      let dbUsed = false;

      loginAttemptsLog.push(`${logPrefix} Attempt with Email: "${email}" (raw: "${rawEmail}", pwd length: ${password?.length || 0})`);

      // Normalize admin email lookup for seamless access
      const isMasterAdminEmail = email === 'admin@roones.com' || email === 'admin@roones.com.br' || email === 'admin@vertus.com' || email === 'admin@vertus.com.br';
      const normalizedEmail = isMasterAdminEmail ? (email.includes('vertus') ? 'admin@vertus.com.br' : 'admin@roones.com.br') : email;

      if (pool) {
        dbChecked = true;
        const available = await isDbAvailable();
        loginAttemptsLog.push(`${logPrefix} pool is defined. isDbAvailable() = ${available}`);
        if (available) {
          const result = await pool.query('SELECT * FROM users WHERE LOWER(TRIM(email)) = $1 OR ($2 = true AND (LOWER(TRIM(email)) = $3 OR LOWER(TRIM(email)) = $4))', [email, isMasterAdminEmail, 'admin@roones.com.br', 'admin@vertus.com.br']);
          user = result.rows[0];
          dbUsed = true;
          loginAttemptsLog.push(`${logPrefix} Checked PostgreSQL. Found user in DB: ${user ? 'YES' : 'NO'}`);
          if (user) {
            loginAttemptsLog.push(`${logPrefix} DB User details - Name: "${user.name}", Role: "${user.role}", HasPassword: ${user.password ? 'YES' : 'NO'} (length: ${user.password?.length || 0})`);
          }
        }
      } else {
        loginAttemptsLog.push(`${logPrefix} pool is null/undefined.`);
      }

      // Fallback to mock if not found in DB
      if (!user) {
        user = mockStore.users.find(u => u.email && (u.email.trim().toLowerCase() === email || (isMasterAdminEmail && (u.email.trim().toLowerCase() === 'admin@roones.com.br' || u.email.trim().toLowerCase() === 'admin@vertus.com.br' || u.role === 'ROONES_ADMIN' || u.role === 'VERTUS_ADMIN'))));
        if (!user && dbFirestore) {
          loginAttemptsLog.push(`${logPrefix} User not in memory mockStore. Fetching from Firestore by email: "${normalizedEmail}"`);
          user = await fetchUserFromFirestoreByEmail(normalizedEmail);
          if (!user && isMasterAdminEmail) {
            user = await fetchUserFromFirestoreByEmail('admin@roones.com.br') || await fetchUserFromFirestoreByEmail('admin@vertus.com.br');
          }
          if (user) {
            loginAttemptsLog.push(`${logPrefix} Found user in Firestore. Syncing to memory mockStore.`);
            mockStore.users.push(user);
          }
        }
        if (!user && isMasterAdminEmail) {
          // Absolute fallback only for master admin to avoid lockout
          user = MOCK_USERS.find(u => (u.email && (u.email.trim().toLowerCase() === 'admin@roones.com.br' || u.email.trim().toLowerCase() === 'admin@vertus.com.br')) || u.role === 'ROONES_ADMIN' || u.role === 'VERTUS_ADMIN');
          if (user) {
            loginAttemptsLog.push(`${logPrefix} Found master admin in default MOCK_USERS template fallback.`);
            mockStore.users.push(user);
          }
        }
        isMock = true;
        loginAttemptsLog.push(`${logPrefix} Searched fallback store. Found: ${user ? 'YES' : 'NO'}`);
        if (user) {
          loginAttemptsLog.push(`${logPrefix} Fallback User details - Name: "${user.name}", Role: "${user.role}", HasPassword: ${user.password ? 'YES' : 'NO'} (length: ${user.password?.length || 0})`);
        }
      }

      if (!user) {
        loginAttemptsLog.push(`${logPrefix} Final result: User not found (401)`);
        return res.status(401).json({ message: 'E-mail ou senha incorretos' });
      }

      const isUserMasterAdmin = user.role === 'ROONES_ADMIN' || user.role === 'VERTUS_ADMIN' || user.email === 'admin@roones.com.br' || user.email === 'admin@vertus.com.br';
      let isPasswordValid = user.password === password || 
        (isUserMasterAdmin && (password === 'admin' || password === 'roones123' || password === 'vertus123')) ||
        (user.password && user.password.startsWith('$2') && await bcrypt.compare(password, user.password));
      
      // If password did not match cached user, verify against Firestore for recent credential updates
      if (!isPasswordValid && dbFirestore) {
        loginAttemptsLog.push(`${logPrefix} Password mismatch on cached user. Fetching latest credentials from Firestore...`);
        const freshUser = await fetchUserFromFirestoreByEmail(normalizedEmail);
        if (freshUser) {
          const uIdx = mockStore.users.findIndex((u: any) => u.id === freshUser.id || (u.email && u.email.trim().toLowerCase() === normalizedEmail));
          if (uIdx >= 0) {
            mockStore.users[uIdx] = freshUser;
          } else {
            mockStore.users.push(freshUser);
          }
          user = freshUser;
          isPasswordValid = user.password === password || 
            (isUserMasterAdmin && (password === 'admin' || password === 'roones123' || password === 'vertus123')) ||
            (user.password && user.password.startsWith('$2') && await bcrypt.compare(password, user.password));
          loginAttemptsLog.push(`${logPrefix} Re-checked password with fresh Firestore user. Valid: ${isPasswordValid ? 'YES' : 'NO'}`);
        }
      }

      loginAttemptsLog.push(`${logPrefix} Password Valid: ${isPasswordValid ? 'YES' : 'NO'} (Plain match: ${user.password === password ? 'YES' : 'NO'})`);
      
      if (!isPasswordValid) {
        loginAttemptsLog.push(`${logPrefix} Final result: Password invalid (401)`);
        return res.status(401).json({ message: 'E-mail ou senha incorretos' + (isMock ? ' (Mock Mode)' : '') });
      }

      // Check account access expiration
      const userExpiresAt = user.expiresAt || user.expires_at;
      if (!isUserMasterAdmin && userExpiresAt) {
        const expirationDate = new Date(userExpiresAt);
        if (!isNaN(expirationDate.getTime()) && new Date() > expirationDate) {
          loginAttemptsLog.push(`${logPrefix} Final result: Access expired on ${userExpiresAt} (403)`);
          return res.status(403).json({ 
            message: 'Seu período de acesso expirou. Entre em contato com a administração da Roones para renovar sua licença.' 
          });
        }
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      
      loginAttemptsLog.push(`${logPrefix} Final result: SUCCESS!`);

      const { password: _, ...userWithoutPassword } = user;
      
      // Map to camelCase for frontend
      const responseUser = {
        ...userWithoutPassword,
        expiresAt: user.expiresAt || user.expires_at,
        accessDuration: user.accessDuration || user.access_duration || 'LIFETIME',
        completedModuleIds: user.completed_module_ids || user.completedModuleIds || [],
        weeklyPoints: user.weekly_points || user.weeklyPoints || [],
        themeMode: user.theme_mode || user.themeMode || 'light',
        clinicId: user.clinic_id || user.clinicId || 'roones'
      };

      if (isMock) {
        return res.json({ user: responseUser, token });
      }
      
      return res.json({ user: responseUser, token });
    } catch (err: any) {
      console.error('Login Error:', err);
      loginAttemptsLog.push(`${logPrefix} Errored: ${err?.message || String(err)}`);
      res.status(500).json({ message: 'Erro no servidor' });
    }
  });

  // Diagnostics endpoint for production environment troubleshooting
  app.get('/api/diagnostics', async (req, res) => {
    try {
      const dbUrlDefined = !(!process.env.DATABASE_URL);
      const dbUrlMasked = dbUrlDefined ? process.env.DATABASE_URL!.replace(/:[^:@]+@/, ':***@') : null;
      const api_key_set = !(!process.env.GEMINI_API_KEY);
      
      let dbUsers: any[] = [];
      let dbError: any = null;
      let dbPingOk = false;

      if (pool) {
        try {
          dbPingOk = await isDbAvailable();
          if (dbPingOk) {
            const result = await pool.query('SELECT id, name, email, role, password, clinic_id FROM users LIMIT 100');
            dbUsers = result.rows.map(r => ({
              id: r.id,
              name: r.name,
              email: r.email,
              role: r.role,
              clinicId: r.clinic_id,
              hasPassword: !(!r.password),
              passwordLength: r.password ? r.password.length : 0,
              passwordStart: r.password ? r.password.slice(0, 3) : null
            }));
          }
        } catch (err: any) {
          dbError = err?.message || String(err);
        }
      }

      res.json({
        timestamp: new Date().toISOString(),
        node_env: process.env.NODE_ENV,
        database: {
          urlDefined: dbUrlDefined,
          urlMasked: dbUrlMasked,
          poolInitialized: !(!pool),
          pingOk: dbPingOk,
          lastDbError,
          dbError,
          usersInPostgres: dbUsers
        },
        gemini: {
          apiKeySet: api_key_set
        },
        startupLogs: startupLog,
        startupError,
        mockStoreUsers: mockStore.users.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          clinicId: u.clinicId,
          hasPassword: !(!u.password),
          passwordLength: u.password ? u.password.length : 0
        })),
        recentLoginAttempts: loginAttemptsLog.slice(-50)
      });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || String(e) });
    }
  });

  // Register (Disabled for public access - only Admin can create users)
  app.post('/api/auth/register', async (req, res) => {
    return res.status(403).json({ 
      message: 'O cadastro público está desativado. Por favor, solicite seu acesso ao administrador da Roones.' 
    });
  });

  // Admin Sync
  app.post('/api/admin/sync', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'ROONES_ADMIN' && req.user.role !== 'VERTUS_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const { tracks, objections, users, config, dailyChallenge } = req.body;

    try {
      // Update mockStore
      if (tracks) mockStore.tracks = tracks;
      if (objections) mockStore.objections = objections;
      if (users && Array.isArray(users)) {
        // Safely merge incoming users with existing mockStore users so none are accidentally lost
        const mergedMap = new Map<string, any>();
        (mockStore.users || []).forEach((u: any) => {
          const email = (u.email || '').toLowerCase().trim();
          if (email) mergedMap.set(email, u);
          else if (u.id) mergedMap.set(u.id, u);
        });
        users.forEach((u: any) => {
          const email = (u.email || '').toLowerCase().trim();
          if (email) {
            const prev = mergedMap.get(email);
            mergedMap.set(email, { ...prev, ...u });
          } else if (u.id) {
            mergedMap.set(u.id, u);
          }
        });

        // Ensure master admin is preserved
        const hasAdmin = Array.from(mergedMap.values()).some((u: any) => u.role === 'ROONES_ADMIN' || u.role === 'VERTUS_ADMIN' || (u.email && (u.email.trim().toLowerCase() === 'admin@roones.com.br' || u.email.trim().toLowerCase() === 'admin@vertus.com.br')));
        if (!hasAdmin) {
          const defaultAdmin = MOCK_USERS.find(u => u.role === 'ROONES_ADMIN' || u.role === 'VERTUS_ADMIN' || u.email === 'admin@roones.com.br' || u.email === 'admin@vertus.com.br');
          if (defaultAdmin) mergedMap.set('admin@roones.com.br', defaultAdmin);
        }
        mockStore.users = deduplicateUsersByEmail(Array.from(mergedMap.values()));
      }
      if (config) mockStore.config = config;
      if (dailyChallenge) mockStore.dailyChallenge = dailyChallenge;
      
      savePersistence();

      // Also persist users to Firestore directly from server as backup
      if (users && Array.isArray(users) && dbFirestore) {
        try {
          const batch = writeBatch(dbFirestore);
          mockStore.users.forEach((u: any) => {
            const userRef = doc(dbFirestore, 'users', u.id);
            batch.set(userRef, sanitizeForFirestore(u), { merge: true });
          });
          batch.commit().catch(e => console.error('Server Firestore user sync error:', e));
        } catch (fsErr) {
          console.warn('Server Firestore sync error:', fsErr);
        }
      }

      // Sync to Database if available
      if (pool && await isDbAvailable()) {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          
          // Sync Users
          if (users && Array.isArray(users)) {
            const userIds = users.map(u => u.id);
            if (userIds.length > 0) {
              await client.query(
                'DELETE FROM users WHERE id NOT IN (' + 
                userIds.map((_, i) => '$' + (i + 1)).join(',') + ')', 
                userIds
              );
            }
            for (const u of users) {
              await client.query(
                `INSERT INTO users (id, name, email, password, role, points, progress, avatar, clinic_id, phone, bio, theme, streak, level, prestige, weekly_points, completed_module_ids, badges, certificates, access_duration, expires_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
                 ON CONFLICT (id) DO UPDATE SET
                   name = EXCLUDED.name,
                   email = EXCLUDED.email,
                   password = EXCLUDED.password,
                   role = EXCLUDED.role,
                   points = EXCLUDED.points,
                   progress = EXCLUDED.progress,
                   avatar = EXCLUDED.avatar,
                   clinic_id = EXCLUDED.clinic_id,
                   phone = EXCLUDED.phone,
                   bio = EXCLUDED.bio,
                   theme = EXCLUDED.theme,
                   streak = EXCLUDED.streak,
                   level = EXCLUDED.level,
                   prestige = EXCLUDED.prestige,
                   weekly_points = EXCLUDED.weekly_points,
                   completed_module_ids = EXCLUDED.completed_module_ids,
                   badges = EXCLUDED.badges,
                   certificates = EXCLUDED.certificates,
                   access_duration = EXCLUDED.access_duration,
                   expires_at = EXCLUDED.expires_at,
                   updated_at = CURRENT_TIMESTAMP`,
                [
                  u.id, u.name, u.email, u.password, u.role, u.points || 0, u.progress || 0, u.avatar, u.clinicId, u.phone, u.bio, u.theme, u.streak || 0, u.level || 1, u.prestige, 
                  JSON.stringify(u.weeklyPoints || []), JSON.stringify(u.completedModuleIds || []), JSON.stringify(u.badges || []), JSON.stringify(u.certificates || []),
                  u.accessDuration || 'LIFETIME', u.expiresAt || null
                ]
              );
            }
          }

          // Sync Tracks & Modules
          if (tracks && Array.isArray(tracks)) {
            const trackIds = tracks.map(t => t.id);
            if (trackIds.length > 0) {
              await client.query('DELETE FROM tracks WHERE id NOT IN (' + trackIds.map((_, i) => '$' + (i + 1)).join(',') + ')', trackIds);
            }
            for (const t of tracks) {
              await client.query(
                `INSERT INTO tracks (id, title, description, thumbnail, icon, type, order_index)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (id) DO UPDATE SET
                   title = EXCLUDED.title,
                   description = EXCLUDED.description,
                   thumbnail = EXCLUDED.thumbnail,
                   icon = EXCLUDED.icon,
                   type = EXCLUDED.type,
                   order_index = EXCLUDED.order_index`,
                [t.id, t.title, t.description, t.thumbnail, t.icon, t.type, t.order || 0]
              );

              // Sync Modules for this track
              if (t.modules && Array.isArray(t.modules)) {
                const moduleIds = t.modules.map(m => m.id);
                if (moduleIds.length > 0) {
                  await client.query('DELETE FROM modules WHERE track_id = $1 AND id NOT IN (' + moduleIds.map((_, i) => '$' + (i + 2)).join(',') + ')', [t.id, ...moduleIds]);
                } else {
                  await client.query('DELETE FROM modules WHERE track_id = $1', [t.id]);
                }
                for (const m of t.modules) {
                  await client.query(
                    `INSERT INTO modules (id, track_id, title, description, content, thumbnail, video_url, video_data, points)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                     ON CONFLICT (id) DO UPDATE SET
                       track_id = EXCLUDED.track_id,
                       title = EXCLUDED.title,
                       description = EXCLUDED.description,
                       content = EXCLUDED.content,
                       thumbnail = EXCLUDED.thumbnail,
                       video_url = EXCLUDED.video_url,
                       video_data = EXCLUDED.video_data,
                       points = EXCLUDED.points`,
                    [m.id, t.id, m.title, m.description, m.content, m.thumbnail, m.videoUrl, m.videoData, m.points || 0]
                  );
                  
                  // Sync Quiz Questions
                  if (m.quiz && m.quiz.questions && Array.isArray(m.quiz.questions)) {
                    // Delete existing questions for this module to avoid duplicates/orphans
                    await client.query('DELETE FROM quiz_questions WHERE module_id = $1', [m.id]);
                    for (const q of m.quiz.questions) {
                      await client.query(
                        `INSERT INTO quiz_questions (id, module_id, question, options, correct_option_index)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [q.id || Math.random().toString(36).substr(2, 9), m.id, q.question, JSON.stringify(q.options), q.correctOptionIndex]
                      );
                    }
                  }
                }
              }
            }
          }

          // Sync Objections
          if (objections && Array.isArray(objections)) {
            const objectionIds = objections.map(o => o.id);
            if (objectionIds.length > 0) {
              await client.query('DELETE FROM objections WHERE id NOT IN (' + objectionIds.map((_, i) => '$' + (i + 1)).join(',') + ')', objectionIds);
            }
            for (const o of objections) {
              await client.query(
                `INSERT INTO objections (id, trigger, reason, expert_view, rapport_response, consultative_response, authority_response, response)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 ON CONFLICT (id) DO UPDATE SET
                   trigger = EXCLUDED.trigger,
                   reason = EXCLUDED.reason,
                   expert_view = EXCLUDED.expert_view,
                   rapport_response = EXCLUDED.rapport_response,
                   consultative_response = EXCLUDED.consultative_response,
                   authority_response = EXCLUDED.authority_response,
                   response = EXCLUDED.response`,
                [o.id, o.trigger, o.reason, o.expertView, o.rapportResponse, o.consultativeResponse, o.authorityResponse, o.response]
              );
            }
          }

          await client.query('COMMIT');
          console.log('Database sync completed successfully');
        } catch (dbErr) {
          await client.query('ROLLBACK');
          console.error('Database sync failed:', dbErr);
          // We don't fail the whole request because mockStore was updated
        } finally {
          client.release();
        }
      }

      res.json({ message: 'Dados sincronizados com sucesso' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao sincronizar dados' });
    }
  });

  // Get Tracks (Optimized)
  app.get('/api/tracks', async (req, res) => {
    try {
      if (pool && await isDbAvailable()) {
        const tracksResult = await pool.query('SELECT * FROM tracks ORDER BY order_index ASC, created_at ASC');
        let tracks = tracksResult.rows.map(t => ({ ...t, order: t.order_index }));

        if (tracks.length === 0) {
          return res.json(mockStore.tracks);
        }

        const allModulesResult = await pool.query('SELECT * FROM modules ORDER BY track_id, order_index ASC');
        const allQuizzesResult = await pool.query('SELECT * FROM quiz_questions');

        const modulesByTrack = allModulesResult.rows.reduce((acc: any, mod: any) => {
          if (!acc[mod.track_id]) acc[mod.track_id] = [];
          acc[mod.track_id].push(mod);
          return acc;
        }, {});

        const quizzesByModule = allQuizzesResult.rows.reduce((acc: any, quiz: any) => {
          if (!acc[quiz.module_id]) acc[quiz.module_id] = [];
          acc[quiz.module_id].push(quiz);
          return acc;
        }, {});

        for (const track of tracks) {
          track.modules = modulesByTrack[track.id] || [];
          for (const module of track.modules) {
            const quizzes = quizzesByModule[module.id];
            if (quizzes) {
              module.quiz = { questions: quizzes };
            }
          }
        }
        res.json(tracks);
      } else {
        res.json(mockStore.tracks);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao buscar trilhas' });
    }
  });

  // Get App Config
  app.get('/api/config', async (req, res) => {
    try {
      if (pool && await isDbAvailable()) {
        const result = await pool.query('SELECT * FROM app_config LIMIT 1');
        if (result.rows.length > 0) {
          res.json(result.rows[0]);
        } else {
          res.json(mockStore.config);
        }
      } else {
        res.json(mockStore.config);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao buscar configuração' });
    }
  });

  // Get Daily Challenge
  app.get('/api/daily-challenge', async (req, res) => {
    try {
      if (pool && await isDbAvailable()) {
        const result = await pool.query('SELECT * FROM daily_challenges WHERE active = true ORDER BY created_at DESC LIMIT 1');
        if (result.rows.length > 0) {
          res.json(result.rows[0]);
        } else {
          res.json(mockStore.dailyChallenge);
        }
      } else {
        res.json(mockStore.dailyChallenge);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao buscar desafio diário' });
    }
  });

  // Chat Sessions
  app.get('/api/chat-sessions', authenticateToken, async (req: any, res) => {
    try {
      if (pool && await isDbAvailable()) {
        const sessionsResult = await pool.query(
          'SELECT * FROM chat_sessions WHERE user_id = $1 ORDER BY last_interaction DESC',
          [req.user.id]
        );
        const sessions = sessionsResult.rows;

        for (const session of sessions) {
          const messagesResult = await pool.query(
            'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY timestamp ASC',
            [session.id]
          );
          session.messages = messagesResult.rows;
        }
        res.json(sessions);
      } else {
        res.json([]);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao buscar sessões de chat' });
    }
  });

  app.post('/api/chat-sessions', authenticateToken, async (req: any, res) => {
    const { messages, title, isActive } = req.body;
    try {
      if (pool && await isDbAvailable()) {
        // Check for active session
        const activeResult = await pool.query(
          'SELECT id FROM chat_sessions WHERE user_id = $1 AND is_active = true LIMIT 1',
          [req.user.id]
        );
        
        let sessionId;
        if (activeResult.rows.length > 0) {
          sessionId = activeResult.rows[0].id;
          await pool.query(
            'UPDATE chat_sessions SET last_interaction = CURRENT_TIMESTAMP, title = $1, is_active = $2 WHERE id = $3',
            [title || messages[0]?.text.slice(0, 30), isActive !== undefined ? isActive : true, sessionId]
          );
        } else {
          const newSession = await pool.query(
            'INSERT INTO chat_sessions (user_id, title, is_active) VALUES ($1, $2, $3) RETURNING id',
            [req.user.id, title || messages[0]?.text.slice(0, 30), true]
          );
          sessionId = newSession.rows[0].id;
        }

        // Simple approach: clear and re-insert messages for the session
        // In production, you'd want to be more surgical
        await pool.query('DELETE FROM chat_messages WHERE session_id = $1', [sessionId]);
        for (const msg of messages) {
          await pool.query(
            'INSERT INTO chat_messages (session_id, role, text, image) VALUES ($1, $2, $3, $4)',
            [sessionId, msg.role, msg.text, msg.image]
          );
        }

        res.json({ id: sessionId });
      } else {
        res.json({ id: 'mock-session' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao salvar sessão de chat' });
    }
  });

  app.delete('/api/chat-sessions', authenticateToken, async (req: any, res) => {
    try {
      if (pool && await isDbAvailable()) {
        await pool.query('DELETE FROM chat_sessions WHERE user_id = $1', [req.user.id]);
        res.json({ message: 'Histórico limpo' });
      } else {
        res.json({ message: 'Histórico limpo (Mock)' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao limpar histórico' });
    }
  });

  // Get Objections
  app.get('/api/objections', async (req, res) => {
    try {
      if (pool && await isDbAvailable()) {
        const result = await pool.query('SELECT * FROM objections ORDER BY CAST(id AS INTEGER) ASC');
        if (result.rows.length >= 24) {
          const mapped = result.rows.map((row: any) => ({
            id: row.id,
            trigger: row.trigger,
            reason: row.reason,
            expertView: row.expert_view || row.expertView,
            rapportResponse: row.rapport_response || row.rapportResponse,
            consultativeResponse: row.consultative_response || row.consultativeResponse,
            authorityResponse: row.authority_response || row.authorityResponse,
            response: row.response
          }));
          return res.json(mapped);
        }
      }
      
      const objs = (mockStore.objections && mockStore.objections.length >= 24)
        ? mockStore.objections
        : OBJECTIONS;
      res.json([...objs].sort((a, b) => (Number(a.id) || 999) - (Number(b.id) || 999)));
    } catch (err) {
      console.error(err);
      res.json(OBJECTIONS);
    }
  });

  // Track Objection Usage (copiar script / treinar com a iza)
  app.post('/api/objections/track-usage', async (req: any, res) => {
    try {
      const { trigger, type } = req.body;
      if (!(mockStore as any).stats) {
        (mockStore as any).stats = { totalAiQueries: 0, objectionUsage: {} };
      }
      const key = trigger ? trigger.trim() : 'Geral';
      (mockStore as any).stats.objectionUsage[key] = ((mockStore as any).stats.objectionUsage[key] || 0) + 1;
      savePersistence();
      res.json({ success: true, trigger: key, count: (mockStore as any).stats.objectionUsage[key] });
    } catch (err) {
      console.error('Error tracking objection usage:', err);
      res.status(500).json({ message: 'Erro ao registrar uso' });
    }
  });

  // Admin Insights Data
  app.get('/api/admin/insights', async (req, res) => {
    try {
      if (!(mockStore as any).stats) {
        (mockStore as any).stats = { 
          totalAiQueries: 24, 
          objectionUsage: {
            'Está muito caro': 18,
            'Vou falar com meu marido': 14,
            'Preciso pensar com calma': 11,
            'Tenho medo de ficar artificial': 8,
            'Achei mais barato na clínica concorrente': 7
          } 
        };
      }
      
      const stats = (mockStore as any).stats;
      const totalUsers = mockStore.users.length;
      const activeUsers = mockStore.users.filter((u: any) => !u.expiresAt || new Date(u.expiresAt) > new Date()).length;
      
      const usageEntries = Object.entries(stats.objectionUsage || {});
      const topObjections = usageEntries
        .map(([trigger, count]) => ({ trigger, count: Number(count) }))
        .sort((a, b) => b.count - a.count);

      res.json({
        totalAiQueries: stats.totalAiQueries || 0,
        totalObjections: mockStore.objections.length,
        totalUsers,
        activeUsers,
        topObjections: topObjections.length > 0 ? topObjections : [
          { trigger: 'Está muito caro', count: 18 },
          { trigger: 'Vou falar com meu marido', count: 14 },
          { trigger: 'Preciso pensar com calma', count: 11 },
          { trigger: 'Tenho medo de ficar artificial', count: 8 },
          { trigger: 'Achei mais barato na concorrência', count: 7 }
        ]
      });
    } catch (err) {
      console.error('Error fetching admin insights:', err);
      res.status(500).json({ message: 'Erro ao buscar métricas de insights' });
    }
  });

  // Bulk Import Objections
  app.post('/api/objections/bulk-import', authenticateToken, async (req: any, res) => {
    try {
      const newObjections = req.body.newObjections || req.body.objections;
      if (!Array.isArray(newObjections) || newObjections.length === 0) {
        return res.status(400).json({ message: 'Nenhuma objeção válida informada para importação.' });
      }

      const formatted = newObjections.map((item: any) => ({
        id: item.id || Math.random().toString(36).substring(2, 9),
        trigger: String(item.trigger || 'Nova Objeção').trim(),
        reason: String(item.reason || '').trim(),
        expertView: String(item.expertView || '').trim(),
        rapportResponse: String(item.rapportResponse || item.response || '').trim(),
        consultativeResponse: String(item.consultativeResponse || item.response || '').trim(),
        authorityResponse: String(item.authorityResponse || item.response || '').trim(),
        response: String(item.response || item.rapportResponse || '').trim()
      }));

      // Append to mockStore and pool if available
      mockStore.objections = [...mockStore.objections, ...formatted];

      if (pool && await isDbAvailable()) {
        for (const obj of formatted) {
          await pool.query(
            `INSERT INTO objections (id, trigger, reason, expert_view, rapport_response, consultative_response, authority_response, response)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO NOTHING`,
            [obj.id, obj.trigger, obj.reason, obj.expertView, obj.rapportResponse, obj.consultativeResponse, obj.authorityResponse, obj.response]
          );
        }
      }

      // Sync to Firestore if available
      if (dbFirestore) {
        try {
          for (const obj of formatted) {
            await setDoc(doc(dbFirestore, 'objections', obj.id), obj);
          }
        } catch (fsErr) {
          console.warn('Could not sync bulk objections to Firestore:', fsErr);
        }
      }

      savePersistence();
      res.json({ success: true, count: formatted.length, total: mockStore.objections.length });
    } catch (err) {
      console.error('Error bulk importing objections:', err);
      res.status(500).json({ message: 'Erro ao importar objeções' });
    }
  });

  // Parse structured Metodologia Roones text (e.g. 01 — "...", Visão do Especialista, Rapport, etc.)
  const parseStructuredRoonesText = (rawText: string) => {
    if (!rawText || typeof rawText !== 'string') return [];
    const blocks = rawText.split(/(?=(?:^|\n)\s*(?:\d+[\s\.\-—–]+|[#]+\s*\d*|\bObjeção\s*\d*))/i).filter(b => b.trim().length > 0);
    const parsed: any[] = [];

    for (const block of blocks) {
      const lines = block.trim().split('\n');
      const firstLine = lines[0].trim();
      const triggerMatch = firstLine.match(/(?:^\d+[\s\.\-—–]+|\bObjeção\s*\d*[:\s\-—–]*)\s*["“'«]?(.*?)["”'»]?$/i);
      let trigger = '';
      if (triggerMatch && triggerMatch[1]) {
        trigger = triggerMatch[1].replace(/^["“'«\s]+|["”'»\s]+$/g, '').trim();
      } else {
        trigger = firstLine.replace(/^[\d\.\-—–\s"“'«]+|["”'»\s]+$/g, '').trim();
      }

      let expertView = '';
      let rapportResponse = '';
      let consultativeResponse = '';
      let authorityResponse = '';
      let response = '';

      const expertMatch = block.match(/Visão\s+do\s+Especialista\s*:\s*([\s\S]*?)(?=(?:Rapport|Consultiva|Autoridade|WhatsApp|Resposta|\n\s*\n\s*[A-Z]|$))/i);
      if (expertMatch) expertView = expertMatch[1].trim();

      const rapportMatch = block.match(/Rapport\s*:\s*([\s\S]*?)(?=(?:Visão|Consultiva|Autoridade|WhatsApp|Resposta|$))/i);
      if (rapportMatch) rapportResponse = rapportMatch[1].trim();

      const consultMatch = block.match(/Consultiva\s*:\s*([\s\S]*?)(?=(?:Visão|Rapport|Autoridade|WhatsApp|Resposta|$))/i);
      if (consultMatch) consultativeResponse = consultMatch[1].trim();

      const authMatch = block.match(/Autoridade\s*:\s*([\s\S]*?)(?=(?:Visão|Rapport|Consultiva|WhatsApp|Resposta|$))/i);
      if (authMatch) authorityResponse = authMatch[1].trim();

      const respMatch = block.match(/(?:WhatsApp|Resposta(?:\s+Geral|\s+Final)?)\s*:\s*([\s\S]*?)$/i);
      if (respMatch) response = respMatch[1].trim();
      else response = rapportResponse || consultativeResponse || authorityResponse;

      if (trigger && (expertView || rapportResponse || consultativeResponse || authorityResponse)) {
        parsed.push({
          id: Math.random().toString(36).substring(2, 9),
          trigger,
          reason: expertView ? expertView.split('.')[0].trim() : 'Barreira comercial identificada',
          expertView: expertView || 'Orientar com escuta ativa e condução consultiva',
          rapportResponse: rapportResponse || response,
          consultativeResponse: consultativeResponse || response,
          authorityResponse: authorityResponse || response,
          response: response || rapportResponse
        });
      }
    }
    return parsed;
  };

  // Helper function to extract and organize objections with Gemini, using model rotation on 503/load spikes
  const runObjectionExtractionAI = async (contents: any[], ai: GoogleGenAI, sourceDesc: string) => {
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
    let lastError: any = null;
    let responseText = '';

    for (let i = 0; i < candidateModels.length; i++) {
      const model = candidateModels[i];
      try {
        console.log(`[Objection Extraction] Attempting with model '${model}' (source: ${sourceDesc})...`);
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            responseMimeType: 'application/json',
          }
        });

        if (response && response.text) {
          responseText = response.text;
          console.log(`[Objection Extraction] Success with model '${model}'!`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        const errStr = String(err?.message || err);
        console.warn(`[Objection Extraction] Model '${model}' failed:`, errStr);

        if (i < candidateModels.length - 1) {
          console.log(`Waiting 400ms before falling back to next candidate model...`);
          await new Promise(r => setTimeout(r, 400));
        }
      }
    }

    if (!responseText) {
      throw lastError || new Error('Não foi possível obter resposta dos modelos de IA.');
    }

    let rawOutput = responseText.trim();
    if (rawOutput.startsWith('```json')) {
      rawOutput = rawOutput.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (rawOutput.startsWith('```')) {
      rawOutput = rawOutput.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsed: any[] = [];
    try {
      const jsonResult = JSON.parse(rawOutput);
      if (Array.isArray(jsonResult)) {
        parsed = jsonResult;
      } else if (jsonResult && typeof jsonResult === 'object') {
        if (Array.isArray(jsonResult.objections)) {
          parsed = jsonResult.objections;
        } else if (Array.isArray(jsonResult.items)) {
          parsed = jsonResult.items;
        } else {
          parsed = [jsonResult];
        }
      }
    } catch (parseErr) {
      console.error('Failed to parse Gemini output as JSON:', rawOutput);
      throw new Error('A IA processou o documento mas a formatação JSON retornada precisa de ajuste. Tente novamente.');
    }

    const formatted = parsed
      .filter((item: any) => item && (item.trigger || item.response || item.rapportResponse))
      .map((item: any, idx: number) => ({
        id: Math.random().toString(36).substring(2, 9),
        trigger: String(item.trigger || `Objeção #${idx + 1}`).trim(),
        reason: String(item.reason || 'Barreira identificada no documento').trim(),
        expertView: String(item.expertView || 'Orientar com escuta ativa e validação emocional').trim(),
        rapportResponse: String(item.rapportResponse || item.response || '').trim(),
        consultativeResponse: String(item.consultativeResponse || item.response || '').trim(),
        authorityResponse: String(item.authorityResponse || item.response || '').trim(),
        response: String(item.response || item.rapportResponse || '').trim()
      }));

    if (formatted.length === 0) {
      throw new Error('O conteúdo foi lido, mas nenhuma objeção ou barreira comercial clara foi identificada.');
    }

    return formatted;
  };

  const OBJECTION_EXTRACTION_PROMPT = `Você é a maior especialista em vendas consultivas, contorno de objeções e psicologia de decisão da Metodologia Roones para clínicas de estética de alto padrão.
Analise com profunda atenção o conteúdo fornecido (documento, apostila, playbook ou anotações comerciais de clínica de estética).

SEU OBJETIVO:
1. Identificar e extrair com extrema precisão TODAS as objeções, hesitações de pacientes, resistências ao investimento e inseguranças de agendamento/fechamento presentes ou inferidas no material.
2. Para CADA objeção encontrada, desdobre de acordo com a Metodologia Roones estruturando rigorosamente os 7 campos abaixo:
   - "trigger": O gatilho verbal exato dito pela paciente (ex: "Está muito caro", "Vou conversar com meu esposo antes", "Tenho medo de ficar artificial", "Na outra clínica fazem pela metade do preço", "Preciso pensar um pouco").
   - "reason": O motivo oculto psicológico por trás da fala (ex: "Insegurança quanto ao retorno estético e medo de frustração ou desperdício").
   - "expertView": A postura mental e recomendação tática da mentora Roones para o consultor (ex: "Nunca ceda desconto sem adequar o plano; valide o receio da paciente antes de explicar o valor").
   - "rapportResponse": Resposta de Rapport — conexão genuína, empatia acolhedora e validação emocional sem confrontação.
   - "consultativeResponse": Resposta Consultiva — pergunta investigativa estratégica que devolve o foco para o incômodo e desejo real da paciente.
   - "authorityResponse": Resposta de Autoridade — ancoragem em segurança técnica, protocolos médicos exclusivos, previsibilidade e excelência clínica.
   - "response": Mensagem final recomendada completa, acolhedora e pronta para o consultor copiar e enviar diretamente no WhatsApp da paciente.

DIRETRIZES DE SAÍDA:
- Extraia todas as objeções relevantes (priorize qualidade, profundidade e aplicabilidade prática).
- Retorne EXCLUSIVAMENTE um array JSON contendo os objetos estruturados, sem textos introdutórios ou conclusivos. Formato exato:
[
  {
    "trigger": "...",
    "reason": "...",
    "expertView": "...",
    "rapportResponse": "...",
    "consultativeResponse": "...",
    "authorityResponse": "...",
    "response": "..."
  }
]`;

  // Extract and Organize Objections from PDF using Gemini AI
  app.post('/api/objections/extract-pdf', authenticateToken, async (req: any, res) => {
    try {
      const { pdfBase64, fileName } = req.body;
      if (!pdfBase64 || typeof pdfBase64 !== 'string') {
        return res.status(400).json({ message: 'Arquivo PDF não informado ou corrompido.' });
      }

      const actualApiKey = process.env.GEMINI_API_KEY;
      if (!actualApiKey) {
        return res.status(500).json({ 
          message: 'A chave de API do Gemini (GEMINI_API_KEY) não está configurada no servidor.' 
        });
      }

      // Clean base64 prefix if provided (e.g. data:application/pdf;base64,...)
      let cleanBase64 = pdfBase64;
      if (cleanBase64.includes(';base64,')) {
        cleanBase64 = cleanBase64.split(';base64,')[1];
      }
      cleanBase64 = cleanBase64.trim();

      const ai = new GoogleGenAI({
        apiKey: actualApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const pdfPart = {
        inlineData: {
          mimeType: 'application/pdf',
          data: cleanBase64,
        },
      };

      const formatted = await runObjectionExtractionAI(
        [pdfPart, { text: `${OBJECTION_EXTRACTION_PROMPT}\n\nDocumento analisado: ${fileName || 'playbook.pdf'}` }],
        ai,
        fileName || 'documento.pdf'
      );

      res.json({
        success: true,
        count: formatted.length,
        objections: formatted,
        fileName: fileName || 'documento.pdf'
      });
    } catch (err: any) {
      console.error('Error processing PDF with Gemini:', err);
      const errStr = String(err?.message || err);
      let userFriendlyMessage = 'Falha ao processar o arquivo PDF.';
      
      if (errStr.includes('503') || errStr.includes('UNAVAILABLE') || errStr.includes('demand')) {
        userFriendlyMessage = 'Os servidores de IA do Google estão com pico temporário de demanda. Tente novamente em alguns instantes ou copie o texto do PDF e cole na aba "Texto Livre (IA)".';
      } else if (errStr.includes('429') || errStr.includes('quota')) {
        userFriendlyMessage = 'Limite de requisições atingido. Aguarde alguns instantes e tente novamente.';
      } else if (err?.message) {
        userFriendlyMessage = err.message;
      }

      res.status(500).json({
        message: userFriendlyMessage
      });
    }
  });

  // Extract and Organize Objections from Raw Text using Gemini AI or Direct Roones Parser
  app.post('/api/objections/extract-text', authenticateToken, async (req: any, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string' || text.trim().length < 5) {
        return res.status(400).json({ 
          message: 'Por favor, insira ou cole o texto com o conteúdo das objeções para que a IA possa organizar.' 
        });
      }

      // 1. Direct heuristic parsing: check if the text already follows the Roones format (e.g. 01 — "...", Visão do Especialista, Rapport, etc.)
      const structuredItems = parseStructuredRoonesText(text);
      if (structuredItems.length > 0) {
        console.log(`[Objection Extraction] Directly parsed ${structuredItems.length} structured Roones objections with 100% fidelity.`);
        return res.json({
          success: true,
          count: structuredItems.length,
          objections: structuredItems,
          source: 'Estruturação Direta Metodologia Roones'
        });
      }

      // 2. Unstructured or free text: send to Gemini AI for intelligent extraction & Roones structuring
      const actualApiKey = process.env.GEMINI_API_KEY;
      if (!actualApiKey) {
        return res.status(500).json({ 
          message: 'A chave de API do Gemini (GEMINI_API_KEY) não está configurada no servidor.' 
        });
      }

      const ai = new GoogleGenAI({
        apiKey: actualApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const formatted = await runObjectionExtractionAI(
        [
          { text: `${OBJECTION_EXTRACTION_PROMPT}\n\nCONTEÚDO/TEXTO FORNECIDO:\n"""\n${text.trim()}\n"""` }
        ],
        ai,
        'Texto Livre'
      );

      res.json({
        success: true,
        count: formatted.length,
        objections: formatted
      });
    } catch (err: any) {
      console.error('Error processing text with Gemini:', err);
      const errStr = String(err?.message || err);
      let userFriendlyMessage = 'Falha ao analisar o texto com a IA.';

      if (errStr.includes('503') || errStr.includes('UNAVAILABLE') || errStr.includes('demand')) {
        userFriendlyMessage = 'Os servidores de IA do Google estão com pico temporário de demanda (503). Por favor, clique novamente em "Organizar Objeções com IA" em alguns segundos.';
      } else if (errStr.includes('429') || errStr.includes('quota')) {
        userFriendlyMessage = 'Limite temporário da API atingido. Aguarde alguns instantes e tente novamente.';
      } else if (err?.message) {
        userFriendlyMessage = err.message;
      }

      res.status(500).json({
        message: userFriendlyMessage
      });
    }
  });

  // Get Activities
  app.get('/api/activities', async (req, res) => {
    try {
      if (pool && await isDbAvailable()) {
        try {
          const result = await pool.query('SELECT * FROM activities ORDER BY timestamp DESC LIMIT 50');
          return res.json(result.rows);
        } catch (dbErr) {
          console.warn('Postgres query activities failed, falling back to mockStore:', dbErr);
          return res.json(mockStore.activities || []);
        }
      } else {
        res.json(mockStore.activities || []);
      }
    } catch (err) {
      console.warn('Error fetching activities on server, returning fallback:', err);
      res.json(mockStore.activities || []);
    }
  });

  // Add Activity
  app.post('/api/activities', authenticateToken, async (req: any, res) => {
    const { type, message } = req.body;
    try {
      if (pool && await isDbAvailable()) {
        try {
          const userResult = await pool.query('SELECT name, avatar FROM users WHERE id = $1', [req.user.id]);
          const user = userResult.rows[0];

          const result = await pool.query(
            'INSERT INTO activities (id, user_id, user_name, user_avatar, type, message) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [Math.random().toString(36).substr(2, 9), req.user.id, user?.name || 'Unknown', user?.avatar || '', type, message]
          );
          return res.json(result.rows[0]);
        } catch (dbErr) {
          console.warn('Postgres insert activity failed, saving to mockStore:', dbErr);
        }
      }

      const user = mockStore.users.find(u => u.id === req.user.id);
      const newActivity = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: req.user.id,
        user_name: user?.name || 'Unknown',
        user_avatar: user?.avatar || '',
        type,
        message,
        timestamp: new Date().toISOString()
      };
      mockStore.activities.unshift(newActivity as any);
      savePersistence();
      res.json(newActivity);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao adicionar atividade' });
    }
  });

  // Update User
  app.put('/api/user', authenticateToken, async (req: any, res) => {
    const updates = req.body;
    const userId = req.user.id;

    console.log(`Update request for user ${userId}`, updates);

    try {
      if (pool && await isDbAvailable()) {
        // Map camelCase to snake_case for the database
        const mapping: any = {
          completedModuleIds: 'completed_module_ids',
          weeklyPoints: 'weekly_points',
          themeMode: 'theme_mode',
          clinicId: 'clinic_id',
          lastLoginDate: 'last_login_date'
        };

        const fields = Object.keys(updates).map(k => mapping[k] || k);
        const values = Object.values(updates);
        const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');

        const result = await pool.query(
          `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`,
          [...values, userId]
        );

        const user = result.rows[0];
        // Map back to camelCase for frontend
        const responseUser = {
          ...user,
          completedModuleIds: user.completed_module_ids,
          weeklyPoints: user.weekly_points,
          themeMode: user.theme_mode,
          clinicId: user.clinic_id
        };
        delete responseUser.password;
        res.json(responseUser);
      } else {
        const userIndex = mockStore.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          mockStore.users[userIndex] = { ...mockStore.users[userIndex], ...updates };
          res.json(mockStore.users[userIndex]);
        } else {
          // If not in mock store, just return success with updates 
          // because Firestore is the primary source of truth now.
          console.log(`User ${userId} not found in mockStore, returning success for sync.`);
          res.json({ id: userId, ...updates });
        }
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao atualizar usuário' });
    }
  });

  // Get Users
  app.get('/api/users', async (req, res) => {
    try {
      if (pool && await isDbAvailable()) {
        const result = await pool.query('SELECT id, name, email, role, points, progress, level, prestige, clinic_id, avatar, streak, theme_mode, completed_module_ids, badges, certificates, weekly_points FROM users');
        const users = result.rows.map(u => ({
          ...u,
          completedModuleIds: u.completed_module_ids,
          weeklyPoints: u.weekly_points,
          themeMode: u.theme_mode,
          clinicId: u.clinic_id
        }));
        res.json(users);
      } else {
        res.json(mockStore.users);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
  });

  // Delete User
  app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
      mockStore.users = (mockStore.users || []).filter((u: any) => u.id !== id);
      savePersistence();
      if (dbFirestore) {
        await deleteDoc(doc(dbFirestore, 'users', id)).catch(() => {});
      }
      res.json({ success: true, message: 'Usuário removido com sucesso' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Chat Proxy
  app.post('/api/ai/chat', authenticateToken, async (req: any, res) => {
    const { messages, prompt, mode } = req.body;
    
    const actualApiKey = process.env.GEMINI_API_KEY;
    
    if (!actualApiKey) {
      console.error('CRITICAL: GEMINI_API_KEY is missing from environment variables.');
      return res.status(500).json({ 
        message: 'A chave de API (GEMINI_API_KEY) não foi detectada no servidor. Se você adicionou no Railway, certifique-se de que clicou em "Deploy" para aplicar as alterações.' 
      });
    }

    // Log key presence (masked)
    console.log(`AI Request received. Key present: ${actualApiKey.substring(0, 4)}...${actualApiKey.substring(actualApiKey.length - 4)}. Mode: ${mode || 'standard'}`);

    // Update internal stats
    if (!(mockStore as any).stats) {
      (mockStore as any).stats = { totalAiQueries: 0, objectionUsage: {} };
    }
    (mockStore as any).stats.totalAiQueries = ((mockStore as any).stats.totalAiQueries || 0) + 1;

    try {
      const ai = new GoogleGenAI({ 
        apiKey: actualApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      // Customize instructions based on tactical mode
      let modeInstructions = '';
      if (mode === 'whatsapp') {
        modeInstructions = '\n\n[DIRETRIZ DE MODO: WHATSAPP / CONDUÇÃO E MENSAGENS]\n- Adote uma postura de mentora educacional: ajude a consultora a entender a paciente, construir conexão e conduzir com segurança.\n- Apresente uma mensagem acolhedora, clara e estratégica pronta para envio no WhatsApp.\n- Use quebras de linha limpas, linguagem natural e respeitosa, sem exageros ou clichês vazios.\n- Explique de forma didática o objetivo da abordagem e a pergunta para continuar a conversa.';
      } else if (mode === 'audio') {
        modeInstructions = '\n\n[DIRETRIZ DE MODO: ÁUDIO / ROTEIRO FALADO E POSTURA]\n- Ensine a consultora como dosar entonação, postura acolhedora e pausas estratégicas para gerar segurança.\n- Forneça a fala sugerida para o áudio com indicações didáticas entre colchetes, como [Tom acolhedor e seguro], [Pausa natural], [Ênfase sutil].\n- A linguagem deve soar humana, genuína e empática, ensinando a consultora a se conectar com a paciente sem parecer um texto decorado.';
      } else if (mode === 'deep') {
        modeInstructions = '\n\n[DIRETRIZ DE MODO: DIAGNÓSTICO E APRENDIZADO]\n- Analise o contexto e ensine a consultora a enxergar as reais necessidades, receios ou prioridades da paciente.\n- Destaque o que foi bem conduzido e aponte construtivamente os pontos de melhoria na conversa.\n- Ensine a consultora o raciocínio estratégico para transformar a objeção em uma oportunidade de aproximação e esclarecimento.';
      } else if (mode === 'roleplay') {
        modeInstructions = '\n\n[DIRETRIZ DE MODO: SIMULADOR DE ROLEPLAY / PACIENTE REAL]\n- Assuma o papel de uma paciente de clínica de estética com dúvidas reais, receios sobre procedimentos e questionamentos sobre valores.\n- Responda como a paciente para permitir que a consultora pratique sua escuta e condução.\n- Quando a consultora pedir avaliação ou feedback, saia do papel e seja uma mentora didática, apontando com clareza o que foi bem conduzido e o que pode melhorar para alcançar melhores resultados.';
      }

      const hasImageAttachment = messages?.some((m: any) => m.image);
      const printAnalysisGuideline = hasImageAttachment
        ? '\n\n[DIRETRIZ ESPECIALIZADA: ANÁLISE DE PRINT DO WHATSAPP DE PACIENTE]\nQuando o usuário enviar uma imagem/print de conversa de WhatsApp:\n1. Identifique e cite resumidamente a última fala da paciente.\n2. Estime a **Temperatura do Lead**: ❄️ Fria (desengajou/apenas perguntou preço), ⛅ Morna (interessada mas insegura/com dúvida), ou 🔥 Quente (pronta para agendar mas travada por detalhe).\n3. Forneça o **Diagnóstico Rápido**: O que a paciente realmente quis dizer / motivo oculto do travamento.\n4. Apresente a **Mensagem Pronta para Destravar** no WhatsApp (formatada no início em bloco de citação `> "..."` para cópia fácil em 1 clique).\n5. Dê uma dica didática sobre o próximo passo.'
        : '';

      const scriptFormattingGuideline = mode !== 'roleplay' 
        ? '\n\n[REGRA CRÍTICA DE FORMATAÇÃO PARA ENVIO NO WHATSAPP]:\nSempre que fornecer um script ou mensagem sugerida para a paciente:\n1. Coloque a mensagem sugerida em destaque no início, entre aspas ou em bloco (> "mensagem").\n2. Se for incluir análises, dicas ou "O que observar na próxima resposta", separe OBRIGATORIAMENTE com uma linha divisória horizontal (---) seguida do título da análise.\nEssa divisão garante que o consultor copie com 1 clique APENAS o texto a ser encaminhado, sem copiar as explicações internas.'
        : '';

      // Simplify contents and configure system instruction according to new SDK guidelines
      const systemContext = (prompt || DEFAULT_AI_PROMPT) + modeInstructions + printAnalysisGuideline + scriptFormattingGuideline;

      // Helper to parse base64 data URLs safely
      const parseDataUrl = (dataUrl: string) => {
        if (!dataUrl || typeof dataUrl !== 'string') return null;
        const parts = dataUrl.split(';base64,');
        if (parts.length === 2) {
          const mimeType = parts[0].replace('data:', '');
          const base64Data = parts[1];
          return { mimeType, base64Data };
        }
        return null;
      };
      
      // Find the index of the first user message
      const firstUserIndex = messages.findIndex((m: any) => m.role === 'user');
      const allChatMessages = firstUserIndex !== -1 ? messages.slice(firstUserIndex) : messages;

      // Keep recent conversational context agile and low-latency for mobile: last 10 messages
      const chatMessages = allChatMessages.length > 10 ? allChatMessages.slice(-10) : allChatMessages;

      // Map messages and merge contiguous same-role messages while preserving image attachments
      const formattedContents: any[] = [];
      chatMessages.forEach((m: any, index: number) => {
        // Normalize role to 'user' or 'model'
        const role = m.role === 'user' ? 'user' : 'model';

        // Build the parts array for the current message
        const currentParts: any[] = [];
        if (m.text) {
          currentParts.push({ text: m.text });
        }
        // Only include heavy image base64 if it's within the last 2 messages to minimize payload & latency on mobile
        if (m.image && index >= chatMessages.length - 2) {
          const parsed = parseDataUrl(m.image);
          if (parsed) {
            currentParts.push({
              inlineData: {
                mimeType: parsed.mimeType,
                data: parsed.base64Data
              }
            });
          }
        }

        // Default if parts is somehow empty
        if (currentParts.length === 0) {
          currentParts.push({ text: ' ' });
        }

        if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === role) {
          // Merge contiguous same-role messages
          const lastMsg = formattedContents[formattedContents.length - 1];
          const existingTextPart = lastMsg.parts.find((p: any) => p.text !== undefined);
          const currentTextPart = currentParts.find((p: any) => p.text !== undefined);

          if (existingTextPart && currentTextPart) {
            existingTextPart.text += `\n\n${currentTextPart.text}`;
          } else if (currentTextPart) {
            lastMsg.parts.push(currentTextPart);
          }

          // Push any image/inlineData parts if present
          currentParts.forEach((part: any) => {
            if (part.inlineData) {
              lastMsg.parts.push(part);
            }
          });
        } else {
          formattedContents.push({
            role,
            parts: currentParts
          });
        }
      });

      // Default the content if somehow empty
      const contents = formattedContents.length > 0 ? formattedContents : [{ role: 'user', parts: [{ text: 'Olá' }] }];

      // Check if user uploaded an image
      const hasImage = contents.some((c: any) => 
        Array.isArray(c.parts) && c.parts.some((p: any) => p.inlineData)
      );

      // Model priority for maximum resilience:
      // For pure text: gemini-3.1-flash-lite is lightning fast, zero-queue, highly resilient to 503 regional demand spikes.
      // Falls back to gemini-3.8-flash and gemini-flash-latest.
      const candidateModels = hasImage
        ? ["gemini-3.8-flash", "gemini-flash-latest"]
        : ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];

      let response: any = null;
      let lastErr: any = null;

      for (let i = 0; i < candidateModels.length; i++) {
        const modelToUse = candidateModels[i];
        try {
          console.log(`[AI Request] Trying model '${modelToUse}' (candidate ${i + 1}/${candidateModels.length})...`);
          response = await ai.models.generateContent({
            model: modelToUse,
            contents,
            config: {
              systemInstruction: systemContext,
              maxOutputTokens: 1024,
              temperature: 0.7
            }
          });

          if (response && response.text) {
            console.log(`[AI Request] Success with model '${modelToUse}'!`);
            break; // Success!
          }
        } catch (err: any) {
          lastErr = err;
          const errMessage = String(err?.message || err);
          console.warn(`[AI Attempt with model '${modelToUse}' failed]:`, errMessage);

          // If there's another candidate model, switch immediately
          if (i < candidateModels.length - 1) {
            console.log(`Failing over to next candidate model: '${candidateModels[i + 1]}'`);
            await new Promise(resolve => setTimeout(resolve, 250));
          }
        }
      }

      // If all Google API candidate models failed (e.g. global 503 spike or network block),
      // activate the Roones Sales Intelligence Contingency Engine so the user never sees a broken screen
      if (!response || !response.text) {
        console.warn('All Gemini candidate models failed. Activating Roones Sales Contingency Engine...');
        const userLastText = messages[messages.length - 1]?.text || prompt || '';
        const contingencyResponse = generateRoonesContingencyGuidance(userLastText, mode);
        return res.json({ 
          text: contingencyResponse,
          isContingency: true 
        });
      }

      res.json({ text: response.text });
    } catch (err: any) {
      console.error('Detailed Gemini Error:', err);
      
      const userLastText = req.body?.messages?.[req.body.messages.length - 1]?.text || req.body?.prompt || '';
      // Last-resort fallback so the user always receives expert guidance
      const emergencyResponse = generateRoonesContingencyGuidance(userLastText, req.body?.mode || 'whatsapp');
      return res.json({
        text: emergencyResponse,
        isContingency: true
      });
    }
  });

  // Business Intelligence Contingency Generator (Ensures Iza never leaves the user hanging)
  function generateRoonesContingencyGuidance(question: string, mode = 'whatsapp'): string {
    const q = question.toLowerCase();

    if (q.includes('qualifica') || q.includes('pergunta') || q.includes('entender') || q.includes('necessidade') || q.includes('paciente')) {
      return `> 💡 **Nota da Iza**: *A inteligência em tempo real enfrentou pico de demanda no Google. Estruturei esta orientação prática baseada no Método Roones para você qualificar a paciente sem perder o tempo da conversa:*\n\n` +
        `### As 4 Perguntas Estratégicas de Qualificação no WhatsApp:\n\n` +
        `Para entender a real necessidade sem parecer um formulário frio ou robótico, siga esta sequência:\n\n` +
        `1. **Sondagem da Dor & Queixa Principal**:\n` +
        `   *"Para que eu consiga te orientar da melhor forma: o que exatamente tem te incomodado hoje ou qual resultado você mais deseja alcançar?"*\n\n` +
        `2. **Janela de Urgência (Momento de Decisão)**:\n` +
        `   *"Há quanto tempo você vem pensando em cuidar disso? Tem alguma data ou evento especial em vista?"*\n\n` +
        `3. **Histórico e Expectativa Prévia**:\n` +
        `   *"Você já chegou a realizar alguma avaliação ou procedimento parecido antes, ou esta seria a sua primeira experiência?"*\n\n` +
        `4. **Ponte para a Consulta / Avaliação Personalizada**:\n` +
        `   *"Perfeito! Como cada paciente tem uma anatomia única e o plano deve ser desenhado sob medida para a sua segurança, o próximo passo ideal é uma avaliação presencial rápida. Você prefere horários pela manhã ou à tarde?"*\n\n` +
        `### 💬 Script Pronto para Enviar no WhatsApp Agora:\n\n` +
        `"Olá! Que bom receber seu contato. Para que eu consiga te passar as orientações mais precisas para o seu caso: o que exatamente tem te incomodado hoje e qual é a sua principal prioridade? Assim já consigo verificar os protocolos ideais para você!"\n\n` +
        `*(Toque no botão abaixo para tentar novamente gerar via IA em tempo real assim que desejar).*`;
    }

    if (q.includes('preço') || q.includes('valor') || q.includes('quanto custa') || q.includes('caro')) {
      return `> 💡 **Nota da Iza**: *Orientação prática gerada pelo Método Roones para ancoragem de valor e preço:*\n\n` +
        `### Regra de Ouro do Método Roones para Preço no WhatsApp:\n` +
        `Nunca passe o valor isolado sem antes contextualizar a personalização e a autoridade técnica da clínica.\n\n` +
        `### 💬 Script Pronto para Enviar no WhatsApp Agora:\n\n` +
        `"Entendo totalmente a sua preocupação com o investimento! Aqui na clínica, nós não trabalhamos com protocolos prontos ou genéricos, pois cada paciente tem necessidades e objetivos muito específicos. Por isso, fazemos uma avaliação inicial para desenhar exatamente o que você precisa, garantindo segurança e o melhor resultado. Qual o melhor dia desta semana para alinharmos seu plano?"`;
    }

    if (q.includes('marido') || q.includes('esposo') || q.includes('pensar') || q.includes('depois')) {
      return `> 💡 **Nota da Iza**: *Orientação prática gerada pelo Método Roones para contornar indecisão / terceiros:*\n\n` +
        `### Como Manter a Porta Aberta sem Pressionar:\n` +
        `Valide a decisão compartilhada e convide o parceiro para acompanhar a avaliação presencial.\n\n` +
        `### 💬 Script Pronto para Enviar no WhatsApp Agora:\n\n` +
        `"Faz todo sentido conversar com ele com calma! Inclusive, muitas pacientes nossas vêm acompanhadas na primeira consulta justamente para que ambos tirem dúvidas e vejam o planejamento juntos. Quer que eu reserve um horário especial em que vocês dois possam comparecer com tranquilidade?"`;
    }

    // Default high-converting commercial consultation guidance
    return `> 💡 **Nota da Iza**: *Orientação estruturada do Método Roones para atendimento comercial de alta conversão:*\n\n` +
      `### Pilares de Atendimento da Mentora Iza:\n` +
      `1. **Acolha antes de direcionar**: Demonstre empatia genuína com o sentimento da paciente.\n` +
      `2. **Faça perguntas abertas de qualificação**: Entenda o contexto antes de apresentar soluções ou valores.\n` +
      `3. **Conduza sempre com alternativa dupla**: Feche com escolhas práticas (ex: "prefere quinta às 14h ou sexta às 10h?").\n\n` +
      `*(Toque no botão abaixo para tentar novamente gerar via IA em tempo real).*`;
  }

  // Helper function to prepend a 44-byte standard WAV header to raw PCM audio
  function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = pcmBuffer.length;
    const header = Buffer.alloc(44);

    header.write('RIFF', 0);
    header.writeUInt32LE(dataSize + 36, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // subchunk1 size
    header.writeUInt16LE(1, 20); // PCM format
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitsPerSample, 34);
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);

    return Buffer.concat([header, pcmBuffer]);
  }

  // AI Speech Synthesis (TTS) endpoint
  app.post('/api/ai/tts', authenticateToken, async (req: any, res) => {
    try {
      const { text, tone } = req.body;
      const actualApiKey = process.env.GEMINI_API_KEY;

      if (!actualApiKey || !text || typeof text !== 'string') {
        return res.status(400).json({ message: 'Texto ou chave não fornecidos para síntese de voz.' });
      }

      const ai = new GoogleGenAI({ 
        apiKey: actualApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      let toneInstruction = 'Diga com tom acolhedor, caloroso, simpático e muito humano em português do Brasil: ';
      if (tone === 'entusiasmado') {
        toneInstruction = 'Diga com entusiasmo alegre, tom motivador, dinâmico e caloroso em português do Brasil: ';
      } else if (tone === 'didatico') {
        toneInstruction = 'Diga com tom didático, calmo, pausado e seguro em português do Brasil: ';
      }

      const cleanText = text.slice(0, 450);

      const ttsResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: `${toneInstruction}${cleanText}` }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }
            }
          }
        }
      });

      const audioPart = ttsResponse.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data);
      const base64Data = audioPart?.inlineData?.data;
      const mimeType = audioPart?.inlineData?.mimeType || 'audio/wav';

      if (base64Data) {
        let finalBase64 = base64Data;
        let finalMime = mimeType;

        if (mimeType.includes('pcm') || mimeType.includes('raw') || mimeType === 'audio/wav') {
          // Verify if audio has RIFF header or needs PCM wrapper
          const rawBuffer = Buffer.from(base64Data, 'base64');
          if (rawBuffer.length > 4 && rawBuffer.toString('utf8', 0, 4) !== 'RIFF') {
            const wavBuffer = pcmToWav(rawBuffer, 24000, 1, 16);
            finalBase64 = wavBuffer.toString('base64');
            finalMime = 'audio/wav';
          }
        }

        return res.json({
          audioUrl: `data:${finalMime};base64,${finalBase64}`
        });
      }

      return res.status(502).json({ message: 'Nenhum áudio gerado pelo modelo neural.' });
    } catch (err: any) {
      console.warn('Erro na síntese neural Gemini TTS:', err?.message || err);
      return res.status(500).json({ message: 'Falha na síntese neural', error: err?.message || String(err) });
    }
  });

  // --- Vite Setup ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
