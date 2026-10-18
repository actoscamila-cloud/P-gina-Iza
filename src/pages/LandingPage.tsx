import { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  Smartphone,
  Laptop,
  Check,
  Copy,
  MessageCircle,
  Shield,
  Zap,
  Target,
  ChevronRight,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { IzaRealWebMockup } from '../components/IzaRealWebMockup';
import { IzaRealMobileMockup } from '../components/IzaRealMobileMockup';

interface DemoScenario {
  id: string;
  tabLabel: string;
  patientMessage: string;
  patientName: string;
  izaGuidance: string;
  readyScript: string;
  strategyBadge: string;
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'vou-pensar',
    tabLabel: '“Valor alto / Vou pensar e te retorno”',
    patientName: 'Mariana Castro',
    patientMessage: 'Achei o valor do bioestimulador alto... vou pensar e qualquer coisa te retorno.',
    izaGuidance:
      'Visão de Bastidores • Método Roones: A paciente ainda não percebeu valor suficiente no procedimento. Em vez de dar desconto de imediato ou aceitar a saída evasiva, valide a importância da decisão para que ela se sinta segura, e faça uma pergunta aberta investigativa para identificar a real dúvida antes que ela esfrie.',
    readyScript:
      'Entendo perfeitamente, é uma decisão importante e você precisa se sentir segura com ela.\n\nPara eu te ajudar melhor, o que exatamente ficou faltando para você sentir que este é o momento ideal para iniciar o tratamento?',
    strategyBadge: 'Segurança & Investigação Consultiva'
  },
  {
    id: 'achei-caro',
    tabLabel: '“Achei caro / na outra clínica é metade”',
    patientName: 'Beatriz Lima',
    patientMessage: 'Achei R$ 2.400 muito caro. Na clínica aqui perto me passaram bioestimulador por R$ 1.300.',
    izaGuidance:
      'A paciente está comparando apenas preço porque ainda não percebeu a diferença de segurança e procedência dos materiais. Não dê desconto de imediato e não fale mal do concorrente. Mostre que produto de alta rastreabilidade lacrado na frente dela é a garantia do rosto dela.',
    readyScript:
      'Super compreensível pesquisar, Beatriz! Mas me diz: eles te informaram qual marca utilizam e se abrem a ampola lacrada na sua frente? No nosso protocolo nós só utilizamos produtos importados com certificação Anvisa e aplicação especializada.',
    strategyBadge: 'Autoridade & Rastreabilidade de Produto'
  },
  {
    id: 'quanto-custa',
    tabLabel: 'Pergunta fria de preço: “Quanto custa?”',
    patientName: 'Camila Ribeiro',
    patientMessage: 'Olá! Vi a foto no feed. Quanto custa o botox no rosto todo?',
    izaGuidance:
      'Responder apenas o número frio transforma seu procedimento em commodity. A paciente lê o valor, compara com 5 outras clínicas no WhatsApp e some. Acolha a intenção e descubra se ela já fez antes para personalizar a recomendação.',
    readyScript:
      'Olá Camila, que bom ter você aqui! A toxina botulínica é perfeita para suavizar marcas e devolver um olhar descansado e elegante. Me conta: você já realizou esse procedimento antes ou seria sua primeira vez?',
    strategyBadge: 'Rapport Inicial + Diagnóstico Prévio'
  }
];

export default function LandingPage() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('vou-pensar');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeDeviceView, setActiveDeviceView] = useState<'desktop' | 'mobile'>('desktop');

  const currentScenario =
    DEMO_SCENARIOS.find((s) => s.id === activeScenarioId) || DEMO_SCENARIOS[0];

  const handleCopyScript = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const message = encodeURIComponent(
      'Olá! Vim pelo link do Instagram e quero conhecer a Iza para a equipe comercial da minha clínica.'
    );
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#141517] font-sans antialiased selection:bg-[#966B24]/20 selection:text-[#141517]">
      {/* ========================================================================= */}
      {/* MINIMAL NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-[#EBE8E2]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-base font-serif font-black tracking-[0.2em] text-[#966B24]">
              ROONES
            </span>
            <span className="text-[#C5BEB3] text-xs font-mono">/</span>
            <span className="text-xs font-semibold tracking-wider text-[#141517] uppercase">
              Iza
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={handleOpenWhatsApp}
              className="px-4 py-2 rounded-full bg-[#141517] hover:bg-[#25282F] text-white font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Quero conhecer a Iza</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C9A96E]" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 1. HERO — VENDER A TRANSFORMAÇÃO, NÃO A TECNOLOGIA */}
      {/* ========================================================================= */}
      <section className="pt-12 pb-16 sm:pt-20 sm:pb-24 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header Typography */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3EFE6] border border-[#E5DEC9] text-[#7A5416] text-[11px] font-semibold tracking-wider uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#966B24]" />
              Inteligência Comercial para Clínicas de Estética
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-serif font-bold text-[#141517] leading-[1.12] tracking-tight">
              Sua clínica não precisa de mais uma atendente.{' '}
              <span className="text-[#966B24] font-normal italic block sm:inline">
                Precisa de uma Iza.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-[#5A5D66] leading-relaxed max-w-2xl font-normal">
              A IA da Roones que prepara sua equipe para vender melhor, conduz atendimentos e ajuda
              sua clínica a transformar oportunidades em vendas.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                onClick={handleOpenWhatsApp}
                className="px-7 py-4 rounded-xl bg-[#141517] hover:bg-[#25282F] text-white font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2.5 shadow-md shadow-[#141517]/10 cursor-pointer"
              >
                <span>Quero conhecer a Iza</span>
                <ArrowRight className="w-4 h-4 text-[#C9A96E]" />
              </button>

              <span className="text-xs text-[#7A7D87] text-center sm:text-left self-center">
                Disponível na versão Web e App • Sem trocar seu WhatsApp
              </span>
            </div>
          </div>

          {/* Large Hero Mockup: Authentic Iza Web Interface on First Scroll */}
          <div className="mt-12 sm:mt-16">
            <IzaRealWebMockup />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. “O PROBLEMA” — IDENTIFICAÇÃO RÁPIDA (SEM EXAGERO, DIRETO AO PONTO) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-white border-t border-b border-[#EBE8E2] px-5 sm:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Main Question */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#966B24] block mb-2">
              O gargalo invisível
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#141517] leading-tight">
              Quantas vendas sua clínica perde sem perceber?
            </h2>
          </div>

          {/* 3 Situations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-[#EAE6DD] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EFEBE0] text-[#7A5416] flex items-center justify-center text-xs font-bold font-mono">
                01
              </div>
              <h3 className="text-base font-semibold text-[#141517]">
                Atendimento sem padrão.
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5D66] leading-relaxed">
                Cada atendente responde de um jeito no WhatsApp, sem seguir o posicionamento de luxo e
                a autoridade técnica da clínica.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-[#EAE6DD] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EFEBE0] text-[#7A5416] flex items-center justify-center text-xs font-bold font-mono">
                02
              </div>
              <h3 className="text-base font-semibold text-[#141517]">
                Consultoras que não sabem conduzir uma objeção.
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5D66] leading-relaxed">
                Ao ouvir "vou pensar" ou "achei caro", a equipe congela, oferece desconto precipitado ou
                simplesmente encerra o contato.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-[#EAE6DD] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EFEBE0] text-[#7A5416] flex items-center justify-center text-xs font-bold font-mono">
                03
              </div>
              <h3 className="text-base font-semibold text-[#141517]">
                Leads que chegam interessados e terminam sem fechamento.
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5D66] leading-relaxed">
                A clínica investe em posts e tráfego, a paciente pergunta o preço e a conversa morre no
                vácuo da tabela de valores.
              </p>
            </div>
          </div>

          {/* Transition Statement */}
          <div className="mt-12 text-center">
            <p className="text-lg sm:text-xl font-serif text-[#141517] italic">
              A Iza entra justamente nesse ponto.
            </p>
            <div className="w-12 h-0.5 bg-[#966B24] mx-auto mt-3" />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. A SOLUÇÃO — MOSTRAR A IZA (INTERFACE & TECNOLOGIA LIMPA) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#966B24] block mb-2">
              A Solução Roones
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#141517] leading-tight">
              Conheça a Iza.{' '}
              <span className="text-[#966B24] block sm:inline font-normal italic">
                Sua inteligência comercial no atendimento.
              </span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#5A5D66] leading-relaxed">
              A Iza ajuda sua equipe a entender o que perguntar, como conduzir a conversa, responder
              objeções e avançar o cliente até a decisão.
            </p>
          </div>

          {/* 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
            <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] space-y-2 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#F6F2EA] text-[#7A5416] flex items-center justify-center mb-3">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#141517]">
                Treinamento na prática
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5D66] leading-relaxed">
                Aprenda a conduzir cada etapa do atendimento com direcionamento claro para cada
                procedimento da clínica.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] space-y-2 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#F6F2EA] text-[#7A5416] flex items-center justify-center mb-3">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#141517]">
                Objeções
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5D66] leading-relaxed">
                Saiba o que responder sem pressionar ou perder autoridade, transformando insegurança da
                paciente em confiança.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] space-y-2 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#F6F2EA] text-[#7A5416] flex items-center justify-center mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#141517]">
                Estratégia comercial
              </h3>
              <p className="text-xs sm:text-sm text-[#5A5D66] leading-relaxed">
                Perguntas e direcionamentos para transformar uma conversa simples em oportunidade real de
                avaliação presencial.
              </p>
            </div>
          </div>

          {/* Clean Screenshot / Mockup Switcher: Iza Web + App */}
          <div className="mt-12 rounded-3xl bg-white border border-[#E7E4DC] p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0ECE3]">
              <div>
                <span className="text-xs font-semibold text-[#966B24] uppercase tracking-wider block">
                  Presença Operacional
                </span>
                <h4 className="text-lg font-serif font-bold text-[#141517] mt-0.5">
                  A praticidade de ter a Iza no computador e no bolso
                </h4>
              </div>

              {/* View Toggle */}
              <div className="inline-flex p-1 rounded-xl bg-[#F3EFE6] border border-[#E5DEC9] self-start sm:self-auto">
                <button
                  onClick={() => setActiveDeviceView('desktop')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeDeviceView === 'desktop'
                      ? 'bg-white text-[#141517] shadow-xs'
                      : 'text-[#6E7179] hover:text-[#141517]'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Iza Web (Recepção)</span>
                </button>
                <button
                  onClick={() => setActiveDeviceView('mobile')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeDeviceView === 'mobile'
                      ? 'bg-white text-[#141517] shadow-xs'
                      : 'text-[#6E7179] hover:text-[#141517]'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Iza App (Celular)</span>
                </button>
              </div>
            </div>

            {/* Display according to selected device view */}
            {activeDeviceView === 'desktop' ? (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-[#5A5D66] px-1">
                  <span className="font-semibold text-[#141517]">
                    Iza no Computador da Recepção (Desktop)
                  </span>
                  <span className="text-[11px] text-[#966B24] font-medium">
                    Aberta lado a lado com o WhatsApp Web
                  </span>
                </div>
                <IzaRealWebMockup />
                <p className="text-xs text-[#6E7179] text-center pt-2">
                  A secretária recebe a mensagem da paciente no WhatsApp, consulta a Iza em 1 clique e copia o script pronto com tom consultivo e acolhedor.
                </p>
              </div>
            ) : (
              <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-8 py-4">
                <IzaRealMobileMockup />

                {/* Text Explanation Beside Phone */}
                <div className="max-w-md space-y-4 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F4EFE6] border border-[#E8DFC9] text-[11px] font-bold text-[#7A5416]">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Aplicativo Nativo Mobile</span>
                  </div>

                  <h5 className="text-xl sm:text-2xl font-serif font-bold text-[#141517] leading-tight">
                    Sua equipe comercial preparada até fora da clínica
                  </h5>

                  <p className="text-xs sm:text-sm text-[#5A5D66] leading-relaxed">
                    Com o App da Iza no celular, médicas, consultoras e secretárias consultam estratégias de contorno em plantões, finais de semana ou em deslocamento.
                  </p>

                  <div className="space-y-2 text-xs text-[#2C2F36] pt-1">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Roteiros de áudio com indicação exata de tom de voz</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Análise rápida de prints de conversas difíceis</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Simulador de roleplay para treinar a equipe</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleOpenWhatsApp}
                      className="px-5 py-2.5 rounded-xl bg-[#141517] hover:bg-[#25282F] text-white text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                    >
                      <span>Solicitar acesso ao aplicativo</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C9A96E]" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. DEMONSTRAÇÃO — “VEJA A IZA TRABALHANDO” (EXPERIÊNCIA INTERATIVA) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-white border-t border-b border-[#EBE8E2] px-5 sm:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Section Headline */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#966B24] block mb-2">
              Demonstração ao Vivo
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#141517] leading-tight">
              Não é uma IA que responde por você.{' '}
              <span className="text-[#966B24] font-normal italic block">
                É uma IA que prepara você para vender melhor.
              </span>
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-[#5A5D66] max-w-lg mx-auto">
              Clique nas situações abaixo e veja como a Iza orienta a sua equipe diante das objeções mais
              comuns de estética:
            </p>
          </div>

          {/* Scenario Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {DEMO_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => {
                  setActiveScenarioId(scenario.id);
                  setCopied(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeScenarioId === scenario.id
                    ? 'bg-[#141517] text-white shadow-sm'
                    : 'bg-[#F5F2EC] text-[#5A5D66] hover:bg-[#EDE8DE] hover:text-[#141517]'
                }`}
              >
                {scenario.tabLabel}
              </button>
            ))}
          </div>

          {/* Interactive Showcase Box */}
          <div className="rounded-2xl bg-[#FAF9F6] border border-[#E8E4DC] p-5 sm:p-8 space-y-6 shadow-sm">
            {/* Step 1: Patient Objection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#8C8F98] uppercase tracking-wider">
                  Situação: Mensagem da Paciente no WhatsApp
                </span>
                <span className="text-[10px] text-[#8C8F98]">
                  Paciente: {currentScenario.patientName}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#E8E4DC] text-sm text-[#141517] font-medium leading-relaxed">
                "{currentScenario.patientMessage}"
              </div>
            </div>

            {/* Step 2: Iza Guidance */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#7A5416] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#966B24]" />
                  A Iza orienta a atendente:
                </span>
                <span className="text-[10px] bg-[#F5EFE4] text-[#7A5416] px-2 py-0.5 rounded border border-[#E5DEC9] font-medium">
                  {currentScenario.strategyBadge}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#F6F2EA] border border-[#E8E0CE] text-xs sm:text-sm text-[#4E350E] leading-relaxed font-normal">
                {currentScenario.izaGuidance}
              </div>
            </div>

            {/* Step 3: Ready Script for Sending (Authentic WhatsAppScriptCard style) */}
            <div className="rounded-xl border border-emerald-600/30 bg-white overflow-hidden shadow-xs">
              <div className="px-3.5 py-2.5 bg-emerald-50 border-b border-emerald-200/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-800" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-950 block">
                      MENSAGEM PRONTA PARA WHATSAPP
                    </span>
                    <span className="text-[9px] text-emerald-800 font-medium block">
                      1-Clique para colar na conversa com a paciente
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyScript(currentScenario.readyScript)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-white" />
                      <span>Copiar resposta</span>
                    </>
                  )}
                </button>
              </div>

              {/* WhatsApp Bubble Preview */}
              <div className="p-3.5 bg-[#EFEAE2]/60">
                <div className="bg-[#DCF8C6] border border-emerald-300/80 rounded-xl rounded-tl-none p-3.5 shadow-xs space-y-2">
                  <p className="text-sm leading-relaxed text-neutral-900 font-normal whitespace-pre-line">
                    {currentScenario.readyScript}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-stone-600 border-t border-emerald-800/10">
                    <span className="text-emerald-900 font-semibold">
                      {currentScenario.readyScript.length} caracteres • Pronto para envio
                    </span>
                    <span className="text-emerald-800 font-mono font-medium">Agora ✓✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Proof Note */}
            <div className="pt-2 border-t border-[#EBE7DF] text-center">
              <p className="text-xs text-[#6E7179]">
                Isso demonstra o produto sem precisar de manuais complexos. Sua equipe aprende aplicando no dia a dia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CTA FINAL — EXTREMAMENTE SIMPLES (DIRETO E CONVERSOR) */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 px-5 sm:px-8 text-center bg-[#FBFBFA]">
        <div className="max-w-2xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#966B24]">
            <Sparkles className="w-3.5 h-3.5" />
            Próximo Passo
          </span>

          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#141517] leading-tight tracking-tight">
            Sua equipe já está usando IA para vender melhor?
          </h2>

          <p className="text-base sm:text-lg text-[#5A5D66] leading-relaxed max-w-xl mx-auto">
            Conheça a Iza e veja como ela pode fazer parte da rotina comercial da sua clínica.
          </p>

          <div className="pt-4 flex flex-col items-center gap-3">
            <button
              onClick={handleOpenWhatsApp}
              className="w-full sm:w-auto px-9 py-4 rounded-xl bg-[#141517] hover:bg-[#25282F] text-white font-semibold text-base transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-[#141517]/10 cursor-pointer"
            >
              <span>Quero conhecer a Iza</span>
              <ArrowRight className="w-4 h-4 text-[#C9A96E]" />
            </button>

            <span className="text-xs text-[#8C8F98]">
              Disponível na versão Web e App.
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <footer className="py-8 border-t border-[#EBE8E2] px-5 sm:px-8 text-xs text-[#8C8F98]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold tracking-widest text-[#966B24]">ROONES</span>
            <span>•</span>
            <span>Inteligência Comercial para Clínicas</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleOpenWhatsApp}
              className="hover:text-[#141517] transition-colors cursor-pointer"
            >
              Contato Comercial
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
