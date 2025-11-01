import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Settings as SettingsIcon } from "lucide-react";

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

        {/* Grade Points Information */}
        <div className="p-4 border rounded-lg space-y-3">
          <Label className="text-base font-medium">Grade to Points Mapping</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { grade: "A+", points: 10 },
              { grade: "A", points: 9 },
              { grade: "A-", points: 8 },
              { grade: "B+", points: 7 },
              { grade: "B", points: 6 },
              { grade: "B-", points: 5 },
              { grade: "C+", points: 4 },
              { grade: "C", points: 3 },
              { grade: "C-", points: 2 },
              { grade: "D", points: 1 },
            ].map((item) => (
              <div key={item.grade} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="font-bold">{item.grade}</span>
                <span className="text-sm text-muted-foreground">{item.points} pts</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Points are automatically calculated based on grades and only visible to admins.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Settings;