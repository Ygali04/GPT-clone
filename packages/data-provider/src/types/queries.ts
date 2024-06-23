import type { InfiniteData } from '@tanstack/react-query';
import type { TMessage, TConversation, TSharedLink } from '../schemas';
export type Conversation = {
  id: string;
  createdAt: number;
  participants: string[];
  lastMessage: string;
  conversations: TConversation[];
};

// Parameters for listing conversations (e.g., for pagination)
export type ConversationListParams = {
  limit?: number;
  before?: string | null;
  after?: string | null;
  order?: 'asc' | 'desc';
  pageNumber: string; // Add this line
  conversationId?: string;
  isArchived?: boolean;
};

// Type for the response from the conversation list API
export type ConversationListResponse = {
  conversations: TConversation[];
  pageNumber: string;
  pageSize: string | number;
  pages: string | number;
  messages: TMessage[];
};

export type ConversationData = InfiniteData<ConversationListResponse>;
export type ConversationUpdater = (
  data: ConversationData,
  conversation: TConversation,
) => ConversationData;

export type SharedMessagesResponse = Omit<TSharedLink, 'messages'> & {
  messages: TMessage[];
};
export type SharedLinkListParams = Omit<ConversationListParams, 'isArchived' | 'conversationId'> & {
  isPublic?: boolean;
};

export type SharedLinksResponse = Omit<ConversationListResponse, 'conversations' | 'messages'> & {
  sharedLinks: TSharedLink[];
};

// Type for the response from the conversation list API
export type SharedLinkListResponse = {
  sharedLinks: TSharedLink[];
  pageNumber: string;
  pageSize: string | number;
  pages: string | number;
};

export type SharedLinkListData = InfiniteData<SharedLinkListResponse>;
