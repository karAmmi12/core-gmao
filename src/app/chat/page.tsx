/**
 * Page Chat IA
 * Interface principale pour accéder à l'assistant IA
 */

import { ChatInterface } from '@/presentation/components/features/chat/ChatInterface';

export const metadata = {
  title: 'Assistant IA | GMAO',
  description: 'Discutez avec l\'assistant IA pour obtenir de l\'aide',
};

export default function ChatPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ChatInterface />
    </div>
  );
}
