import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Archive } from "lucide-react";
import { useFestivalByYear } from "@/hooks/useFestival";
import excellentiaLogo from "@/assets/excellentia-main-logo.png";
import LegacyHome from "./archive/LegacyHome";
import Results from "./Results";
import Gallery from "./Gallery";
import Videos from "./Videos";
import News from "./News";

const TABS = [
  { value: "home", label: "Home" },
  { value: "results", label: "Results" },
  { value: "gallery", label: "Gallery" },
  { value: "videos", label: "Videos" },
  { value: "news", label: "News" },
];

const FestArchive = () => {
  const { year } = useParams();
  const [tab, setTab] = useState("home");
  const parsedYear = Number(year);
  const { data: festival, isLoading } = useFestivalByYear(
    Number.isFinite(parsedYear) ? parsedYear : undefined
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-muted-foreground flex items-center justify-center">
        Loading archive...
      </div>
    );
  }

  if (!festival) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold">Festival not found</h1>
        <Link to="/past-fests" className="text-primary hover:underline">
          Back to past fests
        </Link>
      </div>
    );
  }

  return (
    <div className="legacy-2025 min-h-screen bg-background text-foreground">
      {/* Archive banner */}
      <div className="bg-card/80 border-b border-border">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
            <Archive className="w-3.5 h-3.5" />
            Archived edition · {festival.year}
          </span>
          <Link
            to="/past-fests"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Exit archive
          </Link>
        </div>
      </div>

      {/* Legacy navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            <button onClick={() => setTab("home")} className="flex items-center shrink-0">
              <img src={excellentiaLogo} alt="Excellentia" className="h-10 w-auto" />
            </button>
            <div className="flex items-center gap-4 md:gap-6 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTab(t.value)}
                  className={`whitespace-nowrap font-medium transition-colors ${
                    tab === t.value
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4">
        {tab === "home" && (
          <LegacyHome
            festivalId={festival.id}
            year={festival.year}
            title={festival.title}
            tagline={festival.tagline}
            onNavigate={setTab}
          />
        )}
        {tab === "results" && <Results festivalId={festival.id} readOnly />}
        {tab === "gallery" && <Gallery festivalId={festival.id} readOnly hideHeading />}
        {tab === "videos" && <Videos festivalId={festival.id} hideHeading />}
        {tab === "news" && <News festivalId={festival.id} readOnly hideHeading />}
      </main>

      <footer className="border-t border-border bg-card mt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <h3 className="text-xl font-bold mb-2">Ma'din School of Excellence</h3>
          <p className="text-muted-foreground mb-4">Near Police Station, Malappuram</p>
          <p className="text-lg font-semibold text-primary">{festival.title}</p>
          <p className="text-sm text-muted-foreground mt-4">
            © {festival.year} All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FestArchive;
