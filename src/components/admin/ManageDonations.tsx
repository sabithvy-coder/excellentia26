import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Heart, TrendingUp } from "lucide-react";
import { format } from "date-fns";

const ManageDonations = () => {
  const { data: donations, isLoading } = useQuery({
    queryKey: ["donations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const totalDonations = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
  const completedDonations = donations?.filter(d => d.status === "completed").length || 0;

  if (isLoading) {
    return <div className="text-center py-8">Loading donations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Donations</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              ₹{(totalDonations / 100).toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
              {completedDonations}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Donors</CardDescription>
            <CardTitle className="text-3xl">
              {donations?.length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Donation History</CardTitle>
          <CardDescription>View all donations received</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Donor Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations?.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>
                      {format(new Date(donation.created_at), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>{donation.donor_name || "Anonymous"}</TableCell>
                    <TableCell className="font-semibold">
                      ₹{(donation.amount / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {donation.payment_id || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          donation.status === "completed"
                            ? "default"
                            : donation.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {donation.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {!donations || donations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No donations yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageDonations;
