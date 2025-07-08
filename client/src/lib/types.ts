export interface FunctionAction {
  id: string;
  label: string;
  icon: string;
  type: 'action' | 'primary';
  description: string;
}

export interface ModalContent {
  title: string;
  content: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface DocumentCanvasProps {
  caseId: number;
  document?: any;
  onDocumentUpdate?: (document: any) => void;
}

export interface ChatMessage {
  id: number;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  metadata?: any;
}

export interface LegalFunction {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
}
