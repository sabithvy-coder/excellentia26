import { useState, useMemo, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, AlertCircle, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PosterPreviewDialog from "@/components/PosterPreviewDialog";
import dimashqTeamBg from "@/assets/dimashq-team.jpg";
import marakishTeamBg from "@/assets/marakish-team.jpg";
import kahiraTeamBg from "@/assets/kahira-team.jpg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useResolvedFestivalId } from "@/hooks/useFestival";

interface ResultsProps {
  festivalId?: string;
  readOnly?: boolean;
}

const Results = ({ festivalId: explicitId, readOnly = false }: ResultsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState<string>("");
  const [reporterName, setReporterName] = useState("");
  const [reportIssue, setReportIssue] = useState("");
  const [posterDialogOpen, setPosterDialogOpen] = useState(false);
  const [selectedPosters, setSelectedPosters] = useState<string[]>([]);
  const [selectedResultName, setSelectedResultName] = useState("");

  const { festivalId } = useResolvedFestivalId(explicitId);

  const { data: settings } = useQuery({
    queryKey: ["settings", festivalId],
    enabled: !!festivalId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("festival_id", festivalId!);
      if (error) throw error;
      return data;
    },
  });

  const teamStandingsVisible = settings?.find(s => s.key === "team_standings_visible")?.value === true;
  const teamStandingsAfterResult = (settings?.find(s => s.key === "team_standings_after_result")?.value as number) || 0;

  const { data: teams } = useQuery({
    queryKey: ["teams", festivalId],
    enabled: !!festivalId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("festival_id", festivalId!)
        .order("published_points", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: results } = useQuery({
    queryKey: ["results", festivalId],
    enabled: !!festivalId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("results")
        .select(`
          *,
          program:programs(*),
          first_place_team:teams!results_first_place_team_fkey(name),
          second_place_team:teams!results_second_place_team_fkey(name),
          third_place_team:teams!results_third_place_team_fkey(name),
          another_grade_team:teams!results_another_grade_team_fkey(name)
        `)
        .eq("is_visible", true)
        .eq("festival_id", festivalId!)
        .order("result_number", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const latestResultNumber = results?.[0]?.result_number || 0;

  const filteredResults = useMemo(() => {
    return results?.filter((result: any) => {
      const matchesSearch =
        result.program?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.first_place_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.second_place_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.third_place_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        result.program?.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [results, searchTerm, selectedCategory]);

  const handleReport = async () => {
    if (!reporterName || !reportIssue) {
      toast.error("Please fill in all fields");
      return;
    }

    const { error } = await supabase.from("reports").insert({
      result_id: selectedResultId,
      reporter_name: reporterName,
      issue: reportIssue,
      festival_id: festivalId,
    });

    if (error) {
      toast.error("Failed to submit report");
      return;
    }

    toast.success("Report submitted successfully");
    setReportDialogOpen(false);
    setReporterName("");
    setReportIssue("");
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Team Standings - Only show if admin has published */}
      {teamStandingsVisible && teams && (
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent poly-heading">
            {teamStandingsAfterResult >= latestResultNumber 
              ? "Final Team Standings" 
              : `Team Standings After Result #${teamStandingsAfterResult}`}
          </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {teams.map((team, index) => {
            // Calculate rank considering ties
            let rank = 1;
            for (let i = 0; i < index; i++) {
              if (teams[i].published_points !== team.published_points) {
                rank = i + 2;
              }
            }
            
            // Determine card styling based on rank
            let cardClasses = "rounded-xl text-center transition-all duration-500 relative overflow-hidden";
            let containerClasses = "";
            let sizeClasses = "";
            const backgroundStyle: React.CSSProperties = {};
            
            if (rank === 1) {
              cardClasses += " champion-card border-2 border-primary/50";
              containerClasses = "lg:col-span-3 lg:row-start-1";
              sizeClasses = "p-10 lg:p-12";
              Object.assign(backgroundStyle, {
                backgroundImage: `linear-gradient(135deg, hsl(33 100% 50% / 0.92), hsl(45 100% 55% / 0.88), hsl(38 92% 50% / 0.92), hsl(33 100% 50% / 0.92)), url(${dimashqTeamBg})`,
                backgroundSize: '300% 300%, cover',
                backgroundPosition: 'center',
                backgroundBlendMode: 'overlay, normal',
                willChange: 'transform'
              });
            } else if (rank === 2) {
              cardClasses += " runner-card border-2 border-secondary/40";
              containerClasses = "lg:col-start-1 lg:row-start-2";
              sizeClasses = "p-8 lg:p-10";
              Object.assign(backgroundStyle, {
                backgroundImage: `linear-gradient(135deg, hsl(38 92% 50% / 0.90), hsl(42 88% 55% / 0.88), hsl(38 92% 50% / 0.90)), url(${marakishTeamBg})`,
                backgroundSize: '200% 200%, cover',
                backgroundPosition: 'center',
                backgroundBlendMode: 'overlay, normal',
                willChange: 'transform'
              });
            } else if (rank === 3) {
              cardClasses += " third-card border-2 border-orange-500/40";
              containerClasses = "lg:col-start-2 lg:row-start-2";
              sizeClasses = "p-7 lg:p-9";
              Object.assign(backgroundStyle, {
                backgroundImage: `linear-gradient(135deg, hsl(25 85% 60% / 0.88), hsl(20 75% 55% / 0.86), hsl(30 80% 58% / 0.88), hsl(25 85% 60% / 0.88)), url(${kahiraTeamBg})`,
                backgroundSize: '200% 200%, cover',
                backgroundPosition: 'center',
                backgroundBlendMode: 'overlay, normal',
                willChange: 'transform'
              });
            } else {
              cardClasses += " poly-card";
              containerClasses = "lg:col-start-3 lg:row-start-2";
              sizeClasses = "p-6 lg:p-8";
            }
            
            return (
              <div
                key={team.id}
                className={`${containerClasses}`}
              >
                <div 
                  className={`${cardClasses} ${sizeClasses} h-full flex flex-col justify-center`}
                  style={(rank === 1 || rank === 2 || rank === 3) ? backgroundStyle : undefined}
                >
                  <div className={`font-bold mb-3 ${
                    rank === 1 ? "text-7xl lg:text-8xl text-background drop-shadow-2xl champion-text-glow" : 
                    rank === 2 ? "text-6xl lg:text-7xl text-background drop-shadow-xl champion-text-glow" : 
                    rank === 3 ? "text-5xl lg:text-6xl text-background drop-shadow-lg champion-text-glow" :
                    "text-5xl text-primary"
                  }`}>
                    {team.published_points || 0}
                  </div>
                  <h3 className={`font-righteous font-bold tracking-wider ${
                    rank === 1 ? "text-3xl lg:text-5xl text-background mb-4 drop-shadow-xl champion-text-glow" : 
                    rank === 2 ? "text-2xl lg:text-4xl text-background mb-3 drop-shadow-lg champion-text-glow" : 
                    rank === 3 ? "text-xl lg:text-3xl text-background mb-2 drop-shadow-md champion-text-glow" :
                    "text-xl lg:text-2xl"
                  }`}>
                    {team.name}
                  </h3>
                  <div className={`text-sm font-bold mt-2 uppercase tracking-widest ${
                    rank === 1 ? "text-background/90 text-base lg:text-xl champion-text-glow" : 
                    rank === 2 ? "text-background/85 text-sm lg:text-lg champion-text-glow" : 
                    rank === 3 ? "text-background/80 text-sm lg:text-base champion-text-glow" :
                    "text-muted-foreground"
                  }`}>
                    {rank === 1 ? "🏆 CHAMPION" : rank === 2 ? "🥈 RUNNER-UP" : rank === 3 ? "🥉 THIRD PLACE" : `RANK #${rank}`}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="mb-8 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
            <Input
              placeholder="Search by program or participant name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 poly-chip bg-card/60 backdrop-blur-md border-white/10 focus-visible:ring-primary/60"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="md:w-[200px] poly-chip bg-card/60 backdrop-blur-md border-white/10">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Novice">Novice</SelectItem>
              <SelectItem value="Bachelor">Bachelor</SelectItem>
              <SelectItem value="Masters">Masters</SelectItem>
              <SelectItem value="Universal">Universal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Results List */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 poly-heading">Competition Results</h2>
        <div className="poly-divider mb-6" />
        {filteredResults && filteredResults.length > 0 ? (
          <div className="space-y-6">
            {filteredResults.map((result) => (
              <div
                key={result.id}
                className="poly-card p-6 hover:border-primary transition-colors"
              >
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 poly-chip text-sm font-bold">
                      #{result.result_number}
                    </span>
                    <h3 className="text-xl font-bold">{result.program?.name}</h3>
                  </div>
                  {result.program?.category && (
                    <span className="inline-block px-3 py-1 bg-secondary/20 text-secondary poly-chip text-sm font-medium">
                      {result.program.category}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* First Place */}
                  <div className="bg-primary/10 border-2 border-primary rounded-lg p-6 transform md:scale-105 hover:scale-110 transition-transform duration-300 shadow-lg">
                    <div className="text-sm font-medium text-primary mb-2">🥇 1st Place</div>
                    <div className="font-bold text-xl">{result.first_place_name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {result.first_place_team?.name}
                    </div>
                    {result.first_place_grade && (
                      <div className="text-3xl font-bold text-primary mt-2">
                        Grade: {result.first_place_grade}
                      </div>
                    )}
                  </div>
                  
                  {/* Check for additional first place winner */}
                  {result.additional_grades && Array.isArray(result.additional_grades) && 
                   (result.additional_grades as any[]).find((g: any) => g.place === "1st") && (
                    <div className="bg-primary/10 border border-primary rounded-lg p-4">
                      <div className="text-sm font-medium text-primary mb-2">🥇 1st Place</div>
                      <div className="font-bold text-lg">
                        {(result.additional_grades as any[]).find((g: any) => g.place === "1st").name}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {teams?.find(t => t.id === (result.additional_grades as any[]).find((g: any) => g.place === "1st").team)?.name}
                      </div>
                      {(result.additional_grades as any[]).find((g: any) => g.place === "1st").grade && (
                        <div className="text-2xl font-bold text-primary mt-2">
                          Grade: {(result.additional_grades as any[]).find((g: any) => g.place === "1st").grade}
                        </div>
                      )}
                    </div>
                  )}

                   {/* Second Place */}
                  <div className="bg-secondary/10 border border-secondary rounded-lg p-5 transform md:scale-100 hover:scale-105 transition-transform duration-300 shadow-md">
                    <div className="text-sm font-medium text-secondary mb-2">🥈 2nd Place</div>
                    <div className="font-bold text-lg">{result.second_place_name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {result.second_place_team?.name}
                    </div>
                    {result.second_place_grade && (
                      <div className="text-2xl font-bold text-secondary mt-2">
                        Grade: {result.second_place_grade}
                      </div>
                    )}
                  </div>

                  {/* Third Place */}
                  <div className="bg-muted/30 border border-muted rounded-lg p-4 transform md:scale-95 hover:scale-100 transition-transform duration-300">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      🥉 3rd Place
                    </div>
                    <div className="font-bold text-base">{result.third_place_name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {result.third_place_team?.name}
                    </div>
                    {result.third_place_grade && (
                      <div className="text-xl font-bold text-muted-foreground mt-2">
                        Grade: {result.third_place_grade}
                      </div>
                    )}
                  </div>

                  {/* Additional Grades (if exists) */}
                  {result.additional_grades && Array.isArray(result.additional_grades) && result.additional_grades.length > 0 && (
                    <>
                      {(result.additional_grades as any[])
                        .filter((grade: any) => grade.place !== "1st") // Exclude first place as it's shown separately
                        .sort((a: any, b: any) => {
                          // Sort by place: 2nd before 3rd before others
                          const placeOrder: Record<string, number> = { "2nd": 1, "3rd": 2 };
                          return (placeOrder[a.place] || 999) - (placeOrder[b.place] || 999);
                        })
                        .map((grade: any, idx: number) => {
                        const isSecondPlace = grade.place === "2nd";
                        const isThirdPlace = grade.place === "3rd";
                        
                        return (
                          <div 
                            key={idx} 
                            className={`rounded-lg p-4 ${
                              isSecondPlace 
                                ? "bg-secondary/10 border border-secondary" 
                                : isThirdPlace 
                                ? "bg-muted/30 border border-muted" 
                                : "bg-card border border-border"
                            }`}
                          >
                            <div className={`text-sm font-medium mb-2 ${
                              isSecondPlace 
                                ? "text-secondary" 
                                : isThirdPlace 
                                ? "text-muted-foreground" 
                                : "text-foreground"
                            }`}>
                              {isSecondPlace ? "🥈 2nd Place" : isThirdPlace ? "🥉 3rd Place" : "🏆 Another Grade"}
                            </div>
                            <div className="font-bold text-lg">{grade.name}</div>
                            {grade.team && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {teams?.find(t => t.id === grade.team)?.name}
                              </div>
                            )}
                            {grade.grade && (
                              <div className={`text-2xl font-bold mt-2 ${
                                isSecondPlace 
                                  ? "text-secondary" 
                                  : isThirdPlace 
                                  ? "text-muted-foreground" 
                                  : "text-foreground"
                              }`}>
                                Grade: {grade.grade}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 justify-center sm:justify-end mt-4 pt-4 border-t border-border">
                  {result.poster_urls && Array.isArray(result.poster_urls) && result.poster_urls.length > 0 && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setSelectedPosters(result.poster_urls);
                        setSelectedResultName(result.program?.name || "Result");
                        setPosterDialogOpen(true);
                      }}
                      className="w-full sm:w-auto"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Posters
                    </Button>
                  )}
                  {!readOnly && (
                  <Dialog
                    open={reportDialogOpen && selectedResultId === result.id}
                    onOpenChange={(open) => {
                      setReportDialogOpen(open);
                      if (open) setSelectedResultId(result.id);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Report Issue</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Your Name"
                          value={reporterName}
                          onChange={(e) => setReporterName(e.target.value)}
                        />
                        <textarea
                          className="w-full min-h-[100px] p-3 bg-input border border-border rounded-md"
                          placeholder="Describe the issue..."
                          value={reportIssue}
                          onChange={(e) => setReportIssue(e.target.value)}
                        />
                        <Button onClick={handleReport} className="w-full">
                          Submit Report
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  )}

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No results found. Try adjusting your filters.
          </div>
        )}
      </section>

      <PosterPreviewDialog
        open={posterDialogOpen}
        onOpenChange={setPosterDialogOpen}
        posterUrls={selectedPosters}
        resultName={selectedResultName}
      />
    </div>
  );
};

export default Results;