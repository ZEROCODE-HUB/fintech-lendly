import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send } from "lucide-react";

// WARNING: Embedding API keys in frontend code is insecure and exposes your key publicly.
// Only do this for local testing and never commit real keys to version control.
const INSECURE_OPENAI_KEY = "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"

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy tu asistente virtual de Increscendo Fintech. ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const messageText = inputValue;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    // append user message and clear input
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // add a temporary typing indicator
    const typingId = `typing-${Date.now()}`;
    setMessages(prev => [...prev, { id: typingId, text: 'Escribiendo...', sender: 'bot', timestamp: new Date() }]);

    try {
      // Prefer the embedded insecure key for direct calls, fallback to VITE_OPENAI_KEY.
      const envClientKey = (import.meta as any)?.env?.VITE_OPENAI_KEY;
      const clientKey = INSECURE_OPENAI_KEY || envClientKey;
      if (!clientKey) {
        console.warn('[Chatbot] No OpenAI key available, using local fallback');
        setMessages(prev => prev.filter(m => m.id !== typingId));
        const botResponse = getBotResponse(messageText);
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: botResponse, sender: 'bot', timestamp: new Date() }]);
        return;
      }

      const SYSTEM_PROMPT = `
Actúa como Asistente Virtual Oficial de Increscendo Fintech MX, S.A.P.I. DE C.V.; tono profesional, amable, claro y seguro; transmite confianza, transparencia y tecnología avanzada. Información oficial: Montes Urales 755, Lomas de Chapultepec, Miguel Hidalgo, CDMX, CP 11000, México; único dominio autorizado: https://increscendofintech.com; jurisdicción México y tribunales CDMX. Tu objetivo es asistir usuarios en WALLET sobre préstamos, membresías, pagos, recargas, monederos digitales, OCR, links de pago y navegación de plataforma. Beneficios: seguridad bancaria con cifrado, pagos de luz/agua/gas/teléfono/TV/impuestos/telepeaje, recargas móviles México, préstamos automatizados con IA, soporte 24/7 y gift cards digitales enviados por SMS. Tecnología: IA, OCR, validación biométrica, cronogramas, wallets seguros y links de pago instantáneo. Prioridad absoluta: seguridad y prevención de fraude. Regla crítica: jamás solicitar, aprobar o sugerir pagos anticipados, depósitos previos, comisiones o garantías antes del otorgamiento de crédito; ningún promotor puede cobrar previamente. Alertar sobre phishing, pharming, vishing, smishing, robo de identidad, pirámides y créditos falsos. Nunca pedir contraseñas, NIP, CVV, OTP, tokens ni datos completos de tarjeta. Datos protegidos bajo normativa mexicana. Portal dual: Servicios/Recargas y Préstamos. Para préstamos: membresía anual activa obligatoria, validación CLABE 18 dígitos, OCR con INE/CURP/selfie, revisión, contrato y desembolso. Si aparece "Procesando pago" o "Procesando desembolso", indicar que es normal temporalmente. Nunca garantizar aprobación, montos ni tiempos exactos. Escalar incidencias a contacto@increscendofintech.com o WhatsApp +52 55 9020 7001. Si hay conflicto entre rapidez y seguridad, prioriza seguridad.
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
        const errText = await r.text().catch(() => '[no body]');
        console.error('[Chatbot] direct OpenAI call failed', r.status, errText);
        setMessages(prev => prev.filter(m => m.id !== typingId));
        const botResponse = getBotResponse(messageText);
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: botResponse, sender: 'bot', timestamp: new Date() }]);
        return;
      }

      const data = await r.json().catch((e) => {
        console.error('[Chatbot] invalid JSON from OpenAI', e);
        return null;
      });
      console.debug('[Chatbot] OpenAI response', data);
      const reply = data?.choices?.[0]?.message?.content ?? getBotResponse(messageText);
      setMessages(prev => prev.filter(m => m.id !== typingId));
      setMessages(prev => [...prev, { id: (Date.now() + 2).toString(), text: reply, sender: 'bot', timestamp: new Date() }]);
    } catch (err) {
      console.error('[Chatbot] unexpected error', err);
      setMessages(prev => prev.filter(m => m.id !== typingId));
      const botResponse = getBotResponse(messageText);
      setMessages(prev => [...prev, { id: (Date.now() + 3).toString(), text: botResponse, sender: 'bot', timestamp: new Date() }]);
    }
  };

  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('préstamo') || lowerInput.includes('solicitar')) {
      return 'Para solicitar un préstamo, ve a la sección "Solicitar Préstamo" en el menú. Necesitarás tener una membresía activa. ¿Te gustaría que te explique el proceso?';
    }

    if (lowerInput.includes('pago') || lowerInput.includes('pagar')) {
      return 'Puedes realizar pagos desde tu dashboard. Aceptamos tarjetas de crédito/débito y transferencias bancarias. ¿Necesitas ayuda con algún pago en específico?';
    }

    if (lowerInput.includes('membresía') || lowerInput.includes('membresia')) {
      return 'Ofrecemos diferentes planes de membresía que te dan acceso a préstamos y servicios. ¿Te gustaría conocer nuestros planes disponibles?';
    }

    if (lowerInput.includes('historial')) {
      return 'Puedes ver tu historial completo de préstamos y transacciones en la sección "Historial" del menú lateral.';
    }

    if (lowerInput.includes('soporte') || lowerInput.includes('ayuda')) {
      return 'Estoy aquí para ayudarte. También puedes contactar a nuestro equipo de soporte humano en la sección "Soporte" o enviando un correo a soporte@increscendo.com';
    }

    return 'Gracias por tu mensaje. ¿Podrías ser más específico? Puedo ayudarte con préstamos, pagos, membresías, historial o cualquier otra consulta sobre nuestros servicios.';
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-glow z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-strong z-50 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-hero text-white">
        <CardTitle className="text-lg">Asistente Virtual</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 hover:bg-white/20 text-white"
        >
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${message.sender === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-accent/50 text-foreground'
                  }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu mensaje..."
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
