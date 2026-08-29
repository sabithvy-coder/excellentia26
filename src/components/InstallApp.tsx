import { useEffect, useState } from "react";
import { Download, Share, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true);

export const useInstallPrompt = () => {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferred(null);
    return outcome === "accepted";
  };

  const isIOS =
    typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

  return { canInstall: !!deferred, install, installed, isIOS };
};

/** Small floating banner inviting the visitor to install the app. */
const InstallApp = () => {
  const { canInstall, install, installed, isIOS } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(
    typeof sessionStorage !== "undefined" && sessionStorage.getItem("installBannerDismissed") === "1",
  );

  if (installed || dismissed || (!canInstall && !isIOS)) return null;

  const close = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("installBannerDismissed", "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="fixed bottom-4 inset-x-4 md:left-auto md:right-6 md:w-96 z-50 reveal">
      <div className="poly-card p-4 flex items-start gap-3">
        <img src="/icon-192.png" alt="" className="w-11 h-11 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Install Excellentia</p>
          {isIOS && !canInstall ? (
            <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-1">
              Tap <Share className="w-3.5 h-3.5 inline" /> Share, then
              <Plus className="w-3.5 h-3.5 inline" /> Add to Home Screen.
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mt-1">
                Add Discover the Unseen to your home screen for instant access.
              </p>
              <Button size="sm" className="mt-3 rounded-full" onClick={install}>
                <Download className="w-4 h-4 mr-1.5" /> Install app
              </Button>
            </>
          )}
        </div>
        <button aria-label="Dismiss install prompt" onClick={close} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default InstallApp;
