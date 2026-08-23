import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Archive } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFestivalByYear } from "@/hooks/useFestival";
import Results from "./Results";
import Gallery from "./Gallery";
import Videos from "./Videos";
import News from "./News";

const FestArchive = () => {
  const { year } = useParams();
  const parsedYear = Number(year);
  const { data: festival, isLoading } = useFestivalByYear(
    Number.isFinite(parsedYear) ? parsedYear : undefined
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Loading archive...
      </div>
    );
  }

  if (!festival) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Festival not found</h1>
        <Link to="/past-fests" className="text-primary hover:underline">
          Back to past fests
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        to="/past-fests"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Past Excellentia Fests
      </Link>

      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-2">
          <Archive className="w-4 h-4" />
          Archived edition
        </span>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {festival.title}
        </h1>
        {festival.tagline && (
          <p className="text-muted-foreground mt-2">{festival.tagline}</p>
        )}
      </div>

      <Tabs defaultValue="results" className="space-y-8">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          <Results festivalId={festival.id} readOnly />
        </TabsContent>
        <TabsContent value="gallery">
          <Gallery festivalId={festival.id} readOnly hideHeading />
        </TabsContent>
        <TabsContent value="videos">
          <Videos festivalId={festival.id} hideHeading />
        </TabsContent>
        <TabsContent value="news">
          <News festivalId={festival.id} readOnly hideHeading />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FestArchive;
