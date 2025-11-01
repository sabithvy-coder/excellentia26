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
  const [firstPlaceName, setFirstPlaceName] = useState("");
  const [firstPlaceTeam, setFirstPlaceTeam] = useState("");
  const [firstPlaceGrade, setFirstPlaceGrade] = useState("A+");
  const [secondPlaceName, setSecondPlaceName] = useState("");
  const [secondPlaceTeam, setSecondPlaceTeam] = useState("");
  const [secondPlaceGrade, setSecondPlaceGrade] = useState("A");
  const [thirdPlaceName, setThirdPlaceName] = useState("");
  const [thirdPlaceTeam, setThirdPlaceTeam] = useState("");
  const [thirdPlaceGrade, setThirdPlaceGrade] = useState("A-");
  const [additionalGrades, setAdditionalGrades] = useState<Array<{name: string; team: string; grade: string}>>([]);

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
    setResultNumber("");
    setFirstPlaceName("");
    setFirstPlaceTeam("");
    setFirstPlaceGrade("A+");
    setSecondPlaceName("");
    setSecondPlaceTeam("");
    setSecondPlaceGrade("A");
    setThirdPlaceName("");
    setThirdPlaceTeam("");
    setThirdPlaceGrade("A-");
    setAdditionalGrades([]);
  };

  const addAdditionalGrade = () => {
    setAdditionalGrades([...additionalGrades, { name: "", team: "", grade: "B+" }]);
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

    if (!selectedProgram || !category || !firstPlaceName || !firstPlaceTeam || !secondPlaceName || !secondPlaceTeam || !thirdPlaceName || !thirdPlaceTeam) {
      toast.error("Please fill in all required fields");
      return;
    }

    const additionalGradesData = additionalGrades
      .filter(grade => grade.name)
      .map(grade => ({
        name: grade.name,
        team: grade.team || null,
        grade: grade.grade,
        points: GRADE_POINTS[grade.grade]
      }));

    const resultData = {
      program_id: selectedProgram,
      ...(resultNumber && { result_number: parseInt(resultNumber) }),
      first_place_name: firstPlaceName,
      first_place_team: firstPlaceTeam,
      first_place_grade: firstPlaceGrade,
      first_place_points: GRADE_POINTS[firstPlaceGrade],
      second_place_name: secondPlaceName,
      second_place_team: secondPlaceTeam,
      second_place_grade: secondPlaceGrade,
      second_place_points: GRADE_POINTS[secondPlaceGrade],
      third_place_name: thirdPlaceName,
      third_place_team: thirdPlaceTeam,
      third_place_grade: thirdPlaceGrade,
      third_place_points: GRADE_POINTS[thirdPlaceGrade],
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
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {programs?.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          </div>

          <div>
            <Label>Result Number (Auto-generated if empty)</Label>
            <Input
              type="number"
              value={resultNumber}
              onChange={(e) => setResultNumber(e.target.value)}
              placeholder="Leave empty for auto-increment"
            />
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
                      {grade} ({GRADE_POINTS[grade]} points)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Second Place */}
          <div className="border border-secondary rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-secondary">🥈 Second Place</h3>
            <div>
              <Label>Participant Name</Label>
              <Input
                value={secondPlaceName}
                onChange={(e) => setSecondPlaceName(e.target.value)}
                placeholder="Enter name"
              />
            </div>
            <div>
              <Label>Team</Label>
              <Select value={secondPlaceTeam} onValueChange={setSecondPlaceTeam}>
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
              <Select value={secondPlaceGrade} onValueChange={setSecondPlaceGrade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade} ({GRADE_POINTS[grade]} points)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Third Place */}
          <div className="border border-muted rounded-lg p-4 space-y-3">
            <h3 className="font-bold">🥉 Third Place</h3>
            <div>
              <Label>Participant Name</Label>
              <Input
                value={thirdPlaceName}
                onChange={(e) => setThirdPlaceName(e.target.value)}
                placeholder="Enter name"
              />
            </div>
            <div>
              <Label>Team</Label>
              <Select value={thirdPlaceTeam} onValueChange={setThirdPlaceTeam}>
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
              <Select value={thirdPlaceGrade} onValueChange={setThirdPlaceGrade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade} ({GRADE_POINTS[grade]} points)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                          {g} ({GRADE_POINTS[g]} points)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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