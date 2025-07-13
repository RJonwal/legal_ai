
import { useQuery } from "@tanstack/react-query";
import { Scale, Phone, Mail, MapPin, Lock, Globe } from "lucide-react";
import { SiFacebook, SiX, SiLinkedin, SiInstagram, SiYoutube } from "react-icons/si";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";

export default function Footer() {
  const { data: footerConfig } = useQuery({
    queryKey: ['footer-config'],
    queryFn: async () => {
      const response = await fetch('/api/admin/footer-config');
      return response.json();
    }
  });

  const { data: brandingConfig } = useQuery({
    queryKey: ['branding-config'],
    queryFn: async () => {
      const response = await fetch('/api/admin/branding-config');
      return response.json();
    }
  });

  const { data: landingConfig } = useQuery({
    queryKey: ['landing-config'],
    queryFn: async () => {
      const response = await fetch('/api/admin/landing-config');
      return response.json();
    }
  });

  const socialLinks = [
    { 
      name: 'Twitter/X', 
      icon: SiX, 
      url: brandingConfig?.social?.twitter,
      enabled: brandingConfig?.social?.socialToggles?.twitter !== false
    },
    { 
      name: 'LinkedIn', 
      icon: SiLinkedin, 
      url: brandingConfig?.social?.linkedin,
      enabled: brandingConfig?.social?.socialToggles?.linkedin !== false
    },
    { 
      name: 'Facebook', 
      icon: SiFacebook, 
      url: brandingConfig?.social?.facebook,
      enabled: brandingConfig?.social?.socialToggles?.facebook !== false
    },
    { 
      name: 'Instagram', 
      icon: SiInstagram, 
      url: brandingConfig?.social?.instagram,
      enabled: brandingConfig?.social?.socialToggles?.instagram !== false
    },
    { 
      name: 'YouTube', 
      icon: SiYoutube, 
      url: brandingConfig?.social?.youtube,
      enabled: brandingConfig?.social?.socialToggles?.youtube !== false
    }
  ];

  return (
    <footer id="contact" className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Scale className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">
                {brandingConfig?.brand?.companyName || "LegalAI Pro"}
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              {brandingConfig?.brand?.description || "The future of legal practice is here. Empower your firm with AI-driven insights and automation."}
            </p>
            <div className="flex space-x-4">
              {socialLinks
                .filter(social => social.enabled && social.url)
                .map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <IconComponent className="h-5 w-5" />
                    </a>
                  );
                })}
            </div>
          </div>

          {/* Dynamic footer categories */}
          {footerConfig?.categories && Object.entries(footerConfig.categories).map(([category, pages]: [string, any[]]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4">{category}</h3>
              <ul className="space-y-2 text-gray-400">
                {pages.map((page) => (
                  <li key={page.slug}>
                    <Link href={`/${page.slug}`} className="hover:text-white transition-colors">
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Static Product links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
              <li><a href="#testimonials" className="hover:text-white">Reviews</a></li>
              <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{footerConfig?.contact?.phone || landingConfig?.contact?.phone || "1-800-LEGAL-AI"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{footerConfig?.contact?.email || landingConfig?.contact?.email || "support@legalai.pro"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{footerConfig?.contact?.address || landingConfig?.contact?.address || "San Francisco, CA"}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">
            © 2024 {brandingConfig?.brand?.companyName || "LegalAI Pro"}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <Lock className="h-4 w-4" />
            <span>SOC 2 Compliant</span>
            <Globe className="h-4 w-4" />
            <span>GDPR Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
