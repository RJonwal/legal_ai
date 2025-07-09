import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { CaseSidebar } from "@/components/sidebar/case-sidebar";
import { ChatInterface } from "@/components/chat/chat-interface";
import { DocumentCanvas } from "@/components/canvas/document-canvas";
import { EnhancedFunctionModal } from "@/components/modals/enhanced-function-modal";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export default function LegalAssistant() {
  const [location] = useLocation();
  const [currentCaseId, setCurrentCaseId] = useState<number>(1);
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [modalFunction, setModalFunction] = useState<string | null>(null);
  const [chatSize, setChatSize] = useState<number>(60);
  const [canvasSize, setCanvasSize] = useState<number>(40);

  // Handle URL parameters for case selection
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const caseParam = urlParams.get('case');
    if (caseParam) {
      const caseId = parseInt(caseParam);
      if (!isNaN(caseId)) {
        setCurrentCaseId(caseId);
        setCurrentDocument(null); // Reset document when switching cases
      }
    }
  }, [location]);

  const handleCaseSelect = (caseId: number) => {
    setCurrentCaseId(caseId);
    setCurrentDocument(null);
    // Update URL to reflect current case
    const newUrl = `/legal-assistant?case=${caseId}`;
    window.history.pushState({}, '', newUrl);
  };

  const handleFunctionClick = (functionId: string) => {
    setModalFunction(functionId);
  };

  const handleDocumentGenerate = (document: any) => {
    setCurrentDocument(document);
    // Auto-expand document canvas when document is generated
    setChatSize(35);
    setCanvasSize(65);
  };

  // Auto-adjust panel sizes based on document state
  useEffect(() => {
    if (!currentDocument) {
      // When no document, give more space to chat
      setChatSize(70);
      setCanvasSize(30);
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
    </div>
  );
}
