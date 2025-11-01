import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";

const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "No Grade"];

interface EditResultProps {
  result: any;
}

const EditResult = ({ result }: EditResultProps) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(result.program_id);
  const [resultNumber, setResultNumber] = useState(result.result_number?.toString() || "");
  
  const [firstPlaceLeft, setFirstPlaceLeft] = useState({ 
    name: result.first_place_name, 
    team: result.first_place_team, 
    grade: result.first_place_grade, 
    points: result.first_place_points?.toString() || "0" 
  });
  const [firstPlaceRight, setFirstPlaceRight] = useState({ name: "", team: "", grade: "A+", points: "10" });

  const [secondPlaceLeft, setSecondPlaceLeft] = useState({ 
    name: result.second_place_name, 
    team: result.second_place_team, 
    grade: result.second_place_grade, 
    points: result.second_place_points?.toString() || "0" 
  });
  const [secondPlaceRight, setSecondPlaceRight] = useState({ name: "", team: "", grade: "A", points: "9" });
  
  const [thirdPlaceLeft, setThirdPlaceLeft] = useState({ 
    name: result.third_place_name, 
    team: result.third_place_team, 
    grade: result.third_place_grade, 
    points: result.third_place_points?.toString() || "0" 
  });
  const [thirdPlaceRight, setThirdPlaceRight] = useState({ name: "", team: "", grade: "A-", points: "8" });
  
  const [additionalGrades, setAdditionalGrades] = useState<Array<{name: string; team: string; grade: string; points: string}>>([]);

  useEffect(() => {
    if (result.additional_grades && Array.isArray(result.additional_grades)) {
      const firstPlace = result.additional_grades.find((g: any) => g.place === "1st");
      const secondPlace = result.additional_grades.find((g: any) => g.place === "2nd");
      const thirdPlace = result.additional_grades.find((g: any) => g.place === "3rd");
      const others = result.additional_grades.filter((g: any) => g.place === "other");

      if (firstPlace) {
        setFirstPlaceRight({
          name: firstPlace.name,
          team: firstPlace.team,
          grade: firstPlace.grade,
          points: firstPlace.points?.toString() || "0"
        });
      }

      if (secondPlace) {
        setSecondPlaceRight({
          name: secondPlace.name,
          team: secondPlace.team,
          grade: secondPlace.grade,
          points: secondPlace.points?.toString() || "0"
        });
      }

      if (thirdPlace) {
        setThirdPlaceRight({
          name: thirdPlace.name,
          team: thirdPlace.team,
          grade: thirdPlace.grade,
          points: thirdPlace.points?.toString() || "0"
        });
      }

      setAdditionalGrades(others.map((g: any) => ({
        name: g.name,
        team: g.team || "",
        grade: g.grade,
        points: g.points?.toString() || "0"
      })));
    }
  }, [result]);

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

  const updateResultMutation = useMutation({
    mutationFn: async (resultData: any) => {
      const { error } = await supabase
        .from("results")
        .update(resultData)
        .eq("id", result.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
      queryClient.invalidateQueries({ queryKey: ["results-with-details"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Result updated successfully!");
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to update result");
    },
  });


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

    if (!selectedProgram || !firstPlaceLeft.name || !firstPlaceLeft.team) {
      toast.error("Please fill in all required fields for first place");
      return;
    }

    if (!secondPlaceLeft.name || !secondPlaceLeft.team) {
      toast.error("Please fill in the required second place winner (left)");
      return;
    }

    if (!thirdPlaceLeft.name || !thirdPlaceLeft.team) {
      toast.error("Please fill in the required third place winner (left)");
      return;
    }

    const additionalGradesData = [
      ...(firstPlaceRight.name && firstPlaceRight.team ? [{
        name: firstPlaceRight.name,
        team: firstPlaceRight.team,
        grade: firstPlaceRight.grade,
        points: parseInt(firstPlaceRight.points),
        place: "1st"
      }] : []),
      ...(secondPlaceRight.name && secondPlaceRight.team ? [{
        name: secondPlaceRight.name,
        team: secondPlaceRight.team,
        grade: secondPlaceRight.grade,
        points: parseInt(secondPlaceRight.points),
        place: "2nd"
      }] : []),
      ...(thirdPlaceRight.name && thirdPlaceRight.team ? [{
        name: thirdPlaceRight.name,
        team: thirdPlaceRight.team,
        grade: thirdPlaceRight.grade,
        points: parseInt(thirdPlaceRight.points),
        place: "3rd"
      }] : []),
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
      result_number: parseInt(resultNumber),
      first_place_name: firstPlaceLeft.name,
      first_place_team: firstPlaceLeft.team,
      first_place_grade: firstPlaceLeft.grade,
      first_place_points: parseInt(firstPlaceLeft.points),
      second_place_name: secondPlaceLeft.name,
      second_place_team: secondPlaceLeft.team,
      second_place_grade: secondPlaceLeft.grade,
      second_place_points: parseInt(secondPlaceLeft.points),
      third_place_name: thirdPlaceLeft.name,
      third_place_team: thirdPlaceLeft.team,
      third_place_grade: thirdPlaceLeft.grade,
      third_place_points: parseInt(thirdPlaceLeft.points),
      additional_grades: additionalGradesData
    };

    updateResultMutation.mutate(resultData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Result</DialogTitle>
        </DialogHeader>
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
              <Label>Result Number *</Label>
              <Input
                type="number"
                value={resultNumber}
                onChange={(e) => setResultNumber(e.target.value)}
                required
              />
            </div>
          </div>

          {/* First Place Winners - Side by Side */}
          <div className="border border-primary rounded-lg p-4 space-y-4">
            <h3 className="font-bold text-primary">🥇 First Place Winners</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left - Required */}
              <div className="border border-primary/50 rounded-lg p-3 space-y-3">
                <h4 className="font-medium text-primary">Winner 1 (Required)</h4>
                <div>
                  <Label>Participant Name *</Label>
                  <Input
                    value={firstPlaceLeft.name}
                    onChange={(e) => setFirstPlaceLeft({...firstPlaceLeft, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Team *</Label>
                  <Select value={firstPlaceLeft.team} onValueChange={(val) => setFirstPlaceLeft({...firstPlaceLeft, team: val})}>
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
                  <Select value={firstPlaceLeft.grade} onValueChange={(val) => setFirstPlaceLeft({...firstPlaceLeft, grade: val})}>
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
                  <Label>Points *</Label>
                  <Input
                    type="number"
                    value={firstPlaceLeft.points}
                    onChange={(e) => setFirstPlaceLeft({...firstPlaceLeft, points: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Right - Optional */}
              <div className="border border-muted rounded-lg p-3 space-y-3">
                <h4 className="font-medium text-muted-foreground">Winner 2 (Optional)</h4>
                <div>
                  <Label>Participant Name</Label>
                  <Input
                    value={firstPlaceRight.name}
                    onChange={(e) => setFirstPlaceRight({...firstPlaceRight, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Team</Label>
                  <Select value={firstPlaceRight.team} onValueChange={(val) => setFirstPlaceRight({...firstPlaceRight, team: val})}>
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
                  <Select value={firstPlaceRight.grade} onValueChange={(val) => setFirstPlaceRight({...firstPlaceRight, grade: val})}>
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
                    value={firstPlaceRight.points}
                    onChange={(e) => setFirstPlaceRight({...firstPlaceRight, points: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Second Place Winners - Side by Side */}
          <div className="border border-secondary rounded-lg p-4 space-y-4">
            <h3 className="font-bold text-secondary">🥈 Second Place Winners</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left - Required */}
              <div className="border border-secondary/50 rounded-lg p-3 space-y-3">
                <h4 className="font-medium text-secondary">Winner 1 (Required)</h4>
                <div>
                  <Label>Participant Name *</Label>
                  <Input
                    value={secondPlaceLeft.name}
                    onChange={(e) => setSecondPlaceLeft({...secondPlaceLeft, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Team *</Label>
                  <Select value={secondPlaceLeft.team} onValueChange={(val) => setSecondPlaceLeft({...secondPlaceLeft, team: val})}>
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
                  <Select value={secondPlaceLeft.grade} onValueChange={(val) => setSecondPlaceLeft({...secondPlaceLeft, grade: val})}>
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
                  <Label>Points *</Label>
                  <Input
                    type="number"
                    value={secondPlaceLeft.points}
                    onChange={(e) => setSecondPlaceLeft({...secondPlaceLeft, points: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Right - Optional */}
              <div className="border border-muted rounded-lg p-3 space-y-3">
                <h4 className="font-medium text-muted-foreground">Winner 2 (Optional)</h4>
                <div>
                  <Label>Participant Name</Label>
                  <Input
                    value={secondPlaceRight.name}
                    onChange={(e) => setSecondPlaceRight({...secondPlaceRight, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Team</Label>
                  <Select value={secondPlaceRight.team} onValueChange={(val) => setSecondPlaceRight({...secondPlaceRight, team: val})}>
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
                  <Select value={secondPlaceRight.grade} onValueChange={(val) => setSecondPlaceRight({...secondPlaceRight, grade: val})}>
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
                    value={secondPlaceRight.points}
                    onChange={(e) => setSecondPlaceRight({...secondPlaceRight, points: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Third Place Winners - Side by Side */}
          <div className="border border-muted rounded-lg p-4 space-y-4">
            <h3 className="font-bold">🥉 Third Place Winners</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left - Required */}
              <div className="border border-muted/50 rounded-lg p-3 space-y-3">
                <h4 className="font-medium">Winner 1 (Required)</h4>
                <div>
                  <Label>Participant Name *</Label>
                  <Input
                    value={thirdPlaceLeft.name}
                    onChange={(e) => setThirdPlaceLeft({...thirdPlaceLeft, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Team *</Label>
                  <Select value={thirdPlaceLeft.team} onValueChange={(val) => setThirdPlaceLeft({...thirdPlaceLeft, team: val})}>
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
                  <Select value={thirdPlaceLeft.grade} onValueChange={(val) => setThirdPlaceLeft({...thirdPlaceLeft, grade: val})}>
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
                  <Label>Points *</Label>
                  <Input
                    type="number"
                    value={thirdPlaceLeft.points}
                    onChange={(e) => setThirdPlaceLeft({...thirdPlaceLeft, points: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Right - Optional */}
              <div className="border border-muted rounded-lg p-3 space-y-3">
                <h4 className="font-medium text-muted-foreground">Winner 2 (Optional)</h4>
                <div>
                  <Label>Participant Name</Label>
                  <Input
                    value={thirdPlaceRight.name}
                    onChange={(e) => setThirdPlaceRight({...thirdPlaceRight, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Team</Label>
                  <Select value={thirdPlaceRight.team} onValueChange={(val) => setThirdPlaceRight({...thirdPlaceRight, team: val})}>
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
                  <Select value={thirdPlaceRight.grade} onValueChange={(val) => setThirdPlaceRight({...thirdPlaceRight, grade: val})}>
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
                    value={thirdPlaceRight.points}
                    onChange={(e) => setThirdPlaceRight({...thirdPlaceRight, points: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Grades */}
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
                  <Label>Participant Name *</Label>
                  <Input
                    value={grade.name}
                    onChange={(e) => updateAdditionalGrade(index, "name", e.target.value)}
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
                  <Label>Points *</Label>
                  <Input
                    type="number"
                    value={grade.points}
                    onChange={(e) => updateAdditionalGrade(index, "points", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={updateResultMutation.isPending}>
              {updateResultMutation.isPending ? "Updating..." : "Update Result"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditResult;
