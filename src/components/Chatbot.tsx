import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send } from "lucide-react";

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

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
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
