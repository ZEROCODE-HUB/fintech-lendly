import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

// WARNING: Embedding API keys in frontend code is insecure and exposes your key publicly.
// Only do this for local testing and never commit real keys to version control.
const INSECURE_OPENAI_KEY = "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"

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const parseMessageWithBold = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/80 rounded-lg w-fit">
    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy tu **asistente virtual** de Increscendo Fintech. ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const messageText = inputValue;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const envClientKey = (import.meta as any)?.env?.VITE_OPENAI_KEY;
      const clientKey = INSECURE_OPENAI_KEY || envClientKey;
      if (!clientKey) {
        setIsTyping(false);
        const botResponse = getBotResponse(messageText);
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: botResponse, sender: 'bot', timestamp: new Date() }]);
        return;
      }

      const SYSTEM_PROMPT = `
Actúa como Asistente Virtual Oficial de Increscendo Fintech MX, S.A.P.I. DE C.V.; tono profesional, amable, claro y seguro; transmite confianza, transparencia y tecnología avanzada. Usa **negritas** para enfatizar información importante como nombres de servicios, montos, fechas o pasos clave. Ejemplo: "Para solicitar un **préstamo**, ve a...". Información oficial: Montes Urales 755, Lomas de Chapultepec, Miguel Hidalgo, CDMX, CP 11000, México; único dominio autorizado: https://increscendofintech.com; jurisdicción México y tribunales CDMX. Tu objetivo es asistir usuarios en WALLET sobre préstamos, membresías, pagos, recargas, monederos digitales, OCR, links de pago y navegación de plataforma. Beneficios: seguridad bancaria con cifrado, pagos de luz/agua/gas/teléfono/TV/impuestos/telepeaje, recargas móviles México, préstamos automatizados con IA, soporte 24/7 y gift cards digitales enviados por SMS. Tecnología: IA, OCR, validación biométrica, cronogramas, wallets seguros y links de pago instantáneo. Prioridad absoluta: seguridad y prevención de fraude. Regla crítica: jamás solicitar, aprobar o sugerir pagos anticipados, depósitos previos, comisiones o garantías antes del otorgamiento de crédito; ningún promotor puede cobrar previamente. Alertar sobre phishing, pharming, vishing, smishing, robo de identidad, pirámides y créditos falsos. Nunca pedir contraseñas, NIP, CVV, OTP, tokens ni datos completos de tarjeta. Datos protegidos bajo normativa mexicana. Portal dual: Servicios/Recargas y Préstamos. Para préstamos: membresía anual activa obligatoria, validación CLABE 18 dígitos, OCR con INE/CURP/selfie, revisión, contrato y desembolso. Si aparece "Procesando pago" o "Procesando desembolso", indicar que es normal temporalmente. Nunca garantizar aprobación, montos ni tiempos exactos. Escalar incidencias a contacto@increscendofintech.com o WhatsApp +52 55 9020 7001. Si hay conflicto entre rapidez y seguridad, prioriza seguridad.
`;

      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${clientKey}`
        },
        body: JSON.stringify({
          model: (import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini'),
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT
            },
            {
              role: 'user',
              content: messageText
            }
          ],
          max_tokens: 500,
          temperature: 0.2
        })
      });
      if (!r.ok) {
        setIsTyping(false);
        const botResponse = getBotResponse(messageText);
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: botResponse, sender: 'bot', timestamp: new Date() }]);
        return;
      }

      const data = await r.json().catch((e) => {
        return null;
      });
      const reply = data?.choices?.[0]?.message?.content ?? getBotResponse(messageText);
      setIsTyping(false);
      setMessages(prev => [...prev, { id: (Date.now() + 2).toString(), text: reply, sender: 'bot', timestamp: new Date() }]);
    } catch (err) {
      setIsTyping(false);
      const botResponse = getBotResponse(messageText);
      setMessages(prev => [...prev, { id: (Date.now() + 3).toString(), text: botResponse, sender: 'bot', timestamp: new Date() }]);
    }
  };

  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('préstamo') || lowerInput.includes('solicitar')) {
      return 'Para solicitar un **préstamo**, ve a la sección **"Solicitar Préstamo"** en el menú. Necesitarás tener una **membresía activa**. ¿Te gustaría que te explique el proceso?';
    }

    if (lowerInput.includes('pago') || lowerInput.includes('pagar')) {
      return 'Puedes realizar pagos desde tu **dashboard**. Aceptamos **tarjetas de crédito/débito** y **transferencias bancarias**. ¿Necesitas ayuda con algún pago en específico?';
    }

    if (lowerInput.includes('membresía') || lowerInput.includes('membresia')) {
      return 'Ofrecemos diferentes **planes de membresía** que te dan acceso a **préstamos** y **servicios exclusivos**. ¿Te gustaría conocer nuestros planes disponibles?';
    }

    if (lowerInput.includes('historial')) {
      return 'Puedes ver tu **historial completo** de préstamos y transacciones en la sección **"Historial"** del menú lateral.';
    }

    if (lowerInput.includes('soporte') || lowerInput.includes('ayuda')) {
      return 'Estoy aquí para ayudarte. También puedes contactar a nuestro equipo de **soporte humano** en la sección **"Soporte"** o enviando un correo a **soporte@increscendo.com**';
    }

    return 'Gracias por tu mensaje. ¿Podrías ser más específico? Puedo ayudarte con **préstamos**, **pagos**, **membresías**, **historial** o cualquier otra consulta sobre nuestros servicios.';
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-glow z-50 border border-white/20"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[380px] h-[520px] shadow-2xl z-50 flex flex-col rounded-2xl overflow-hidden border border-white/20">
      <CardHeader className="flex flex-row items-center justify-between px-5 py-4 bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-white">Asistente Virtual</CardTitle>
            <p className="text-xs text-white/70">Increscendo Fintech</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 hover:bg-white/20 text-white rounded-lg"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 gap-3 overflow-hidden bg-muted/20">
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div className="flex items-end gap-2 max-w-[85%]">
                {message.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mb-1">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 ${
                    message.sender === 'user'
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-card border border-border/50 text-foreground rounded-bl-md shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{parseMessageWithBold(message.text)}</p>
                  <p className={`text-[10px] mt-1.5 ${
                    message.sender === 'user' ? 'text-white/60' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString('es-MX', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {message.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mb-1">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-end gap-2 max-w-[85%]">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mb-1">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md shadow-sm px-4 py-3">
                  <TypingIndicator />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2 border-t bg-background rounded-xl px-3 py-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu mensaje..."
            className="flex-1 bg-muted/50 border-0 focus-visible:ring-1 text-sm h-9"
          />
          <Button onClick={handleSend} size="sm" className="h-9 w-9 p-0" disabled={!inputValue.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
