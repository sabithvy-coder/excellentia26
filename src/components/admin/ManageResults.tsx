import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, Trophy, Image as ImageIcon, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const queryClient = useQueryClient();
  const [verificationDialog, setVerificationDialog] = useState<{
    open: boolean;
    results: any;
    loading: boolean;
  }>({ open: false, results: null, loading: false });

  const { data: results } = useQuery({
    queryKey: ["results-with-details"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("results")
        .select(`
          *,
          programs (name)
        `)
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

  const verifyPosters = async (resultId: string) => {
    setVerificationDialog({ open: true, results: null, loading: true });
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-result-posters', {
        body: { resultId }
      });

      if (error) throw error;

      setVerificationDialog({ open: true, results: data, loading: false });

      if (data.summary.mismatches > 0) {
        toast.error(`Found ${data.summary.mismatches} discrepancy(ies) in posters!`);
      } else if (data.summary.errors > 0) {
        toast.warning(`Verification completed with ${data.summary.errors} error(s)`);
      } else {
        toast.success("All posters match the database records!");
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationDialog({ open: false, results: null, loading: false });
      toast.error("Failed to verify posters");
    }
  };

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
                   {result.poster_urls && result.poster_urls.length > 0 && (
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => verifyPosters(result.id)}
                       title="Verify posters with AI"
                     >
                       <CheckCircle2 className="w-4 h-4 text-primary" />
                     </Button>
                   )}
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

      <Dialog open={verificationDialog.open} onOpenChange={(open) => setVerificationDialog({ ...verificationDialog, open })}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Poster Verification Results</DialogTitle>
            <DialogDescription>
              AI-powered analysis comparing posters with database records
            </DialogDescription>
          </DialogHeader>
          
          {verificationDialog.loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Analyzing posters with AI...</p>
            </div>
          ) : verificationDialog.results && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Program: {verificationDialog.results.programName}</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Posters:</span> {verificationDialog.results.summary.total}
                  </div>
                  <div className="text-green-600">
                    <span className="font-medium">Matches:</span> {verificationDialog.results.summary.matches}
                  </div>
                  <div className="text-red-600">
                    <span className="font-medium">Mismatches:</span> {verificationDialog.results.summary.mismatches}
                  </div>
                </div>
              </div>

              {verificationDialog.results.verificationResults.map((result: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {result.status === 'match' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    ) : result.status === 'mismatch' ? (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">Poster {index + 1}</h4>
                      <img 
                        src={result.posterUrl} 
                        alt={`Poster ${index + 1}`} 
                        className="w-full max-w-md rounded-lg mb-3"
                      />
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">AI Analysis:</p>
                          <p className="text-sm whitespace-pre-line">{result.aiFindings}</p>
                        </div>
                        {result.discrepancies.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              {result.status === 'match' ? 'Status:' : 'Discrepancies Found:'}
                            </p>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {result.discrepancies.map((disc: string, i: number) => (
                                <li key={i} className={result.status === 'match' ? 'text-green-600' : 'text-red-600'}>
                                  {disc}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ManageResults;
