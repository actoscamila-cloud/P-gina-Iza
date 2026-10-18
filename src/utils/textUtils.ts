/**
 * Utility functions for extracting suggested messages and formatting them for WhatsApp/clipboard.
 */

/**
 * Extracts ONLY the suggested message/script intended to be sent to the patient/lead,
 * intentionally omitting explanations, strategy notes, "o que observar", and internal tips.
 */
export const extractSuggestedMessage = (fullText: string): string => {
  if (!fullText || typeof fullText !== 'string') return '';

  let text = fullText.trim();

  // 1. If text contains a horizontal divider (---, ***, ___), the script is in the first section
  if (/^[\-\*_]{3,}\s*$/m.test(text)) {
    const parts = text.split(/^[\-\*_]{3,}\s*$/m);
    const firstPart = parts[0]?.trim();
    if (firstPart && firstPart.length > 10) {
      text = firstPart;
    }
  }

  // 2. Cut off strategic/diagnostic sections if present without horizontal divider
  const explanationCutoffRegex = /\n\s*(?:#{1,4}\s+|\*{1,2})?(?:O que observar|Observações?|Análise|Por que funciona|Estratégia|Visão (?:do especialista|Vertus|Roones)|Dica(?: de ouro| da Iza| prática)?|Como conduzir|Próximos passos?|Passo a passo|Critérios?|Entonação|Feedback|Orientações?|Motivo oculto)(?::|\*{1,2}|$)[\s\S]*$/i;
  if (explanationCutoffRegex.test(text)) {
    const truncated = text.replace(explanationCutoffRegex, '').trim();
    if (truncated.length > 10) {
      text = truncated;
    }
  }

  // 3. Remove lead-in prefixes like "### Sugestão de Resposta:" or "**Mensagem para enviar:**"
  const leadInRegex = /^(?:[\s\S]*?(?:###?\s*(?:Mensagem|Script|Sugestão|Resposta|Roteiro)[^\n]*|\*\*(?:Mensagem|Script|Sugestão|Resposta|Roteiro)[^\n]*\*\*|(?:Você pode responder|Sugiro responder|Envie o seguinte script|Copie e envie)[^\n]*:))\s*\n+/i;
  if (leadInRegex.test(text)) {
    const stripped = text.replace(leadInRegex, '').trim();
    if (stripped.length > 10) {
      text = stripped;
    }
  }

  // 4. If message is formatted in markdown blockquote lines (> ...), extract the blockquote content
  const lines = text.split('\n');
  const blockquoteLines = lines.filter(line => line.trim().startsWith('>'));
  if (blockquoteLines.length > 0) {
    const blockquoteText = blockquoteLines.map(l => l.replace(/^>\s*/, '')).join('\n').trim();
    if (blockquoteText.length > 15) {
      text = blockquoteText;
    }
  }

  // 5. Clean surrounding quotes from each line / block
  text = text.replace(/^["“«]\s*/gm, '').replace(/\s*["”»]$/gm, '').trim();

  // 6. Convert markdown to native WhatsApp formatting
  // Bold: **text** -> *text*
  text = text.replace(/\*\*(.*?)\*\*/g, '*$1*');
  // Bullets: - item -> • item
  text = text.replace(/^[\*\-]\s+/gm, '• ');
  // Headers: # Title -> *TITLE*
  text = text.replace(/^#{1,6}\s+(.*)$/gm, '*$1*');
  // Leftover blockquote markers
  text = text.replace(/^>\s+/gm, '');
  // Normalize excessive blank lines
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
};

/**
 * Format any general markdown text for WhatsApp sharing
 */
export const formatForWhatsApp = (text: string): string => {
  if (!text) return '';
  let formatted = text.trim();
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '*$1*');
  formatted = formatted.replace(/^[\*\-]\s+/gm, '• ');
  formatted = formatted.replace(/^#{1,6}\s+(.*)$/gm, '*$1*');
  formatted = formatted.replace(/^>\s+/gm, '');
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  return formatted.trim();
};

export interface ParsedAiMessage {
  hasScript: boolean;
  scriptText: string;
  strategyText: string | null;
  rawText: string;
}

/**
 * Splits an AI message into the client-facing suggested script (for WhatsApp/Audio)
 * and the internal educational strategy/analysis, if present.
 */
export const parseAiMessageParts = (fullText: string): ParsedAiMessage => {
  if (!fullText || typeof fullText !== 'string') {
    return { hasScript: false, scriptText: '', strategyText: null, rawText: '' };
  }

  const raw = fullText.trim();

  // Check if there is an explicit horizontal divider (---, ***, ___)
  const dividerMatch = /^[\-\*_]{3,}\s*$/m.exec(raw);
  if (dividerMatch && dividerMatch.index !== undefined) {
    const firstPart = raw.slice(0, dividerMatch.index).trim();
    const secondPart = raw.slice(dividerMatch.index + dividerMatch[0].length).trim();

    const script = extractSuggestedMessage(firstPart);
    if (script && script.length > 15) {
      return {
        hasScript: true,
        scriptText: script,
        strategyText: secondPart.length > 5 ? secondPart : null,
        rawText: raw,
      };
    }
  }

  // Check if there are blockquotes (> ...) indicating a direct script
  const lines = raw.split('\n');
  const hasBlockquotes = lines.some(l => l.trim().startsWith('>'));
  if (hasBlockquotes) {
    const script = extractSuggestedMessage(raw);
    if (script && script.length > 15) {
      // Find where strategy starts
      const cutoffRegex = /\n\s*(?:#{1,4}\s+|\*{1,2})?(?:O que observar|Observações?|Análise|Por que funciona|Estratégia|Visão (?:do especialista|Roones|Vertus)|Dica(?: de ouro| da Iza| prática)?|Como conduzir|Próximos passos?|Passo a passo|Critérios?|Entonação|Feedback|Orientações?|Motivo oculto)(?::|\*{1,2}|$)[\s\S]*$/i;
      const match = cutoffRegex.exec(raw);
      const strategy = match ? match[0].trim() : null;

      return {
        hasScript: true,
        scriptText: script,
        strategyText: strategy,
        rawText: raw,
      };
    }
  }

  // Check if there is an explanation cutoff
  const cutoffRegex = /\n\s*(?:#{1,4}\s+|\*{1,2})?(?:O que observar|Observações?|Análise|Por que funciona|Estratégia|Visão (?:do especialista|Roones|Vertus)|Dica(?: de ouro| da Iza| prática)?|Como conduzir|Próximos passos?|Passo a passo|Critérios?|Entonação|Feedback|Orientações?|Motivo oculto)(?::|\*{1,2}|$)[\s\S]*$/i;
  const match = cutoffRegex.exec(raw);
  if (match && match.index > 20) {
    const firstPart = raw.slice(0, match.index).trim();
    const script = extractSuggestedMessage(firstPart);
    if (script && script.length > 15) {
      return {
        hasScript: true,
        scriptText: script,
        strategyText: raw.slice(match.index).trim(),
        rawText: raw,
      };
    }
  }

  // General text without explicit script separation
  return {
    hasScript: false,
    scriptText: '',
    strategyText: null,
    rawText: raw,
  };
};
