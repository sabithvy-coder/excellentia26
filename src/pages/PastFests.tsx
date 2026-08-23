import { Link } from "react-router-dom";
import { Archive, ArrowRight } from "lucide-react";
import { useFestivals } from "@/hooks/useFestival";
import { Skeleton } from "@/components/ui/skeleton";

const PastFests = () => {
  const { data: festivals, isLoading } = useFestivals();
  const past = festivals?.filter((f) => !f.is_current) ?? [];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Archive className="w-8 h-8 text-primary" />
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Past Excellentia Fests
        </h1>
      </div>
      <p className="text-center text-muted-foreground mb-10">
        Browse the results, galleries, highlights and announcements of previous editions.
      </p>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : past.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {past.map((festival) => (
            <Link
              key={festival.id}
              to={`/fest/${festival.year}`}
              className="group bg-card border border-border rounded-xl p-8 hover:border-primary transition-colors"
            >
              <div className="text-5xl font-bold text-primary mb-2">{festival.year}</div>
              <h2 className="text-lg font-semibold">{festival.title}</h2>
              {festival.tagline && (
                <p className="text-sm text-muted-foreground mt-1">{festival.tagline}</p>
              )}
              <span className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-primary">
                View archive
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-xl text-muted-foreground py-20">
          No past festivals archived yet.
        </p>
      )}
    </div>
  );
};

export default PastFests;
