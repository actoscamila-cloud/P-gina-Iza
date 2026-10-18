import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Trash2, 
  Edit3, 
  Check, 
  RefreshCw, 
  FileCheck2, 
  Eye, 
  Code,
  ShieldCheck,
  HelpCircle,
  HeartHandshake,
  AlignLeft,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';
import { toast } from 'sonner';
import { Objection } from '../types';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedCount: number) => void;
}

const SAMPLE_RAW_TEXT = `Biblioteca de Objeções - Metodologia Vertus

1. "Está muito caro, achei o valor alto"
Motivo: Insegurança financeira e falta de percepção de valor dos protocolos exclusivos.
Orientação da Especialista: Nunca dê desconto sem readequar o plano; ancore o investimento na durabilidade e nos produtos de padrão médico.
Rapport: "Super compreendo, investir em nós mesmas exige planejamento e clareza de prioridades."
Consultiva: "Se o valor estivesse 100% alinhado, você iniciaria o protocolo hoje mesmo ou tem alguma outra dúvida técnica?"
Autoridade: "Trabalhamos exclusivamente com insumos importados com selo de aprovação médica internacional e rastreabilidade total."
WhatsApp: "Super compreendo, investir no nosso bem-estar exige planejamento! Me conta: o que mais chamou sua atenção no plano para avaliarmos as opções de pagamento ideais para você?"

2. "Preciso falar com o meu marido antes de fechar"
Motivo: Terceirização da decisão por medo de arrependimento ou julgamento em casa.
Orientação: Valide a parceria do casal, mas empodere a paciente como protagonista da sua própria transformação.
Rapport: "Acho maravilhoso você compartilhar momentos e decisões importantes com ele!"
Consultiva: "Ele costuma apoiar quando você decide cuidar da sua autoestima e bem-estar?"
Autoridade: "A maioria das nossas pacientes divide essa etapa e seus maridos são os primeiros a elogiar a naturalidade dos resultados."
WhatsApp: "Que ótimo, apoio da família é fundamental! O que acha de levar um resumo do protocolo para ele ver junto com você? Se preferir, posso tirar as dúvidas dele diretamente."`;

const SAMPLE_CSV = `Gatilho,Motivo Oculto,Visão do Especialista,Rapport,Consultiva,Autoridade,Resposta Geral
"Tá muito caro","Insegurança sobre o retorno financeiro","Nunca dê desconto sem reduzir escopo","Super entendo sua cautela com o investimento","Qual benefício mais te encantou no protocolo?","Nossos insumos possuem certificação médica premium","Entendo perfeitamente, vamos analisar as condições que melhor se encaixam"`;

const SAMPLE_JSON = `[
  {
    "trigger": "Tá muito caro",
    "reason": "Insegurança sobre o retorno financeiro",
    "expertView": "Nunca dê desconto sem reduzir escopo",
    "rapportResponse": "Super entendo sua cautela com o investimento...",
    "consultativeResponse": "Qual benefício mais te encantou no protocolo?",
    "authorityResponse": "Nossos insumos possuem certificação médica premium...",
    "response": "Entendo perfeitamente, vamos analisar as melhores condições."
  }
]`;

const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
  const [activeFormat, setActiveFormat] = useState<'text' | 'pdf' | 'json' | 'csv'>('text');
  const [rawText, setRawText] = useState('');
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState<string>('');
  
  // PDF state
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [extractedObjections, setExtractedObjections] = useState<Partial<Objection>[]>([]);
  const [extractedSource, setExtractedSource] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'json'>('cards');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fast Client-Side Parser for Structured Vertus Text (01 — ..., Visão do Especialista, Rapport, etc.)
  const parseStructuredVertusTextClient = (text: string): Partial<Objection>[] => {
    if (!text || text.trim().length < 5) return [];
    const blocks = text.split(/(?=(?:^|\n)\s*(?:\d+[\s\.\-—–]+|[#]+\s*\d*|\bObjeção\s*\d*))/i).filter(b => b.trim().length > 0);
    const parsed: Partial<Objection>[] = [];

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

      const expertMatch = block.match(/(?:Visão\s+do\s+Especialista|Orientação(?:\s+da\s+Especialista)?)\s*:\s*([\s\S]*?)(?=(?:Rapport|Consultiva|Autoridade|WhatsApp|Resposta|\n\s*\n\s*[A-Z]|$))/i);
      if (expertMatch) expertView = expertMatch[1].trim();

      const rapportMatch = block.match(/Rapport\s*:\s*([\s\S]*?)(?=(?:Visão|Orientação|Consultiva|Autoridade|WhatsApp|Resposta|$))/i);
      if (rapportMatch) rapportResponse = rapportMatch[1].trim();

      const consultMatch = block.match(/Consultiva\s*:\s*([\s\S]*?)(?=(?:Visão|Orientação|Rapport|Autoridade|WhatsApp|Resposta|$))/i);
      if (consultMatch) consultativeResponse = consultMatch[1].trim();

      const authMatch = block.match(/Autoridade\s*:\s*([\s\S]*?)(?=(?:Visão|Orientação|Rapport|Consultiva|WhatsApp|Resposta|$))/i);
      if (authMatch) authorityResponse = authMatch[1].trim();

      const respMatch = block.match(/(?:WhatsApp|Resposta(?:\s+Geral|\s+Final)?)\s*:\s*([\s\S]*?)$/i);
      if (respMatch) response = respMatch[1].trim();
      else response = rapportResponse || consultativeResponse || authorityResponse;

      if (trigger && (expertView || rapportResponse || consultativeResponse || authorityResponse)) {
        parsed.push({
          trigger,
          reason: expertView ? expertView.split('.')[0].trim() : 'Barreira identificada no material',
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

  const detectedStructuredCount = React.useMemo(() => {
    return parseStructuredVertusTextClient(rawText).length;
  }, [rawText]);

  const processRawTextInstantly = () => {
    const items = parseStructuredVertusTextClient(rawText);
    if (items.length > 0) {
      setExtractedObjections(items);
      setExtractedSource(`Texto Estruturado Vertus (${items.length} itens)`);
      setInputText(JSON.stringify(items, null, 2));
      toast.success(`${items.length} objeções organizadas com sucesso com a Metodologia Vertus!`);
    } else {
      processRawTextWithAI();
    }
  };

  // AI Extraction from Raw Text (copiado de PDF, Word, WhatsApp, anotações, etc)
  const processRawTextWithAI = async () => {
    if (!rawText.trim() || rawText.trim().length < 10) {
      toast.error('Por favor, cole o texto das objeções com pelo menos algumas frases para análise.');
      return;
    }

    // If client parser already detected structured items, use them directly without waiting
    const localStructured = parseStructuredVertusTextClient(rawText);
    if (localStructured.length > 0) {
      setExtractedObjections(localStructured);
      setExtractedSource(`Texto Estruturado Vertus (${localStructured.length} itens)`);
      setInputText(JSON.stringify(localStructured, null, 2));
      toast.success(`${localStructured.length} objeções estruturadas com sucesso!`);
      return;
    }

    setIsAnalyzingAI(true);
    setAiStatusMessage('A Iza está lendo o texto e organizando os scripts da Metodologia Vertus...');

    try {
      const res = await api.post('/objections/extract-text', {
        text: rawText.trim()
      });

      if (res.data?.objections && Array.isArray(res.data.objections) && res.data.objections.length > 0) {
        setExtractedObjections(res.data.objections);
        setExtractedSource(res.data.source || 'Texto Livre Processado');
        setInputText(JSON.stringify(res.data.objections, null, 2));
        toast.success(`Pronto! ${res.data.objections.length} objeções organizadas com a Metodologia Vertus.`);
      } else {
        toast.error('Nenhuma objeção pôde ser estruturada a partir do texto informado.');
      }
    } catch (err: any) {
      console.error('Error extracting text with AI:', err);
      const msg = err.response?.data?.message || 'Falha ao processar o texto com a IA. Tente novamente em alguns instantes.';
      toast.error(msg);
    } finally {
      setIsAnalyzingAI(false);
      setAiStatusMessage('');
    }
  };

  // AI Extraction from PDF File
  const processPdfFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Por favor, selecione um arquivo em formato PDF.');
      return;
    }

    setSelectedPdf(file);
    setIsAnalyzingAI(true);
    setAiStatusMessage('Lendo e codificando arquivo PDF...');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64 = event.target?.result as string;
          setAiStatusMessage('A Iza está lendo o PDF e identificando todas as barreiras de fechamento...');
          
          const res = await api.post('/objections/extract-pdf', {
            pdfBase64: base64,
            fileName: file.name
          });

          if (res.data?.objections && Array.isArray(res.data.objections) && res.data.objections.length > 0) {
            setExtractedObjections(res.data.objections);
            setExtractedSource(`PDF: ${file.name}`);
            setInputText(JSON.stringify(res.data.objections, null, 2));
            toast.success(`Leitura concluída! ${res.data.objections.length} objeções organizadas com sucesso.`);
          } else {
            toast.error('Nenhuma objeção comercial estruturada foi encontrada no PDF.');
          }
        } catch (apiErr: any) {
          console.error('Error analyzing PDF on server:', apiErr);
          const errorMsg = apiErr.response?.data?.message || 'Não foi possível ler o PDF via IA no momento. Você pode copiar o texto do seu PDF e colar na aba "Texto Livre (IA)".';
          toast.error(errorMsg);
        } finally {
          setIsAnalyzingAI(false);
          setAiStatusMessage('');
        }
      };

      reader.onerror = () => {
        toast.error('Erro ao ler o arquivo no navegador.');
        setIsAnalyzingAI(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('File read error:', err);
      toast.error('Erro ao processar o arquivo.');
      setIsAnalyzingAI(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.toLowerCase().endsWith('.pdf')) {
      setActiveFormat('pdf');
      processPdfFile(file);
    } else if (file.name.toLowerCase().endsWith('.csv')) {
      setActiveFormat('csv');
      const reader = new FileReader();
      reader.onload = (event) => {
        setInputText(event.target?.result as string);
        toast.success(`Arquivo CSV ${file.name} carregado com sucesso!`);
      };
      reader.readAsText(file);
    } else {
      setActiveFormat('json');
      const reader = new FileReader();
      reader.onload = (event) => {
        setInputText(event.target?.result as string);
        toast.success(`Arquivo JSON ${file.name} carregado com sucesso!`);
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.name.toLowerCase().endsWith('.pdf')) {
        setActiveFormat('pdf');
        processPdfFile(file);
      } else {
        toast.info('Para arrastar e soltar nesta área, utilize um arquivo PDF.');
      }
    }
  };

  const parseCsvToObjections = (csv: string): Partial<Objection>[] => {
    const lines = csv.trim().split('\n');
    if (lines.length <= 1) return [];

    const results: Partial<Objection>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const pattern = /(?:^|,)(?:"([^"]*)"|([^,]*))/g;
      const cells: string[] = [];
      let match;
      while ((match = pattern.exec(line)) !== null) {
        cells.push((match[1] || match[2] || '').trim());
      }

      if (cells.length >= 2 && cells[0]) {
        results.push({
          trigger: cells[0],
          reason: cells[1] || '',
          expertView: cells[2] || '',
          rapportResponse: cells[3] || '',
          consultativeResponse: cells[4] || '',
          authorityResponse: cells[5] || '',
          response: cells[6] || cells[3] || cells[0]
        });
      }
    }
    return results;
  };

  const handleDeleteExtractedItem = (index: number) => {
    const updated = extractedObjections.filter((_, i) => i !== index);
    setExtractedObjections(updated);
    setInputText(JSON.stringify(updated, null, 2));
    toast.info('Objeção removida da lista.');
  };

  const handleUpdateExtractedItem = (index: number, updatedItem: Partial<Objection>) => {
    const updated = [...extractedObjections];
    updated[index] = updatedItem;
    setExtractedObjections(updated);
    setInputText(JSON.stringify(updated, null, 2));
    setEditingIndex(null);
    toast.success('Objeção atualizada com sucesso.');
  };

  const handleImport = async () => {
    let itemsToImport: any[] = [];

    if (extractedObjections.length > 0) {
      itemsToImport = extractedObjections;
    } else if (activeFormat === 'json') {
      if (!inputText.trim()) {
        toast.error('Insira os dados em JSON antes de importar.');
        return;
      }
      try {
        const parsed = JSON.parse(inputText);
        itemsToImport = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        toast.error('Formato JSON inválido. Verifique a sintaxe.');
        return;
      }
    } else if (activeFormat === 'csv') {
      if (!inputText.trim()) {
        toast.error('Insira os dados em CSV antes de importar.');
        return;
      }
      itemsToImport = parseCsvToObjections(inputText);
    } else {
      toast.error('Clique primeiro em "Organizar Objeções com IA" para processar o conteúdo.');
      return;
    }

    if (itemsToImport.length === 0) {
      toast.error('Nenhuma objeção válida identificada para importação.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await api.post('/objections/bulk-import', { 
        objections: itemsToImport,
        newObjections: itemsToImport 
      });
      const count = res.data?.count || itemsToImport.length;
      toast.success(res.data?.message || `${count} objeções importadas com sucesso para o banco!`);
      onImportSuccess(count);
      onClose();
    } catch (err: any) {
      console.error('Import error:', err);
      toast.error(err.response?.data?.message || 'Erro ao importar objeções no banco.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setExtractedObjections([]);
    setSelectedPdf(null);
    setRawText('');
    setInputText('');
    setExtractedSource('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-vertus-card border border-vertus-gray rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-vertus-gray flex items-center justify-between bg-vertus-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-vertus-gold/15 text-vertus-gold border border-vertus-gold/30 flex items-center justify-center shrink-0">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-vertus-white flex items-center gap-2">
                <span>Importação em Lote de Objeções</span>
                <span className="text-[10px] bg-vertus-gold/15 text-vertus-gold border border-vertus-gold/30 px-2 py-0.5 rounded-full font-sans font-semibold">
                  IA Vertus
                </span>
              </h3>
              <p className="text-xs text-vertus-white/50">
                Cadastre dezenas de scripts colando texto livre ou via PDF, JSON ou CSV
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-vertus-white/40 hover:text-vertus-white hover:bg-vertus-gray transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar flex-1">
          {/* Format Tabs Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-vertus-bg p-1 rounded-xl border border-vertus-gray flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setActiveFormat('text');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeFormat === 'text'
                    ? 'bg-vertus-gold text-vertus-bg font-bold shadow-sm'
                    : 'text-vertus-white/60 hover:text-vertus-white'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
                <span>Texto Livre (IA)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveFormat('pdf');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeFormat === 'pdf'
                    ? 'bg-vertus-gold text-vertus-bg font-bold shadow-sm'
                    : 'text-vertus-white/60 hover:text-vertus-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Arquivo PDF (IA)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormat('json')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeFormat === 'json'
                    ? 'bg-vertus-gold text-vertus-bg font-bold shadow-sm'
                    : 'text-vertus-white/60 hover:text-vertus-white'
                }`}
              >
                JSON
              </button>

              <button
                type="button"
                onClick={() => setActiveFormat('csv')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeFormat === 'csv'
                    ? 'bg-vertus-gold text-vertus-bg font-bold shadow-sm'
                    : 'text-vertus-white/60 hover:text-vertus-white'
                }`}
              >
                CSV
              </button>
            </div>

            <div className="flex items-center gap-2">
              {extractedObjections.length > 0 ? (
                <button
                  type="button"
                  onClick={resetAll}
                  className="text-xs text-rose-400 hover:underline py-1.5 px-2 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Limpar e Recomeçar
                </button>
              ) : activeFormat === 'text' ? (
                <button
                  type="button"
                  onClick={() => setRawText(SAMPLE_RAW_TEXT)}
                  className="text-xs text-vertus-gold hover:underline py-1.5 px-2 cursor-pointer"
                >
                  Carregar Exemplo
                </button>
              ) : activeFormat === 'json' ? (
                <button
                  type="button"
                  onClick={() => setInputText(SAMPLE_JSON)}
                  className="text-xs text-vertus-gold hover:underline py-1.5 px-2 cursor-pointer"
                >
                  Carregar Exemplo JSON
                </button>
              ) : activeFormat === 'csv' ? (
                <button
                  type="button"
                  onClick={() => setInputText(SAMPLE_CSV)}
                  className="text-xs text-vertus-gold hover:underline py-1.5 px-2 cursor-pointer"
                >
                  Carregar Exemplo CSV
                </button>
              ) : null}

              {activeFormat === 'pdf' && (
                <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-vertus-gray hover:bg-vertus-white/10 text-vertus-white/80 text-xs font-semibold flex items-center gap-1.5 border border-vertus-gray transition-colors">
                  <FileText className="w-3.5 h-3.5 text-vertus-gold" />
                  <span>Escolher PDF</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* LOADING STATE FOR AI PROCESSING */}
          {isAnalyzingAI && (
            <div className="border border-vertus-gold/30 bg-vertus-gold/5 rounded-2xl p-6 sm:p-8 text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-2xl bg-vertus-gold/20 text-vertus-gold border border-vertus-gold/40 flex items-center justify-center mx-auto animate-spin">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-semibold text-vertus-white flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-vertus-gold animate-pulse" />
                  <span>Inteligência Artificial Vertus em Ação</span>
                </h4>
                <p className="text-xs text-vertus-gold font-mono">
                  {aiStatusMessage || 'A Iza está identificando as objeções e estruturando os 7 pilares...'}
                </p>
              </div>
              <div className="w-full max-w-xs mx-auto bg-vertus-bg/80 h-1.5 rounded-full overflow-hidden border border-vertus-gray">
                <div className="h-full bg-vertus-gold animate-[pulse_1.5s_infinite] w-3/4 rounded-full" />
              </div>
              <p className="text-[11px] text-vertus-white/40">
                Analisando o material para criar automaticamente os gatilhos, motivos ocultos e os scripts de Rapport, Consultivo e Autoridade.
              </p>
            </div>
          )}

          {/* EXTRACTED OBJECTIONS REVIEW STATE (CARDS OU JSON) */}
          {extractedObjections.length > 0 && !isAnalyzingAI && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {/* Results Topbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {extractedObjections.length} objeções organizadas com sucesso {extractedSource ? `(${extractedSource})` : ''}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-vertus-bg/80 p-0.5 rounded-lg border border-vertus-gray">
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      viewMode === 'cards'
                        ? 'bg-vertus-gold text-vertus-bg font-bold'
                        : 'text-vertus-white/60 hover:text-vertus-white'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Ver Cards</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('json')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      viewMode === 'json'
                        ? 'bg-vertus-gold text-vertus-bg font-bold'
                        : 'text-vertus-white/60 hover:text-vertus-white'
                    }`}
                  >
                    <Code className="w-3 h-3" />
                    <span>Ver JSON</span>
                  </button>
                </div>
              </div>

              {/* VIEW MODE: CARDS */}
              {viewMode === 'cards' ? (
                <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1 custom-scrollbar">
                  {extractedObjections.map((item, idx) => {
                    const isEditing = editingIndex === idx;

                    if (isEditing) {
                      return (
                        <div key={idx} className="p-4 rounded-2xl bg-vertus-bg border border-vertus-gold/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-vertus-gold">Editando Objeção #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => setEditingIndex(null)}
                              className="text-xs text-vertus-white/40 hover:text-vertus-white cursor-pointer"
                            >
                              Fechar
                            </button>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div>
                              <label className="text-[10px] text-vertus-white/60 font-bold uppercase">Gatilho Verbal</label>
                              <input
                                type="text"
                                defaultValue={item.trigger || ''}
                                id={`edit-trigger-${idx}`}
                                className="w-full bg-vertus-card border border-vertus-gray rounded-lg p-2 text-vertus-white outline-none focus:border-vertus-gold"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-vertus-white/60 font-bold uppercase">Motivo Oculto</label>
                              <input
                                type="text"
                                defaultValue={item.reason || ''}
                                id={`edit-reason-${idx}`}
                                className="w-full bg-vertus-card border border-vertus-gray rounded-lg p-2 text-vertus-white outline-none focus:border-vertus-gold"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-vertus-white/60 font-bold uppercase">Visão da Especialista</label>
                              <input
                                type="text"
                                defaultValue={item.expertView || ''}
                                id={`edit-expert-${idx}`}
                                className="w-full bg-vertus-card border border-vertus-gray rounded-lg p-2 text-vertus-white outline-none focus:border-vertus-gold"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-vertus-gold font-bold uppercase">Script Rapport</label>
                                <textarea
                                  rows={2}
                                  defaultValue={item.rapportResponse || ''}
                                  id={`edit-rapport-${idx}`}
                                  className="w-full bg-vertus-card border border-vertus-gray rounded-lg p-2 text-vertus-white outline-none focus:border-vertus-gold"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-vertus-gold font-bold uppercase">Script Consultivo</label>
                                <textarea
                                  rows={2}
                                  defaultValue={item.consultativeResponse || ''}
                                  id={`edit-consultative-${idx}`}
                                  className="w-full bg-vertus-card border border-vertus-gray rounded-lg p-2 text-vertus-white outline-none focus:border-vertus-gold"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] text-vertus-gold font-bold uppercase">Script Autoridade</label>
                              <textarea
                                rows={2}
                                defaultValue={item.authorityResponse || ''}
                                id={`edit-authority-${idx}`}
                                className="w-full bg-vertus-card border border-vertus-gray rounded-lg p-2 text-vertus-white outline-none focus:border-vertus-gold"
                              />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const trig = (document.getElementById(`edit-trigger-${idx}`) as HTMLInputElement)?.value;
                                  const reas = (document.getElementById(`edit-reason-${idx}`) as HTMLInputElement)?.value;
                                  const exp = (document.getElementById(`edit-expert-${idx}`) as HTMLInputElement)?.value;
                                  const rap = (document.getElementById(`edit-rapport-${idx}`) as HTMLTextAreaElement)?.value;
                                  const con = (document.getElementById(`edit-consultative-${idx}`) as HTMLTextAreaElement)?.value;
                                  const aut = (document.getElementById(`edit-authority-${idx}`) as HTMLTextAreaElement)?.value;
                                  handleUpdateExtractedItem(idx, {
                                    ...item,
                                    trigger: trig,
                                    reason: reas,
                                    expertView: exp,
                                    rapportResponse: rap,
                                    consultativeResponse: con,
                                    authorityResponse: aut,
                                    response: rap || item.response || trig
                                  });
                                }}
                                className="px-3 py-1.5 rounded-lg bg-vertus-gold text-vertus-bg font-bold text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Salvar Alterações
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={idx} 
                        className="p-3.5 sm:p-4 rounded-2xl bg-vertus-bg/80 border border-vertus-gray hover:border-vertus-gold/30 transition-all space-y-2.5 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-vertus-gold/15 text-vertus-gold text-xs font-bold flex items-center justify-center shrink-0 border border-vertus-gold/25 mt-0.5">
                              {idx + 1}
                            </span>
                            <div>
                              <h5 className="font-serif font-bold text-sm text-vertus-white leading-snug">
                                "{item.trigger}"
                              </h5>
                              {item.reason && (
                                <p className="text-[11px] text-vertus-white/50 mt-0.5">
                                  <strong className="text-vertus-white/70">Motivo Oculto:</strong> {item.reason}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => setEditingIndex(idx)}
                              className="p-1.5 rounded-md text-vertus-white/50 hover:text-vertus-gold hover:bg-vertus-gray transition-colors cursor-pointer"
                              title="Editar esta objeção"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExtractedItem(idx)}
                              className="p-1.5 rounded-md text-vertus-white/50 hover:text-rose-400 hover:bg-vertus-gray transition-colors cursor-pointer"
                              title="Remover esta objeção"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {item.expertView && (
                          <div className="text-[11px] bg-vertus-card/70 border border-vertus-gray/60 rounded-xl p-2 text-vertus-white/80 leading-relaxed">
                            <span className="font-semibold text-vertus-gold">💡 Visão do Especialista:</span> {item.expertView}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                          <div className="p-2 rounded-xl bg-vertus-card/50 border border-vertus-gray/40 text-[11px] space-y-1">
                            <span className="font-bold text-vertus-gold flex items-center gap-1 text-[10px] uppercase">
                              <HeartHandshake className="w-3 h-3" />
                              Rapport
                            </span>
                            <p className="text-vertus-white/70 line-clamp-3 leading-relaxed">
                              {item.rapportResponse || 'Não informado'}
                            </p>
                          </div>

                          <div className="p-2 rounded-xl bg-vertus-card/50 border border-vertus-gray/40 text-[11px] space-y-1">
                            <span className="font-bold text-vertus-gold flex items-center gap-1 text-[10px] uppercase">
                              <HelpCircle className="w-3 h-3" />
                              Consultiva
                            </span>
                            <p className="text-vertus-white/70 line-clamp-3 leading-relaxed">
                              {item.consultativeResponse || 'Não informado'}
                            </p>
                          </div>

                          <div className="p-2 rounded-xl bg-vertus-card/50 border border-vertus-gray/40 text-[11px] space-y-1">
                            <span className="font-bold text-vertus-gold flex items-center gap-1 text-[10px] uppercase">
                              <ShieldCheck className="w-3 h-3" />
                              Autoridade
                            </span>
                            <p className="text-vertus-white/70 line-clamp-3 leading-relaxed">
                              {item.authorityResponse || 'Não informado'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* VIEW MODE: JSON */
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-vertus-white/60 uppercase tracking-wider">
                    Estrutura JSON das Objeções:
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      try {
                        const p = JSON.parse(e.target.value);
                        if (Array.isArray(p)) setExtractedObjections(p);
                      } catch {}
                    }}
                    rows={11}
                    className="w-full bg-vertus-bg border border-vertus-gray focus:border-vertus-gold/50 rounded-xl p-3.5 font-mono text-xs leading-relaxed outline-none text-vertus-white resize-none custom-scrollbar"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 1: TEXTO LIVRE COM IA (QUANDO AINDA NÃO EXTRAIU) */}
          {activeFormat === 'text' && extractedObjections.length === 0 && !isAnalyzingAI && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-vertus-white/80 uppercase tracking-wider flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5 text-vertus-gold" />
                  <span>Cole o texto corrido do seu documento, apostila ou anotações:</span>
                </label>
                {rawText && (
                  <span className="text-[11px] text-vertus-white/40">
                    {rawText.length} caracteres
                  </span>
                )}
              </div>

              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={11}
                placeholder="Cole aqui o texto copiado do PDF, da apostila, do manual de atendimento ou mensagens de pacientes...

Exemplo:
- Paciente diz: 'Achei o valor muito puxado'
- Resposta sugerida: 'Super entendo, me conta o que mais te chamou atenção...'
- Ou qualquer texto livre sem formatação: a IA da Vertus vai identificar os gatilhos e estruturar tudo nos 7 pilares automaticamente!"
                className="w-full bg-vertus-bg border border-vertus-gray focus:border-vertus-gold/50 rounded-2xl p-4 text-xs leading-relaxed outline-none text-vertus-white resize-none custom-scrollbar placeholder:text-vertus-white/30"
              />

              {detectedStructuredCount > 0 && (
                <div className="p-3 bg-vertus-gold/10 border border-vertus-gold/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-vertus-gold shrink-0" />
                    <span className="text-xs text-vertus-gold font-medium">
                      <strong>{detectedStructuredCount}</strong> {detectedStructuredCount === 1 ? 'objeção identificada' : 'objeções identificadas'} no padrão Metodologia Vertus!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={processRawTextInstantly}
                    className="px-3.5 py-1.5 rounded-lg bg-vertus-gold text-vertus-bg text-xs font-bold hover:brightness-110 active:scale-95 transition-all shrink-0 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Organizar Agora ({detectedStructuredCount})</span>
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <p className="text-[11px] text-vertus-white/50">
                  {detectedStructuredCount > 0 
                    ? 'Padrão Vertus identificado no texto. Você pode organizar instantaneamente ou utilizar a IA.'
                    : 'A IA lerá o texto, identificará as falas e gerará os scripts de Rapport, Consultivo e Autoridade.'}
                </p>

                <div className="flex items-center gap-2">
                  {detectedStructuredCount > 0 && (
                    <button
                      type="button"
                      onClick={processRawTextInstantly}
                      disabled={isAnalyzingAI}
                      className="px-4 py-2.5 rounded-xl border border-vertus-gold text-vertus-gold hover:bg-vertus-gold/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Rápido ({detectedStructuredCount})</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={processRawTextWithAI}
                    disabled={!rawText.trim() || isAnalyzingAI}
                    className="gold-gradient text-vertus-bg px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-lg shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Organizar Objeções com IA</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PDF COM IA (QUANDO AINDA NÃO EXTRAIU) */}
          {activeFormat === 'pdf' && extractedObjections.length === 0 && !isAnalyzingAI && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragOver 
                    ? 'border-vertus-gold bg-vertus-gold/10' 
                    : 'border-vertus-gray hover:border-vertus-gold/50 bg-vertus-bg/60'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-vertus-gold/10 border border-vertus-gold/30 text-vertus-gold flex items-center justify-center shadow-inner">
                  <FileText className="w-7 h-7" />
                </div>

                {selectedPdf ? (
                  <div className="space-y-2 max-w-md">
                    <div className="flex items-center justify-center gap-2 text-vertus-white font-medium text-sm">
                      <FileCheck2 className="w-4 h-4 text-emerald-400" />
                      <span className="truncate max-w-xs">{selectedPdf.name}</span>
                      <span className="text-xs text-vertus-white/40">({(selectedPdf.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                    <p className="text-xs text-vertus-white/60">
                      Arquivo pronto para leitura. Clique no botão abaixo para a IA analisar.
                    </p>
                    <button
                      type="button"
                      onClick={() => processPdfFile(selectedPdf)}
                      className="gold-gradient text-vertus-bg px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 mx-auto hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Ler e Organizar Objeções com IA</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-w-md">
                    <h4 className="text-sm font-semibold text-vertus-white">
                      Arraste e solte o arquivo PDF aqui
                    </h4>
                    <p className="text-xs text-vertus-white/50 leading-relaxed">
                      Envie playbooks, roteiros de clínica ou manuais de atendimento.
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 px-4 py-2 rounded-xl bg-vertus-gray hover:bg-vertus-white/10 text-vertus-gold border border-vertus-gold/30 text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Selecionar PDF do Computador</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Dica para copiar texto se preferir */}
              <div className="flex items-center justify-between p-3 bg-vertus-bg border border-vertus-gray rounded-xl text-xs">
                <span className="text-vertus-white/60">
                  Prefere não enviar o arquivo? Copie o texto do documento e cole na aba de texto livre.
                </span>
                <button
                  type="button"
                  onClick={() => setActiveFormat('text')}
                  className="text-vertus-gold font-semibold hover:underline shrink-0 ml-2 cursor-pointer flex items-center gap-1"
                >
                  <span>Ir para Texto Livre</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3 & 4: JSON OU CSV MANUAL */}
          {(activeFormat === 'json' || activeFormat === 'csv') && extractedObjections.length === 0 && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className="text-[11px] font-bold text-vertus-white/60 uppercase tracking-wider">
                Cole o conteúdo {activeFormat.toUpperCase()} aqui:
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={11}
                placeholder={activeFormat === 'json' ? SAMPLE_JSON : SAMPLE_CSV}
                className="w-full bg-vertus-bg border border-vertus-gray focus:border-vertus-gold/50 rounded-xl p-3.5 font-mono text-xs leading-relaxed outline-none text-vertus-white resize-none custom-scrollbar"
              />
            </div>
          )}

          {/* Metodologia Vertus card footer note */}
          <div className="bg-vertus-gold/5 border border-vertus-gold/20 rounded-xl p-3 text-[11px] text-vertus-white/70 space-y-1">
            <strong className="text-vertus-gold block font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Metodologia Vertus de Gestão de Objeções:
            </strong>
            <p>
              O sistema organiza automaticamente os 7 pilares: <code>trigger</code> (Gatilho Verbal), <code>reason</code> (Motivo Oculto), <code>expertView</code> (Visão Especialista), <code>rapportResponse</code> (Rapport), <code>consultativeResponse</code> (Consultiva), <code>authorityResponse</code> (Autoridade) e <code>response</code> (WhatsApp Geral).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-vertus-gray flex items-center justify-between gap-3 bg-vertus-card">
          <div className="text-xs text-vertus-white/50 hidden sm:block">
            {extractedObjections.length > 0 ? (
              <span className="text-emerald-400 font-semibold">{extractedObjections.length} objeções prontas para inclusão</span>
            ) : activeFormat === 'text' ? (
              <span>Cole o texto acima e clique em 'Organizar Objeções com IA'</span>
            ) : activeFormat === 'pdf' ? (
              <span>Envie o arquivo PDF para leitura automática</span>
            ) : (
              <span>Insira os dados e confirme a importação</span>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-vertus-white/60 hover:text-vertus-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={
                isProcessing || 
                isAnalyzingAI || 
                (extractedObjections.length === 0 && activeFormat === 'text' && !rawText.trim()) ||
                (extractedObjections.length === 0 && activeFormat === 'pdf') ||
                (extractedObjections.length === 0 && (activeFormat === 'json' || activeFormat === 'csv') && !inputText.trim())
              }
              className="gold-gradient text-vertus-bg px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-md"
            >
              <UploadCloud className="w-4 h-4" />
              {isProcessing ? 'Importando...' : extractedObjections.length > 0 
                ? `Confirmar Importação (${extractedObjections.length} Objeções)` 
                : 'Confirmar Importação'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BulkImportModal;
