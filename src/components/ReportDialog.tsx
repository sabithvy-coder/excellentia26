import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Flag } from "lucide-react";

interface ReportDialogProps {
  type: "gallery" | "news" | "result";
  itemId: string;
  trigger?: React.ReactNode;
}

const ReportDialog = ({ type, itemId, trigger }: ReportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [reporterName, setReporterName] = useState("");
  const [issue, setIssue] = useState("");
  const queryClient = useQueryClient();

  const reportMutation = useMutation({
    mutationFn: async () => {
      const reportData: any = {
        reporter_name: reporterName,
        issue,
      };

      if (type === "gallery") {
        reportData.gallery_id = itemId;
      } else if (type === "news") {
        reportData.news_id = itemId;
      } else {
        reportData.result_id = itemId;
      }

      const { error } = await supabase.from("reports").insert(reportData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report submitted successfully!");
      setOpen(false);
      setReporterName("");
      setIssue("");
    },
    onError: () => {
      toast.error("Failed to submit report");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterName.trim() || !issue.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    reportMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Flag className="w-4 h-4 mr-2" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Issue</DialogTitle>
          <DialogDescription>
            Report any issues or concerns with this content.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Your Name *</Label>
            <Input
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <Label>Issue Description *</Label>
            <Textarea
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="Describe the issue"
              rows={4}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={reportMutation.isPending}>
            {reportMutation.isPending ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
