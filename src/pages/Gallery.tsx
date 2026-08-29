import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ImageIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReportDialog from "@/components/ReportDialog";
import { toast } from "sonner";
import { useResolvedFestivalId } from "@/hooks/useFestival";

interface GalleryProps {
  festivalId?: string;
  readOnly?: boolean;
  hideHeading?: boolean;
}

const Gallery = ({ festivalId: explicitId, readOnly = false, hideHeading = false }: GalleryProps) => {
  const { festivalId } = useResolvedFestivalId(explicitId);

  const { data: images, isLoading } = useQuery({
    queryKey: ["gallery", festivalId],
    enabled: !!festivalId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .eq("festival_id", festivalId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleDownload = async (imageUrl: string, caption: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = caption || "gallery-image";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {!hideHeading && (
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Event Gallery
        </h1>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading gallery...</div>
      ) : images && images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image) => (
            <div
              key={image.id}
              className="poly-card overflow-hidden hover:border-primary transition-colors group"
            >
              {image.link_url ? (
                <a href={image.link_url} target="_blank" rel="noopener noreferrer">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={image.image_url}
                      alt={image.caption || "Gallery image"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </a>
              ) : (
                <div className="aspect-square overflow-hidden">
                  <img
                    src={image.image_url}
                    alt={image.caption || "Gallery image"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-4 space-y-2">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDownload(image.image_url, image.caption || "image")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  {!readOnly && <ReportDialog type="gallery" itemId={image.id} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-xl text-muted-foreground">
            No images in the gallery yet. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
};

export default Gallery;
