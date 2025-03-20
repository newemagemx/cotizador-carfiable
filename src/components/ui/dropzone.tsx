
import * as React from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Upload, X, Image as ImageIcon } from "lucide-react";

export type FileWithPreview = File & {
  preview: string;
};

interface DropzoneProps extends React.HTMLAttributes<HTMLDivElement> {
  onDrop: (acceptedFiles: FileWithPreview[]) => void;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  accept?: Record<string, string[]>;
  files?: FileWithPreview[];
  onRemove?: (file: FileWithPreview) => void;
}

const Dropzone = React.forwardRef<HTMLDivElement, DropzoneProps>(
  ({ className, onDrop, maxFiles = 5, maxSize = 5242880, disabled = false, 
     accept = { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }, 
     files = [], onRemove, ...props }, ref) => {
    
    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
      onDrop: (acceptedFiles) => {
        const filesWithPreview = acceptedFiles.map(file => 
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        ) as FileWithPreview[];
        
        onDrop(filesWithPreview);
      },
      maxFiles,
      maxSize,
      accept,
      disabled
    });

    // Clean up previews
    React.useEffect(() => {
      return () => {
        files.forEach(file => {
          if (file.preview) URL.revokeObjectURL(file.preview);
        });
      };
    }, [files]);

    return (
      <div ref={ref} className="space-y-4">
        <div
          {...getRootProps()}
          className={cn(
            "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors",
            isDragActive ? "border-primary bg-primary/10" : "border-input bg-background",
            isDragReject && "border-destructive bg-destructive/10",
            disabled && "cursor-not-allowed opacity-60",
            className
          )}
          {...props}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center justify-center text-center gap-2">
            <Upload className={cn(
              "h-10 w-10",
              isDragActive ? "text-primary" : "text-muted-foreground"
            )} />
            <div>
              <p className="font-medium">
                {isDragActive ? "Suelta las imágenes aquí" : "Arrastra imágenes o haz clic para seleccionar"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Sube hasta {maxFiles} imágenes (max. {Math.round(maxSize / 1048576)}MB cada una)
              </p>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative group overflow-hidden rounded-lg border border-border">
                <div className="aspect-square relative">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="h-full w-full object-cover transition-all group-hover:opacity-80"
                    onLoad={() => { URL.revokeObjectURL(file.preview) }}
                  />
                </div>
                {onRemove && (
                  <button
                    className="absolute top-1 right-1 bg-background/80 p-1 rounded-full shadow-sm opacity-70 hover:opacity-100 transition-opacity"
                    onClick={() => onRemove(file)}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-background/80 px-2 py-1 text-xs truncate">
                  {file.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

Dropzone.displayName = "Dropzone";

export { Dropzone };
