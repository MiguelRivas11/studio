'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getFinancialGuidance } from '@/ai/flows/chatbot-assisted-financial-guidance';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');
  const chatbotAvatar = PlaceHolderImages.find((img) => img.id === 'chatbot-tutor');

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getFinancialGuidance({
        query: input,
        history: [...messages, userMessage],
      });
      const assistantMessage: Message = {
        role: 'model',
        content: response.answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting financial guidance:', error);
      const errorMessage: Message = {
        role: 'model',
        content:
          'Lo siento, algo salió mal. Por favor, intenta de nuevo más tarde.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-57px)] md:h-[calc(100vh-57px-4rem)]">
      <div className="flex-1 p-4 md:p-6">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-6 pr-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-4',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'model' && (
                  <Avatar className="h-9 w-9 border">
                    {chatbotAvatar && <AvatarImage src={chatbotAvatar.imageUrl} alt="AI Tutor" data-ai-hint={chatbotAvatar.imageHint} />}
                    <AvatarFallback>IA</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-md rounded-lg p-3 text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p>{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-9 w-9 border">
                     {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User" data-ai-hint={userAvatar.imageHint} />}
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4 justify-start">
                <Avatar className="h-9 w-9 border">
                  {chatbotAvatar && <AvatarImage src={chatbotAvatar.imageUrl} alt="AI Tutor" data-ai-hint={chatbotAvatar.imageHint} />}
                  <AvatarFallback>IA</AvatarFallback>
                </Avatar>
                <div className="max-w-md rounded-lg p-3 text-sm bg-muted">
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 bg-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-foreground rounded-full animate-pulse"></span>
                  </div>
                </div>
              </div>
            )}
             {messages.length === 0 && !isLoading && (
              <div className="text-center text-muted-foreground pt-16">
                <Bot className="mx-auto h-12 w-12 mb-4" />
                <h2 className="text-xl font-semibold">Tutor Financiero IA</h2>
                <p>Hazme una pregunta para comenzar.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="p-4 md:p-6 border-t bg-background">
        <form onSubmit={handleSubmit} className="flex items-center gap-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta financiera..."
            className="flex-1"
            disabled={isLoading}
            autoComplete="off"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
            <Send className="h-5 w-5" />
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
