
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePWA } from '@/hooks/use-pwa';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Download, RefreshCw } from '@/lib/icons';
import { useToast } from '@/hooks/use-toast';

interface MobileLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function MobileLayout({ sidebar, children }: MobileLayoutProps) {
  const isMobile = useIsMobile();
  const { isInstallable, isUpdateAvailable, installApp, updateApp } = usePWA();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleInstall = async () => {
    try {
      await installApp();
      toast({
        title: "App Installed!",
        description: "Legal Assistant AI is now available on your home screen.",
      });
    } catch (error) {
      toast({
        title: "Installation Failed",
        description: "Could not install the app. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = () => {
    updateApp();
    toast({
      title: "Updating App",
      description: "Please wait while we update to the latest version.",
    });
  };

  if (!isMobile) {
    return (
      <div className="flex h-screen">
        {/* PWA Install/Update Banner */}
        {(isInstallable || isUpdateAvailable) && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground p-2 text-center">
            {isInstallable && (
              <Button variant="secondary" size="sm" onClick={handleInstall} className="mr-2">
                <Download className="w-4 h-4 mr-1" />
                Install App
              </Button>
            )}
            {isUpdateAvailable && (
              <Button variant="secondary" size="sm" onClick={handleUpdate}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Update Available
              </Button>
            )}
          </div>
        )}
        
        {/* Desktop Layout */}
        <div className="w-80 border-r bg-background">
          {sidebar}
        </div>
        <div className="flex-1">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* PWA Install/Update Banner */}
      {(isInstallable || isUpdateAvailable) && (
        <div className="bg-primary text-primary-foreground p-2 text-center text-sm">
          {isInstallable && (
            <Button variant="secondary" size="sm" onClick={handleInstall} className="mr-2 text-xs">
              <Download className="w-3 h-3 mr-1" />
              Install App
            </Button>
          )}
          {isUpdateAvailable && (
            <Button variant="secondary" size="sm" onClick={handleUpdate} className="text-xs">
              <RefreshCw className="w-3 h-3 mr-1" />
              Update
            </Button>
          )}
        </div>
      )}

      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            {sidebar}
          </SheetContent>
        </Sheet>
        
        <h1 className="text-lg font-semibold">Legal Assistant AI</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Mobile Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
