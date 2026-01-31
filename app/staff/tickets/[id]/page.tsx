'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TicketComments from '@/components/TicketComments';
import CreateTicketModal from '@/components/CreateTicketModal';

interface Ticket {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  ticketType: string;
  storyPoints?: number | null;
  parentId?: number | null;
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
  parent?: {
    id: number;
    ticketNumber: string;
    title: string;
    ticketType: string;
  };
  subtasks?: Ticket[];
  comments: any[];
  project?: {
    id: number;
    name: string;
    color: string;
  };
  projectId?: number | null;
}

export default function StaffTicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params?.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/');
      return;
    }

    fetchTicket();
    fetchProjects();
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

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      case 'MEDIUM':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        );
      case 'HIGH':
        return (
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        );
      case 'CRITICAL':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
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

  const handleProjectChange = async (newProjectId: string) => {
    setIsUpdatingProject(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/staff/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId: newProjectId }),
      });

      if (response.ok) {
        fetchTicket(); // Refresh ticket data
      } else {
        alert('Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project');
    } finally {
      setIsUpdatingProject(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EPIC':
        return '🎯';
      case 'STORY':
        return '📖';
      case 'IMPROVEMENT':
        return '⚡';
      case 'BUG':
        return '🐛';
      default:
        return '📝';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'EPIC':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'STORY':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'IMPROVEMENT':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'BUG':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/staff/tickets/${ticketId}/delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        router.push('/staff/tickets');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete ticket');
      }
    } catch (error) {
      alert('Error deleting ticket');
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
        {/* Back Button and Actions */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/tickets')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Tickets
          </button>

          {ticket.createdBy.id === currentUserId && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Ticket
            </button>
          )}
        </div>

        {/* Parent Ticket Breadcrumb */}
        {ticket.parent && (
          <div className="mb-4 bg-white rounded-lg shadow-sm p-3 border border-gray-200">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 font-medium">Parent:</span>
              <button
                onClick={() => router.push(`/staff/tickets/${ticket.parent!.id}`)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
              >
                <span>{getTypeIcon(ticket.parent.ticketType)}</span>
                <span>{ticket.parent.ticketNumber}</span>
                <span>-</span>
                <span>{ticket.parent.title}</span>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              {/* Clean Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTypeIcon(ticket.ticketType)}</span>
                  <span className="text-2xl font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                    {ticket.ticketNumber}
                  </span>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getTypeColor(ticket.ticketType)}`}>
                    {ticket.ticketType}
                  </span>
                  {ticket.storyPoints && (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300">
                      {ticket.storyPoints} pts
                    </span>
                  )}
                  <span className="flex items-center" title={ticket.priority}>
                    {getPriorityIcon(ticket.priority)}
                  </span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-800 mb-4">{ticket.title}</h1>

              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
              </div>

              {/* Subtasks Section */}
              {ticket.subtasks && ticket.subtasks.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Subtasks ({ticket.subtasks.length})
                    </h3>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Subtask
                    </button>
                  </div>
                  <div className="space-y-2">
                    {ticket.subtasks.map((subtask) => (
                      <div
                        key={subtask.id}
                        onClick={() => router.push(`/staff/tickets/${subtask.id}`)}
                        className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 border border-gray-200 hover:border-blue-300 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-lg">{getTypeIcon(subtask.ticketType)}</span>
                            <span className="text-sm font-bold text-gray-600">{subtask.ticketNumber}</span>
                            <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors flex-1">
                              {subtask.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {subtask.storyPoints && (
                              <span className="text-xs font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                {subtask.storyPoints}pts
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(subtask.status)}`}>
                              {subtask.status.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold border ${getPriorityColor(subtask.priority)}`}>
                              {subtask.priority}
                            </span>
                            {subtask.assignedTo && (
                              <span className="text-xs text-gray-600">
                                {subtask.assignedTo.staffProfile?.fullName || subtask.assignedTo.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Subtasks - Show Create Button */}
              {(!ticket.subtasks || ticket.subtasks.length === 0) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Subtasks
                    </h3>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Subtask
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-600 font-medium mb-2">No subtasks yet</p>
                    <p className="text-sm text-gray-500">Break down this ticket into smaller subtasks</p>
                  </div>
                </div>
              )}
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
                  <p className="text-sm font-semibold text-gray-600 mb-2">Project</p>
                  <select
                    value={ticket.projectId || ''}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    disabled={isUpdatingProject}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900 font-medium disabled:opacity-50"
                  >
                    <option value="">-- No Project --</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
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
                  <p className={`text-gray-800 font-medium flex items-center gap-2 ${new Date(ticket.dueDate) < new Date() && ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED'
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

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchTicket();
          }}
          defaultParentId={ticket.id}
        />
      )}
    </div>
  );
}
