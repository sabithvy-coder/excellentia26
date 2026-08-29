import { MessageCircle, Calendar, Users, Trophy, MapPin } from "lucide-react";
import themeLogoAsset from "@/assets/discover-the-unseen.png.asset.json";

const About = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        About Excellentia '26
      </h1>

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Main Description */}
        <section className="poly-card p-8">
          <div className="flex items-center gap-4 mb-6">
            <img src={themeLogoAsset.url} alt="Discover the Unseen theme logo" className="w-24 h-auto" />
            <h2 className="text-2xl font-bold">Discover the Unseen</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Beneath every spotlight lies a world waiting to be revealed. Excellentia, the
              magnificent annual arts festival of Ma'din School of Excellence, returns in 2026
              with a theme that invites you to look deeper — "Discover the Unseen."
            </p>
            <p>
              Like the iceberg beneath still waters, true talent hides below the surface. This
              year's theme is a journey from darkness to mystery, from discovery to revelation —
              a celebration of the hidden brilliance within every young artist.
            </p>
            <p>
              This theme asks our young artists not just to perform, but to unveil — to bring the
              unseen into the light and transform hidden potential into breathtaking artistry.
            </p>
          </div>
        </section>

        {/* Event Details */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Event Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="poly-card p-6">
              <Calendar className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Dates</h3>
              <p className="text-muted-foreground">Coming Soon, 2026</p>
              <p className="text-sm text-muted-foreground mt-1">Two days of excellence</p>
            </div>

            <div className="poly-card p-6">
              <Users className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Participants</h3>
              <p className="text-muted-foreground">150+ Competitors</p>
              <p className="text-sm text-muted-foreground mt-1">Across four teams</p>
            </div>

            <div className="poly-card p-6">
              <Trophy className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Competitions</h3>
              <p className="text-muted-foreground">100+ Events</p>
              <p className="text-sm text-muted-foreground mt-1">Across six venues</p>
            </div>

            <div className="poly-card p-6">
              <MapPin className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Venue</h3>
              <p className="text-muted-foreground">Ma'din School of Excellence</p>
              <p className="text-sm text-muted-foreground mt-1">Near Police Station, Malappuram</p>
            </div>
          </div>
        </section>

        {/* Teams */}
        <section>
          <h2 className="text-2xl font-bold mb-6">The Four Teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["Marakish", "Dimashq", "Undulus", "Qudus"].map((team) => (
              <div
                key={team}
                className="poly-card p-6 text-center hover:border-primary transition-colors"
              >
                <h3 className="text-2xl font-bold">{team}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* Closing Statement */}
        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-8 text-center">
          <p className="text-lg font-medium leading-relaxed">
            Come and witness the unseen step into the light.{" "}
            <span className="text-primary font-bold">
              Excellentia is more than a festival; it is a profound declaration that the most
              extraordinary brilliance is found by those who dare to "Discover the Unseen."
            </span>
          </p>
        </section>

        {/* WhatsApp CTA */}
        <section className="poly-card p-8 text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-4">Stay Connected</h2>
          <p className="text-muted-foreground mb-6">
            Join our WhatsApp channel for real-time updates and exclusive content
          </p>
          <a 
            href="https://whatsapp.com/channel/0029VaA6UMK8kyyFIltUH33p" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary hover:opacity-90 text-primary-foreground rounded-lg font-medium text-lg transition-opacity"
          >
            <MessageCircle className="w-5 h-5" />
            Join WhatsApp Channel
          </a>
        </section>
      </div>
    </div>
  );
};

export default About;
