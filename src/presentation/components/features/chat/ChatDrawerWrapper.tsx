'use client';

/**
 * ChatDrawerWrapper - Client Component
 * Wrapper pour intégrer ChatDrawer dans le layout
 */

import { useChat } from '@/presentation/providers/ChatProvider';
import { ChatDrawer } from '@/presentation/components/features/chat/ChatDrawer';

export function ChatDrawerWrapper() {
  const { isOpen, closeChat } = useChat();
  return <ChatDrawer isOpen={isOpen} onClose={closeChat} />;
}
