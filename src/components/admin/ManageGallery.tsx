import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentFestival } from "@/hooks/useFestival";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Trash2, Cloud } from "lucide-react";
import heic2any from "heic2any";

const ManageGallery = () => {
  const { data: festival } = useCurrentFestival();
  const festivalId = festival?.id;
  const festivalYear = festival?.year;
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
  const [googleDriveUrl, setGoogleDriveUrl] = useState("");
  const [syncing, setSyncing] = useState(false);

  const { data: images } = useQuery({
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

  const addImageMutation = useMutation({
    mutationFn: async (imageData: any) => {
      const { error } = await supabase
        .from("gallery")
        .insert({ ...imageData, festival_id: festivalId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      toast.success("Image added successfully!");
      setImageUrl("");
      setCaption("");
      setLinkUrl("");
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
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      toast.info(`Uploading ${files.length} images...`);

      // Process all files in parallel
      const uploadPromises = Array.from(files).map(async (file) => {
        try {
          let uploadFile: File | Blob = file;
          let fileExt = file.name.split(".").pop()?.toLowerCase();
          
          // Convert HEIC to JPEG
          if (fileExt === "heic" || fileExt === "heif") {
            try {
              const convertedBlob = await heic2any({
                blob: file,
                toType: "image/jpeg",
                quality: 0.9,
              });
              
              uploadFile = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
              fileExt = "jpg";
            } catch (conversionError) {
              console.error("HEIC conversion error:", conversionError);
              throw new Error("Failed to convert HEIC image");
            }
          }

          const fileName = `gallery-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = fileName;

          const { error: uploadError } = await supabase.storage
            .from("gallery")
            .upload(filePath, uploadFile, { upsert: true });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("gallery")
            .getPublicUrl(filePath);

          // Add to gallery table
          const { error: insertError } = await supabase
            .from("gallery")
            .insert({ image_url: publicUrl, caption: file.name.replace(/\.[^/.]+$/, ''), link_url: null, festival_id: festivalId });

          if (insertError) throw insertError;

          successCount++;
        } catch (error: any) {
          console.error(`Upload error for ${file.name}:`, error);
          errorCount++;
        }
      });

      await Promise.all(uploadPromises);

      if (errorCount > 0) {
        toast.warning(`Upload completed: ${successCount} successful, ${errorCount} failed`);
      } else {
        toast.success(`Successfully uploaded ${successCount} images!`);
      }

      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      setImageUrl("");
      setCaption("");
      setLinkUrl("");
      
      // Reset file input
      e.target.value = "";
    } catch (error: any) {
      console.error("Bulk upload error:", error);
      toast.error("Failed to upload images");
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
    addImageMutation.mutate({ image_url: imageUrl, caption, link_url: linkUrl || null });
  };

  const handleGoogleDriveSync = async () => {
    if (!googleDriveUrl.trim()) {
      toast.error("Please enter a Google Drive folder URL");
      return;
    }

    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-google-drive-gallery', {
        body: { folderUrl: googleDriveUrl }
      });

      if (error) throw error;

      if (data.errorCount > 0) {
        toast.warning(data.message, {
          description: `${data.successCount} images uploaded successfully, ${data.errorCount} failed`
        });
      } else {
        toast.success(data.message);
      }
      
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      setGoogleDriveUrl("");
    } catch (error: any) {
      console.error("Google Drive sync error:", error);
      toast.error(error.message || "Failed to sync from Google Drive");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Sync from Google Drive
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Google Drive Folder URL</Label>
              <Input
                value={googleDriveUrl}
                onChange={(e) => setGoogleDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                disabled={syncing}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Paste a shared Google Drive folder link. All images will be automatically uploaded to the gallery.
              </p>
            </div>
            <Button 
              onClick={handleGoogleDriveSync} 
              disabled={syncing || !googleDriveUrl.trim()}
              className="w-full"
            >
              {syncing ? "Syncing..." : "Sync from Google Drive"}
            </Button>
          </div>
        </CardContent>
      </Card>

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
              <Label>Image Source Method *</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="file"
                    checked={uploadMethod === "file"}
                    onChange={(e) => {
                      setUploadMethod(e.target.value as "file");
                      setImageUrl("");
                    }}
                  />
                  <span>Upload File</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="url"
                    checked={uploadMethod === "url"}
                    onChange={(e) => {
                      setUploadMethod(e.target.value as "url");
                      setImageUrl("");
                    }}
                  />
                  <span>Paste URL</span>
                </label>
              </div>
            </div>
            {uploadMethod === "file" ? (
              <div>
                <Label>Upload Images * (Multiple files supported)</Label>
                <Input 
                  type="file" 
                  accept="image/*,.heic,.heif" 
                  onChange={handleFileUpload} 
                  disabled={uploading}
                  multiple
                />
                {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading images...</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  Select multiple images to upload them all at once. No limit on number of files.
                </p>
              </div>
            ) : (
              <div>
                <Label>Image URL *</Label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            )}
            <div>
              <Label>Caption (Optional)</Label>
              <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Enter image caption"
              />
            </div>
            <div>
              <Label>Link URL (Optional)</Label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            {uploadMethod === "url" && (
              <>
                {imageUrl && (
                  <div className="border rounded-lg overflow-hidden">
                    <img src={imageUrl} alt="Preview" className="w-full h-48 object-cover" />
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={addImageMutation.isPending || !imageUrl}>
                  {addImageMutation.isPending ? "Adding..." : "Add to Gallery"}
                </Button>
              </>
            )}
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
    </div>
  );
};

export default ManageGallery;
