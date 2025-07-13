
import React, { createContext, useContext, useEffect, useState } from 'react';

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
    description: string;
    domain: string;
  };
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    backgroundDark: string;
    text: string;
    textDark: string;
    muted: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    headingFont: string;
    bodyFont: string;
    fontScale: number;
  };
  theme: {
    borderRadius: string;
    shadowStyle: string;
    animationSpeed: string;
  };
  social: {
    twitter: string;
    linkedin: string;
    facebook: string;
    instagram: string;
    youtube: string;
  };
}

interface BrandingContextType {
  brandingConfig: BrandingConfig | null;
  isLoading: boolean;
  refreshBranding: () => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brandingConfig, setBrandingConfig] = useState<BrandingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadBranding = async () => {
    try {
      const response = await fetch('/api/admin/branding-config');
      if (response.ok) {
        const config = await response.json();
        setBrandingConfig(config);
        
        // Apply CSS variables to document root
        if (config.colors) {
          const root = document.documentElement;
          Object.entries(config.colors).forEach(([key, value]) => {
            root.style.setProperty(`--brand-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
          });
          root.style.setProperty('--brand-font-family', `'${config.typography.fontFamily}', sans-serif`);
          root.style.setProperty('--brand-border-radius', config.theme.borderRadius);
        }
        
        // Update document title and meta tags
        if (config.brand) {
          document.title = `${config.brand.companyName} - ${config.brand.tagline}`;
          
          // Update meta description
          const metaDescription = document.querySelector('meta[name="description"]');
          if (metaDescription) {
            metaDescription.setAttribute('content', config.brand.description);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load branding config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBranding();
  }, []);

  const refreshBranding = () => {
    setIsLoading(true);
    loadBranding();
  };

  return (
    <BrandingContext.Provider value={{ brandingConfig, isLoading, refreshBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};
