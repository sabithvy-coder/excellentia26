import { Link } from "react-router-dom";
import { Calendar, Users, Trophy, MessageCircle, Heart, Sparkles, Video, Eye, Moon, Compass } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import excellentiaLogo from "@/assets/excellentia-logo.png";
import { Button } from "@/components/ui/button";
import { useCurrentFestival } from "@/hooks/useFestival";
import UnseenParticles from "@/components/UnseenParticles";

const Home = () => {
  const { data: festival } = useCurrentFestival();
  const festivalId = festival?.id;

  const { data: newsItems } = useQuery({
    queryKey: ["latest-news", festivalId],
    enabled: !!festivalId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("festival_id", festivalId!)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const { data: videos } = useQuery({
    queryKey: ["videos", "home", festivalId],
    enabled: !!festivalId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("festival_id", festivalId!)
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  const phases = [
    { label: "Darkness", text: "It begins in silence — a campus dimmed, waiting.", icon: Moon },
    { label: "Mystery", text: "Something stirs behind the curtain. Clues, not answers.", icon: Eye },
    { label: "Discovery", text: "Young artists reach into the dark and find their craft.", icon: Compass },
    { label: "Revelation", text: "The unseen steps into the light — and the stage ignites.", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden min-h-screen flex items-center">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        >
          <source src="/background-video.mp4" type="video/mp4" />
        </video>

        {/* Atmospheric layers */}
        <div className="absolute inset-0 unseen-veil animate-aurora" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background" />
        <UnseenParticles />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <img src={excellentiaLogo} alt="Excellentia arts festival logo" className="w-52 mx-auto mb-8 reveal" />
            <p className="text-xs md:text-sm tracking-[0.5em] uppercase text-secondary/90 mb-6 reveal" style={{ animationDelay: "0.1s" }}>
              Excellentia {festival?.year ?? 2026}
            </p>
            <h1 className="font-sora font-extrabold leading-[0.95] mb-8 reveal" style={{ animationDelay: "0.2s" }}>
              <span className="block text-5xl md:text-8xl unveil-text">DISCOVERING</span>
              <span className="block text-5xl md:text-8xl text-unseen">THE UNSEEN</span>
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 reveal" style={{ animationDelay: "0.35s" }}>
              {festival?.title ?? "Excellentia Arts Fiesta 2026"} — an immersive journey from darkness into revelation.
            </p>

            <div className="flex flex-wrap gap-3 justify-center mb-12 reveal" style={{ animationDelay: "0.45s" }}>
              {festival?.tagline && (
                <span className="glass-card rounded-full px-5 py-2.5 flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-secondary" />
                  {festival.tagline}
                </span>
              )}
              <span className="glass-card rounded-full px-5 py-2.5 flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-secondary" />
                150+ Competitors
              </span>
              <span className="glass-card rounded-full px-5 py-2.5 flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-secondary" />
                100+ Competitions
              </span>
            </div>

            <div className="flex flex-wrap gap-4 justify-center reveal" style={{ animationDelay: "0.55s" }}>
              <Link to="/results">
                <Button size="lg" className="rounded-full px-8 glow-violet">
                  Enter the Unseen
                </Button>
              </Link>
              <Link to="/gallery">
                <Button size="lg" variant="outline" className="rounded-full px-8 border-secondary/40 text-secondary hover:bg-secondary/10">
                  Immersive Gallery
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Darkness → Revelation timeline */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 unseen-veil opacity-60" />
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-5xl font-sora font-bold text-center mb-4 text-unseen">
            Darkness → Revelation
          </h2>
          <p className="text-center text-muted-foreground mb-14 max-w-2xl mx-auto">
            Four movements shape this year's festival. Each one pulls the veil a little further back.
          </p>

          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-secondary/50 to-transparent md:-translate-x-1/2" />
            <div className="space-y-10">
              {phases.map((phase, i) => (
                <div
                  key={phase.label}
                  className={`relative pl-12 md:pl-0 md:w-1/2 ${i % 2 ? "md:ml-auto md:pl-12" : "md:pr-12 md:text-right"}`}
                >
                  <span
                    className={`absolute left-4 md:left-auto top-6 w-3 h-3 rounded-full bg-secondary timeline-dot -translate-x-1/2 ${
                      i % 2 ? "md:-left-0" : "md:left-auto md:-right-0 md:translate-x-1/2"
                    }`}
                  />
                  <div className="glass-card rounded-2xl p-6">
                    <div className={`flex items-center gap-3 mb-3 ${i % 2 ? "" : "md:justify-end"}`}>
                      <phase.icon className="w-5 h-5 text-secondary" />
                      <h3 className="font-sora font-bold text-xl">{phase.label}</h3>
                    </div>
                    <p className="text-muted-foreground">{phase.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Eye className="w-10 h-10 text-primary" />
              <h2 className="text-3xl md:text-4xl font-sora font-bold">About Excellentia</h2>
            </div>
            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
              <p>
                The air on campus is changing once again. A hush of anticipation settles upon the grounds of the Ma'din School of Excellence as the magnificent annual arts festival, Excellentia, returns — this time as a search for everything that has stayed hidden.
              </p>
              <p>
                Every edition invites our young artists not just to perform, but to reveal — turning imagination into artistry across stage, canvas, page and voice.
              </p>
              <p className="font-semibold text-foreground">
                A staggering 100 diverse competitions will unfold simultaneously across six distinct venues, each space dedicated to a unique facet of the arts. From the thunderous rhythm of the stage to the silent strokes of a paintbrush; from the profound depth of a debate to the delicate nuance of a classical raga—Excellentia is where every unseen talent finds its light.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Donation Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-background to-secondary/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Heart className="w-10 h-10 text-primary animate-pulse" />
              <Sparkles className="w-8 h-8 text-secondary" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Be a Part of Excellence!
            </h2>
            
            <p className="text-xl md:text-2xl text-foreground mb-4 font-semibold">
              Your Support Powers Our Dreams ✨
            </p>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              Every contribution you make helps us celebrate art, nurture talent, and create unforgettable moments. 
              From grand stage productions to intimate art exhibitions, from budding performers to seasoned artists—
              <span className="text-foreground font-semibold"> your generosity makes it all possible!</span>
            </p>

            <div className="glass-card rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-bold mb-4 text-foreground">Why Your Donation Matters</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <p className="text-muted-foreground">Support emerging artists and provide them a platform to shine</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <p className="text-muted-foreground">Help organize world-class cultural programs and competitions</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <p className="text-muted-foreground">Provide better prizes, recognition, and opportunities</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <p className="text-muted-foreground">Enhance event infrastructure and create magical experiences</p>
                </div>
              </div>
              
              <p className="text-lg text-foreground font-semibold italic">
                "Together, we don't just celebrate art—we create it, live it, and make it eternal! 🎨"
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/donate">
                <Button size="lg" className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <Heart className="w-5 h-5 mr-2" />
                  Donate Now
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">Every rupee counts. Every contribution matters. 💝</p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Highlights */}
      {videos && videos.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-background to-card/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-3 mb-12">
              <Video className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold text-center">Festival Highlights</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {videos.map((video) => (
                <div key={video.id} className="glass-card rounded-2xl overflow-hidden">
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
                <Link
                  key={news.id}
                  to={`/news?id=${news.id}`}
                  className="glass-card rounded-2xl p-6 cursor-pointer block"
                >
                  <h3 className="text-xl font-bold mb-3">{news.title}</h3>
                  <p className="text-muted-foreground line-clamp-3">{news.content}</p>
                  <div className="text-sm text-muted-foreground mt-4">
                    {new Date(news.created_at).toLocaleDateString()}
                  </div>
                </Link>
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

      {/* Past Fests */}
      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">Looking for a previous edition?</h2>
          <p className="text-muted-foreground mb-6">
            Results, galleries and highlights from earlier Excellentia fests are archived.
          </p>
          <Link
            to="/past-fests"
            className="inline-block px-6 py-3 border border-border rounded-lg font-medium hover:border-primary transition-colors"
          >
            Browse Past Excellentia Fests
          </Link>
        </div>
      </section>

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