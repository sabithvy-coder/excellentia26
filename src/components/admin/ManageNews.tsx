import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentFestival } from "@/hooks/useFestival";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Edit } from "lucide-react";

const ManageNews = () => {
  const { data: festival } = useCurrentFestival();
  const festivalId = festival?.id;
  const festivalYear = festival?.year;
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");

  const { data: newsItems } = useQuery({
    queryKey: ["news", festivalId],
    enabled: !!festivalId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("festival_id", festivalId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addNewsMutation = useMutation({
    mutationFn: async (newsData: any) => {
      if (editingId) {
        const { error } = await supabase.from("news").update(newsData).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("news")
          .insert({ ...newsData, festival_id: festivalId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
      toast.success(editingId ? "News updated successfully!" : "News added successfully!");
      setTitle("");
      setContent("");
      setImageUrl("");
      setLinkUrl("");
      setEditingId(null);
    },
    onError: () => {
      toast.error(editingId ? "Failed to update news" : "Failed to add news");
    },
  });

  const deleteNewsMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
      toast.success("News deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete news");
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `news-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("gallery")
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (news: any) => {
    setTitle(news.title);
    setContent(news.content);
    setImageUrl(news.image_url || "");
    setLinkUrl(news.link_url || "");
    setEditingId(news.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error("Title and content are required");
      return;
    }
    addNewsMutation.mutate({ title, content, image_url: imageUrl || null, link_url: linkUrl || null });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {editingId ? "Edit News Update" : "Add News Update"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter news title"
              />
            </div>
            <div>
              <Label>Content *</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter news content"
                rows={6}
              />
            </div>
            <div>
              <Label>Image Source Method (Optional)</Label>
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
                <Label>Upload Image</Label>
                <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
              </div>
            ) : (
              <div>
                <Label>Image URL</Label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            )}
            <div>
              <Label>Link URL (Optional)</Label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            {imageUrl && (
              <div className="border rounded-lg overflow-hidden">
                <img src={imageUrl} alt="Preview" className="w-full h-48 object-cover" />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={addNewsMutation.isPending}>
              {addNewsMutation.isPending 
                ? (editingId ? "Updating..." : "Adding...") 
                : (editingId ? "Update News" : "Add News")}
            </Button>
            {editingId && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  setEditingId(null);
                  setTitle("");
                  setContent("");
                  setImageUrl("");
                  setLinkUrl("");
                }}
              >
                Cancel Edit
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent News</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {newsItems && newsItems.length > 0 ? (
              newsItems.map((news) => (
                <div key={news.id} className="p-4 bg-muted rounded-lg">
                  {news.image_url && (
                    <img src={news.image_url} alt={news.title} className="w-full h-32 object-cover rounded-lg mb-2" />
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold">{news.title}</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(news)}
                      >
                        <Edit className="w-4 h-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNewsMutation.mutate(news.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{news.content}</p>
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(news.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No news yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageNews;
