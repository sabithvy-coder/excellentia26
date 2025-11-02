import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Settings as SettingsIcon, Trophy, Edit2 } from "lucide-react";
import { useState } from "react";

const Settings = () => {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("points", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const publishedUpToResult = (settings?.find(s => s.key === "published_up_to_result")?.value as number) || 0;

  const [editingResultThreshold, setEditingResultThreshold] = useState(false);
  const [resultThresholdValue, setResultThresholdValue] = useState<number>(0);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [newPoints, setNewPoints] = useState<number>(0);

  const updateResultThresholdMutation = useMutation({
    mutationFn: async (threshold: number) => {
      const { error } = await supabase
        .from("settings")
        .upsert({ key: "published_up_to_result", value: threshold }, { onConflict: "key" });
      if (error) throw error;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" />
          Team Points Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Result Threshold Display */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/10">
          <div className="space-y-1">
            <Label className="text-base font-medium">Result After</Label>
            <p className="text-sm text-muted-foreground">
              Current result number: {publishedUpToResult}
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <Label className="text-base font-medium">All Team Points</Label>
            </div>
          </div>
          <div className="space-y-2">
            {teams?.map((team, index) => (
              <div
                key={team.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold w-6">#{index + 1}</span>
                  <span className="font-medium">{team.name}</span>
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
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Settings;
