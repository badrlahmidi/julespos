"use client";

import React, { useState, useEffect, memo, useCallback } from 'react';
import { usePosStore } from '../../store/usePosStore';
import { motion } from 'framer-motion';
import { Users, Clock } from 'lucide-react';
import type { Table, TableStatus } from '../../types/pos';

const getStatusColor = (status: TableStatus) => {
  switch (status) {
    case 'available':
      return 'bg-pos-card text-pos-text-secondary border-pos-darker'; // Light Gray / Default
    case 'occupied':
      return 'bg-pos-info/20 text-pos-info border-pos-info/50'; // Vibrant Blue
    case 'ordered':
      return 'bg-pos-warning/20 text-pos-warning border-pos-warning/50'; // Orange
    case 'billing':
      return 'bg-pos-emerald/20 text-pos-emerald border-pos-emerald/50'; // Emerald Green
    default:
      return 'bg-pos-card text-pos-text-secondary border-pos-darker';
  }
};

interface TableCardProps {
  table: Table;
  currentTime: number;
  draggedTableId: string | null;
  onTableClick: (tableId: string) => void;
  onDragStart: (e: React.DragEvent, tableId: string, status: TableStatus) => void;
  onDragOver: (e: React.DragEvent, status: TableStatus) => void;
  onDrop: (e: React.DragEvent, targetTableId: string, targetStatus: TableStatus) => void;
}

const TableCard = memo(({ table, currentTime, draggedTableId, onTableClick, onDragStart, onDragOver, onDrop }: TableCardProps) => {
  const isRound = table.capacity <= 2;

  const getElapsedTime = (lastActionTime?: number) => {
    if (!lastActionTime) return null;
    const diffMins = Math.floor((currentTime - lastActionTime) / 60000);
    if (diffMins < 60) return `${diffMins}m`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h${mins > 0 ? mins : ''}`;
  };

  return (
    <motion.div
      draggable={table.status !== 'available'}
      onDragStart={(e: any) => onDragStart(e, table.id, table.status)}
      onDragOver={(e: any) => onDragOver(e, table.status)}
      onDrop={(e: any) => onDrop(e, table.id, table.status)}
      whileTap={{ scale: 0.95 }}
      onClick={() => onTableClick(table.id)}
      className={`
        relative flex flex-col items-center justify-center p-4 cursor-pointer
        border-2 backdrop-blur-md transition-all shadow-sm min-w-[44px] min-h-[44px]
        ${isRound ? 'rounded-full aspect-square' : 'rounded-2xl aspect-[4/3]'}
        ${getStatusColor(table.status)}
        ${draggedTableId === table.id ? 'opacity-50 scale-95' : ''}
      `}
    >
      <span className="text-2xl font-bold mb-1">{table.label}</span>
      <div className="flex items-center gap-1 opacity-80">
        <Users size={14} />
        <span className="text-sm font-medium">{table.capacity}</span>
      </div>

      {/* Elapsed Time Badge */}
      {table.status !== 'available' && table.lastActionTime && (
        <div className="absolute -top-2 -right-2 bg-pos-darker text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-pos-card shadow-md">
          <Clock size={10} />
          {getElapsedTime(table.lastActionTime)}
        </div>
      )}
    </motion.div>
  );
});
TableCard.displayName = 'TableCard';

interface FloorPlanProps {
  onTableClick: (tableId: string) => void;
}

export const FloorPlan = ({ onTableClick }: FloorPlanProps) => {
  const tables = usePosStore((state) => state.tables);
  const transferOrder = usePosStore((state) => state.transferOrder);

  const [draggedTableId, setDraggedTableId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update timer every minute for elapsed time
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const totalCovers = tables.reduce((acc, table) => table.status !== 'available' ? acc + table.capacity : acc, 0);

  const handleDragStart = useCallback((e: React.DragEvent, tableId: string, status: TableStatus) => {
    if (status === 'available') {
      e.preventDefault();
      return;
    }
    setDraggedTableId(tableId);
    e.dataTransfer.setData('text/plain', tableId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, status: TableStatus) => {
    e.preventDefault();
    if (status === 'available') {
        e.dataTransfer.dropEffect = 'move';
    } else {
        e.dataTransfer.dropEffect = 'none';
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetTableId: string, targetStatus: TableStatus) => {
    e.preventDefault();
    const sourceTableId = e.dataTransfer.getData('text/plain');
    setDraggedTableId(null);

    if (sourceTableId && sourceTableId !== targetTableId && targetStatus === 'available') {
        transferOrder(sourceTableId, targetTableId);
    }
  }, [transferOrder]);

  return (
    <div className="flex-1 h-full bg-pos-dark p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto">

        {/* Header & Service Status */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-pos-text-primary">Plan de Salle</h1>

          <div className="bg-pos-card border border-pos-darker px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
            <Users size={18} className="text-pos-emerald" />
            <span className="text-pos-text-primary font-medium">
              <span className="text-pos-emerald font-bold">{totalCovers}</span> couverts en cours
            </span>
          </div>
        </div>

        {/* CSS Grid for Tables */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              currentTime={currentTime}
              draggedTableId={draggedTableId}
              onTableClick={onTableClick}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>

      </div>
    </div>
  );
};
