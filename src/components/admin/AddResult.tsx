import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D"];
const GRADE_POINTS: Record<string, number> = {
  "A+": 10, "A": 9, "A-": 8, "B+": 7, "B": 6, "B-": 5, "C+": 4, "C": 3, "C-": 2, "D": 1
};

const AddResult = () => {
  const queryClient = useQueryClient();
  const [selectedProgram, setSelectedProgram] = useState("");
  const [category, setCategory] = useState("");
  const [resultNumber, setResultNumber] = useState("");
  const [suggestedResultNumber, setSuggestedResultNumber] = useState<number | null>(null);
  const [firstPlaceName, setFirstPlaceName] = useState("");
  const [firstPlaceTeam, setFirstPlaceTeam] = useState("");
  const [firstPlaceGrade, setFirstPlaceGrade] = useState("A+");
  const [firstPlacePoints, setFirstPlacePoints] = useState("10");

  // Auto-fill category when program is selected
  const handleProgramChange = (programId: string) => {
    setSelectedProgram(programId);
    const selectedProgramData = programs?.find(p => p.id === programId);
    if (selectedProgramData?.category) {
      setCategory(selectedProgramData.category);
    } else {
      setCategory("");
    }
  };
  
  const [secondPlaceWinners, setSecondPlaceWinners] = useState<Array<{name: string; team: string; grade: string; points: string}>>([
    { name: "", team: "", grade: "A", points: "9" }
  ]);
  
  const [thirdPlaceWinners, setThirdPlaceWinners] = useState<Array<{name: string; team: string; grade: string; points: string}>>([
    { name: "", team: "", grade: "A-", points: "8" }
  ]);
  
  const [additionalGrades, setAdditionalGrades] = useState<Array<{name: string; team: string; grade: string; points: string}>>([]);

  const { data: programs } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("programs").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teams").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch the latest result number for preview
  useQuery({
    queryKey: ["latestResultNumber"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("results")
        .select("result_number")
        .order("result_number", { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      const nextNumber = data ? (data.result_number || 0) + 1 : 1;
      setSuggestedResultNumber(nextNumber);
      if (!resultNumber) {
        setResultNumber(nextNumber.toString());
      }
      return nextNumber;
    },
  });

  const addResultMutation = useMutation({
    mutationFn: async (resultData: any) => {
      const { error } = await supabase.from("results").insert(resultData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Result added successfully!");
      resetForm();
    },
    onError: () => {
      toast.error("Failed to add result");
    },
  });

  const resetForm = () => {
    setSelectedProgram("");
    setCategory("");
    const nextNumber = suggestedResultNumber ? suggestedResultNumber + 1 : 1;
    setSuggestedResultNumber(nextNumber);
    setResultNumber(nextNumber.toString());
    setFirstPlaceName("");
    setFirstPlaceTeam("");
    setFirstPlaceGrade("A+");
    setFirstPlacePoints("10");
    setSecondPlaceWinners([{ name: "", team: "", grade: "A", points: "9" }]);
    setThirdPlaceWinners([{ name: "", team: "", grade: "A-", points: "8" }]);
    setAdditionalGrades([]);
  };

  const addSecondPlaceWinner = () => {
    setSecondPlaceWinners([...secondPlaceWinners, { name: "", team: "", grade: "A", points: "9" }]);
  };

  const removeSecondPlaceWinner = (index: number) => {
    if (secondPlaceWinners.length > 1) {
      setSecondPlaceWinners(secondPlaceWinners.filter((_, i) => i !== index));
    }
  };

  const updateSecondPlaceWinner = (index: number, field: string, value: string) => {
    const updated = [...secondPlaceWinners];
    updated[index] = { ...updated[index], [field]: value };
    setSecondPlaceWinners(updated);
  };

  const addThirdPlaceWinner = () => {
    setThirdPlaceWinners([...thirdPlaceWinners, { name: "", team: "", grade: "A-", points: "8" }]);
  };

  const removeThirdPlaceWinner = (index: number) => {
    if (thirdPlaceWinners.length > 1) {
      setThirdPlaceWinners(thirdPlaceWinners.filter((_, i) => i !== index));
    }
  };

  const updateThirdPlaceWinner = (index: number, field: string, value: string) => {
    const updated = [...thirdPlaceWinners];
    updated[index] = { ...updated[index], [field]: value };
    setThirdPlaceWinners(updated);
  };

  const addAdditionalGrade = () => {
    setAdditionalGrades([...additionalGrades, { name: "", team: "", grade: "B+", points: "7" }]);
  };

  const removeAdditionalGrade = (index: number) => {
    setAdditionalGrades(additionalGrades.filter((_, i) => i !== index));
  };

  const updateAdditionalGrade = (index: number, field: string, value: string) => {
    const updated = [...additionalGrades];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalGrades(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate first place
    if (!selectedProgram || !category || !firstPlaceName || !firstPlaceTeam) {
      toast.error("Please fill in all required fields for first place");
      return;
    }

    // Validate second place winners
    const validSecondPlace = secondPlaceWinners.filter(w => w.name && w.team);
    if (validSecondPlace.length === 0) {
      toast.error("Please add at least one second place winner");
      return;
    }

    // Validate third place winners
    const validThirdPlace = thirdPlaceWinners.filter(w => w.name && w.team);
    if (validThirdPlace.length === 0) {
      toast.error("Please add at least one third place winner");
      return;
    }

    // Prepare additional grades including 2nd and 3rd place winners beyond the first one
    const additionalGradesData = [
      // Add extra 2nd place winners
      ...validSecondPlace.slice(1).map(winner => ({
        name: winner.name,
        team: winner.team,
        grade: winner.grade,
        points: parseInt(winner.points),
        place: "2nd"
      })),
      // Add extra 3rd place winners
      ...validThirdPlace.slice(1).map(winner => ({
        name: winner.name,
        team: winner.team,
        grade: winner.grade,
        points: parseInt(winner.points),
        place: "3rd"
      })),
      // Add other additional grades
      ...additionalGrades
        .filter(grade => grade.name)
        .map(grade => ({
          name: grade.name,
          team: grade.team || null,
          grade: grade.grade,
          points: parseInt(grade.points),
          place: "other"
        }))
    ];

    const resultData = {
      program_id: selectedProgram,
      ...(resultNumber && { result_number: parseInt(resultNumber) }),
      first_place_name: firstPlaceName,
      first_place_team: firstPlaceTeam,
      first_place_grade: firstPlaceGrade,
      first_place_points: parseInt(firstPlacePoints),
      second_place_name: validSecondPlace[0].name,
      second_place_team: validSecondPlace[0].team,
      second_place_grade: validSecondPlace[0].grade,
      second_place_points: parseInt(validSecondPlace[0].points),
      third_place_name: validThirdPlace[0].name,
      third_place_team: validThirdPlace[0].team,
      third_place_grade: validThirdPlace[0].grade,
      third_place_points: parseInt(validThirdPlace[0].points),
      additional_grades: additionalGradesData
    };

    // Update program category
    supabase.from("programs").update({ category }).eq("id", selectedProgram).then(() => {
      addResultMutation.mutate(resultData);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Competition Result
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Program *</Label>
              <Select value={selectedProgram} onValueChange={handleProgramChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {programs?.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name} {program.category && `(${program.category})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {category && (
              <div>
                <Label>Category</Label>
                <Input value={category} disabled className="bg-muted" />
              </div>
            )}
            {!category && selectedProgram && (
              <div>
                <Label>Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Novice">Novice</SelectItem>
                    <SelectItem value="Bachelor">Bachelor</SelectItem>
                    <SelectItem value="Masters">Masters</SelectItem>
                    <SelectItem value="Universal">Universal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div>
            <Label>Result Number</Label>
            <Input
              type="number"
              value={resultNumber}
              onChange={(e) => setResultNumber(e.target.value)}
              placeholder={suggestedResultNumber ? `Suggested: ${suggestedResultNumber}` : "Auto-generated"}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Edit if needed. Next result will be {resultNumber ? parseInt(resultNumber) + 1 : 'auto-generated'}.
            </p>
          </div>

          {/* First Place */}
          <div className="border border-primary rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-primary">🥇 First Place</h3>
            <div>
              <Label>Participant Name</Label>
              <Input
                value={firstPlaceName}
                onChange={(e) => setFirstPlaceName(e.target.value)}
                placeholder="Enter name"
              />
            </div>
            <div>
              <Label>Team</Label>
              <Select value={firstPlaceTeam} onValueChange={setFirstPlaceTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams?.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Grade</Label>
              <Select value={firstPlaceGrade} onValueChange={setFirstPlaceGrade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Points</Label>
              <Input
                type="number"
                value={firstPlacePoints}
                onChange={(e) => setFirstPlacePoints(e.target.value)}
                placeholder="Enter points"
              />
            </div>
          </div>

          {/* Second Place Winners */}
          <div className="border border-secondary rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-secondary">🥈 Second Place Winners</h3>
              <Button type="button" variant="outline" size="sm" onClick={addSecondPlaceWinner}>
                <Plus className="w-4 h-4 mr-2" />
                Add Winner
              </Button>
            </div>
            {secondPlaceWinners.map((winner, index) => (
              <div key={index} className="border border-muted rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Winner {index + 1}</h4>
                  {secondPlaceWinners.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSecondPlaceWinner(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div>
                  <Label>Participant Name</Label>
                  <Input
                    value={winner.name}
                    onChange={(e) => updateSecondPlaceWinner(index, "name", e.target.value)}
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <Label>Team</Label>
                  <Select value={winner.team} onValueChange={(val) => updateSecondPlaceWinner(index, "team", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams?.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Grade</Label>
                  <Select value={winner.grade} onValueChange={(val) => updateSecondPlaceWinner(index, "grade", val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADES.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Points</Label>
                  <Input
                    type="number"
                    value={winner.points}
                    onChange={(e) => updateSecondPlaceWinner(index, "points", e.target.value)}
                    placeholder="Enter points"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Third Place Winners */}
          <div className="border border-muted rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">🥉 Third Place Winners</h3>
              <Button type="button" variant="outline" size="sm" onClick={addThirdPlaceWinner}>
                <Plus className="w-4 h-4 mr-2" />
                Add Winner
              </Button>
            </div>
            {thirdPlaceWinners.map((winner, index) => (
              <div key={index} className="border border-muted rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Winner {index + 1}</h4>
                  {thirdPlaceWinners.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeThirdPlaceWinner(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div>
                  <Label>Participant Name</Label>
                  <Input
                    value={winner.name}
                    onChange={(e) => updateThirdPlaceWinner(index, "name", e.target.value)}
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <Label>Team</Label>
                  <Select value={winner.team} onValueChange={(val) => updateThirdPlaceWinner(index, "team", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams?.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Grade</Label>
                  <Select value={winner.grade} onValueChange={(val) => updateThirdPlaceWinner(index, "grade", val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADES.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Points</Label>
                  <Input
                    type="number"
                    value={winner.points}
                    onChange={(e) => updateThirdPlaceWinner(index, "points", e.target.value)}
                    placeholder="Enter points"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Additional Grades (Optional) */}
          <div className="border border-border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">🏆 Additional Grades (Optional)</h3>
              <Button type="button" variant="outline" size="sm" onClick={addAdditionalGrade}>
                <Plus className="w-4 h-4 mr-2" />
                Add Grade
              </Button>
            </div>
            {additionalGrades.map((grade, index) => (
              <div key={index} className="border border-muted rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Grade {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAdditionalGrade(index)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                <div>
                  <Label>Participant Name</Label>
                  <Input
                    value={grade.name}
                    onChange={(e) => updateAdditionalGrade(index, "name", e.target.value)}
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <Label>Team</Label>
                  <Select value={grade.team} onValueChange={(val) => updateAdditionalGrade(index, "team", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams?.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Grade</Label>
                  <Select value={grade.grade} onValueChange={(val) => updateAdditionalGrade(index, "grade", val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADES.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Points</Label>
                  <Input
                    type="number"
                    value={grade.points}
                    onChange={(e) => updateAdditionalGrade(index, "points", e.target.value)}
                    placeholder="Enter points"
                  />
                </div>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={addResultMutation.isPending}>
            {addResultMutation.isPending ? "Adding..." : "Add Result"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddResult;