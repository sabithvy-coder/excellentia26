import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const TermsConditions = () => {
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
            <CardTitle className="text-3xl">Terms and Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Welcome to Excellentia Arts Fiesta. By accessing and using our platform, you agree to comply with and be 
              bound by the following terms and conditions.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h3>
              <p>
                By making a donation or participating in our events, you acknowledge that you have read, understood, and 
                agree to be bound by these terms and conditions.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">2. Donations</h3>
              <p>
                All donations made through our platform are voluntary contributions to support Excellentia Arts Fiesta 
                and its cultural programs. Donations are used to organize events, support artists, and enhance event experiences.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">3. Payment Processing</h3>
              <p>
                All payments are processed securely through Razorpay. We do not store your payment card details. 
                By making a payment, you agree to Razorpay's terms and conditions.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">4. Event Participation</h3>
              <p>
                Participants must follow event rules and guidelines. The organizers reserve the right to refuse entry 
                or remove participants who violate event policies.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">5. Intellectual Property</h3>
              <p>
                All content on this platform, including text, images, logos, and designs, is the property of Excellentia 
                Arts Fiesta and is protected by copyright laws.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">6. Limitation of Liability</h3>
              <p>
                Excellentia Arts Fiesta shall not be liable for any direct, indirect, incidental, or consequential damages 
                arising from the use of our platform or participation in our events.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">7. Changes to Terms</h3>
              <p>
                We reserve the right to modify these terms and conditions at any time. Continued use of our platform 
                constitutes acceptance of any changes.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Contact Information</h3>
              <p>
                For questions about these terms, please contact us at:<br />
                Email: sabithvy10@gmail.com<br />
                Phone: +91 8590307346
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

export default TermsConditions;
