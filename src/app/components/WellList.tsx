'use client';

import { Plus, Database, MessageCircle, Trash2 } from 'lucide-react';

interface Well {
  name: string;
  depth: number;
  status: string;
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

interface WellListProps {
  selectedWell: string;
  onWellSelect: (wellName: string) => void;
  wells: Well[];
  onAddWell: () => void;
  onDeleteWell: (wellName: string) => void;
  wellData: { [wellName: string]: DrillingDataPoint[] };
}

export default function WellList({ selectedWell, onWellSelect, wells, onAddWell, onDeleteWell, wellData }: WellListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Drilling': return 'bg-blue-100 text-blue-800';
      case 'Planning': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4">
      {/* Add New Well Button */}
      <button
        onClick={onAddWell}
        className="w-full mb-4 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
      >
        <Plus className="w-4 h-4" />
        <span>Add New Well</span>
      </button>

      <div className="space-y-2">
        {wells.map((well) => {
          const hasData = wellData[well.name] && wellData[well.name].length > 0;
          return (
            <div
              key={well.name}
              className={`w-full p-3 rounded-lg border transition-colors ${
                selectedWell === well.name
                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div 
                className="cursor-pointer"
                onClick={() => onWellSelect(well.name)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium">{well.name}</div>
                  <div className="flex items-center space-x-1">
                    {hasData && (
                      <div className="flex items-center space-x-1">
                        <Database className="w-3 h-3 text-green-600" />
                        <MessageCircle className="w-3 h-3 text-blue-600" />
                      </div>
                    )}
                    {wells.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to delete ${well.name}? This will remove all associated data and chat history.`)) {
                            onDeleteWell(well.name);
                          }
                        }}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        title="Delete well"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500 mb-1">
                  Depth: {well.depth > 0 ? `${well.depth.toLocaleString()} ft` : 'No data'}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(well.status)}`}>
                    {well.status}
                  </span>
                  {hasData && (
                    <span className="text-xs text-green-600 font-medium">
                      {wellData[well.name].length} data points
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
