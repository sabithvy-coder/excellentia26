import { Link } from "react-router-dom";
import { Scroll, Calendar, Users, Trophy, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import excellentiaLogo from "@/assets/excellentia-logo.png";

const Home = () => {
  const { data: newsItems } = useQuery({
    queryKey: ["latest-news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("points", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 border-2 border-primary rounded-full animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 border-2 border-secondary rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <img src={excellentiaLogo} alt="Excellentia" className="w-64 mx-auto mb-8" />
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Unfolding Excellence Through the{" "}
              </span>
              <span className="inline-block animate-scroll-slide bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent">
                Scrolls
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Excellentia Arts Fiesta 2025
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <div className="flex items-center gap-2 text-lg">
                <Calendar className="text-primary" />
                <span>November 01-02, 2025</span>
              </div>
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

      {/* Description Section */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Scroll className="w-12 h-12 text-primary" />
              <h2 className="text-3xl font-bold">About Excellentia</h2>
            </div>
            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
              <p>
                The air on campus is changing. A hush of anticipation, a whisper of untold stories, settles upon the grounds of the Ma'din School of Excellence. Get ready to turn the page, because the magnificent annual arts festival, Excellentia, returns on November 01 and 02, 2025, for a two-day journey into the heart of creativity.
              </p>
              <p>
                Our theme this year, "Through the Scrolls," is an invitation to explore the ancient and enduring power of inscription, of history penned and poetry preserved. It is a celebration of knowledge passed down—from the oldest manuscripts and illuminated texts to the limitless potential held in a blank sheet.
              </p>
              <p>
                This theme asks our young artists not just to perform, but to unravel the narratives woven into time itself, transforming the wisdom of the past into the artistry of the present.
              </p>
              <p className="font-semibold text-foreground">
                A staggering 100 diverse competitions will unfold simultaneously across six distinct venues, each space dedicated to a unique facet of the arts. From the thunderous rhythm of the stage to the silent strokes of a paintbrush; from the profound depth of a debate to the delicate nuance of a classical raga—Excellentia is where every talent finds its voice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Standings */}
      {teams && teams.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Team Standings</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {teams.map((team, index) => (
                <div
                  key={team.id}
                  className="bg-card border border-border rounded-lg p-6 text-center hover:border-primary transition-colors"
                >
                  <div className="text-4xl font-bold text-primary mb-2">{index + 1}</div>
                  <h3 className="text-xl font-bold mb-2">{team.name}</h3>
                  <div className="text-3xl font-bold text-secondary">{team.points}</div>
                  <div className="text-sm text-muted-foreground">points</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest News */}
      {newsItems && newsItems.length > 0 && (
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
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
            <div className="text-center mt-8">
              <Link
                to="/news"
                className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                View All News
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Explore Excellentia</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/results"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium text-lg hover:opacity-90 transition-opacity"
            >
              View Results
            </Link>
            <Link
              to="/gallery"
              className="px-8 py-4 bg-secondary text-primary-foreground rounded-lg font-medium text-lg hover:opacity-90 transition-opacity"
            >
              Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-3xl font-bold mb-4">Stay Updated!</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Join our WhatsApp channel for live updates, behind-the-scenes content, and exclusive announcements
          </p>
          <a 
            href="https://whatsapp.com/channel/0029VaA6UMK8kyyFIltUH33p" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary hover:opacity-90 text-primary-foreground rounded-lg font-medium text-lg transition-opacity"
          >
            <MessageCircle className="w-6 h-6" />
            Join WhatsApp Channel
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;