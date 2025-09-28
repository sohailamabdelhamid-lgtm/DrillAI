'use client';

import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onDataUploaded: (data: { [key: string]: number | string }[]) => void;
}

export default function FileUpload({ onDataUploaded }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setUploadStatus('error');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Upload response:', responseData);
        console.log('Data being passed to charts:', responseData.data);
        onDataUploaded(responseData.data); // Pass only the data array, not the entire response
        setUploadStatus('success');
      } else {
        const errorData = await response.json();
        console.error('Upload failed:', errorData);
        setUploadStatus('error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      <button
        onClick={handleButtonClick}
        disabled={isUploading}
        className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
      >
        <Upload className="w-4 h-4" />
        <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileUpload}
        className="hidden"
      />

      {uploadStatus === 'success' && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-green-100 text-green-800 text-sm rounded border border-green-200">
          File uploaded successfully!
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-100 text-red-800 text-sm rounded border border-red-200">
          Upload failed. Please try again.
        </div>
      )}
    </div>
  );
}
