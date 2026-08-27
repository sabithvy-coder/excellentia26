import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentFestival } from "@/hooks/useFestival";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Settings as SettingsIcon, Trophy, Edit2, Plus, Trash2, Check, X } from "lucide-react";
import { useState } from "react";

const Settings = () => {
  const queryClient = useQueryClient();
  const { data: festival } = useCurrentFestival();
  const festivalId = festival?.id;

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

  const { data: teams } = useQuery({
    queryKey: ["teams", festivalId],
    enabled: !!festivalId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("festival_id", festivalId!)
        .order("points", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const publishedUpToResult = (settings?.find(s => s.key === "team_standings_after_result")?.value as number) || 0;

  const [editingResultThreshold, setEditingResultThreshold] = useState(false);
  const [resultThresholdValue, setResultThresholdValue] = useState<number>(0);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [newPoints, setNewPoints] = useState<number>(0);
  const [renamingTeam, setRenamingTeam] = useState<string | null>(null);
  const [teamNameValue, setTeamNameValue] = useState("");
  const [newTeamName, setNewTeamName] = useState("");

  const upsertSetting = async (key: string, value: any) => {
    const existing = settings?.find(s => s.key === key);
    if (existing) {
      const { error } = await supabase
        .from("settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("settings")
        .insert({ key, value, festival_id: festivalId });
      if (error) throw error;
    }
  };

  const updateResultThresholdMutation = useMutation({
    mutationFn: async (threshold: number) => {
      await upsertSetting("team_standings_after_result", threshold);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Result threshold updated successfully!");
      setEditingResultThreshold(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update result threshold");
    },
  });

  const updateTeamPointsMutation = useMutation({
    mutationFn: async ({ teamId, points }: { teamId: string; points: number }) => {
      if (points < 0) {
        throw new Error("Points cannot be negative");
      }
      const { error } = await supabase
        .from("teams")
        .update({ points })
        .eq("id", teamId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team points updated successfully!");
      setEditingTeam(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update team points");
    },
  });

  const renameTeamMutation = useMutation({
    mutationFn: async ({ teamId, name }: { teamId: string; name: string }) => {
      if (!name.trim()) throw new Error("Team name cannot be empty");
      const { error } = await supabase
        .from("teams")
        .update({ name: name.trim() })
        .eq("id", teamId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team name updated!");
      setRenamingTeam(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to rename team");
    },
  });

  const addTeamMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!name.trim()) throw new Error("Team name is required");
      const { error } = await supabase
        .from("teams")
        .insert({ name: name.trim(), points: 0, published_points: 0, festival_id: festivalId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team added!");
      setNewTeamName("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add team");
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const { error } = await supabase.from("teams").delete().eq("id", teamId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team removed");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove team");
    },
  });

  const publishTeamPointsMutation = useMutation({
    mutationFn: async () => {
      if (!teams) return;

      const updates = teams.map(team =>
        supabase
          .from("teams")
          .update({ published_points: team.points })
          .eq("id", team.id)
      );

      const results = await Promise.all(updates);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) throw new Error("Failed to publish some team points");

      await upsertSetting("team_standings_visible", true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("All team points published successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to publish team points");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" />
          Team Points Management
          {festival && (
            <span className="text-sm font-normal text-muted-foreground">
              — Excellentia {festival.year}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Result Threshold Display */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/10">
          <div className="space-y-1">
            <Label className="text-base font-medium">Final Result Number</Label>
            <p className="text-sm text-muted-foreground">
              Set the last result number to finalize team standings
            </p>
          </div>
          <div className="flex items-center gap-2">
            {editingResultThreshold ? (
              <>
                <Input
                  type="number"
                  min="0"
                  value={resultThresholdValue}
                  onChange={(e) => setResultThresholdValue(parseInt(e.target.value) || 0)}
                  className="w-24"
                />
                <Button
                  size="sm"
                  onClick={() => updateResultThresholdMutation.mutate(resultThresholdValue)}
                  disabled={updateResultThresholdMutation.isPending}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingResultThreshold(false);
                    setResultThresholdValue(publishedUpToResult);
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold">{publishedUpToResult}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingResultThreshold(true);
                    setResultThresholdValue(publishedUpToResult);
                  }}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Team Points */}
        <div className="p-4 border rounded-lg space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <Label className="text-base font-medium">All Team Points</Label>
            </div>
            <Button
              onClick={() => publishTeamPointsMutation.mutate()}
              disabled={publishTeamPointsMutation.isPending}
            >
              Publish Team Standings
            </Button>
          </div>

          {/* Add team */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="New team name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={() => addTeamMutation.mutate(newTeamName)}
              disabled={addTeamMutation.isPending || !newTeamName.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Team
            </Button>
          </div>

          <div className="space-y-2">
            {teams?.map((team, index) => (
              <div
                key={team.id}
                className="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-semibold w-6">#{index + 1}</span>
                  {renamingTeam === team.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={teamNameValue}
                        onChange={(e) => setTeamNameValue(e.target.value)}
                        className="w-48"
                      />
                      <Button
                        size="sm"
                        onClick={() => renameTeamMutation.mutate({ teamId: team.id, name: teamNameValue })}
                        disabled={renameTeamMutation.isPending}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setRenamingTeam(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{team.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setRenamingTeam(team.id);
                          setTeamNameValue(team.name);
                        }}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
                {editingTeam === team.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      value={newPoints}
                      onChange={(e) => setNewPoints(parseInt(e.target.value) || 0)}
                      className="w-24"
                    />
                    <Button
                      size="sm"
                      onClick={() => updateTeamPointsMutation.mutate({ teamId: team.id, points: newPoints })}
                      disabled={updateTeamPointsMutation.isPending}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingTeam(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{team.points}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingTeam(team.id);
                        setNewPoints(team.points);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => deleteTeamMutation.mutate(team.id)}
                      disabled={deleteTeamMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {(!teams || teams.length === 0) && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No teams yet for this edition — add one above.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Settings;
