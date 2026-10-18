import { DiagnosticResult, ExtractedFile, ScaleReadinessScore } from '../types';

export function analyzeFileContent(content: string, fileName: string): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];
  const lower = content.toLowerCase();
  const pathLower = fileName.toLowerCase();

  // 1. In-memory sessions / Stateful server (Blocks Horizontal Autoscaling)
  if (
    (content.includes('express-session') && !content.includes('connect-redis') && !content.includes('redis') && !content.includes('ioredis')) ||
    (content.includes('global.') && (content.includes('users') || content.includes('cache') || content.includes('sessions'))) ||
    (content.includes('let activeSessions =') || content.includes('const userSessions = new Map('))
  ) {
    results.push({
      category: 'Escalabilidade',
      severity: 'high',
      title: 'Estado em Memória Local (Stateful Server)',
      description: 'Armazenamento de sessões, autenticação ou cache direto na memória da instância (RAM local) sem camada distribuída (Redis).',
      impactOnScale: 'Impede o balanceamento de carga (Load Balancer com múltiplas instâncias). Se subir 5 instâncias, o usuário cai e perde a sessão entre requests.',
      recommendation: 'Torne o backend 100% Stateless: use JWT assinado com refresh token ou sessões centralizadas no Redis.',
      fileName,
    });
  }

  // 2. Database N+1 Queries & Missing Pagination (Crushes DB under high load)
  if (
    (lower.includes('await') || lower.includes('select') || lower.includes('findby') || lower.includes('query') || lower.includes('.find(')) &&
    (lower.includes('for (') || lower.includes('for(') || lower.includes('foreach') || lower.includes('.map(async') || lower.includes('while('))
  ) {
    results.push({
      category: 'Banco de Dados',
      severity: 'high',
      title: 'Consultas N+1 em Iterações no Banco de Dados',
      description: 'Execução de queries SQL/ORM dentro de laços de repetição.',
      impactOnScale: 'Com 100 clientes gerando 500 registros cada, isso dispara 50.000 queries instantâneas, saturando o Connection Pool e travando o banco.',
      recommendation: 'Utilize consultas agregadas com JOINs, cláusula IN (WHERE id IN (...)), ou técnicas de batching como Dataloader.',
      fileName,
    });
  }

  // 3. Missing Pagination / Unbounded Queries (SELECT * or findAll without LIMIT)
  if (
    (lower.includes('select * from') && !lower.includes('limit') && !lower.includes('take') && !lower.includes('paginate')) ||
    (lower.includes('findall()') && !lower.includes('limit') && !lower.includes('pagesize'))
  ) {
    results.push({
      category: 'Banco de Dados',
      severity: 'high',
      title: 'Consulta sem Paginação (Unbounded Query)',
      description: 'Buscar todos os registros de uma tabela sem limite máximo (LIMIT / OFFSET / Cursor).',
      impactOnScale: 'Em produção comercial com milhões de registros, essa consulta causará Out-Of-Memory (OOM) no servidor e travará o banco de dados.',
      recommendation: 'Implemente paginação obrigatória baseada em cursor (Keyset pagination) ou limite padrão seguro (ex: limit 50).',
      fileName,
    });
  }

  // 4. Heavy Synchronous Processing in Main Thread (Blocks Event Loop)
  if (
    content.includes('fs.readFileSync') ||
    content.includes('fs.writeFileSync') ||
    content.includes('execSync') ||
    content.includes('bcrypt.hashSync')
  ) {
    results.push({
      category: 'Performance',
      severity: 'high',
      title: 'Operações Síncronas Bloqueando a Thread Principal',
      description: 'Uso de métodos Sync (como readFileSync, writeFileSync ou processamento intensivo de CPU síncrono).',
      impactOnScale: 'Enquanto uma requisição processa essa chamada, todas as outras requisições de outros clientes ficam congeladas na fila.',
      recommendation: 'Utilize versões assíncronas (fs/promises, async bcrypt) ou delegue tarefas pesadas para workers assíncronos/filas.',
      fileName,
    });
  }

  // 5. Hardcoded Credentials & Secrets (Security & Compliance Blocker)
  if (
    (content.includes('password = "') || content.includes('secret = "') || content.includes('apiKey = "') || content.includes('api_key = "')) &&
    !content.includes('process.env') &&
    !pathLower.includes('example') &&
    !pathLower.includes('test')
  ) {
    results.push({
      category: 'Segurança',
      severity: 'high',
      title: 'Credenciais e Chaves Fixas no Código (Hardcoded Secrets)',
      description: 'Chaves de API, senhas ou tokens definidos diretamente no código-fonte.',
      impactOnScale: 'Bloqueio imediato em auditorias de segurança (SOC2, ISO 27001, LGPD) e risco catastrófico de vazamento em massa de dados de clientes.',
      recommendation: 'Migre todas as credenciais para variáveis de ambiente (.env) gerenciadas via Secret Manager seguro.',
      fileName,
    });
  }

  // 6. Lack of Rate Limiting & DoS Vulnerability
  if (
    (pathLower.includes('server') || pathLower.includes('app') || pathLower.includes('route') || pathLower.includes('api')) &&
    !content.includes('rate-limit') &&
    !content.includes('express-rate-limit') &&
    !content.includes('throttle') &&
    !content.includes('limiter')
  ) {
    results.push({
      category: 'Escalabilidade',
      severity: 'medium',
      title: 'Ausência de Rate Limiting (Controle de Taxa)',
      description: 'Endpoints de API expostos sem limitação de chamadas por IP ou por cliente autenticado.',
      impactOnScale: 'Um único cliente ou script automatizado pode derrubar toda a infraestrutura com disparos contínuos (Denial of Service).',
      recommendation: 'Instale middlewares de Rate Limiting (ex: express-rate-limit ou Redis token bucket) com cotas por plano comercial.',
      fileName,
    });
  }

  // 7. Missing Multi-tenancy Data Isolation Safeguards
  if (
    (lower.includes('select') || lower.includes('update') || lower.includes('delete')) &&
    !lower.includes('tenant_id') &&
    !lower.includes('tenantid') &&
    !lower.includes('organization_id') &&
    !lower.includes('company_id') &&
    (pathLower.includes('repo') || pathLower.includes('service') || pathLower.includes('model'))
  ) {
    results.push({
      category: 'Multi-tenancy',
      severity: 'medium',
      title: 'Risco de Falha no Isolamento de Dados Multi-tenant',
      description: 'Consultas e mutações no banco de dados sem filtro explícito de tenant/organização.',
      impactOnScale: 'Risco gravíssimo de um cliente acessar ou sobrescrever dados confidenciais de outro cliente corporativo.',
      recommendation: 'Adicione Row-Level Security (RLS) no PostgreSQL ou middleware automático que injeta `tenant_id` em todas as queries.',
      fileName,
    });
  }

  // 8. Long-running Synchronous Webhooks / Email sending in request cycle
  if (
    (lower.includes('sendemail') || lower.includes('sendmail') || lower.includes('stripe.charges') || lower.includes('axios.post')) &&
    (pathLower.includes('controller') || pathLower.includes('route') || pathLower.includes('handler')) &&
    !content.includes('queue') &&
    !content.includes('bull') &&
    !content.includes('rabbitmq') &&
    !content.includes('sqs')
  ) {
    results.push({
      category: 'Arquitetura',
      severity: 'medium',
      title: 'Tarefas Pesadas / Integrações Externas no Ciclo da Requisição HTTP',
      description: 'Disparo de e-mails, processamento de relatórios ou webhooks diretamente na resposta HTTP do usuário.',
      impactOnScale: 'Se a API de terceiros oscilar ou demorar 5 segundos, a requisição do usuário trava e consome recursos da aplicação.',
      recommendation: 'Mova tarefas secundárias para filas assíncronas (BullMQ, Celery, SQS ou RabbitMQ) com workers dedicados.',
      fileName,
    });
  }

  return results;
}

export function calculateReadinessScore(files: ExtractedFile[], allDiagnostics: DiagnosticResult[]): ScaleReadinessScore {
  let score = 100;
  let dbScore = 100;
  let concurrencyScore = 100;
  let archScore = 100;
  let costScore = 100;
  let secScore = 100;

  allDiagnostics.forEach((d) => {
    const penalty = d.severity === 'high' ? 18 : d.severity === 'medium' ? 8 : 3;
    score -= penalty;

    if (d.category === 'Banco de Dados') dbScore -= penalty * 1.2;
    if (d.category === 'Performance' || d.category === 'Escalabilidade') concurrencyScore -= penalty * 1.2;
    if (d.category === 'Arquitetura') archScore -= penalty;
    if (d.category === 'Segurança' || d.category === 'Multi-tenancy') secScore -= penalty * 1.5;
  });

  return {
    overallScore: Math.max(15, Math.min(100, Math.round(score))),
    databaseScore: Math.max(10, Math.min(100, Math.round(dbScore))),
    concurrencyScore: Math.max(10, Math.min(100, Math.round(concurrencyScore))),
    architectureScore: Math.max(20, Math.min(100, Math.round(archScore))),
    costEfficiencyScore: Math.max(20, Math.min(100, Math.round((dbScore + concurrencyScore) / 2))),
    securityScore: Math.max(15, Math.min(100, Math.round(secScore))),
  };
}

export const COMMERCIAL_SCALING_CHECKLIST = [
  {
    pillar: '1. Banco de Dados & I/O de Disco',
    criticalRisk: 'Colapso de conexões sob carga e lentidão exponencial',
    symptoms: ['Queries N+1 em listas', 'Falta de índices em chaves estrangeiras', 'Tabelas sem particionamento ou paginação'],
    solution: 'Connection pooling (PgBouncer/Prisma Accelerate), índices parciais e paginação com cursor.',
  },
  {
    pillar: '2. Arquitetura Stateless & Escalabilidade Horizontal',
    criticalRisk: 'Impossibilidade de subir múltiplas instâncias atrás de Load Balancer',
    symptoms: ['Sessões salvas na memória local da aplicação', 'Upload de arquivos salvo no disco local do container em vez de S3/GCS', 'Websockets sem Redis Pub/Sub'],
    solution: 'Tornar as instâncias totalmente descartáveis (stateless) com JWT/Redis e Object Storage na nuvem.',
  },
  {
    pillar: '3. Processamento Assíncrono & Filas',
    criticalRisk: 'Timeouts em cascata quando serviços externos demoram',
    symptoms: ['Envio de e-mails, PDFs e relatórios dentro da rota HTTP', 'Webhooks síncronos travando o cliente'],
    solution: 'Fila de mensageria assíncrona (BullMQ, Redis Streams, RabbitMQ ou AWS SQS) com retentativas automáticas.',
  },
  {
    pillar: '4. Isolamento Multi-tenant & Segurança',
    criticalRisk: 'Vazamento de dados entre empresas clientes (Risco Jurídico/LGPD)',
    symptoms: ['Queries sem filtro de organização/tenant', 'Falta de auditoria de acessos', 'Chaves e senhas fixas no repositório'],
    solution: 'Row Level Security (RLS) no banco de dados e injeção automática de tenant_id via middleware de autenticação.',
  },
  {
    pillar: '5. Custo por Usuário (Unit Economics)',
    criticalRisk: 'Faturamento menor que a fatura do servidor na nuvem ao crescer',
    symptoms: ['Consumo de CPU em 100% com poucos usuários', 'Falta de cache em camadas (Redis/CDN)', 'Consultas pesadas repetidas a cada 2 segundos'],
    solution: 'Cache distribuído com invalidação pontual, CDN para ativos estáticos e algoritmos otimizados de O(n²)->O(n).',
  }
];
