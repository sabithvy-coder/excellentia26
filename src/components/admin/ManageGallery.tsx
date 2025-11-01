import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Trash2 } from "lucide-react";

const ManageGallery = () => {
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: images } = useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addImageMutation = useMutation({
    mutationFn: async (imageData: any) => {
      const { error } = await supabase.from("gallery").insert(imageData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      toast.success("Image added successfully!");
      setImageUrl("");
      setCaption("");
    },
    onError: () => {
      toast.error("Failed to add image");
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      toast.success("Image deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete image");
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("gallery")
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      toast.error("Image URL is required");
      return;
    }
    addImageMutation.mutate({ image_url: imageUrl, caption });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Add Gallery Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Upload Image *</Label>
              <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
              {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
            </div>
            <div>
              <Label>Caption (Optional)</Label>
              <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Enter image caption"
              />
            </div>
            {imageUrl && (
              <div className="border rounded-lg overflow-hidden">
                <img src={imageUrl} alt="Preview" className="w-full h-48 object-cover" />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={addImageMutation.isPending || !imageUrl}>
              {addImageMutation.isPending ? "Adding..." : "Add to Gallery"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gallery Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
            {images && images.length > 0 ? (
              images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.image_url}
                    alt={image.caption || "Gallery"}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteImageMutation.mutate(image.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  {image.caption && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{image.caption}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4 col-span-2">No images yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageGallery;