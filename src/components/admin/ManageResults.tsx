import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentFestival } from "@/hooks/useFestival";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, Trophy, Image as ImageIcon, Eye, EyeOff } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import EditResult from "./EditResult";

const ManageResults = () => {
  const { data: festival } = useCurrentFestival();
  const festivalId = festival?.id;
  const festivalYear = festival?.year;
  const queryClient = useQueryClient();

  const { data: results } = useQuery({
    queryKey: ["results-with-details", festivalId],
    enabled: !!festivalId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("results")
        .select(`
          *,
          programs (name)
        `)
        .eq("festival_id", festivalId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isVisible }: { id: string; isVisible: boolean }) => {
      const { error } = await supabase
        .from("results")
        .update({ is_visible: !isVisible })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results-with-details"] });
      queryClient.invalidateQueries({ queryKey: ["results"] });
      toast.success("Visibility updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update visibility");
    },
  });

  const deleteResultMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("results").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results-with-details"] });
      queryClient.invalidateQueries({ queryKey: ["results"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Result deleted and points reversed successfully!");
    },
    onError: () => {
      toast.error("Failed to delete result");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Manage Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {results && results.length > 0 ? (
            results.map((result) => (
              <div
                key={result.id}
                className="flex justify-between items-start p-4 bg-muted rounded-lg"
              >
                  <div className="space-y-2">
                    <div className="font-bold text-lg">
                      {result.programs?.name || "Unknown Program"} - Result #{result.result_number}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="font-semibold">🥇 First:</span> {result.first_place_name} ({result.first_place_grade}) - {result.first_place_points} pts
                      </div>
                      <div>
                        <span className="font-semibold">🥈 Second:</span> {result.second_place_name} ({result.second_place_grade}) - {result.second_place_points} pts
                      </div>
                      <div>
                        <span className="font-semibold">🥉 Third:</span> {result.third_place_name} ({result.third_place_grade}) - {result.third_place_points} pts
                      </div>
                      {result.additional_grades && Array.isArray(result.additional_grades) && result.additional_grades.length > 0 && (
                        <div className="text-muted-foreground">
                          +{result.additional_grades.length} additional grade(s)
                        </div>
                      )}
                      {result.poster_urls && Array.isArray(result.poster_urls) && result.poster_urls.length > 0 && (
                        <div className="text-primary flex items-center gap-1 mt-2">
                          <ImageIcon className="w-4 h-4" />
                          {result.poster_urls.length} poster(s) uploaded
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Added: {new Date(result.created_at).toLocaleString()}
                    </div>
                  </div>
                 <div className="flex gap-2">
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => toggleVisibilityMutation.mutate({ id: result.id, isVisible: result.is_visible })}
                     title={result.is_visible ? "Hide result" : "Show result"}
                   >
                     {result.is_visible ? (
                       <Eye className="w-4 h-4 text-primary" />
                     ) : (
                       <EyeOff className="w-4 h-4 text-muted-foreground" />
                     )}
                   </Button>
                   <EditResult result={result} />
                   <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Result?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete the result and automatically reverse all points awarded to teams and students. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteResultMutation.mutate(result.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">No results yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ManageResults;
