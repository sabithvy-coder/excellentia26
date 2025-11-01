import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

const Results = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState<string>("");
  const [reporterName, setReporterName] = useState("");
  const [reportIssue, setReportIssue] = useState("");

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("*");
      if (error) throw error;
      return data;
    },
  });

  const teamStandingsVisible = settings?.find(s => s.key === "team_standings_visible")?.value === true;
  const teamStandingsAfterResult = (settings?.find(s => s.key === "team_standings_after_result")?.value as number) || 0;

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("published_points", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: results } = useQuery({
    queryKey: ["results"],
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
        .order("result_number", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const latestResultNumber = results?.[0]?.result_number || 0;

  const filteredResults = results?.filter((result: any) => {
    const matchesSearch =
      result.program?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.first_place_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.second_place_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.third_place_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTeam =
      selectedTeam === "all" ||
      result.first_place_team?.id === selectedTeam ||
      result.second_place_team?.id === selectedTeam ||
      result.third_place_team?.id === selectedTeam;

    const matchesCategory =
      selectedCategory === "all" ||
      result.program?.category === selectedCategory;

    return matchesSearch && matchesTeam && matchesCategory;
  });

  const handleReport = async () => {
    if (!reporterName || !reportIssue) {
      toast.error("Please fill in all fields");
      return;
    }

    const { error } = await supabase.from("reports").insert({
      result_id: selectedResultId,
      reporter_name: reporterName,
      issue: reportIssue,
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
      {teamStandingsVisible && (
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Team Standings After Result #{teamStandingsAfterResult}
          </h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {teams?.map((team, index) => (
            <div
              key={team.id}
              className={`bg-card border-2 rounded-lg p-6 text-center ${
                index === 0 ? "border-primary" : "border-border"
              }`}
            >
              <div className="text-5xl font-bold text-primary mb-2">{team.published_points || 0}</div>
              <h3 className="text-xl font-bold">{team.name}</h3>
              <div className="text-sm text-muted-foreground mt-2">
                Rank #{index + 1}
              </div>
            </div>
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="mb-8 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search by program or participant name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="md:w-[200px]">
              <SelectValue placeholder="Filter by team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams?.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="md:w-[200px]">
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
        <h2 className="text-2xl font-bold mb-6">Competition Results</h2>
        {filteredResults && filteredResults.length > 0 ? (
          <div className="space-y-6">
            {filteredResults.map((result) => (
              <div
                key={result.id}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
                        #{result.result_number}
                      </span>
                      <h3 className="text-xl font-bold">{result.program?.name}</h3>
                    </div>
                    {result.program?.category && (
                      <span className="inline-block px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm font-medium">
                        {result.program.category}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Dialog
                      open={reportDialogOpen && selectedResultId === result.id}
                      onOpenChange={(open) => {
                        setReportDialogOpen(open);
                        if (open) setSelectedResultId(result.id);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
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
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* First Place */}
                  <div className="bg-primary/10 border border-primary rounded-lg p-4">
                    <div className="text-sm font-medium text-primary mb-2">🥇 1st Place</div>
                    <div className="font-bold text-lg">{result.first_place_name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {result.first_place_team?.name}
                    </div>
                    {result.first_place_grade && (
                      <div className="text-2xl font-bold text-primary mt-2">
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
                  <div className="bg-secondary/10 border border-secondary rounded-lg p-4">
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
                  <div className="bg-muted/30 border border-muted rounded-lg p-4">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      🥉 3rd Place
                    </div>
                    <div className="font-bold text-lg">{result.third_place_name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {result.third_place_team?.name}
                    </div>
                    {result.third_place_grade && (
                      <div className="text-2xl font-bold text-muted-foreground mt-2">
                        Grade: {result.third_place_grade}
                      </div>
                    )}
                  </div>

                  {/* Additional Grades (if exists) */}
                  {result.additional_grades && Array.isArray(result.additional_grades) && result.additional_grades.length > 0 && (
                    <>
                      {(result.additional_grades as any[])
                        .filter((grade: any) => grade.place !== "1st") // Exclude first place as it's shown separately
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
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No results found. Try adjusting your filters.
          </div>
        )}
      </section>
    </div>
  );
};

export default Results;