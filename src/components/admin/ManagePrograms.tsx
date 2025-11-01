import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const ManagePrograms = () => {
  const queryClient = useQueryClient();
  const [programName, setProgramName] = useState("");
  const [category, setCategory] = useState("");
  const [venue, setVenue] = useState("");

  const { data: programs } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addProgramMutation = useMutation({
    mutationFn: async (programData: any) => {
      const { error } = await supabase.from("programs").insert(programData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Program added successfully!");
      setProgramName("");
      setCategory("");
      setVenue("");
    },
    onError: () => {
      toast.error("Failed to add program");
    },
  });

  const deleteProgramMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("programs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Program deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete program");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programName) {
      toast.error("Program name is required");
      return;
    }
    addProgramMutation.mutate({ name: programName, category, venue });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Program Name *</Label>
              <Input
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                placeholder="Enter program name"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Enter category (optional)"
              />
            </div>
            <div>
              <Label>Venue</Label>
              <Input
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Enter venue (optional)"
              />
            </div>
            <Button type="submit" className="w-full" disabled={addProgramMutation.isPending}>
              {addProgramMutation.isPending ? "Adding..." : "Add Program"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Programs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {programs && programs.length > 0 ? (
              programs.map((program) => (
                <div
                  key={program.id}
                  className="flex justify-between items-start p-3 bg-muted rounded-lg"
                >
                  <div>
                    <div className="font-medium">{program.name}</div>
                    {program.category && (
                      <div className="text-sm text-muted-foreground">{program.category}</div>
                    )}
                    {program.venue && (
                      <div className="text-sm text-muted-foreground">{program.venue}</div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteProgramMutation.mutate(program.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No programs yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagePrograms;