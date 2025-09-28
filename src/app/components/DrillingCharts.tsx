'use client';

import { useState, useEffect } from 'react';
import {BarChart, LineChart, XAxis, YAxis, Tooltip, Bar, Line, ResponsiveContainer } from 'recharts';

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

interface DrillingChartsProps {
  selectedWell: string;
  wellData: DrillingDataPoint[] | null;
}


export default function DrillingCharts({ selectedWell, wellData }: DrillingChartsProps) {
  const [data, setData] = useState<DrillingDataPoint[]>([]);

  useEffect(() => {
    console.log('wellData received:', wellData, 'Type:', typeof wellData, 'Is Array:', Array.isArray(wellData));
    if (wellData && Array.isArray(wellData) && wellData.length > 0) {
      setData(wellData);
      console.log('Data updated with uploaded data, length:', wellData.length);
    } else {
      // No data available - show empty state
      setData([]);
      console.log('No data available for', selectedWell);
    }
  }, [wellData, selectedWell]);


  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  const rockCompositionData = safeData.map(d => ({
    depth: d.depth,
    SH: d.SH,
    SS: d.SS,
    LS: d.LS,
    DOL: d.DOL,
    ANH: d.ANH,
    Coal: d.Coal,
    Salt: d.Salt,
  }));

  const dtData = safeData.map(d => ({
    depth: d.depth,
    DT: d.DT,
  }));

  const grData = safeData.map(d => ({
    depth: d.depth,
    GR: d.GR,
  }));


  const CustomTooltip = ({ active, payload, label }: { active: boolean, payload: { payload: DrillingDataPoint }[], label: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">Depth: {label}</p>
          {data.SH !== undefined && <p>SH: {data.SH.toFixed(2)}%</p>}
          {data.SS !== undefined && <p>SS: {data.SS.toFixed(2)}%</p>}
          {data.LS !== undefined && <p>LS: {data.LS.toFixed(2)}%</p>}
          {data.DOL !== undefined && <p>DOL: {data.DOL.toFixed(2)}%</p>}
          {data.ANH !== undefined && <p>ANH: {data.ANH.toFixed(2)}%</p>}
          {data.Coal !== undefined && <p>Coal: {data.Coal.toFixed(2)}%</p>}
          {data.Salt !== undefined && <p>Salt: {data.Salt.toFixed(2)}%</p>}
          {data.DT !== undefined && <p>DT: {data.DT.toFixed(3)}</p>}
          {data.GR !== undefined && <p>GR: {data.GR.toFixed(3)}</p>}
        </div>
      );
    }
    return null;
  };

  // Show empty state if no data
  if (safeData.length === 0) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="text-center">
          <h2 className="text-lg lg:text-2xl font-bold text-gray-900 mb-2">
            Drilling Monitoring - {selectedWell}
          </h2>
          <p className="text-sm lg:text-base text-gray-600">Real-time drilling data visualization</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-8 lg:p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-4">
              Upload drilling data for {selectedWell} to see charts and analysis.
            </p>
            <p className="text-sm text-gray-500">
              Use the Upload button in the header to add your Excel or CSV file.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="text-center">
        <h2 className="text-lg lg:text-2xl font-bold text-gray-900 mb-2">
          Drilling Monitoring - {selectedWell}
        </h2>
        <p className="text-sm lg:text-base text-gray-600">Real-time drilling data visualization</p>
        <p className="text-xs text-gray-500 mt-2">Data points: {safeData.length}</p>
      </div>

      {/* Rock Composition Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-semibold mb-4">Rock Composition</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-pink-400 rounded"></div>
            <span className="text-xs lg:text-sm">SH</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-400 rounded"></div>
            <span className="text-xs lg:text-sm">SS</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-300 rounded"></div>
            <span className="text-xs lg:text-sm">LS</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-300 rounded"></div>
            <span className="text-xs lg:text-sm">DOL</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-300 rounded"></div>
            <span className="text-xs lg:text-sm">ANH</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span className="text-xs lg:text-sm">Coal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span className="text-xs lg:text-sm">Salt</span>
          </div>
        </div>
        <div style={{ width: '100%', height: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rockCompositionData}>
              <XAxis dataKey="depth" />
              <YAxis />
              <Tooltip content={<CustomTooltip active={false} payload={[]} label="" />} />
              <Bar dataKey="SH" stackId="a" fill="#f472b6" />
              <Bar dataKey="SS" stackId="a" fill="#fb923c" />
              <Bar dataKey="LS" stackId="a" fill="#fde047" />
              <Bar dataKey="DOL" stackId="a" fill="#86efac" />
              <Bar dataKey="ANH" stackId="a" fill="#93c5fd" />
              <Bar dataKey="Coal" stackId="a" fill="#6b7280" />
              <Bar dataKey="Salt" stackId="a" fill="#d1d5db" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DT Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-semibold mb-4">DT (Delta T)</h3>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-4 h-4 bg-pink-400 rounded"></div>
          <span className="text-xs lg:text-sm">DT</span>
        </div>
        <div style={{ width: '100%', height: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dtData}>
              <XAxis dataKey="depth" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="DT" stroke="#f472b6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GR Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-semibold mb-4">GR (Gamma Ray)</h3>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-4 h-4 bg-blue-300 rounded"></div>
          <span className="text-xs lg:text-sm">GR</span>
        </div>
        <div style={{ width: '100%', height: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={grData}>
              <XAxis dataKey="depth" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="GR" stroke="#93c5fd" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
