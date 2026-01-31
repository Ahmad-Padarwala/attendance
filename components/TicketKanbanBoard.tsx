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
  ticketType: string;
  dueDate: string;
  assignedTo?: {
    staffProfile?: {
      fullName: string;
    };
  };
  createdBy: {
    staffProfile?: {
      fullName: string;
    };
    email: string;
  };
  project?: {
    id: number;
    name: string;
    color: string;
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
    { key: 'OPEN', label: 'Open', color: 'border-l-blue-500' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: 'border-l-orange-500' },
    { key: 'ON_HOLD', label: 'On Hold', color: 'border-l-purple-500' },
    { key: 'COMPLETED', label: 'Completed', color: 'border-l-green-500' },
  ];

  const getTicketsByStatus = (status: string) => {
    return tickets.filter(ticket => ticket.status === status);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EPIC':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
          </svg>
        );
      case 'STORY':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
        );
      case 'IMPROVEMENT':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        );
      case 'BUG':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'EPIC':
        return 'text-purple-600';
      case 'STORY':
        return 'text-green-600';
      case 'IMPROVEMENT':
        return 'text-blue-600';
      case 'BUG':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      case 'MEDIUM':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        );
      case 'HIGH':
        return (
          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        );
      case 'CRITICAL':
        return (
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
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
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statuses.map((status) => {
        const statusTickets = getTicketsByStatus(status.key);

        return (
          <div
            key={status.key}
            className="flex-shrink-0 w-80 bg-white rounded-lg p-3 border border-gray-200 shadow-sm"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status.key)}
          >
            {/* Column Header */}
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
                  {status.label}
                </h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {statusTickets.length}
                </span>
              </div>
            </div>

            {/* Tickets Container */}
            <div className="space-y-2 min-h-[200px] max-h-[600px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {statusTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <p className="text-xs font-medium">No tickets</p>
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
                      className={`bg-white rounded-lg border border-gray-200 border-l-4 ${status.color} p-3 cursor-pointer hover:shadow-md transition-all group`}
                    >
                      {/* Title */}
                      <h4 className="font-medium text-sm text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {ticket.title}
                      </h4>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* Ticket Number */}
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium text-gray-500">
                                {ticket.ticketNumber}
                              </span>
                              {ticket.project && (
                                <span
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: ticket.project.color }}
                                  title={`Project: ${ticket.project.name}`}
                                />
                              )}
                            </div>
                          </div>

                          {/* Type Icon */}
                          {ticket.ticketType && (
                            <span className={`flex items-center ${getTypeColor(ticket.ticketType)}`}>
                              {getTypeIcon(ticket.ticketType)}
                            </span>
                          )}

                          {/* Priority Icon */}
                          <span className="flex items-center" title={ticket.priority}>
                            {getPriorityIcon(ticket.priority)}
                          </span>

                          {/* Overdue Badge */}
                          {isOverdue && (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                              OVERDUE
                            </span>
                          )}
                        </div>

                      </div>

                      {/* Card Footer: Date, Comments & Assignee Flow */}
                      <div className="mt-3 flex items-end justify-between">
                        <div className="flex items-center gap-3">
                          {/* Due Date */}
                          {ticket.dueDate && (
                            <div className={`flex items-center gap-1 text-xs ${new Date(ticket.dueDate) < new Date() &&
                                ticket.status !== 'COMPLETED' &&
                                ticket.status !== 'CLOSED'
                                ? 'text-red-600 font-medium'
                                : 'text-gray-500'
                              }`}>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>
                                {new Date(ticket.dueDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          )}

                          {/* Comments Count */}
                          {ticket.comments && ticket.comments.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                              <span>{ticket.comments.length}</span>
                            </div>
                          )}
                        </div>

                        {/* Creator -> Assignee Flow */}
                        <div className="flex items-center gap-1">
                          {/* Creator */}
                          <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 text-[10px] font-semibold"
                            title={`Created by: ${ticket.createdBy?.staffProfile?.fullName || ticket.createdBy?.email || 'Unknown'}`}>
                            {(ticket.createdBy?.staffProfile?.fullName || ticket.createdBy?.email || '?').charAt(0).toUpperCase()}
                          </div>

                          {/* Arrow */}
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>

                          {/* Assignee */}
                          {ticket.assignedTo?.staffProfile ? (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm"
                              title={`Assigned to: ${ticket.assignedTo.staffProfile.fullName}`}>
                              {ticket.assignedTo.staffProfile.fullName.charAt(0).toUpperCase()}
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-[10px]" title="Unassigned">
                              ?
                            </div>
                          )}
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
