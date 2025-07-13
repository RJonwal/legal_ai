
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
}

interface BrandingConfig {
  logo: {
    primaryLogo: string | null;
    secondaryLogo: string | null;
    logoHeight: number;
    logoWidth: number;
    showText: boolean;
    textPosition: string;
  };
  brand: {
    companyName: string;
    tagline: string;
  };
  colors: {
    primary: string;
    text: string;
  };
}

export function Logo({ className = "", size = "md", variant = "primary" }: LogoProps) {
  const [brandingConfig, setBrandingConfig] = useState<BrandingConfig>({
    logo: {
      primaryLogo: null,
      secondaryLogo: null,
      logoHeight: 32,
      logoWidth: 32,
      showText: true,
      textPosition: "right"
    },
    brand: {
      companyName: "LegalAI Pro",
      tagline: "AI-Powered Legal Excellence"
    },
    colors: {
      primary: "#3b82f6",
      text: "#1e293b"
    }
  });

  // Query branding configuration
  const { data: brandingData } = useQuery({
    queryKey: ['/api/admin/branding-config'],
    retry: false,
    onSuccess: (data) => {
      if (data) {
        setBrandingConfig(data);
      }
    },
    onError: () => {
      // Silently fail and use default config if admin endpoint doesn't exist yet
      console.log('Using default branding configuration');
    }
  });

  const sizeClasses = {
    sm: { height: 24, width: 24, text: "text-lg" },
    md: { height: 32, width: 32, text: "text-xl" },
    lg: { height: 48, width: 48, text: "text-2xl" }
  };

  const currentSize = sizeClasses[size];
  const logoUrl = variant === 'secondary' && brandingConfig.logo.secondaryLogo 
    ? brandingConfig.logo.secondaryLogo 
    : brandingConfig.logo.primaryLogo;

  const logoElement = logoUrl ? (
    <img
      src={logoUrl}
      alt={`${brandingConfig.brand.companyName} Logo`}
      className="object-contain"
      style={{
        height: brandingConfig.logo.logoHeight || currentSize.height,
        width: brandingConfig.logo.logoWidth || currentSize.width,
      }}
      onError={(e) => {
        // Fallback to default if custom logo fails to load
        console.warn('Custom logo failed to load, using fallback');
        setBrandingConfig(prev => ({ 
          ...prev, 
          logo: { 
            ...prev.logo, 
            primaryLogo: null, 
            secondaryLogo: null 
          } 
        }));
      }}
    />
  ) : (
    <div 
      className="rounded-md flex items-center justify-center text-white font-bold"
      style={{
        height: currentSize.height,
        width: currentSize.width,
        backgroundColor: brandingConfig.colors.primary,
      }}
    >
      <span className="text-sm">
        {brandingConfig.brand.companyName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
      </span>
    </div>
  );

  const textElement = brandingConfig.logo.showText && (
    <span 
      className={`font-semibold ${currentSize.text}`}
      style={{ color: brandingConfig.colors.text }}
    >
      {brandingConfig.brand.companyName}
    </span>
  );

  const flexDirection = brandingConfig.logo.textPosition === 'bottom' ? 'flex-col' : 'flex-row';
  const gap = brandingConfig.logo.textPosition === 'bottom' ? 'space-y-1' : 'space-x-2';

  if (brandingConfig.logo.textPosition === 'none') {
    return (
      <div className={`flex items-center ${className}`}>
        {logoElement}
      </div>
    );
  }

  return (
    <div className={`flex items-center ${flexDirection === 'flex-col' ? 'flex-col' : 'flex-row'} ${gap} ${className}`}>
      {logoElement}
      {textElement}
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
