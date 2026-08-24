import { Scroll, Calendar, Users, Trophy, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import excellentiaLogo from "@/assets/excellentia-logo.png";

interface LegacyHomeProps {
  festivalId: string;
  year: number;
  title: string;
  tagline?: string | null;
  onNavigate?: (tab: string) => void;
}

/** The original Excellentia 2025 homepage, preserved for archived editions. */
const LegacyHome = ({ festivalId, year, title, tagline, onNavigate }: LegacyHomeProps) => {
  const { data: newsItems } = useQuery({
    queryKey: ["archive-news", festivalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("festival_id", festivalId)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const { data: videos } = useQuery({
    queryKey: ["archive-videos-home", festivalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("festival_id", festivalId)
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      {/* Hero Section — original 2025 look */}
      <section className="relative py-20 overflow-hidden min-h-[80vh] flex items-center rounded-2xl">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/background-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/75 to-background" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <img src={excellentiaLogo} alt="Excellentia" className="w-64 mx-auto mb-8" />
            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-playfair animate-slide-up">
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Unfolding Excellence{" "}
              </span>
              <span className="inline-block animate-scroll-slide bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent">
                Through the Scrolls
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">{title}</p>
            <div className="flex flex-wrap gap-4 justify-center">
              {tagline && (
                <div className="flex items-center gap-2 text-lg">
                  <Calendar className="text-primary" />
                  <span>{tagline}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-lg">
                <Users className="text-primary" />
                <span>150+ Competitors</span>
              </div>
              <div className="flex items-center gap-2 text-lg">
                <Trophy className="text-primary" />
                <span>100+ Competitions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Scroll className="w-12 h-12 text-primary" />
            <h2 className="text-3xl font-bold">About Excellentia {year}</h2>
          </div>
          <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
            <p>
              The air on campus changed once again as a hush of anticipation settled upon the grounds of the Ma'din School of Excellence, when the magnificent annual arts festival, Excellentia, returned for the {year} edition — a journey into the heart of creativity.
            </p>
            <p>
              Every edition invited our young artists not just to perform, but to tell a story — turning imagination into artistry across stage, canvas, page and voice.
            </p>
            <p className="font-semibold text-foreground">
              A staggering 100 diverse competitions unfolded simultaneously across six distinct venues, each space dedicated to a unique facet of the arts. From the thunderous rhythm of the stage to the silent strokes of a paintbrush; from the profound depth of a debate to the delicate nuance of a classical raga—Excellentia is where every talent finds its voice.
            </p>
          </div>
        </div>
      </section>

      {/* Video Highlights */}
      {videos && videos.length > 0 && (
        <section className="py-16">
          <div className="flex items-center justify-center gap-3 mb-12">
            <Video className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold text-center">Festival Highlights</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {videos.map((video) => (
              <div key={video.id} className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary transition-colors">
                <div className="aspect-video">
                  <iframe
                    src={video.video_url}
                    title={video.title}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
                  {video.description && (
                    <p className="text-sm text-muted-foreground">{video.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Latest News */}
      {newsItems && newsItems.length > 0 && (
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Latest News</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {newsItems.map((news) => (
              <div
                key={news.id}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
              >
                <h3 className="text-xl font-bold mb-3">{news.title}</h3>
                <p className="text-muted-foreground line-clamp-3">{news.content}</p>
                <div className="text-sm text-muted-foreground mt-4">
                  {new Date(news.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Explore */}
      <section className="py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Explore Excellentia {year}</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => onNavigate?.("results")}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium text-lg hover:opacity-90 transition-opacity"
            >
              View Results
            </button>
            <button
              onClick={() => onNavigate?.("gallery")}
              className="px-8 py-4 bg-secondary text-primary-foreground rounded-lg font-medium text-lg hover:opacity-90 transition-opacity"
            >
              Gallery
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LegacyHome;
