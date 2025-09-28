'use client';

import { useState, useEffect } from 'react';
import { X, Menu } from 'lucide-react';
import WellList from './components/WellList';
import DrillingCharts from './components/DrillingCharts';
import Chatbot from './components/Chatbot';

// Types for well data and chat history
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

interface WellData {
  [wellName: string]: DrillingDataPoint[];
}

interface ChatHistory {
  [wellName: string]: Array<{
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
}

export default function Home() {
  const [selectedWell, setSelectedWell] = useState('Well A');
  const [activeTab, setActiveTab] = useState('Drilling Monitoring');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarClosed, setSidebarClosed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wellData, setWellData] = useState<WellData>({});
  const [chatHistory, setChatHistory] = useState<ChatHistory>({});
  const [wells, setWells] = useState([
    { name: 'Well A', depth: 0, status: 'Planning' }
  ]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedWellData = localStorage.getItem('drill-ai-well-data');
    const savedChatHistory = localStorage.getItem('drill-ai-chat-history');
    const savedWells = localStorage.getItem('drill-ai-wells');
    
    if (savedWells) {
      setWells(JSON.parse(savedWells));
    }
    
    if (savedWellData) {
      setWellData(JSON.parse(savedWellData));
    }
    
    if (savedChatHistory) {
      const parsed = JSON.parse(savedChatHistory);
      // Convert timestamp strings back to Date objects
      Object.keys(parsed).forEach(wellName => {
        parsed[wellName] = parsed[wellName].map((msg: { id: string; type: 'user' | 'assistant'; content: string; timestamp: string }) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      });
      setChatHistory(parsed);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('drill-ai-wells', JSON.stringify(wells));
  }, [wells]);

  useEffect(() => {
    localStorage.setItem('drill-ai-well-data', JSON.stringify(wellData));
  }, [wellData]);

  useEffect(() => {
    localStorage.setItem('drill-ai-chat-history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Handle well-specific data upload
  const handleDataUploaded = (data: DrillingDataPoint[]) => {
    setWellData(prev => ({
      ...prev,
      [selectedWell]: data
    }));

    // Update well depth based on uploaded data
    if (data && data.length > 0) {
      const depths = data.map(d => d.Depth || d.depth || d.DEPTH).filter((d): d is number => d !== undefined && !isNaN(d));
      if (depths.length > 0) {
        const maxDepth = Math.max(...depths);
        setWells(prev => prev.map(well => 
          well.name === selectedWell 
            ? { ...well, depth: maxDepth, status: 'Active' }
            : well
        ));
      }
    }
  };

  // Handle well-specific chat messages
  const handleChatMessage = (message: { id: string; type: 'user' | 'assistant'; content: string; timestamp: Date }) => {
    setChatHistory(prev => ({
      ...prev,
      [selectedWell]: [...(prev[selectedWell] || []), message]
    }));
  };

  // Add new well
  const addNewWell = () => {
    const wellNumber = wells.length + 1;
    const newWell = {
      name: `Well ${String.fromCharCode(64 + wellNumber)}`,
      depth: 0, // Will be updated when data is uploaded
      status: 'Planning'
    };
    setWells(prev => [...prev, newWell]);
  };

  // Delete well
  const deleteWell = (wellName: string) => {
    if (wells.length <= 1) return; // Don't delete the last well
    
    setWells(prev => prev.filter(well => well.name !== wellName));
    
    // Clear data for deleted well
    setWellData(prev => {
      const newData = { ...prev };
      delete newData[wellName];
      return newData;
    });
    
    setChatHistory(prev => {
      const newHistory = { ...prev };
      delete newHistory[wellName];
      return newHistory;
    });
    
    // If deleted well was selected, select the first remaining well
    if (selectedWell === wellName) {
      const remainingWells = wells.filter(well => well.name !== wellName);
      if (remainingWells.length > 0) {
        setSelectedWell(remainingWells[0].name);
      }
    }
  };

  const tabs = ['Drilling Monitoring', 'Offset Wells Map', 'Bit Summary'];

  // Sidebar control functions
  // const toggleSidebar = () => {
  //   setSidebarCollapsed(!sidebarCollapsed);
  // };

  const closeSidebar = () => {
    // On mobile, just close the mobile menu
    if (window.innerWidth < 1024) {
      setMobileMenuOpen(false);
    } else {
      // On desktop, close the sidebar
      setSidebarClosed(true);
      setSidebarCollapsed(false);
    }
  };

  const openMobileMenu = () => {
    setMobileMenuOpen(true);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 h-[80px]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0 h-full">
          <div className="flex items-center space-x-2 lg:space-x-4 w-full lg:w-auto">
            {/* Mobile Menu Button */}
            <button
              onClick={openMobileMenu}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <h1 className="text-lg lg:text-xl font-semibold text-gray-900">
                Drill AI Intelligence Platform
              </h1>
              <div className="text-sm text-gray-600">
                {selectedWell} {wellData[selectedWell] && wellData[selectedWell].length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    {wellData[selectedWell].length} data points
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* <div className="flex items-center space-x-2 lg:space-x-4 flex-wrap">
            <button className="flex items-center space-x-2 bg-green-500 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <FileUpload onDataUploaded={handleDataUploaded} />
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm text-gray-600 hidden lg:inline">1x</span>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
          </div> */}
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] max-w-screen relative">
        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeMobileMenu}
          />
        )}

        {/* Left Sidebar - Well List */}
        <div className={`
          bg-white border-r border-gray-200 transition-all duration-300
          ${sidebarClosed ? 'hidden lg:block lg:w-0' : ''}
          ${sidebarCollapsed ? 'w-16' : 'w-full lg:w-80'}
          ${mobileMenuOpen ? 'fixed top-[0] left-0 h-full z-50 w-80' : 'hidden lg:block'}
        `}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className={`font-semibold text-gray-900 ${sidebarCollapsed ? 'hidden' : ''}`}>
                Well List
              </h2>
              <div className="flex items-center space-x-2 relative z-10 lg:hidden">
                {!sidebarCollapsed && (
                  <button
                    onClick={closeSidebar}
                    className="p-1 hover:bg-gray-100 rounded transition-colors bg-white border border-gray-200 shadow-sm"
                    title="Close sidebar"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
          {!sidebarCollapsed && (
            <WellList 
              selectedWell={selectedWell} 
              onWellSelect={(well) => {
                setSelectedWell(well);
                closeMobileMenu(); // Close mobile menu when well is selected
              }}
              wells={wells}
              onAddWell={addNewWell}
              onDeleteWell={deleteWell}
              wellData={wellData}
            />
          )}
        </div>

        {/* Main Content Area */}
        <div className="grow-1 shrink-1 flex flex-col min-w-0">
          {/* Tabs */}
          <div className="bg-white border-b border-gray-200 px-4 lg:px-6">
            <div className="flex items-center space-x-2 lg:space-x-6 overflow-x-auto">
              {tabs.map((tab) => (
                <div
                  key={tab}
                  className={`relative flex items-center py-4 px-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <button
                    onClick={() => setActiveTab(tab)}
                    className="flex items-center"
                  >
                    {tab}
                  </button>
                  <button 
                    className="ml-2 p-1 hover:bg-gray-100 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle tab close functionality here if needed
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 lg:p-6 overflow-auto">
            {activeTab === 'Drilling Monitoring' && (
              <DrillingCharts 
                selectedWell={selectedWell} 
                wellData={ wellData[selectedWell] || null}
              />
            )}
            {activeTab === 'Offset Wells Map' && (
              <div className="flex items-center justify-center h-full text-gray-500">
                Offset Wells Map - Coming Soon
              </div>
            )}
            {activeTab === 'Bit Summary' && (
              <div className="flex items-center justify-center h-full text-gray-500">
                Bit Summary - Coming Soon
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Chatbot */}
        <div className="w-full lg:w-90 shrink-1 bg-white border-l border-gray-200 lg:block">
          <Chatbot 
            selectedWell={selectedWell} 
            wellData={wellData[selectedWell] || null}
            chatHistory={chatHistory[selectedWell] || []}
            onChatMessage={handleChatMessage}
            onDataUploaded={handleDataUploaded}
          />
        </div>
      </div>
    </div>
  );
}