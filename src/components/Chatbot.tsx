import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send } from "lucide-react";

// WARNING: Embedding API keys in frontend code is insecure and exposes your key publicly.
// Only do this for local testing and never commit real keys to version control.
const INSECURE_OPENAI_KEY = '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';

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

      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${clientKey}`
        },
        body: JSON.stringify({
          model: (import.meta as any).env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Eres un asistente virtual amable y breve para una fintech en español.' },
            { role: 'user', content: messageText }
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
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender === 'user'
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
