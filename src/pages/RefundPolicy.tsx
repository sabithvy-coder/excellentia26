import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const RefundPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Refund and Cancellation Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Refund Policy</h3>
              <p>
                All donations made to Excellentia Arts Fiesta are final and non-refundable. By making a donation, 
                you acknowledge and agree to this no-refund policy.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Why We Have This Policy</h3>
              <p>
                Donations are voluntary contributions made to support our cultural events and programs. These funds 
                are immediately allocated to event organization, artist support, infrastructure, and other event-related 
                expenses. Therefore, we are unable to process refunds for donations.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Payment Errors</h3>
              <p>
                In case of technical errors or duplicate charges during payment processing, please contact us immediately 
                with your transaction details. We will investigate and resolve genuine payment issues on a case-by-case basis.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Event Cancellations</h3>
              <p>
                In the unlikely event that Excellentia Arts Fiesta is cancelled or postponed, donated funds will be 
                used for future events or alternative cultural programs. No refunds will be issued.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Contact Us for Issues</h3>
              <p>
                If you have concerns about your donation or encounter any issues with the payment process, 
                please reach out to us:
              </p>
              <p className="mt-2">
                Email: sabithvy10@gmail.com<br />
                Phone: +91 8590307346
              </p>
            </div>

            <div className="bg-primary/10 p-4 rounded-lg mt-6">
              <p className="font-semibold text-foreground">
                Important Note:
              </p>
              <p>
                By proceeding with a donation, you confirm that you have read and understood this refund policy 
                and agree to make a non-refundable contribution to Excellentia Arts Fiesta.
              </p>
            </div>

            <p className="text-sm pt-4">
              Last Updated: November 2025
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RefundPolicy;
