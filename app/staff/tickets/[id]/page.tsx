'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TicketComments from '@/components/TicketComments';

interface Ticket {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
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

export default function StaffTicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params?.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/');
      return;
    }

    fetchTicket();
  }, [router, ticketId]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/staff/tickets/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTicket(data.ticket);
      } else {
        router.push('/staff/tickets');
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
      router.push('/staff/tickets');
    } finally {
      setLoading(false);
    }
  };

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

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/staff/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchTicket(); // Refresh ticket data
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="w-[95%] mx-auto py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/staff/tickets')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to My Tickets
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-2xl font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                    {ticket.ticketNumber}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-800 mb-4">{ticket.title}</h1>
              
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <TicketComments
                ticketId={ticket.id}
                comments={ticket.comments}
                onCommentAdded={fetchTicket}
                isAdmin={false}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Ticket Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Update Status</p>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isUpdatingStatus}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 font-medium disabled:opacity-50"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Priority</p>
                  <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold border ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Assigned To</p>
                  <p className="text-gray-800 font-medium">
                    {ticket.assignedTo?.staffProfile?.fullName || 'Unassigned'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Created By</p>
                  <p className="text-gray-800 font-medium">
                    {ticket.createdBy.staffProfile?.fullName || 'Admin'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Due Date</p>
                  <p className={`text-gray-800 font-medium flex items-center gap-2 ${
                    new Date(ticket.dueDate) < new Date() && ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED'
                      ? 'text-red-600'
                      : ''
                  }`}>
                    {new Date(ticket.dueDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {new Date(ticket.dueDate) < new Date() && ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                        Overdue
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Created At</p>
                  <p className="text-gray-800 font-medium">
                    {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Last Updated</p>
                  <p className="text-gray-800 font-medium">
                    {new Date(ticket.updatedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Help Info */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-md p-6 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Need Help?</h4>
                  <p className="text-sm text-gray-700">
                    Use the comments section to communicate with your admin about this ticket. 
                    You'll receive updates as the ticket progresses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

