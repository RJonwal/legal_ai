
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface LogoConfig {
  logoUrl?: string;
  companyName: string;
  showText: boolean;
  logoHeight: number;
  logoWidth: number;
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const [logoConfig, setLogoConfig] = useState<LogoConfig>({
    companyName: "LegalAssist AI",
    showText: true,
    logoHeight: 32,
    logoWidth: 32
  });

  // Query admin logo configuration
  const { data: adminLogoConfig } = useQuery({
    queryKey: ['/api/admin/logo-config'],
    retry: false,
    onSuccess: (data) => {
      if (data) {
        setLogoConfig(prev => ({ ...prev, ...data }));
      }
    },
    onError: () => {
      // Silently fail and use default config if admin endpoint doesn't exist yet
      console.log('Using default logo configuration');
    }
  });

  const sizeClasses = {
    sm: { height: 24, width: 24, text: "text-lg" },
    md: { height: 32, width: 32, text: "text-xl" },
    lg: { height: 48, width: 48, text: "text-2xl" }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {logoConfig.logoUrl ? (
        <img
          src={logoConfig.logoUrl}
          alt={`${logoConfig.companyName} Logo`}
          className="object-contain"
          style={{
            height: logoConfig.logoHeight || currentSize.height,
            width: logoConfig.logoWidth || currentSize.width,
          }}
          onError={(e) => {
            // Fallback to default if custom logo fails to load
            console.warn('Custom logo failed to load, using fallback');
            setLogoConfig(prev => ({ ...prev, logoUrl: undefined }));
          }}
        />
      ) : (
        <div 
          className="bg-legal-blue rounded-md flex items-center justify-center text-white font-bold"
          style={{
            height: currentSize.height,
            width: currentSize.width,
          }}
        >
          <span className="text-sm">LA</span>
        </div>
      )}
      
      {logoConfig.showText && (
        <span className={`font-semibold text-gray-900 ${currentSize.text}`}>
          {logoConfig.companyName}
        </span>
      )}
    </div>
  );
}

// Hook for admin logo management (for future admin portal)
export function useLogoConfig() {
  const { data: logoConfig, refetch } = useQuery({
    queryKey: ['/api/admin/logo-config'],
    retry: false
  });

  const updateLogo = async (newConfig: Partial<LogoConfig>) => {
    try {
      const response = await apiRequest('PUT', '/api/admin/logo-config', newConfig);
      if (response.ok) {
        refetch();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating logo config:', error);
      return false;
    }
  };

  const uploadLogo = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await fetch('/api/admin/upload-logo', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        await updateLogo({ logoUrl: result.logoUrl });
        return result.logoUrl;
      }
      return null;
    } catch (error) {
      console.error('Error uploading logo:', error);
      return null;
    }
  };

  return {
    logoConfig,
    updateLogo,
    uploadLogo,
    refetch
  };
}
