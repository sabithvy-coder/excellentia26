import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentFestival } from "@/hooks/useFestival";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const VerifyPosters = () => {
  const { data: festival } = useCurrentFestival();
  const festivalId = festival?.id;
  const festivalYear = festival?.year;
  const [verificationDialog, setVerificationDialog] = useState<{
    open: boolean;
    results: any;
    loading: boolean;
  }>({ open: false, results: null, loading: false });

  const { data: results, isLoading } = useQuery({
    queryKey: ["results-with-posters", festivalId],
    enabled: !!festivalId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("results")
        .select(`
          *,
          programs (name)
        `)
        .eq("festival_id", festivalId!)
        .not("poster_urls", "is", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const verifyPosters = async (resultId: string, programName: string) => {
    setVerificationDialog({ open: true, results: null, loading: true });
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-result-posters', {
        body: { resultId }
      });

      if (error) throw error;

      setVerificationDialog({ open: true, results: data, loading: false });

      if (data.summary.mismatches > 0) {
        toast.error(`Found ${data.summary.mismatches} discrepancy(ies) in posters for ${programName}!`);
      } else if (data.summary.errors > 0) {
        toast.warning(`Verification completed with ${data.summary.errors} error(s) for ${programName}`);
      } else {
        toast.success(`All posters match database records for ${programName}!`);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationDialog({ open: false, results: null, loading: false });
      toast.error("Failed to verify posters");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Poster Verification
          </CardTitle>
          <CardDescription>
            Use AI to automatically verify that poster images match the result data in the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {results && results.length > 0 ? (
              results.map((result) => (
                <div
                  key={result.id}
                  className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-muted rounded-lg"
                >
                  <div className="space-y-2 flex-1">
                    <div className="font-bold text-lg">
                      {result.programs?.name || "Unknown Program"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Result #{result.result_number}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="font-semibold">🥇 First:</span> {result.first_place_name}
                      </div>
                      <div>
                        <span className="font-semibold">🥈 Second:</span> {result.second_place_name}
                      </div>
                      <div>
                        <span className="font-semibold">🥉 Third:</span> {result.third_place_name}
                      </div>
                    </div>
                    <div className="text-primary flex items-center gap-1 mt-2">
                      <CheckCircle2 className="w-4 h-4" />
                      {result.poster_urls?.length || 0} poster(s) to verify
                    </div>
                  </div>
                  <Button
                    onClick={() => verifyPosters(result.id, result.programs?.name || "Unknown")}
                    className="w-full md:w-auto"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Verify with AI
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">No results with posters found</p>
                <p className="text-sm text-muted-foreground">
                  Add results with poster images to verify them using AI
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={verificationDialog.open} onOpenChange={(open) => setVerificationDialog({ ...verificationDialog, open })}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Verification Results
            </DialogTitle>
            <DialogDescription>
              AI-powered analysis comparing posters with database records
            </DialogDescription>
          </DialogHeader>
          
          {verificationDialog.loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg font-medium mb-2">Analyzing posters with AI...</p>
              <p className="text-sm text-muted-foreground">This may take a few moments</p>
            </div>
          ) : verificationDialog.results && (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Program: {verificationDialog.results.programName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-background p-3 rounded">
                    <span className="font-medium block mb-1">Total Posters</span>
                    <span className="text-2xl font-bold">{verificationDialog.results.summary.total}</span>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950 p-3 rounded">
                    <span className="font-medium block mb-1 text-green-700 dark:text-green-300">Matches</span>
                    <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {verificationDialog.results.summary.matches}
                    </span>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950 p-3 rounded">
                    <span className="font-medium block mb-1 text-red-700 dark:text-red-300">Mismatches</span>
                    <span className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {verificationDialog.results.summary.mismatches}
                    </span>
                  </div>
                </div>
              </div>

              {verificationDialog.results.verificationResults.map((result: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {result.status === 'match' ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    ) : result.status === 'mismatch' ? (
                      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        Poster {index + 1}
                        {result.status === 'match' && (
                          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                            Verified ✓
                          </span>
                        )}
                        {result.status === 'mismatch' && (
                          <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-1 rounded">
                            Issues Found
                          </span>
                        )}
                      </h4>
                      <img 
                        src={result.posterUrl} 
                        alt={`Poster ${index + 1}`} 
                        className="w-full max-w-2xl rounded-lg mb-4 border"
                      />
                      <div className="space-y-3">
                        <div className="bg-muted p-3 rounded">
                          <p className="text-sm font-medium text-muted-foreground mb-2">AI Analysis:</p>
                          <p className="text-sm whitespace-pre-line">{result.aiFindings}</p>
                        </div>
                        {result.discrepancies.length > 0 && (
                          <div className={`p-3 rounded ${
                            result.status === 'match' 
                              ? 'bg-green-50 dark:bg-green-950' 
                              : 'bg-red-50 dark:bg-red-950'
                          }`}>
                            <p className="text-sm font-medium mb-2">
                              {result.status === 'match' ? 'Verification Status:' : 'Discrepancies Found:'}
                            </p>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {result.discrepancies.map((disc: string, i: number) => (
                                <li 
                                  key={i} 
                                  className={result.status === 'match' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}
                                >
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
    </>
  );
};

export default VerifyPosters;
