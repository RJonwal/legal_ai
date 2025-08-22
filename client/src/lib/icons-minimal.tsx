// Minimal icon set for core functionality only
// This drastically reduces bundle size by importing only essential icons

export {
  // Core navigation (absolute essentials)
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  
  // Essential actions
  Search,
  Settings,
  User,
  Home,
  Bell,
  Check,
  Edit,
  
  // Legal essentials
  Gavel,
  FileText,
  
  // System essentials
  Loader2,
  AlertCircle,
  
  // Communication
  Mail,
  MessageCircle
} from 'lucide-react';

// Fallback component for missing icons
export const IconFallback = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <div 
    className={`inline-block bg-gray-300 rounded ${className}`}
    style={{ width: size, height: size }}
  />
);