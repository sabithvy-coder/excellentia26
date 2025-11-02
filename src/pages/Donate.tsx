import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Donate = () => {
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Load Razorpay checkout script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleDonate = async () => {
    if (!amount || parseInt(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!window.Razorpay) {
      toast.error("Payment system is loading. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const amountInPaise = parseInt(amount) * 100;

      const options = {
        key: "rzp_live_RalCj3UqJFYX6k",
        amount: amountInPaise,
        currency: "INR",
        name: "Excellentia Arts Fiesta",
        description: "Donation",
        handler: async function (response: any) {
          try {
            // Save donation to database
            const { error } = await supabase.from('donations').insert({
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id || null,
              amount: amountInPaise,
              donor_name: donorName || 'Anonymous',
              status: 'completed'
            });

            if (error) {
              console.error('Error saving donation:', error);
              toast.error("Payment successful but failed to record donation");
            } else {
              toast.success("✅ Payment Successful! Thank you ❤️");
            }
          } catch (err) {
            console.error('Error:', err);
            toast.error("Payment successful but failed to record donation");
          }
          
          setDonorName("");
          setAmount("");
          setLoading(false);
        },
        prefill: {
          name: donorName || "",
        },
        theme: {
          color: "#ff9900",
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Failed to open payment window. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 animate-fade-up">
          <div className="inline-flex items-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-primary animate-pulse" />
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Support Excellentia Arts Fiesta
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your generous contribution helps us celebrate art, culture, and talent. 
            Every donation brings us closer to creating unforgettable moments!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Why Donate?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>✨ Support emerging artists and performers</p>
              <p>🎭 Help organize grand cultural programs</p>
              <p>🏆 Provide better prizes and recognition</p>
              <p>🎨 Enhance event infrastructure and facilities</p>
              <p>💫 Create memorable experiences for participants</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-lg bg-gradient-to-br from-primary/5 to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Make a Difference
              </CardTitle>
              <CardDescription>Every contribution counts!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name (Optional)</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Donation Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {[100, 500, 1000, 2000].map((value) => (
                  <Button
                    key={value}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(value.toString())}
                  >
                    ₹{value}
                  </Button>
                ))}
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={handleDonate}
                disabled={loading}
              >
                {loading ? "Processing..." : "Donate Now"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Secure payment powered by Razorpay
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold mb-3">Together, We Create Magic! ✨</h3>
              <p className="text-muted-foreground mb-4">
                Join hundreds of supporters who believe in celebrating art and culture. 
                Your donation, big or small, makes a real impact!
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Button variant="outline" onClick={() => navigate("/")}>
                  Back to Home
                </Button>
                <Button variant="outline" onClick={() => navigate("/about")}>
                  Learn More About Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 border-t border-border pt-8">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
            <div className="space-y-2 text-muted-foreground">
              <p>Email: sabithvy10@gmail.com</p>
              <p>Phone: +91 8590307346</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <button 
              onClick={() => window.open("/shipping-policy", "_blank")}
              className="hover:text-primary transition-colors"
            >
              Shipping Policy
            </button>
            <span>•</span>
            <button 
              onClick={() => window.open("/terms-conditions", "_blank")}
              className="hover:text-primary transition-colors"
            >
              Terms and Conditions
            </button>
            <span>•</span>
            <button 
              onClick={() => window.open("/refund-policy", "_blank")}
              className="hover:text-primary transition-colors"
            >
              Refund Policy
            </button>
            <span>•</span>
            <button 
              onClick={() => window.open("/privacy-policy", "_blank")}
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
