'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Ticket {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assignedTo?: {
    staffProfile?: {
      fullName: string;
    };
  };
  comments: any[];
}

interface TicketKanbanBoardProps {
  tickets: Ticket[];
  onStatusChange: (ticketId: number, newStatus: string) => void;
  isStaff?: boolean;
}

export default function TicketKanbanBoard({ tickets, onStatusChange, isStaff = false }: TicketKanbanBoardProps) {
  const router = useRouter();
  const [draggedTicket, setDraggedTicket] = useState<number | null>(null);

  const statuses = [
    { key: 'OPEN', label: 'Open', color: 'from-blue-500 to-cyan-600' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: 'from-yellow-500 to-orange-600' },
    { key: 'ON_HOLD', label: 'On Hold', color: 'from-purple-500 to-pink-600' },
    { key: 'COMPLETED', label: 'Completed', color: 'from-green-500 to-emerald-600' },
  ];

  const getTicketsByStatus = (status: string) => {
    return tickets.filter(ticket => ticket.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'CRITICAL':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };


  const handleDragStart = (ticketId: number) => {
    setDraggedTicket(ticketId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedTicket) {
      onStatusChange(draggedTicket, newStatus);
      setDraggedTicket(null);
    }
  };

  const handleTicketClick = (ticketId: number) => {
    if (isStaff) {
      router.push(`/staff/tickets/${ticketId}`);
    } else {
      router.push(`/admin/tickets/${ticketId}`);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statuses.map((status) => {
        const statusTickets = getTicketsByStatus(status.key);
        
        return (
          <div
            key={status.key}
            className="flex flex-col"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status.key)}
          >
            {/* Column Header */}
            <div className={`bg-gradient-to-r ${status.color} rounded-t-xl shadow-lg p-4 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{status.label}</h3>
                  <p className="text-xs opacity-90">{statusTickets.length} ticket{statusTickets.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center font-bold">
                  {statusTickets.length}
                </div>
              </div>
            </div>

            {/* Tickets Container */}
            <div className="bg-gray-50 rounded-b-xl shadow-lg p-2 min-h-[400px] space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
              {statusTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-sm font-medium">No tickets</p>
                </div>
              ) : (
                statusTickets.map((ticket) => {
                  const isOverdue = new Date(ticket.dueDate) < new Date() && 
                                   ticket.status !== 'COMPLETED' && 
                                   ticket.status !== 'CLOSED';

                  return (
                    <div
                      key={ticket.id}
                      draggable
                      onDragStart={() => handleDragStart(ticket.id)}
                      onClick={() => handleTicketClick(ticket.id)}
                      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer p-3 border border-gray-200 hover:border-blue-300 group"
                    >
                      {/* Ticket Number and Priority */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {ticket.ticketNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="font-semibold text-sm text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {ticket.title}
                      </h4>

                      {/* Due Date */}
                      <div className={`flex items-center gap-1 text-xs mb-1.5 ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                        <svg className={`w-3 h-3 ${isOverdue ? 'text-red-500' : 'text-orange-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {new Date(ticket.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {isOverdue && (
                          <span className="ml-1 bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                            OVERDUE
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        {ticket.assignedTo?.staffProfile && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="truncate max-w-[100px]">{ticket.assignedTo.staffProfile.fullName}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          <span>{ticket.comments.length}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

