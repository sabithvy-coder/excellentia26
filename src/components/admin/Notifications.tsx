import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Bell, CheckCircle, XCircle } from "lucide-react";
import EditResult from "./EditResult";
import { useState } from "react";

const Notifications = () => {
  const queryClient = useQueryClient();
  const [editingResult, setEditingResult] = useState<any>(null);
  const [resolvingReportId, setResolvingReportId] = useState<string | null>(null);

  const { data: resultRequests } = useQuery({
    queryKey: ["result-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("result_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: reports } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*, result:results(*, program:programs(*))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleResolveReport = async (report: any) => {
    if (!report.result_id) {
      toast.error("No result associated with this report");
      return;
    }
    
    setResolvingReportId(report.id);
    setEditingResult(report.result);
  };

  const handleEditComplete = () => {
    if (resolvingReportId) {
      updateReportMutation.mutate({ id: resolvingReportId, status: "resolved" });
    }
    setEditingResult(null);
    setResolvingReportId(null);
  };

  const handleEditCancel = () => {
    setEditingResult(null);
    setResolvingReportId(null);
  };

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("result_requests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["result-requests"] });
      toast.success("Request updated");
    },
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("reports")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report updated");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="requests">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="requests">
              Result Requests ({resultRequests?.filter((r) => r.status === "pending").length || 0})
            </TabsTrigger>
            <TabsTrigger value="reports">
              Reports ({reports?.filter((r) => r.status === "pending").length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            {resultRequests && resultRequests.length > 0 ? (
              resultRequests.map((request) => (
                <div
                  key={request.id}
                  className={`p-4 rounded-lg border ${
                    request.status === "pending" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold">{request.program_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Requested by: {request.requester_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(request.created_at).toLocaleString()}
                      </p>
                      <p className="text-sm mt-2">Status: {request.status}</p>
                    </div>
                    {request.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateRequestMutation.mutate({ id: request.id, status: "ignored" })
                          }
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Ignore
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            updateRequestMutation.mutate({ id: request.id, status: "completed" })
                          }
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Complete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No result requests</p>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            {reports && reports.length > 0 ? (
              reports.map((report: any) => (
                <div
                  key={report.id}
                  className={`p-4 rounded-lg border ${
                    report.status === "pending" ? "border-destructive bg-destructive/5" : "border-border"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold">
                        Issue with: {report.result?.program?.name || "Unknown Program"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Reported by: {report.reporter_name}
                      </p>
                      <p className="text-sm mt-2">{report.issue}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(report.created_at).toLocaleString()}
                      </p>
                      <p className="text-sm mt-2">Status: {report.status}</p>
                    </div>
                    {report.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateReportMutation.mutate({ id: report.id, status: "dismissed" })
                          }
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Dismiss
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleResolveReport(report)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolve
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No reports</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {editingResult && (
        <EditResult 
          result={editingResult}
          open={!!editingResult}
          onOpenChange={(open) => {
            if (!open) handleEditCancel();
          }}
          onSuccess={handleEditComplete}
        />
      )}
    </Card>
  );
};

export default Notifications;