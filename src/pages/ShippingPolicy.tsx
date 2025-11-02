import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const ShippingPolicy = () => {
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
            <CardTitle className="text-3xl">Shipping Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Excellentia Arts Fiesta is a cultural event and donation platform. As we provide event services and accept donations, 
              there are no physical products shipped to donors or participants.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Digital Confirmations</h3>
              <p>
                All donation confirmations and event-related communications will be sent via email to the address provided 
                during the transaction.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Event Materials</h3>
              <p>
                Any event-related materials, certificates, or prizes will be distributed during the event or as per the 
                event schedule announced on our platform.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Contact Us</h3>
              <p>For any queries regarding our services, please contact us at:</p>
              <p className="mt-2">
                Email: sabithvy10@gmail.com<br />
                Phone: +91 8590307346
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShippingPolicy;
