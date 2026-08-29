import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useRef, useState } from "react";
import excellentiaWordmarkAsset from "@/assets/excellentia-wordmark.png.asset.json";
import InstallApp from "@/components/InstallApp";
import LowPolyBackdrop from "@/components/LowPolyBackdrop";

const excellentiaWordmark = excellentiaWordmarkAsset.url;

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Hidden admin access: 5 quick taps on the logo
  const clicks = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clicks.current += 1;
    if (timer.current) clearTimeout(timer.current);
    if (clicks.current >= 5) {
      clicks.current = 0;
      navigate("/admin");
      return;
    }
    timer.current = setTimeout(() => {
      if (clicks.current === 1) navigate("/");
      clicks.current = 0;
    }, 600);
  };

  const isActive = (path: string) => location.pathname === path;
  // Archived editions keep their original look
  const isArchive = location.pathname.startsWith("/fest/");


  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/results", label: "Results" },
    { path: "/videos", label: "Videos" },
    { path: "/gallery", label: "Gallery" },
    { path: "/news", label: "News" },
    { path: "/about", label: "About" },
    { path: "/past-fests", label: "Past Fests" },
    { path: "/donate", label: "Donate" },
  ];

  return (
    <div className={`relative min-h-screen bg-background text-foreground font-sora ${isArchive ? "legacy-2025" : ""}`}>
      {!isArchive && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <LowPolyBackdrop className="opacity-70" />
        </div>
      )}
      <div className="relative z-10">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">

          <div className="flex items-center justify-between h-16">
            {/* Logo — 5 quick taps opens the admin login */}
            <Link to="/" onClick={handleLogoClick} className="flex items-center select-none">
              <img src={excellentiaWordmark} alt="Excellentia" className="h-10 w-auto" draggable={false} />
            </Link>


            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`transition-colors font-medium ${
                    isActive(link.path)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 transition-colors ${
                    isActive(link.path)
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      <InstallApp />

      {/* Footer */}
      <footer className={`relative border-t border-border bg-card mt-20 ${isArchive ? "" : "poly-top overflow-hidden"}`}>
        {!isArchive && <LowPolyBackdrop className="opacity-60" />}
        <div className="container mx-auto px-4 py-12 pt-[6vw] text-center relative z-10">
          <h3 className="text-xl font-bold mb-2">Ma'din School of Excellence</h3>
          <p className="text-muted-foreground mb-4">Near Police Station, Malappuram</p>
          <div className="poly-divider max-w-xs mx-auto mb-4" />
          <p className="text-lg font-semibold text-unseen">
            Excellentia 2026 · Discover the Unseen
          </p>
          <p className="text-sm text-muted-foreground mt-4">© 2026 All Rights Reserved</p>
        </div>
      </footer>
      </div>
    </div>

  );
};

export default Layout;