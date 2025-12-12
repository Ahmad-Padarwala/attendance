'use client';

import { useRouter } from 'next/navigation';

interface Ticket {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  createdAt: string;
  assignedTo?: {
    id: number;
    email: string;
    staffProfile?: {
      fullName: string;
    };
  };
  createdBy: {
    id: number;
    email: string;
    staffProfile?: {
      fullName: string;
    };
  };
  comments: any[];
}

interface TicketListProps {
  tickets: Ticket[];
  isAdmin?: boolean;
}

export default function TicketList({ tickets, isAdmin = false }: TicketListProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'RESOLVED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
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


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleTicketClick = (ticketId: number) => {
    if (isAdmin) {
      router.push(`/admin/tickets/${ticketId}`);
    } else {
      router.push(`/staff/tickets/${ticketId}`);
    }
  };

  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Tickets Found</h3>
        <p className="text-gray-500">There are no tickets to display at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          onClick={() => handleTicketClick(ticket.id)}
          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-100 hover:border-blue-200 p-6 group"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                  {ticket.ticketNumber}
                </span>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                {ticket.title}
              </h3>

              {/* Description Preview */}
              <p className="text-gray-600 mb-4 line-clamp-2">
                {ticket.description}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {ticket.assignedTo && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>
                      <span className="font-medium">Assigned to:</span>{' '}
                      {ticket.assignedTo.staffProfile?.fullName || ticket.assignedTo.email}
                    </span>
                  </div>
                )}
                <div className={`flex items-center gap-2 ${
                  new Date(ticket.dueDate) < new Date() && ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED'
                    ? 'text-red-600 font-semibold'
                    : ''
                }`}>
                  <svg className={`w-4 h-4 ${
                    new Date(ticket.dueDate) < new Date() && ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED'
                      ? 'text-red-500'
                      : 'text-orange-500'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    <span className="font-medium">Due:</span>{' '}
                    {new Date(ticket.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {new Date(ticket.dueDate) < new Date() && ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
                      <span className="ml-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Overdue</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span>{ticket.comments.length} comment{ticket.comments.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatDate(ticket.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Arrow Icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center transition-all">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

