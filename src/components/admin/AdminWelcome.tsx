import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

const AdminWelcome = () => {
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

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Hello, Admin! 👋
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Team Points Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teams?.map((team, index) => (
              <div 
                key={team.id} 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg hover:from-muted/70 hover:to-muted/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                    index === 0 ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" :
                    index === 1 ? "bg-gray-400/20 text-gray-600 dark:text-gray-400" :
                    index === 2 ? "bg-orange-500/20 text-orange-600 dark:text-orange-400" :
                    "bg-primary/10 text-primary"
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-lg font-semibold">{team.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-primary">{team.points}</span>
                  <span className="text-sm text-muted-foreground">points</span>
                </div>
              </div>
            ))}
            {(!teams || teams.length === 0) && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No teams available yet</p>
                <p className="text-sm text-muted-foreground mt-2">Teams will appear here once results are added</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWelcome;
