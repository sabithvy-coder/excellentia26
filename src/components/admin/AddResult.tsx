import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Image as ImageIcon } from "lucide-react";
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

const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "No Grade"];
const GRADE_POINTS: Record<string, number> = {
  "A+": 10, "A": 9, "A-": 8, "B+": 7, "B": 6, "B-": 5, "C+": 4, "C": 3, "C-": 2, "D": 1, "No Grade": 0
};

const AddResult = () => {
  const queryClient = useQueryClient();
  const [selectedProgram, setSelectedProgram] = useState("");
  const [category, setCategory] = useState("");
  const [resultNumber, setResultNumber] = useState("");
  const [suggestedResultNumber, setSuggestedResultNumber] = useState<number | null>(null);
  
  // First place - two winners (left required, right optional)
  const [firstPlaceLeft, setFirstPlaceLeft] = useState({ name: "", team: "", grade: "A+", points: "10" });
  const [firstPlaceRight, setFirstPlaceRight] = useState({ name: "", team: "", grade: "A+", points: "10" });

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
  
  // Second place - two winners (left required, right optional)
  const [secondPlaceLeft, setSecondPlaceLeft] = useState({ name: "", team: "", grade: "A", points: "9" });
  const [secondPlaceRight, setSecondPlaceRight] = useState({ name: "", team: "", grade: "A", points: "9" });
  
  // Third place - two winners (left required, right optional)
  const [thirdPlaceLeft, setThirdPlaceLeft] = useState({ name: "", team: "", grade: "A-", points: "8" });
  const [thirdPlaceRight, setThirdPlaceRight] = useState({ name: "", team: "", grade: "A-", points: "8" });
  
  const [additionalGrades, setAdditionalGrades] = useState<Array<{name: string; team: string; grade: string; points: string}>>([]);
  const [posterFiles, setPosterFiles] = useState<File[]>([]);
  const [uploadingPosters, setUploadingPosters] = useState(false);

  const { data: programs } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("programs").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: existingResults } = useQuery({
    queryKey: ["results"],
    queryFn: async () => {
      const { data, error } = await supabase.from("results").select("program_id");
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

  // Get programs with results for tick marks
  const programsWithResults = new Set(existingResults?.map((result) => result.program_id) || []);

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
      // Upload posters if any
      let posterUrls: string[] = [];
      if (posterFiles.length > 0) {
        setUploadingPosters(true);
        for (const file of posterFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('result-posters')
            .upload(fileName, file);
          
          if (uploadError) throw uploadError;
          
          const { data: urlData } = supabase.storage
            .from('result-posters')
            .getPublicUrl(fileName);
          
          posterUrls.push(urlData.publicUrl);
        }
        setUploadingPosters(false);
      }

      const { error } = await supabase.from("results").insert({
        ...resultData,
        poster_urls: posterUrls
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["programs"] });
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
    setFirstPlaceLeft({ name: "", team: "", grade: "A+", points: "10" });
    setFirstPlaceRight({ name: "", team: "", grade: "A+", points: "10" });
    setSecondPlaceLeft({ name: "", team: "", grade: "A", points: "9" });
    setSecondPlaceRight({ name: "", team: "", grade: "A", points: "9" });
    setThirdPlaceLeft({ name: "", team: "", grade: "A-", points: "8" });
    setThirdPlaceRight({ name: "", team: "", grade: "A-", points: "8" });
    setAdditionalGrades([]);
    setPosterFiles([]);
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

    // Validate first place left (required)
    if (!selectedProgram || !category || !firstPlaceLeft.name || !firstPlaceLeft.team) {
      toast.error("Please fill in all required fields for first place");
      return;
    }

    // Validate second place left (required)
    if (!secondPlaceLeft.name || !secondPlaceLeft.team) {
      toast.error("Please fill in the required second place winner (left)");
      return;
    }

    // Validate third place left (required)
    if (!thirdPlaceLeft.name || !thirdPlaceLeft.team) {
      toast.error("Please fill in the required third place winner (left)");
      return;
    }

    // Prepare additional grades
    const additionalGradesData = [
      // Add first place right if filled
      ...(firstPlaceRight.name && firstPlaceRight.team ? [{
        name: firstPlaceRight.name,
        team: firstPlaceRight.team,
        grade: firstPlaceRight.grade,
        points: parseInt(firstPlaceRight.points),
        place: "1st"
      }] : []),
      // Add second place right if filled
      ...(secondPlaceRight.name && secondPlaceRight.team ? [{
        name: secondPlaceRight.name,
        team: secondPlaceRight.team,
        grade: secondPlaceRight.grade,
        points: parseInt(secondPlaceRight.points),
        place: "2nd"
      }] : []),
      // Add third place right if filled
      ...(thirdPlaceRight.name && thirdPlaceRight.team ? [{
        name: thirdPlaceRight.name,
        team: thirdPlaceRight.team,
        grade: thirdPlaceRight.grade,
        points: parseInt(thirdPlaceRight.points),
        place: "3rd"
      }] : []),
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
                  {programs?.map((program) => {
                    const hasResult = programsWithResults.has(program.id);
                    return (
                      <SelectItem 
                        key={program.id} 
                        value={program.id}
                        disabled={hasResult}
                      >
                        {hasResult && "✓ "}{program.name} {program.category && `(${program.category})`}
                      </SelectItem>
                    );
                  })}
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
                    placeholder="Enter name"
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
                    placeholder="Enter points"
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
                    placeholder="Enter name"
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
                    placeholder="Enter points"
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
                    placeholder="Enter name"
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
                    placeholder="Enter points"
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
                    placeholder="Enter name"
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
                    placeholder="Enter points"
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
                    placeholder="Enter name"
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
                    placeholder="Enter points"
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
                    placeholder="Enter name"
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
                    placeholder="Enter points"
                  />
                </div>
              </div>
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

          {/* Poster Upload Section */}
          <div className="border border-border rounded-lg p-4 space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Result Posters (Optional)
            </h3>
            <div>
              <Label htmlFor="poster-upload">Upload Posters</Label>
              <Input
                id="poster-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    setPosterFiles(Array.from(e.target.files));
                  }
                }}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can upload multiple poster images
              </p>
            </div>
            {posterFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Selected Posters:</p>
                <div className="flex flex-wrap gap-2">
                  {posterFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Poster ${index + 1}`}
                        className="w-24 h-24 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => setPosterFiles(posterFiles.filter((_, i) => i !== index))}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={addResultMutation.isPending || uploadingPosters}>
            {uploadingPosters ? "Uploading Posters..." : addResultMutation.isPending ? "Adding..." : "Add Result"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddResult;