import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Eye, EyeOff, Settings as SettingsIcon, Trophy, Edit2, Upload } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

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

  const teamStandingsVisible = settings?.find(s => s.key === "team_standings_visible")?.value === true;
  const teamStandingsAfterResult = (settings?.find(s => s.key === "team_standings_after_result")?.value as number) || 0;
  const publishedUpToResult = (settings?.find(s => s.key === "published_up_to_result")?.value as number) || 0;

  const [editingStandingsThreshold, setEditingStandingsThreshold] = useState(false);
  const [newThreshold, setNewThreshold] = useState(0);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishUpToResult, setPublishUpToResult] = useState(0);

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from("settings")
        .upsert({ key, value }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update settings");
    },
  });

  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [newPoints, setNewPoints] = useState<number>(0);

  const toggleTeamStandings = () => {
    updateSettingMutation.mutate({
      key: "team_standings_visible",
      value: !teamStandingsVisible,
    });
  };

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

  const publishPointsMutation = useMutation({
    mutationFn: async (upToResultNumber: number) => {
      // Get all results up to the specified result number
      const { data: results, error: resultsError } = await supabase
        .from("results")
        .select("*")
        .lte("result_number", upToResultNumber);
      
      if (resultsError) throw resultsError;

      // Calculate points for each team
      const teamPoints: Record<string, number> = {};
      const studentPoints: Record<string, Record<string, number>> = {};

      results?.forEach((result: any) => {
        // First place
        if (result.first_place_team && result.first_place_points) {
          teamPoints[result.first_place_team] = (teamPoints[result.first_place_team] || 0) + result.first_place_points;
          if (!studentPoints[result.first_place_team]) studentPoints[result.first_place_team] = {};
          studentPoints[result.first_place_team][result.first_place_name] = 
            (studentPoints[result.first_place_team][result.first_place_name] || 0) + result.first_place_points;
        }

        // Second place
        if (result.second_place_team && result.second_place_points) {
          teamPoints[result.second_place_team] = (teamPoints[result.second_place_team] || 0) + result.second_place_points;
          if (!studentPoints[result.second_place_team]) studentPoints[result.second_place_team] = {};
          studentPoints[result.second_place_team][result.second_place_name] = 
            (studentPoints[result.second_place_team][result.second_place_name] || 0) + result.second_place_points;
        }

        // Third place
        if (result.third_place_team && result.third_place_points) {
          teamPoints[result.third_place_team] = (teamPoints[result.third_place_team] || 0) + result.third_place_points;
          if (!studentPoints[result.third_place_team]) studentPoints[result.third_place_team] = {};
          studentPoints[result.third_place_team][result.third_place_name] = 
            (studentPoints[result.third_place_team][result.third_place_name] || 0) + result.third_place_points;
        }

        // Additional grades
        if (result.additional_grades && Array.isArray(result.additional_grades)) {
          result.additional_grades.forEach((grade: any) => {
            if (grade.team && grade.points) {
              teamPoints[grade.team] = (teamPoints[grade.team] || 0) + grade.points;
              if (!studentPoints[grade.team]) studentPoints[grade.team] = {};
              studentPoints[grade.team][grade.name] = 
                (studentPoints[grade.team][grade.name] || 0) + grade.points;
            }
          });
        }
      });

      // Update published_points for all teams
      const { data: allTeams } = await supabase.from("teams").select("id");
      for (const team of allTeams || []) {
        const { error } = await supabase
          .from("teams")
          .update({ published_points: teamPoints[team.id] || 0 })
          .eq("id", team.id);
        if (error) throw error;
      }

      // Update published_points for all students
      for (const [teamId, students] of Object.entries(studentPoints)) {
        for (const [studentName, points] of Object.entries(students)) {
          const { error } = await supabase
            .from("students")
            .update({ published_points: points })
            .eq("name", studentName)
            .eq("team_id", teamId);
          if (error) throw error;
        }
      }

      // Reset published_points to 0 for students not in the results
      const { error: resetError } = await supabase
        .from("students")
        .update({ published_points: 0 })
        .not("id", "in", `(${Object.values(studentPoints).flatMap(s => Object.keys(s)).join(",")})`);

      // Update the published_up_to_result setting
      const { error: settingError } = await supabase
        .from("settings")
        .upsert({ key: "published_up_to_result", value: upToResultNumber }, { onConflict: "key" });
      
      if (settingError) throw settingError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Points published successfully!");
      setPublishDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to publish points");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" />
          App Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Team Standings Visibility */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium">Team Standings Visibility</Label>
              <p className="text-sm text-muted-foreground">
                {teamStandingsVisible 
                  ? "🟢 Team standings are LIVE and visible to all users" 
                  : "🔴 Team standings are HIDDEN from users"}
              </p>
            </div>
            <Button
              onClick={toggleTeamStandings}
              variant={teamStandingsVisible ? "destructive" : "default"}
              size="sm"
              className="ml-4"
            >
              {teamStandingsVisible ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide from Users
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Publish to Users
                </>
              )}
            </Button>
          </div>

          {/* Team Standings Threshold */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium">Show Team Standings After Result</Label>
              <p className="text-sm text-muted-foreground">
                Team standings will be visible after result number: {teamStandingsAfterResult}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {editingStandingsThreshold ? (
                <>
                  <Input
                    type="number"
                    min="0"
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(parseInt(e.target.value) || 0)}
                    className="w-24"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      updateSettingMutation.mutate({
                        key: "team_standings_after_result",
                        value: newThreshold,
                      });
                      setEditingStandingsThreshold(false);
                    }}
                    disabled={updateSettingMutation.isPending}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingStandingsThreshold(false)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setNewThreshold(teamStandingsAfterResult);
                    setEditingStandingsThreshold(true);
                  }}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Threshold
                </Button>
              )}
            </div>
          </div>

          {/* Publish Points Section */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5">
            <div className="space-y-1">
              <Label className="text-base font-medium">Publish Team Points</Label>
              <p className="text-sm text-muted-foreground">
                Currently published up to result #{publishedUpToResult}
              </p>
            </div>
            <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  onClick={() => setPublishUpToResult(publishedUpToResult)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Publish Points
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Publish Team Points to Users</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Publish points up to result number:</Label>
                    <Input
                      type="number"
                      min="0"
                      value={publishUpToResult}
                      onChange={(e) => setPublishUpToResult(parseInt(e.target.value) || 0)}
                      placeholder="Enter result number"
                    />
                    <p className="text-sm text-muted-foreground">
                      Users will see points calculated from results 1 to {publishUpToResult}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setPublishDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => publishPointsMutation.mutate(publishUpToResult)}
                    disabled={publishPointsMutation.isPending}
                  >
                    Publish
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Draft Points (Admin View) */}
          <div className="p-4 border rounded-lg space-y-3 bg-orange-50 dark:bg-orange-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-600" />
                <Label className="text-base font-medium">Draft Points (Admin Only)</Label>
              </div>
              <span className="text-xs bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                Latest/Unpublished
              </span>
            </div>
            <div className="space-y-2">
              {teams?.map((team, index) => (
                <div 
                  key={team.id} 
                  className="flex items-center justify-between p-3 bg-background rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{team.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {editingTeam === team.id ? (
                      <>
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
                      </>
                    ) : (
                      <>
                        <span className="text-2xl font-bold text-orange-600">{team.points}</span>
                        <span className="text-sm text-muted-foreground">pts</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingTeam(team.id);
                            setNewPoints(team.points);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {(!teams || teams.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No teams available yet
                </p>
              )}
            </div>
          </div>

          {/* Published Points (What Users See) */}
          <div className="p-4 border rounded-lg space-y-3 bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-green-600" />
                <Label className="text-base font-medium">Published Points (User View)</Label>
              </div>
              <span className="text-xs bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                Up to Result #{publishedUpToResult}
              </span>
            </div>
            <div className="space-y-2">
              {teams
                ?.sort((a, b) => (b.published_points || 0) - (a.published_points || 0))
                .map((team, index) => (
                <div 
                  key={team.id} 
                  className="flex items-center justify-between p-3 bg-background rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{team.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-green-600">{team.published_points || 0}</span>
                    <span className="text-sm text-muted-foreground">pts</span>
                  </div>
                </div>
              ))}
              {(!teams || teams.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No teams available yet
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Settings;