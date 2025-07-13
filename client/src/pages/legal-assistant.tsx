import { useState, useCallback, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { CaseSidebar } from "@/components/sidebar/case-sidebar";
import ChatInterface from "@/components/chat/chat-interface";
import { DocumentCanvas } from "@/components/canvas/document-canvas";
import { EnhancedFunctionModal } from "@/components/modals/enhanced-function-modal";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import DashboardChat from "@/components/live-chat/dashboard-chat";

export default function LegalAssistant() {
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const [currentCaseId, setCurrentCaseId] = useState<number>(1);
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [modalFunction, setModalFunction] = useState<string | null>(null);
  const [chatSize, setChatSize] = useState<number>(75);
  const [canvasSize, setCanvasSize] = useState<number>(25);
  const [liveChatOpen, setLiveChatOpen] = useState<boolean>(false);

  // Memoize URL parameters parsing for performance
  const caseIdFromUrl = useMemo(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const caseParam = urlParams.get('case');
    return caseParam ? parseInt(caseParam) : null;
  }, [location]);

  // Handle URL parameters for case selection
  useEffect(() => {
    if (caseIdFromUrl && !isNaN(caseIdFromUrl)) {
      setCurrentCaseId(caseIdFromUrl);
      setCurrentDocument(null); // Reset document when switching cases
    }
  }, [caseIdFromUrl]);

  const handleCaseSelect = useCallback(async (caseId: number) => {
    console.log('Case selected in LegalAssistant:', caseId);
    setCurrentCaseId(caseId);
    setCurrentDocument(null);

    try {
      // Fetch case data first
      const response = await fetch(`/api/cases/${caseId}`);
      if (response.ok) {
        const caseData = await response.json();
        console.log('Case data loaded:', caseData);

        // Update chat context with case information using React Query cache
        queryClient.setQueryData(['case', caseId], caseData);
        
        // Dispatch case selection event more efficiently
        const chatInterface = document.querySelector('[data-chat-interface="true"]');
        if (chatInterface) {
          const event = new CustomEvent('caseSelected', { 
            detail: { caseId, caseData } 
          });
          chatInterface.dispatchEvent(event);
          console.log('Dispatched caseSelected event to chat interface');
        } else {
          console.log('Chat interface not found');
        }
      }
    } catch (error) {
      console.error('Error loading case data:', error);
    }

    // Invalidate and refetch case data
    queryClient.invalidateQueries({ queryKey: [`/api/cases/${caseId}`] });
    queryClient.invalidateQueries({ queryKey: [`/api/cases/${caseId}/messages`] });

    // Update URL to reflect current case
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('case', caseId.toString());
    window.history.pushState({}, '', currentUrl.toString());
  }, [queryClient]);

  const handleFunctionClick = (functionId: string) => {
    setModalFunction(functionId);
  };

  const handleDocumentGenerate = (document: any) => {
    setCurrentDocument(document);
    // Auto-expand document canvas when document is generated
    setChatSize(40);
    setCanvasSize(60);
  };

  // Auto-adjust panel sizes based on document state
  useEffect(() => {
    if (!currentDocument) {
      // When no document, give more space to chat
      setChatSize(75);
      setCanvasSize(25);
    }
  }, [currentDocument]);

  const handleDocumentUpdate = (document: any) => {
    setCurrentDocument(document);
  };

  const closeModal = () => {
    setModalFunction(null);
  };

  const onLayoutChange = useCallback((sizes: number[]) => {
    setChatSize(sizes[0]);
    setCanvasSize(sizes[1]);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <CaseSidebar
        currentCaseId={currentCaseId}
        onCaseSelect={handleCaseSelect}
      />

      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1"
        onLayout={onLayoutChange}
      >
        <ResizablePanel size={chatSize} minSize={30}>
          <ChatInterface
            caseId={currentCaseId}
            onFunctionClick={handleFunctionClick}
            onDocumentGenerate={handleDocumentGenerate}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel size={canvasSize} minSize={25}>
          <DocumentCanvas
            caseId={currentCaseId}
            document={currentDocument}
            onDocumentUpdate={handleDocumentUpdate}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      <EnhancedFunctionModal
        isOpen={!!modalFunction}
        functionId={modalFunction || ''}
        caseId={currentCaseId}
        onClose={closeModal}
        onDocumentGenerate={handleDocumentGenerate}
        onSendMessage={(message) => {
          // Handle sending message to chat
          console.log('Strategy message:', message);
        }}
      />

      {/* Dashboard Chat Widget with Enhanced Features */}
      <DashboardChat 
        isOpen={liveChatOpen}
        onToggle={() => setLiveChatOpen(!liveChatOpen)}
      />
      
      {/* Dashboard Chat Button */}
      {!liveChatOpen && (
        <button
          onClick={() => setLiveChatOpen(true)}
          className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors z-40"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}
    </div>
  );
}