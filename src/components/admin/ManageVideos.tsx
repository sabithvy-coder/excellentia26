import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { useState } from "react";

const ManageVideos = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [description, setDescription] = useState("");

  const { data: videos } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addVideoMutation = useMutation({
    mutationFn: async (newVideo: {
      title: string;
      video_url: string;
      thumbnail_url?: string;
      description?: string;
    }) => {
      const { error } = await supabase.from("videos").insert(newVideo);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast.success("Video added successfully!");
      setTitle("");
      setVideoUrl("");
      setThumbnailUrl("");
      setDescription("");
    },
    onError: () => {
      toast.error("Failed to add video");
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("videos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast.success("Video deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete video");
    },
  });

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      toast.error("Please fill in required fields");
      return;
    }
    addVideoMutation.mutate({
      title,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl || undefined,
      description: description || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Video
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddVideo} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Festival Highlights 2024"
                required
              />
            </div>
            <div>
              <Label htmlFor="videoUrl">Video URL * (YouTube, Vimeo, etc.)</Label>
              <Input
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/embed/..."
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                For YouTube: Use embed URL (youtube.com/embed/VIDEO_ID)
              </p>
            </div>
            <div>
              <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
              <Input
                id="thumbnailUrl"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the video..."
                rows={3}
              />
            </div>
            <Button type="submit" disabled={addVideoMutation.isPending}>
              {addVideoMutation.isPending ? "Adding..." : "Add Video"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Videos ({videos?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {videos?.map((video) => (
              <div
                key={video.id}
                className="flex items-start gap-4 p-4 border rounded-lg"
              >
                {video.thumbnail_url && (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-32 h-20 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{video.title}</h3>
                  {video.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {video.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(video.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteVideoMutation.mutate(video.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {(!videos || videos.length === 0) && (
              <p className="text-center text-muted-foreground py-8">
                No videos added yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageVideos;
