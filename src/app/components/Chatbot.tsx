'use client';

import { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, X, FileText, Image, File } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
}

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  content?: string;
}

interface DrillingDataPoint {
  Depth?: number;
  depth?: number;
  DEPTH?: number;
  DT?: number;
  dt?: number;
  GR?: number;
  gr?: number;
  SH?: number;
  sh?: number;
  SS?: number;
  ss?: number;
  LS?: number;
  ls?: number;
  DOL?: number;
  dol?: number;
  ANH?: number;
  anh?: number;
  Coal?: number;
  coal?: number;
  Salt?: number;
  salt?: number;
  [key: string]: number | string | undefined;
}

interface ChatbotProps {
  selectedWell: string;
  wellData: DrillingDataPoint[] | null;
  chatHistory: Message[];
  onChatMessage: (message: Message) => void;
  onDataUploaded?: (data: DrillingDataPoint[]) => void;
}

export default function Chatbot({ selectedWell, wellData, chatHistory, onChatMessage, onDataUploaded }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const [isListening, setIsListening] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history when well changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      setMessages(chatHistory);
    } else {
      // Initialize with welcome message for new wells
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'assistant',
        content: `Hi, I'm Drill AI. Ask me anything about ${selectedWell}!`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [selectedWell, chatHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if ((!inputText.trim() && attachments.length === 0) || isLoading) return;

    // Extract XLSX data and update charts if XLSX files are attached
    if (attachments.length > 0) {
      const xlsxAttachments = attachments.filter(attachment => attachment.name.endsWith('.xlsx'));
      if (xlsxAttachments.length > 0 && onDataUploaded) {
        try {
          const xlsxData = JSON.parse(xlsxAttachments[0].content || '[]');
          if (Array.isArray(xlsxData) && xlsxData.length > 0) {
            onDataUploaded(xlsxData);
          }
        } catch (error) {
          console.error('Error extracting XLSX data for charts:', error);
        }
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    onChatMessage(userMessage);
    setInputText('');
    setAttachments([]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
          wellName: selectedWell,
          wellData: wellData,
          attachments: attachments,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('JSON parsing error in response:', jsonError);
        throw new Error('Invalid response format from server');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response || 'Sorry, I could not process your request.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      onChatMessage(aiMessage);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: error instanceof Error ? error.message : 'Sorry, there was an error processing your request.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // const handleVoiceChat = () => {
  //   setIsListening(!isListening);
  //   // Voice chat functionality would be implemented here
  //   // For now, just toggle the state
  // };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(async (file) => {
      // Only accept XLSX files
      if (!file.name.endsWith('.xlsx')) {
        alert(`Only XLSX files are supported. Please select an Excel file.`);
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      const attachment: FileAttachment = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
      };

      try {
        // Parse XLSX file
        const data = await parseXLSXFile(file);
        attachment.content = JSON.stringify(data);
        setAttachments(prev => [...prev, attachment]);
        
        // Don't update charts automatically - wait for message submission
      } catch (error) {
        console.error('Error parsing XLSX file:', error);
        alert(`Error parsing XLSX file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  };

  const parseXLSXFile = async (file: File): Promise<{ [key: string]: number | string }[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string;
          if (!data) {
            reject(new Error('No data read from file'));
            return;
          }

          // Import XLSX library dynamically
          import('xlsx').then((XLSX) => {
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            resolve(jsonData as { [key: string]: number | string }[]);
          }).catch((importError) => {
            reject(new Error('Failed to load XLSX parser: ' + importError.message));
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsBinaryString(file);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment?.url) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('text/') || type.includes('csv') || type.includes('json')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">D</span>
            </div>
            <h2 className="font-semibold text-gray-900">Drill AI</h2>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.type === 'assistant' ? (
                <div className="text-sm prose prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      // Custom styling for markdown elements
                      h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-sm">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      code: ({ children, className }) => {
                        const isInline = !className;
                        return isInline ? (
                          <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                        ) : (
                          <code className="block bg-gray-200 p-2 rounded text-xs font-mono overflow-x-auto">{children}</code>
                        );
                      },
                      pre: ({ children }) => <pre className="bg-gray-200 p-2 rounded text-xs font-mono overflow-x-auto mb-2">{children}</pre>,
                      blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-3 italic mb-2">{children}</blockquote>,
                      table: ({ children }) => <table className="w-full border-collapse border border-gray-300 text-xs mb-2">{children}</table>,
                      th: ({ children }) => <th className="border border-gray-300 px-2 py-1 bg-gray-200 font-semibold">{children}</th>,
                      td: ({ children }) => <td className="border border-gray-300 px-2 py-1">{children}</td>,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div>
                  <p className="text-sm">{message.content}</p>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1 text-gray-800">
                      {message.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded text-xs">
                          {getFileIcon(attachment.type)}
                          <span className="flex-1 truncate">{attachment.name}</span>
                          <span className="text-gray-500">{formatFileSize(attachment.size)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <p className="text-xs opacity-70 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-white border border-gray-200 rounded-lg">
                {getFileIcon(attachment.type)}
                <span className="text-sm truncate max-w-32">{attachment.name}</span>
                <span className="text-xs text-gray-500">{formatFileSize(attachment.size)}</span>
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              accept=".xlsx"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Upload XLSX file"
            >
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type messages here or upload XLSX files..."
            className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={(!inputText.trim() && attachments.length === 0) || isLoading}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Supported format: XLSX files only - Max 10MB per file. Data will be displayed in charts after sending the message.
        </div>
      </div>
    </div>
  );
}
