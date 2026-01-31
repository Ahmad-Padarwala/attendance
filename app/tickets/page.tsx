'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TicketFilters from '@/components/TicketFilters';
import CreateTicketModal from '@/components/CreateTicketModal';
import CreateProjectModal from '@/components/CreateProjectModal';
import EditProjectModal from '@/components/EditProjectModal';
import TicketKanbanBoard from '@/components/TicketKanbanBoard';

export default function PublicTicketsPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [editingProject, setEditingProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        priority: '',
        assignee: '',
        search: '',
    });

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            router.push('/');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUserRole(parsedUser.role);

        fetchProjects();
        fetchTickets();
        fetchStaff();
    }, [router, filters, selectedProjectId]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams();

            if (filters.type) queryParams.append('type', filters.type);
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.priority) queryParams.append('priority', filters.priority);
            if (filters.assignee) queryParams.append('assignedToId', filters.assignee);
            if (filters.search) queryParams.append('search', filters.search);
            if (selectedProjectId) queryParams.append('projectId', selectedProjectId.toString());

            const queryString = queryParams.toString();
            const url = queryString ? `/api/tickets?${queryString}` : '/api/tickets';

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTickets(data.tickets);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
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
                setStaffList(data.staff || []);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    const getTypeCount = (type: string) => {
        return tickets.filter((ticket: any) => ticket.ticketType === type).length;
    };

    const getStatusCount = (status: string) => {
        return tickets.filter((ticket: any) => ticket.status === status).length;
    };

    const handleBackToDashboard = () => {
        if (userRole === 'ADMIN') {
            router.push('/admin/staff');
        } else {
            router.push('/staff/dashboard');
        }
    };

    const handleStatusChange = async (ticketId: number, newStatus: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/tickets/${ticketId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                fetchTickets(); // Refresh tickets
            }
        } catch (error) {
            console.error('Error updating ticket status:', error);
        }
    };

    if (loading && tickets.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
            </div>

            {/* Dot Pattern Overlay */}
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
                backgroundSize: '24px 24px'
            }}></div>

            <div className="relative z-10">
                {/* Header */}
                <header className="bg-white/30 backdrop-blur-xl shadow-lg border-b border-white/40">
                    <div className="w-[95%] mx-auto py-5 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 via-blue-700 to-purple-700 bg-clip-text text-transparent">
                                All Tickets
                            </h1>
                            <p className="text-sm font-semibold text-gray-700 mt-1">View and manage all project tickets</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleBackToDashboard}
                                className="group bg-gradient-to-r from-gray-600 to-slate-600 text-white px-5 py-2.5 rounded-xl hover:from-gray-700 hover:to-slate-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Dashboard
                            </button>
                            <button
                                onClick={handleLogout}
                                className="group bg-gradient-to-r from-red-600 to-rose-600 text-white px-5 py-2.5 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="w-[95%] mx-auto py-8">
                    {/* Summary Statistics */}
                    <div className="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                        {/* Type Stats */}
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-3 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold opacity-90 uppercase">Epics</p>
                                    <p className="text-2xl font-bold mt-0.5">{getTypeCount('EPIC')}</p>
                                </div>
                                <svg className="w-8 h-8 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                                </svg>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-3 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold opacity-90 uppercase">Stories</p>
                                    <p className="text-2xl font-bold mt-0.5">{getTypeCount('STORY')}</p>
                                </div>
                                <svg className="w-8 h-8 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                </svg>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-3 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold opacity-90 uppercase">Improvements</p>
                                    <p className="text-2xl font-bold mt-0.5">{getTypeCount('IMPROVEMENT')}</p>
                                </div>
                                <svg className="w-8 h-8 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md p-3 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold opacity-90 uppercase">Bugs</p>
                                    <p className="text-2xl font-bold mt-0.5">{getTypeCount('BUG')}</p>
                                </div>
                                <svg className="w-8 h-8 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>

                        {/* Status Stats */}
                        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-md p-3 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold opacity-90 uppercase">Open</p>
                                    <p className="text-2xl font-bold mt-0.5">{getStatusCount('OPEN')}</p>
                                </div>
                                <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-md p-3 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold opacity-90 uppercase">In Progress</p>
                                    <p className="text-2xl font-bold mt-0.5">{getStatusCount('IN_PROGRESS')}</p>
                                </div>
                                <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-md p-3 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold opacity-90 uppercase">On Hold</p>
                                    <p className="text-2xl font-bold mt-0.5">{getStatusCount('ON_HOLD')}</p>
                                </div>
                                <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-md p-3 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold opacity-90 uppercase">Completed</p>
                                    <p className="text-2xl font-bold mt-0.5">{getStatusCount('COMPLETED')}</p>
                                </div>
                                <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Filters with integrated Create Button */}
                    <div className="mb-4">
                        <TicketFilters
                            filters={filters}
                            onFilterChange={setFilters}
                            onCreateClick={() => setShowCreateModal(true)}
                            staffList={staffList}
                            projects={projects}
                            selectedProjectId={selectedProjectId}
                            onProjectChange={setSelectedProjectId}
                            onCreateProjectClick={() => setShowCreateProjectModal(true)}
                            onEditProjectClick={(p) => setEditingProject(p)}
                        />
                    </div>



                    {/* Tickets Display */}
                    {tickets.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Tickets Found</h3>
                            <p className="text-gray-500">There are no tickets matching your filters.</p>
                        </div>
                    ) : (
                        <TicketKanbanBoard
                            tickets={tickets}
                            onStatusChange={handleStatusChange}
                            isStaff={userRole === 'STAFF'}
                        />
                    )}
                </main>
            </div>

            {/* Create Ticket Modal */}
            {showCreateModal && (
                <CreateTicketModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchTickets();
                    }}
                    selectedProjectId={selectedProjectId}
                />
            )}

            {/* Create Project Modal */}
            {showCreateProjectModal && (
                <CreateProjectModal
                    onClose={() => setShowCreateProjectModal(false)}
                    onSuccess={() => {
                        setShowCreateProjectModal(false);
                        fetchProjects();
                    }}
                />
            )}
            {/* Edit Project Modal */}
            {editingProject && (
                <EditProjectModal
                    project={editingProject}
                    onClose={() => setEditingProject(null)}
                    onSuccess={() => {
                        setEditingProject(null);
                        fetchProjects();
                    }}
                />
            )}
        </div>
    );
}
