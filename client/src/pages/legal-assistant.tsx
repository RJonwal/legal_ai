import { useState, useRef, useCallback } from "react";
import { CaseSidebar } from "@/components/sidebar/case-sidebar";
import { ChatInterface } from "@/components/chat/chat-interface";
import { DocumentCanvas } from "@/components/canvas/document-canvas";
import { EnhancedFunctionModal } from "@/components/modals/enhanced-function-modal";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export default function LegalAssistant() {
  const [currentCaseId, setCurrentCaseId] = useState<number>(1);
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [modalFunction, setModalFunction] = useState<string | null>(null);
  const [chatSize, setChatSize] = useState<number>(60);
  const [canvasSize, setCanvasSize] = useState<number>(40);

  const handleCaseSelect = (caseId: number) => {
    setCurrentCaseId(caseId);
    setCurrentDocument(null);
  };

  const handleFunctionClick = (functionId: string) => {
    setModalFunction(functionId);
  };

  const handleDocumentGenerate = (document: any) => {
    setCurrentDocument(document);
    // Expand canvas when document is generated
    setChatSize(45);
    setCanvasSize(55);
  };

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
