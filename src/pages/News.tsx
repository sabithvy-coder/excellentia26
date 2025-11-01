import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReportDialog from "@/components/ReportDialog";

const News = () => {
  const [searchParams] = useSearchParams();
  const newsId = searchParams.get("id");
  const [expandedNews, setExpandedNews] = useState<Record<string, boolean>>({});
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

  const toggleExpanded = (id: string) => {
    setExpandedNews(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (newsId) {
      setExpandedNews(prev => ({ ...prev, [newsId]: true }));
      setTimeout(() => {
        const element = document.getElementById(`news-${newsId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }, [newsId]);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Latest News
      </h1>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading news...</div>
      ) : newsItems && newsItems.length > 0 ? (
        <div className="max-w-4xl mx-auto space-y-8">
          {newsItems.map((news) => {
            const isExpanded = expandedNews[news.id];
            const isLong = news.content.length > 300;
            const displayContent = isLong && !isExpanded 
              ? news.content.substring(0, 300) + "..." 
              : news.content;

            const isHighlighted = newsId === news.id;
            const article = (
              <article
                key={news.id}
                id={`news-${news.id}`}
                className={`bg-card border rounded-lg p-8 transition-colors ${
                  isHighlighted ? "border-primary shadow-lg" : "border-border hover:border-primary"
                }`}
              >
                {news.image_url && (
                  <img 
                    src={news.image_url} 
                    alt={news.title} 
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}
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
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line mb-4">
                  {displayContent}
                </p>
                {news.link_url && (
                  <a 
                    href={news.link_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Read More →
                  </a>
                )}
                {isLong && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(news.id)}
                    className="flex items-center gap-2"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Read less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Read more
                      </>
                    )}
                  </Button>
                )}
                <div className="mt-4">
                  <ReportDialog type="news" itemId={news.id} />
                </div>
              </article>
            );
            
            return news.link_url ? (
              <a key={news.id} href={news.link_url} target="_blank" rel="noopener noreferrer" className="block">
                {article}
              </a>
            ) : article;
          })}
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