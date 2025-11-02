import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
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
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              At Excellentia Arts Fiesta, we are committed to protecting your privacy and ensuring the security of your 
              personal information. This Privacy Policy explains how we collect, use, and safeguard your data.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">1. Information We Collect</h3>
              <p>We may collect the following types of information:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Name and contact information (email, phone number)</li>
                <li>Payment information (processed securely through Razorpay)</li>
                <li>Event registration and participation details</li>
                <li>Communication preferences</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">2. How We Use Your Information</h3>
              <p>We use your information for the following purposes:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Processing donations and payments</li>
                <li>Managing event registrations and participation</li>
                <li>Sending event updates and announcements</li>
                <li>Improving our services and user experience</li>
                <li>Complying with legal obligations</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">3. Payment Security</h3>
              <p>
                All payment transactions are processed through Razorpay, a secure payment gateway. We do not store 
                your credit card or banking information on our servers. Razorpay uses industry-standard encryption 
                to protect your financial data.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">4. Data Sharing</h3>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share information 
                with trusted service providers who assist us in operating our platform and conducting events, but 
                only to the extent necessary for those purposes.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">5. Data Protection</h3>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal 
                information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">6. Cookies and Tracking</h3>
              <p>
                Our website may use cookies and similar technologies to enhance user experience, analyze site usage, 
                and assist in our marketing efforts. You can control cookie settings through your browser preferences.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">7. Your Rights</h3>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Access your personal information we hold</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">8. Children's Privacy</h3>
              <p>
                Our services are not directed to individuals under the age of 13. We do not knowingly collect 
                personal information from children. If you believe we have collected information from a child, 
                please contact us immediately.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">9. Changes to Privacy Policy</h3>
              <p>
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with 
                an updated revision date. We encourage you to review this policy periodically.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">10. Contact Us</h3>
              <p>
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <p className="mt-2">
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

export default PrivacyPolicy;
