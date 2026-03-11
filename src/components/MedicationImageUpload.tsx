import { useState, useRef } from "react";
import { Camera, ImagePlus, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  imageUrl?: string;
  onChange: (url: string | undefined) => void;
}

function compressImage(file: File, maxWidth = 800, quality = 0.6): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const MedicationImageUpload = ({ imageUrl, onChange }: Props) => {
  const { t, isRTL } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const compressed = await compressImage(file);
      onChange(compressed);
    } catch {
      console.error("Failed to compress image");
    }
    setLoading(false);
  };

  const handleCapture = () => {
    if (inputRef.current) {
      inputRef.current.setAttribute("capture", "environment");
      inputRef.current.click();
    }
  };

  const handleGallery = () => {
    if (inputRef.current) {
      inputRef.current.removeAttribute("capture");
      inputRef.current.click();
    }
  };

  return (
    <div>
      <label className="text-base font-bold text-foreground block mb-2">
        {isRTL ? "صورة علبة الدواء" : "Medication Box Photo"}
      </label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) await handleFile(file);
          e.target.value = "";
        }}
      />

      {imageUrl ? (
        <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-border bg-muted">
          <img src={imageUrl} alt="Medication box" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute top-2 end-2 w-8 h-8 rounded-full bg-destructive/80 text-destructive-foreground flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleGallery}
            className="absolute bottom-2 end-2 px-3 py-1.5 rounded-full bg-card/80 text-foreground text-xs font-medium backdrop-blur-sm border border-border"
          >
            {isRTL ? "تغيير" : "Change"}
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCapture}
            disabled={loading}
            className="flex-1 flex flex-col items-center gap-2 py-6 rounded-2xl border-2 border-dashed border-border bg-muted/50 hover:border-primary/50 transition-colors"
          >
            <Camera className="w-8 h-8 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              {isRTL ? "التقاط صورة" : "Take Photo"}
            </span>
          </button>
          <button
            type="button"
            onClick={handleGallery}
            disabled={loading}
            className="flex-1 flex flex-col items-center gap-2 py-6 rounded-2xl border-2 border-dashed border-border bg-muted/50 hover:border-primary/50 transition-colors"
          >
            <ImagePlus className="w-8 h-8 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              {isRTL ? "من المعرض" : "Gallery"}
            </span>
          </button>
        </div>
      )}
      {loading && (
        <p className="text-sm text-muted-foreground mt-2 text-center">
          {isRTL ? "جارٍ تحميل الصورة..." : "Uploading..."}
        </p>
      )}
    </div>
  );
};

export default MedicationImageUpload;
