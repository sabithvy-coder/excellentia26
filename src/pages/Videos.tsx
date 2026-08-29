import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Video as VideoIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useResolvedFestivalId } from "@/hooks/useFestival";

interface VideosProps {
  festivalId?: string;
  hideHeading?: boolean;
}

const Videos = ({ festivalId: explicitId, hideHeading = false }: VideosProps) => {
  const { festivalId } = useResolvedFestivalId(explicitId);

  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos", festivalId],
    enabled: !!festivalId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("festival_id", festivalId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {!hideHeading && (
          <div className="flex items-center justify-center gap-3 mb-12">
            <VideoIcon className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-center">Festival Highlights</h1>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="poly-card overflow-hidden hover:border-primary transition-colors hover:shadow-lg"
              >
                <div className="aspect-video">
                  <iframe
                    src={video.video_url}
                    title={video.title}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
                  {video.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {video.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-3">
                    {new Date(video.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <VideoIcon className="w-20 h-20 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground">No videos available yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back soon for festival highlights!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Videos;
