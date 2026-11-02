import { apiClient } from './apiClient'
import { ChatMessage, Citation, Conversation } from '../types'

export interface SendMessagePayload {
  conversationId?: string
  documentIds: string[]
  message: string
}

export interface SendMessageResponse {
  conversationId: string
  message: ChatMessage
}

export const SAMPLE_CITATIONS: Record<string, Citation[]> = {
  fin: [
    {
      id: 'cit-1',
      documentId: 'sample-doc-1',
      documentName: 'Q3_Financial_Analysis_Report.pdf',
      pageNumber: 3,
      excerpt: 'Total revenue for Q3 achieved $48.6M, representing a 28% year-over-year increase driven by strong enterprise subscription adoption and enterprise retention rate of 118%.',
      relevanceScore: 0.96,
      sectionHeading: 'Executive Performance Summary',
    },
    {
      id: 'cit-2',
      documentId: 'sample-doc-1',
      documentName: 'Q3_Financial_Analysis_Report.pdf',
      pageNumber: 8,
      excerpt: 'Gross profit margin reached 74.2%, up 320 bps from Q2, reflecting platform infrastructure optimizations.',
      relevanceScore: 0.91,
      sectionHeading: 'Margin & Profitability Bridge',
    },
  ],
  sec: [
    {
      id: 'cit-3',
      documentId: 'sample-doc-2',
      documentName: 'Enterprise_Architecture_Security_Spec.docx',
      pageNumber: 2,
      excerpt: 'Vector retrieval strictly partitions index queries by tenant_id and document access control lists (ACL) prior to approximate nearest neighbor search.',
      relevanceScore: 0.98,
      sectionHeading: 'Vector Index Isolation',
    },
    {
      id: 'cit-4',
      documentId: 'sample-doc-2',
      documentName: 'Enterprise_Architecture_Security_Spec.docx',
      pageNumber: 4,
      excerpt: 'Customer document embeddings and prompts are processed under zero-data-retention agreements; no customer documents are ever used for foundation model training.',
      relevanceScore: 0.94,
      sectionHeading: 'LLM Boundary Policies',
    },
  ],
}

export const SAMPLE_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Q3 Revenue Breakdown & Gross Margins',
    documentIds: ['sample-doc-1'],
    documentNames: ['Q3_Financial_Analysis_Report.pdf'],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    lastMessageSnippet: 'Total revenue achieved $48.6M (+28% YoY) with gross margin expanding to 74.2%.',
    messageCount: 4,
  },
  {
    id: 'conv-2',
    title: 'Tenant Isolation & Vector Encryption Audit',
    documentIds: ['sample-doc-2'],
    documentNames: ['Enterprise_Architecture_Security_Spec.docx'],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    lastMessageSnippet: 'Vector namespaces are strictly segmented by tenant UUID with AES-GCM-256 keys.',
    messageCount: 6,
  },
]

export const SAMPLE_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      role: 'user',
      content: 'What was the overall revenue growth in Q3 and what drove the gross margin improvement?',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'msg-2',
      role: 'assistant',
      content: `Based on **Q3_Financial_Analysis_Report.pdf**, here is the verified breakdown:

### Key Financial Highlights
- **Total Revenue**: Reached **$48.6M**, representing a **28% year-over-year increase**.
- **Growth Drivers**: Strong enterprise subscription net retention of **118%** and new customer acquisition in regulated verticals.
- **Gross Profit Margin**: Expanded to **74.2%** (an increase of **+320 bps** from Q2).

### Margin Expansion Factors
The 320 bps margin expansion was primarily driven by:
1. Platform multi-tenant compute optimization.
2. Vector database index compression reducing raw cloud egress overhead.
3. Automated tiering of cold document chunks to low-cost encrypted storage.

*All figures are sourced directly from the quarterly financial statement filed on page 3 and page 8.*`,
      timestamp: new Date(Date.now() - 3600000 * 2 + 3000).toISOString(),
      citations: SAMPLE_CITATIONS.fin,
      status: 'complete',
      isSamplePreview: true,
    },
  ],
  'conv-2': [
    {
      id: 'msg-3',
      role: 'user',
      content: 'How does DocuMind AI ensure tenant isolation across vector indexes?',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'msg-4',
      role: 'assistant',
      content: `According to the **Enterprise Architecture Security Specification**:

1. **Pre-Filtering Namespace Isolation**: Vector similarity queries execute against strict tenant metadata filters before approximate nearest neighbor (ANN) graph traversal.
2. **Cryptographic Segmentation**: Each organization holds independent AES-GCM-256 envelope keys managed via dedicated KMS policies.
3. **Zero Retention Policy**: Documents submitted to downstream reasoning models adhere strictly to private endpoint zero-data-retention agreements. No customer data is indexed into foundation model weights.`,
      timestamp: new Date(Date.now() - 3600000 * 12 + 2500).toISOString(),
      citations: SAMPLE_CITATIONS.sec,
      status: 'complete',
      isSamplePreview: true,
    },
  ],
}

function normalizeCitation(c: any): Citation {
  return {
    id: c.id || `cit-${Date.now()}`,
    documentId: c.documentId || c.document_id || '',
    documentName: c.documentName || c.document_name || 'Document',
    pageNumber: c.pageNumber ?? c.page_number,
    excerpt: c.excerpt || '',
    relevanceScore: 1.0,
    sectionHeading: c.sectionHeading || c.section_heading,
  }
}

export const chatService = {
  async listConversations(): Promise<Conversation[]> {
    try {
      const res = await apiClient.get<Conversation[]>('/chat/conversations')
      return res.data
    } catch {
      return SAMPLE_CONVERSATIONS
    }
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const res = await apiClient.get<any>(`/chat/conversations/${conversationId}`)
      const rawMsgs = res.data?.messages || []
      return rawMsgs.map((m: any) => ({
        id: m.id || `msg-${Date.now()}`,
        role: m.role || 'assistant',
        content: m.content || '',
        timestamp: m.timestamp || m.created_at || new Date().toISOString(),
        citations: Array.isArray(m.citations) ? m.citations.map(normalizeCitation) : [],
        status: m.status || 'complete',
      }))
    } catch {
      return SAMPLE_CHAT_MESSAGES[conversationId] || []
    }
  },

  async sendMessage(payload: SendMessagePayload): Promise<SendMessageResponse> {
    const res = await apiClient.post<any>('/chat/query', payload)
    const raw = res.data || {}
    const msg = raw.message || {}
    const rawCites = msg.citations || raw.citations || []
    const formattedMsg: ChatMessage = {
      id: msg.id || `msg-${Date.now()}`,
      role: msg.role || 'assistant',
      content: msg.content || raw.answer || '',
      timestamp: msg.timestamp || msg.created_at || new Date().toISOString(),
      citations: Array.isArray(rawCites) ? rawCites.map(normalizeCitation) : [],
      status: msg.status || 'complete',
    }
    return {
      conversationId: raw.conversationId || raw.conversation_id || payload.conversationId || '',
      message: formattedMsg,
    }
  },

  async deleteConversation(id: string): Promise<void> {
    try {
      await apiClient.delete(`/chat/conversations/${id}`)
    } catch {
      // Handled in client state
    }
  },

  async sendFeedback(messageId: string, rating: 'positive' | 'negative', note?: string): Promise<void> {
    try {
      await apiClient.post(`/chat/messages/${messageId}/feedback`, { rating, note })
    } catch {
      // Silently log or queue
    }
  },
}

