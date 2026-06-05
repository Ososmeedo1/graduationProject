import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, Printer } from 'lucide-react';
import axios from 'axios';
import { storage } from '../../utils/storage';

const FileViewerModal = ({ isOpen, onClose, url: propUrl, fileUrl, title }) => {
  const url = propUrl || fileUrl;
  const [blobUrl, setBlobUrl] = useState(null);
  const [contentType, setContentType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const iframeRef = useRef(null);

  const handleClose = () => {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }
    setBlobUrl(null);
    setContentType(null);
    setError(false);
    setLoading(true);
    onClose();
  };

  const handlePrint = () => {
    if (contentType?.startsWith('text/html') || contentType?.includes('html')) {
      // For HTML content, print the iframe content
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.print();
      }
    } else {
      // For other content types, use regular print
      window.print();
    }
  };

  useEffect(() => {
    if (isOpen && url) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      setBlobUrl(null);
      setContentType(null);
      setLoading(true);
      setError(false);

      const token = storage.getToken();
      axios.get(url, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/octet-stream',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
      .then(response => {
        const blob = response.data;
        const type = response.headers['content-type'] || blob.type || '';
        setContentType(type);
        setBlobUrl(URL.createObjectURL(blob));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    }
    else if (!isOpen) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      setBlobUrl(null);
      setContentType(null);
      setError(false);
      setLoading(true);
    }

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [isOpen, url]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      <div className="relative bg-surface rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-stroke">
          <h3 className="font-semibold text-ink">{title}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-md hover:bg-surface-muted transition-colors text-ink-muted"
              title="Print PDF"
            >
              <Printer size={18} />
            </button>
            <button
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-surface-muted transition-colors text-ink-muted"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="relative flex-1 overflow-auto p-4 bg-white min-h-[500px]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="animate-spin w-8 h-8 text-primary-600" />
            </div>
          )}
          {error && <div className="p-4 text-red-500">Failed to load file.</div>}
          {blobUrl && (
            contentType?.startsWith('image/') ? (
              <img
                src={blobUrl}
                alt={title}
                className="w-full h-full object-contain"
              />
            ) : (
              <iframe
                ref={iframeRef}
                src={blobUrl}
                className="w-full h-full min-h-[500px] border-none"
                title={title || 'File Preview'}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default FileViewerModal;
