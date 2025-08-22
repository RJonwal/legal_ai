import { useState, useCallback, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { CaseSidebar } from "@/components/sidebar/case-sidebar";
import ChatInterface from "@/components/chat/chat-interface";
import { DocumentCanvas } from "@/components/canvas/document-canvas";
import { EnhancedFunctionModal } from "@/components/modals/enhanced-function-modal";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";


export default function LegalAssistant() {
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const [currentCaseId, setCurrentCaseId] = useState<number>(1);
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [modalFunction, setModalFunction] = useState<string | null>(null);
  const [chatSize, setChatSize] = useState<number>(75);
  const [canvasSize, setCanvasSize] = useState<number>(25);


  // Memoize URL parameters parsing for performance
  const caseIdFromUrl = useMemo(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const caseParam = urlParams.get('case');
    return caseParam ? parseInt(caseParam) : null;
  }, [location]);

  // Handle URL parameters for case selection
  // useEffect(() => {
  //   if (caseIdFromUrl && !isNaN(caseIdFromUrl)) {
  //     setCurrentCaseId(caseIdFromUrl);
  //     setCurrentDocument(null); // Reset document when switching cases
  //   }
  // }, [caseIdFromUrl]);

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
    // queryClient.invalidateQueries({ queryKey: [`/api/cases/${caseId}`] });
    // queryClient.invalidateQueries({ queryKey: [`/api/cases/${caseId}/messages`] });

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
        <ResizablePanel defaultSize={chatSize} minSize={30}>
          <ChatInterface
            caseId={currentCaseId}
            onFunctionClick={handleFunctionClick}
            onDocumentGenerate={handleDocumentGenerate}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={canvasSize} minSize={25}>
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


    </div>
  );
}