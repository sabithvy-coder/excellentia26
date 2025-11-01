import { MessageCircle, Calendar, Users, Trophy, MapPin } from "lucide-react";
import scrollIcon from "@/assets/scroll-icon.png";

const About = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        About Excellentia '25
      </h1>

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Main Description */}
        <section className="bg-card border border-border rounded-lg p-8">
          <div className="flex items-center gap-4 mb-6">
            <img src={scrollIcon} alt="Scroll" className="w-16 h-16" />
            <h2 className="text-2xl font-bold">Through the Scrolls</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              The air on campus is changing. A hush of anticipation, a whisper of untold stories,
              settles upon the grounds of the Ma'din School of Excellence. Get ready to turn the
              page, because the magnificent annual arts festival, Excellentia, returns on November
              01 and 02, 2025, for a two-day journey into the heart of creativity.
            </p>
            <p>
              Our theme this year, "Through the Scrolls," is an invitation to explore the ancient
              and enduring power of inscription, of history penned and poetry preserved. It is a
              celebration of knowledge passed down—from the oldest manuscripts and illuminated texts
              to the limitless potential held in a blank sheet.
            </p>
            <p>
              This theme asks our young artists not just to perform, but to unravel the narratives
              woven into time itself, transforming the wisdom of the past into the artistry of the
              present.
            </p>
          </div>
        </section>

        {/* Event Details */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Event Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <Calendar className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Dates</h3>
              <p className="text-muted-foreground">November 01-02, 2025</p>
              <p className="text-sm text-muted-foreground mt-1">Two days of excellence</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <Users className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Participants</h3>
              <p className="text-muted-foreground">150+ Competitors</p>
              <p className="text-sm text-muted-foreground mt-1">Across four teams</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <Trophy className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Competitions</h3>
              <p className="text-muted-foreground">100+ Events</p>
              <p className="text-sm text-muted-foreground mt-1">Across six venues</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
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
                className="bg-card border border-border rounded-lg p-6 text-center hover:border-primary transition-colors"
              >
                <h3 className="text-2xl font-bold">{team}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* Closing Statement */}
        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-8 text-center">
          <p className="text-lg font-medium leading-relaxed">
            Come and witness the unrolling of the scrolls. Come and see history, literature,
            science, and spirit translated into breathtaking artistic expression.{" "}
            <span className="text-primary font-bold">
              Excellentia is more than a festival; it is a profound declaration that the most
              excellent future is built by those who honor the beauty and knowledge held "Through
              the Scrolls."
            </span>
          </p>
        </section>

        {/* WhatsApp CTA */}
        <section className="bg-card border border-border rounded-lg p-8 text-center">
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
