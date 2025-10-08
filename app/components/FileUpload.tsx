"use client";

import { useState, useRef } from "react";
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface FileUploadProps {
  onUpload?: (url: string) => void;
  folder?: string;
  accept?: string;
  multiple?: boolean;
  className?: string;
}

export function FileUpload({
  onUpload,
  folder = "uploads",
  accept,
  multiple = false,
  className = "",
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<
    Array<{
      file: File;
      success: boolean;
      url?: string;
      error?: string;
    }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        return { success: true, url: result.url };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: "Upload failed" };
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const results = [];

    for (const file of Array.from(files)) {
      const result = await uploadFile(file);
      results.push({ file, ...result });

      if (result.success && onUpload) {
        onUpload(result.url!);
      }
    }

    setUploadResults(results);
    setUploading(false);

    // 重置input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeResult = (index: number) => {
    setUploadResults((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 文件上传区域 */}
      <div
        className={`border-2 border-dashed rounded p-6 transition-colors ${
          uploading
            ? "border-gray-300 bg-gray-50"
            : "border-gray-300 hover:border-primary"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept={accept}
          multiple={multiple}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />

        <label
          htmlFor="file-upload"
          className="block cursor-pointer text-center"
        >
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            {uploading ? "Uploading..." : "Click to upload files"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {accept ? `Supported: ${accept}` : "All file types"}
          </p>
        </label>
      </div>

      {/* 上传结果 */}
      {uploadResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Upload Results</h4>
          {uploadResults.map((result, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded"
            >
              <div className="flex items-center space-x-3 flex-1">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {result.file.name}
                  </p>
                  {result.error && (
                    <p className="text-xs text-red-500">{result.error}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => removeResult(index)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
