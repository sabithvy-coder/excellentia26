import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, LayoutDashboard, Bell, DollarSign, Trophy, Calendar, Newspaper, Image as ImageIcon, Video, Settings as SettingsIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import AdminWelcome from "@/components/admin/AdminWelcome";
import AddResult from "@/components/admin/AddResult";
import ManagePrograms from "@/components/admin/ManagePrograms";
import ManageNews from "@/components/admin/ManageNews";
import ManageGallery from "@/components/admin/ManageGallery";
import ManageVideos from "@/components/admin/ManageVideos";
import ManageResults from "@/components/admin/ManageResults";
import ManageStudents from "@/components/admin/ManageStudents";
import Notifications from "@/components/admin/Notifications";
import Settings from "@/components/admin/Settings";
import ManageDonations from "@/components/admin/ManageDonations";
import VerifyPosters from "@/components/admin/VerifyPosters";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const menuItems = [
    { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { value: "notifications", label: "Notifications", icon: Bell },
    { value: "donations", label: "Donations", icon: DollarSign },
    { value: "verify-posters", label: "AI Verify", icon: Sparkles },
    { value: "results", label: "Results", icon: Trophy },
    { value: "programs", label: "Programs", icon: Calendar },
    { value: "news", label: "News", icon: Newspaper },
    { value: "gallery", label: "Gallery", icon: ImageIcon },
    { value: "videos", label: "Videos", icon: Video },
    { value: "settings", label: "Settings", icon: SettingsIcon },
  ];

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/admin");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast.error("Access denied");
        await supabase.auth.signOut();
        navigate("/admin");
        return;
      }

      setIsAuthenticated(true);
      setLoading(false);
    };

    checkAdminAccess();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                  <DrawerTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Admin Menu</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 space-y-2">
                      {menuItems.map((item) => (
                        <DrawerClose key={item.value} asChild>
                          <Button
                            variant={activeTab === item.value ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setActiveTab(item.value)}
                          >
                            <item.icon className="w-4 h-4 mr-2" />
                            {item.label}
                          </Button>
                        </DrawerClose>
                      ))}
                    </div>
                  </DrawerContent>
                </Drawer>
              )}
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
            <Button variant="outline" onClick={handleLogout} size={isMobile ? "sm" : "default"}>
              <LogOut className="w-4 h-4 mr-2" />
              {!isMobile && "Logout"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {!isMobile && (
            <TabsList className="grid w-full grid-cols-5 md:grid-cols-10 max-w-7xl mx-auto">
              {menuItems.map((item) => (
                <TabsTrigger key={item.value} value={item.value} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 hidden md:inline" />
                  <span className="hidden md:inline">{item.label}</span>
                  <span className="md:hidden text-xs">{item.label.slice(0, 4)}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          )}

          <TabsContent value="dashboard">
            <AdminWelcome />
          </TabsContent>

          <TabsContent value="notifications">
            <Notifications />
          </TabsContent>

          <TabsContent value="donations">
            <ManageDonations />
          </TabsContent>

          <TabsContent value="verify-posters">
            <VerifyPosters />
          </TabsContent>

          <TabsContent value="results">
            <div className="space-y-6">
              <AddResult />
              <ManageResults />
            </div>
          </TabsContent>

          <TabsContent value="programs">
            <ManagePrograms />
          </TabsContent>

          <TabsContent value="news">
            <ManageNews />
          </TabsContent>

          <TabsContent value="gallery">
            <ManageGallery />
          </TabsContent>

          <TabsContent value="videos">
            <ManageVideos />
          </TabsContent>

          <TabsContent value="settings">
            <Settings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;