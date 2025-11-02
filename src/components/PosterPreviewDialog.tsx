import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

interface PosterPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  posterUrls: string[];
  resultName: string;
}

const PosterPreviewDialog = ({ open, onOpenChange, posterUrls, resultName }: PosterPreviewDialogProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${resultName}-poster-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % posterUrls.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + posterUrls.length) % posterUrls.length);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Result Posters</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <img
              src={posterUrls[currentIndex]}
              alt={`${resultName} poster ${currentIndex + 1}`}
              className="w-full h-auto rounded-lg"
            />
            {posterUrls.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                  onClick={handleNext}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Poster {currentIndex + 1} of {posterUrls.length}
            </p>
            <Button onClick={() => handleDownload(posterUrls[currentIndex], currentIndex)}>
              <Download className="w-4 h-4 mr-2" />
              Download Current
            </Button>
          </div>
          {posterUrls.length > 1 && (
            <div className="flex gap-2 justify-center flex-wrap">
              {posterUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-16 h-16 rounded border-2 overflow-hidden ${
                    currentIndex === index ? "border-primary" : "border-border"
                  }`}
                >
                  <img src={url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PosterPreviewDialog;
