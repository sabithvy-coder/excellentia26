import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentFestival } from "@/hooks/useFestival";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Edit } from "lucide-react";

const ManageStudents = () => {
  const { data: festival } = useCurrentFestival();
  const festivalId = festival?.id;
  const festivalYear = festival?.year;
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [teamId, setTeamId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: teams } = useQuery({
    queryKey: ["teams", festivalId],
    enabled: !!festivalId,
    queryFn: async () => {
      const { data, error } = await supabase.from("teams").select("*").eq("festival_id", festivalId!);
      if (error) throw error;
      return data;
    },
  });

  const { data: students } = useQuery({
    queryKey: ["students", festivalId],
    enabled: !!festivalId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select(`
          *,
          team:teams(name)
        `)
        .eq("festival_id", festivalId!)
        .order("points", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addStudentMutation = useMutation({
    mutationFn: async (studentData: any) => {
      if (editingId) {
        const { error } = await supabase.from("students").update(studentData).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("students")
          .insert({ ...studentData, festival_id: festivalId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success(editingId ? "Student updated!" : "Student added!");
      setName("");
      setTeamId("");
      setEditingId(null);
    },
    onError: () => {
      toast.error(editingId ? "Failed to update" : "Failed to add");
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete student");
    },
  });

  const handleEdit = (student: any) => {
    setName(student.name);
    setTeamId(student.team_id);
    setEditingId(student.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !teamId) {
      toast.error("Name and team are required");
      return;
    }
    addStudentMutation.mutate({ name, team_id: teamId });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Student
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Student Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter student name"
              />
            </div>
            <div>
              <Label>Team *</Label>
              <Select value={teamId} onValueChange={setTeamId}>
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
            <Button type="submit" className="w-full" disabled={addStudentMutation.isPending}>
              {addStudentMutation.isPending 
                ? (editingId ? "Updating..." : "Adding...") 
                : (editingId ? "Update Student" : "Add Student")}
            </Button>
            {editingId && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  setEditingId(null);
                  setName("");
                  setTeamId("");
                }}
              >
                Cancel Edit
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Students Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {students && students.length > 0 ? (
              students.map((student: any, index) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-primary">#{index + 1}</div>
                    <div>
                      <div className="font-bold">{student.name}</div>
                      <div className="text-sm text-muted-foreground">{student.team?.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xl font-bold text-secondary">{student.points} pts</div>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(student)}>
                      <Edit className="w-4 h-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteStudentMutation.mutate(student.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No students yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageStudents;
