import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  where 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Conversation, ConversationMessage, UserSettings } from '../types';
import { removeUndefinedFields } from '../utils/firestoreUtils';
import { detectTextLanguage } from '../i18n/detector';

export const firestoreService = {
  // Generate title from first user message
  generateTitle(content: string): string {
    const cleaned = content.trim().replace(/^[\W_]+/, '');
    if (!cleaned) return 'New Conversation';
    // Clean and truncate to ~35 characters nicely
    const words = cleaned.split(/\s+/).slice(0, 6).join(' ');
    return words.length > 40 ? words.slice(0, 37) + '...' : words;
  },

  // Create a new conversation session
  async createConversation(userId: string, initialTitle = 'New Conversation'): Promise<Conversation> {
    const id = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    
    const conv: Conversation = {
      id,
      title: initialTitle,
      userId,
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
    };

    const convRef = doc(db, 'users', userId, 'conversations', id);
    try {
      await setDoc(convRef, removeUndefinedFields(conv));
      return conv;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${userId}/conversations/${id}`);
      throw error;
    }
  },

  // List all conversations for user, sorted newest first
  async getConversations(userId: string): Promise<Conversation[]> {
    const colRef = collection(db, 'users', userId, 'conversations');
    const q = query(colRef, orderBy('updatedAt', 'desc'), limit(50));
    try {
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as Conversation);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/conversations`);
      return [];
    }
  },

  // Get single conversation
  async getConversation(userId: string, conversationId: string): Promise<Conversation | null> {
    const docRef = doc(db, 'users', userId, 'conversations', conversationId);
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as Conversation;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${userId}/conversations/${conversationId}`);
      return null;
    }
  },

  // Update conversation title or metadata
  async updateConversation(userId: string, conversationId: string, updates: Partial<Conversation>): Promise<void> {
    const docRef = doc(db, 'users', userId, 'conversations', conversationId);
    try {
      const cleanUpdates = removeUndefinedFields({
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      await updateDoc(docRef, cleanUpdates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/conversations/${conversationId}`);
      throw error;
    }
  },

  // Delete conversation and all its messages
  async deleteConversation(userId: string, conversationId: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'conversations', conversationId);
    try {
      // First delete messages inside subcollection
      const msgCol = collection(db, 'users', userId, 'conversations', conversationId, 'messages');
      const msgSnap = await getDocs(msgCol);
      for (const mDoc of msgSnap.docs) {
        await deleteDoc(mDoc.ref);
      }
      // Then delete conversation doc
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}/conversations/${conversationId}`);
      throw error;
    }
  },

  // Add message to conversation
  async addMessage(
    userId: string, 
    conversationId: string, 
    msg: Omit<ConversationMessage, 'id' | 'createdAt' | 'userId' | 'conversationId'>
  ): Promise<ConversationMessage> {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const detectedLang = msg.language || detectTextLanguage(msg.content);
    
    // Safely construct message: omit structuredData completely if it is undefined or null
    const message: ConversationMessage = {
      role: msg.role,
      content: msg.content,
      status: msg.status || 'delivered',
      id,
      conversationId,
      userId,
      createdAt: now,
      language: detectedLang,
      ...(msg.structuredData !== undefined && msg.structuredData !== null
        ? { structuredData: removeUndefinedFields(msg.structuredData) }
        : {}),
    };

    // Recursively strip any accidental undefined fields before calling setDoc()
    const cleanMessageData = removeUndefinedFields(message);

    const msgRef = doc(db, 'users', userId, 'conversations', conversationId, 'messages', id);
    try {
      await setDoc(msgRef, cleanMessageData);

      // Update conversation's updatedAt and snippet
      const convRef = doc(db, 'users', userId, 'conversations', conversationId);
      const snippet = msg.content.length > 100 ? msg.content.substring(0, 97) + '...' : msg.content;
      
      const convSnap = await getDoc(convRef);
      if (convSnap.exists()) {
        const curCount = (convSnap.data().messageCount || 0) + 1;
        const currentTitle = convSnap.data().title;
        // Auto rename from first user message if still titled "New Conversation"
        const newTitle = (currentTitle === 'New Conversation' && msg.role === 'user')
          ? firestoreService.generateTitle(msg.content)
          : currentTitle;

        const convUpdates = removeUndefinedFields({
          updatedAt: now,
          messageCount: curCount,
          lastMessageSnippet: snippet,
          title: newTitle,
        });

        await updateDoc(convRef, convUpdates);
      }

      return message;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${userId}/conversations/${conversationId}/messages/${id}`);
      throw error;
    }
  },

  // Get messages for a conversation
  async getMessages(userId: string, conversationId: string): Promise<ConversationMessage[]> {
    const colRef = collection(db, 'users', userId, 'conversations', conversationId, 'messages');
    const q = query(colRef, orderBy('createdAt', 'asc'));
    try {
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as ConversationMessage);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/conversations/${conversationId}/messages`);
      return [];
    }
  },

  // Delete single message
  async deleteMessage(userId: string, conversationId: string, messageId: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'conversations', conversationId, 'messages', messageId);
    try {
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}/conversations/${conversationId}/messages/${messageId}`);
      throw error;
    }
  },

  // Clear all messages in a conversation
  async clearMessages(userId: string, conversationId: string): Promise<void> {
    const colRef = collection(db, 'users', userId, 'conversations', conversationId, 'messages');
    try {
      const snap = await getDocs(colRef);
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
      }
      const convRef = doc(db, 'users', userId, 'conversations', conversationId);
      await updateDoc(convRef, { messageCount: 0, lastMessageSnippet: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}/conversations/${conversationId}/messages`);
      throw error;
    }
  },

  // Settings
  async getUserSettings(userId: string): Promise<UserSettings> {
    const docRef = doc(db, 'users', userId, 'settings', 'general');
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as UserSettings;
      }
      // Return defaults
      return {
        userId,
        theme: 'dark',
        enterToSend: true,
        showTimestamps: true,
        compactMode: false,
        emailNotifications: true,
        n8nCustomUrl: '',
        preferredLanguage: 'en',
      };
    } catch (error) {
      return {
        userId,
        theme: 'dark',
        enterToSend: true,
        showTimestamps: true,
        compactMode: false,
        emailNotifications: true,
        n8nCustomUrl: '',
        preferredLanguage: 'en',
      };
    }
  },

  async saveUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
    const docRef = doc(db, 'users', userId, 'settings', 'general');
    try {
      const cleanSettings = removeUndefinedFields({ ...settings, userId });
      await setDoc(docRef, cleanSettings, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}/settings/general`);
      throw error;
    }
  },

  // Get user aggregated statistics
  async getUserStats(userId: string): Promise<{ totalConversations: number; totalMessages: number }> {
    try {
      const convs = await this.getConversations(userId);
      const totalConversations = convs.length;
      const totalMessages = convs.reduce((acc, c) => acc + (c.messageCount || 0), 0);
      return { totalConversations, totalMessages };
    } catch {
      return { totalConversations: 0, totalMessages: 0 };
    }
  }
};
