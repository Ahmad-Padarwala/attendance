'use client';

import { useState, useEffect } from 'react';
import StoryPointsInput from './StoryPointsInput';

interface Staff {
  id: number;
  email: string;
  staffProfile: {
    fullName: string;
  };
}

interface Ticket {
  id: number;
  ticketNumber: string;
  title: string;
  ticketType: string;
}

interface Project {
  id: number;
  name: string;
  color: string;
}

interface CreateTicketModalProps {
  onClose: () => void;
  onSuccess: () => void;
  parentTicket?: Ticket | null;
  defaultParentId?: number;
  selectedProjectId?: number | null;
}

export default function CreateTicketModal({ onClose, onSuccess, parentTicket = null, defaultParentId, selectedProjectId = null }: CreateTicketModalProps) {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [parentTickets, setParentTickets] = useState<Ticket[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedToId: '',
    priority: 'MEDIUM',
    ticketType: 'STORY',
    storyPoints: null as number | null,
    dueDate: '',
    parentId: defaultParentId?.toString() || parentTicket?.id.toString() || '',
    projectId: selectedProjectId?.toString() || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStaff();
    fetchParentTickets();
    fetchProjects();
  }, []);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/staff/all-staff', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStaffList(data.staff);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchParentTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tickets', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Only show tickets that can be parents (not subtasks themselves)
        setParentTickets(data.tickets.filter((t: any) => !t.parentId));
      }
    } catch (error) {
      console.error('Error fetching parent tickets:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/projects', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      // Validate dueDate
      if (!formData.dueDate) {
        setError('Please select a due date');
        setLoading(false);
        return;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        ticketType: formData.ticketType,
        storyPoints: formData.storyPoints,
        dueDate: formData.dueDate,
        assignedToId: formData.assignedToId || null,
        parentId: formData.parentId || null,
      };

      console.log('Sending ticket data:', payload);

      const response = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        console.error('Server error:', data);
        setError(data.error || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      setError('Failed to create ticket: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Ticket
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ticket Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-gray-900 placeholder:text-gray-400"
              placeholder="Enter ticket title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all resize-none text-gray-900 placeholder:text-gray-400"
              rows={5}
              placeholder="Describe the ticket in detail..."
              required
            />
          </div>

          {/* Ticket Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ticket Type
            </label>
            <select
              value={formData.ticketType}
              onChange={(e) => setFormData({ ...formData, ticketType: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-gray-900"
            >
              <option value="EPIC">🎯 Epic</option>
              <option value="STORY">📖 Story</option>
              <option value="IMPROVEMENT">⚡ Improvement</option>
              <option value="BUG">🐛 Bug</option>
            </select>
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project (Optional)
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-gray-900"
            >
              <option value="">No Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Parent Ticket (for subtasks) */}
          {!parentTicket && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Parent Ticket (Optional)
                <span className="text-gray-500 font-normal ml-2 text-xs">Create as subtask</span>
              </label>
              <select
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-gray-900"
              >
                <option value="">-- No Parent (Standalone Ticket) --</option>
                {parentTickets.map((ticket) => (
                  <option key={ticket.id} value={ticket.id}>
                    {ticket.ticketNumber} - {ticket.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Story Points */}
          <StoryPointsInput
            value={formData.storyPoints}
            onChange={(points) => setFormData({ ...formData, storyPoints: points })}
            onDueDateSuggestion={(date) => {
              if (!formData.dueDate) {
                setFormData({ ...formData, dueDate: date.toISOString().split('T')[0] });
              }
            }}
          />

          {/* Assign To */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assign To (Optional)
            </label>
            <select
              value={formData.assignedToId}
              onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-gray-900"
            >
              <option value="">-- Select Staff Member --</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.staffProfile?.fullName || staff.email}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-gray-900"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Due Date *
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-gray-900"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

