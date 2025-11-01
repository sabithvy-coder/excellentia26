import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "lucide-react";

const News = () => {
  const { data: newsItems, isLoading } = useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Latest News
      </h1>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading news...</div>
      ) : newsItems && newsItems.length > 0 ? (
        <div className="max-w-4xl mx-auto space-y-8">
          {newsItems.map((news) => (
            <article
              key={news.id}
              className="bg-card border border-border rounded-lg p-8 hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Calendar className="w-4 h-4" />
                <time dateTime={news.created_at}>
                  {new Date(news.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
              <h2 className="text-2xl font-bold mb-4">{news.title}</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {news.content}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">No news updates yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
};

export default News;