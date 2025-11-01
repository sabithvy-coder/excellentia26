import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Settings as SettingsIcon, Trophy } from "lucide-react";

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

  const toggleTeamStandings = () => {
    updateSettingMutation.mutate({
      key: "team_standings_visible",
      value: !teamStandingsVisible,
    });
  };

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

          {/* Team Points List */}
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <Label className="text-base font-medium">Current Team Standings</Label>
            </div>
            <div className="space-y-2">
              {teams?.map((team, index) => (
                <div 
                  key={team.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{team.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">{team.points}</span>
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