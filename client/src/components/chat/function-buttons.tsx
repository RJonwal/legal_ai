import { Button } from "@/components/ui/button";
import { 
  Upload, 
  Calendar, 
  History, 
  Search, 
  Lightbulb, 
  FolderOpen, 
  BarChart3, 
  UserCheck, 
  Gavel 
} from "@/lib/icons";

interface FunctionButtonsProps {
  onFunctionClick: (functionId: string) => void;
  disabled?: boolean;
}

export function FunctionButtons({ onFunctionClick, disabled }: FunctionButtonsProps) {
  const functions = [
    {
      id: 'upload-document',
      label: 'Upload Document',
      icon: Upload,
      variant: 'secondary' as const,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      variant: 'secondary' as const,
    },
    {
      id: 'timeline',
      label: 'Case History',
      icon: History,
      variant: 'secondary' as const,
    },
    {
      id: 'evidence-analysis',
      label: 'Evidence Analysis',
      icon: Search,
      variant: 'secondary' as const,
    },
    {
      id: 'next-best-action',
      label: 'Next Best Action',
      icon: Lightbulb,
      variant: 'default' as const,
    },
    {
      id: 'case-documents',
      label: 'Case Documents',
      icon: FolderOpen,
      variant: 'secondary' as const,
    },
    {
      id: 'case-analytics',
      label: 'Case Analytics',
      icon: BarChart3,
      variant: 'secondary' as const,
    },
    {
      id: 'deposition-prep',
      label: 'Deposition Prep',
      icon: UserCheck,
      variant: 'secondary' as const,
    },
    {
      id: 'court-prep',
      label: 'Court Prep',
      icon: Gavel,
      variant: 'secondary' as const,
    },
  ];

  return (
    <div className="p-4 border-b border-gray-100">
      <div className="flex flex-wrap gap-2">
        {functions.map((func) => {
          const Icon = func.icon;
          return (
            <Button
              key={func.id}
              variant={func.variant}
              size="sm"
              onClick={() => onFunctionClick(func.id)}
              disabled={disabled}
              className={`flex items-center space-x-2 ${
                func.variant === 'default' 
                  ? 'bg-legal-blue hover:bg-legal-deep text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{func.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
