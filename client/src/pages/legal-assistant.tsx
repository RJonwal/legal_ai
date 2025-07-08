import { useState } from "react";
import { CaseSidebar } from "@/components/sidebar/case-sidebar";
import { ChatInterface } from "@/components/chat/chat-interface";
import { DocumentCanvas } from "@/components/canvas/document-canvas";
import { FunctionModal } from "@/components/modals/function-modal";

export default function LegalAssistant() {
  const [currentCaseId, setCurrentCaseId] = useState<number>(1);
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [modalFunction, setModalFunction] = useState<string | null>(null);

  const handleCaseSelect = (caseId: number) => {
    setCurrentCaseId(caseId);
    setCurrentDocument(null);
  };

  const handleFunctionClick = (functionId: string) => {
    setModalFunction(functionId);
  };

  const handleDocumentGenerate = (document: any) => {
    setCurrentDocument(document);
  };

  const handleDocumentUpdate = (document: any) => {
    setCurrentDocument(document);
  };

  const closeModal = () => {
    setModalFunction(null);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CaseSidebar
        currentCaseId={currentCaseId}
        onCaseSelect={handleCaseSelect}
      />
      
      <div className="flex-1 flex">
        <ChatInterface
          caseId={currentCaseId}
          onFunctionClick={handleFunctionClick}
          onDocumentGenerate={handleDocumentGenerate}
        />
        
        <DocumentCanvas
          caseId={currentCaseId}
          document={currentDocument}
          onDocumentUpdate={handleDocumentUpdate}
        />
      </div>

      <FunctionModal
        isOpen={!!modalFunction}
        functionId={modalFunction || ''}
        caseId={currentCaseId}
        onClose={closeModal}
        onDocumentGenerate={handleDocumentGenerate}
      />
    </div>
  );
}
