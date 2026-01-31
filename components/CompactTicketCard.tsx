'use client';

import { useRouter } from 'next/navigation';

interface Ticket {
    id: number;
    ticketNumber: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    ticketType: string;
    storyPoints?: number | null;
    dueDate: string;
    createdAt: string;
    assignedTo?: {
        id: number;
        email: string;
        staffProfile?: {
            fullName: string;
        };
    };
    subtasks?: Ticket[];
    _count?: {
        subtasks: number;
    };
}

interface CompactTicketCardProps {
    ticket: Ticket;
    isAdmin?: boolean;
    showSubtasks?: boolean;
}

export default function CompactTicketCard({ ticket, isAdmin = false, showSubtasks = false }: CompactTicketCardProps) {
    const router = useRouter();

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'IN_PROGRESS':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'ON_HOLD':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'COMPLETED':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'CLOSED':
                return 'bg-gray-50 text-gray-600 border-gray-200';
            default:
                return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'LOW':
                return 'text-gray-500';
            case 'MEDIUM':
                return 'text-blue-500';
            case 'HIGH':
                return 'text-orange-500';
            case 'CRITICAL':
                return 'text-red-600';
            default:
                return 'text-gray-500';
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'CRITICAL':
                return '⬆⬆';
            case 'HIGH':
                return '⬆';
            case 'MEDIUM':
                return '➡';
            case 'LOW':
                return '⬇';
            default:
                return '➡';
        }
    };

    const getDaysRemaining = () => {
        const today = new Date();
        const due = new Date(ticket.dueDate);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysRemaining = getDaysRemaining();
    const isOverdue = daysRemaining < 0 && ticket.status !== 'COMPLETED' && ticket.status !== 'CLOSED';
    const isDueSoon = daysRemaining >= 0 && daysRemaining <= 3 && ticket.status !== 'COMPLETED' && ticket.status !== 'CLOSED';

    const completedSubtasks = ticket.subtasks?.filter(st => st.status === 'COMPLETED' || st.status === 'CLOSED').length || 0;
    const totalSubtasks = ticket._count?.subtasks || ticket.subtasks?.length || 0;
    const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleClick = () => {
        if (isAdmin) {
            router.push(`/admin/tickets/${ticket.id}`);
        } else {
            router.push(`/staff/tickets/${ticket.id}`);
        }
    };

    return (
        <div
            onClick={handleClick}
            className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer p-3 group"
        >
            {/* Header Row */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{getTypeIcon(ticket.ticketType)}</span>
                    <span className="text-xs font-bold text-gray-600">{ticket.ticketNumber}</span>
                    <span className={`text-xs ${getPriorityColor(ticket.priority)}`} title={ticket.priority}>
                        {getPriorityIcon(ticket.priority)}
                    </span>
                </div>
                {ticket.storyPoints && (
                    <div className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-0.5 rounded" title="Story Points">
                        {ticket.storyPoints}pts
                    </div>
                )}
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {ticket.title}
            </h3>

            {/* Footer Row */}
            <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Assignee */}
                    {ticket.assignedTo && (
                        <div
                            className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold flex-shrink-0"
                            title={ticket.assignedTo.staffProfile?.fullName || ticket.assignedTo.email}
                        >
                            {getInitials(ticket.assignedTo.staffProfile?.fullName || ticket.assignedTo.email)}
                        </div>
                    )}

                    {/* Due Date */}
                    <div className={`flex items-center gap-1 flex-shrink-0 ${isOverdue ? 'text-red-600 font-semibold' : isDueSoon ? 'text-orange-600 font-semibold' : 'text-gray-600'
                        }`}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">
                            {isOverdue ? `${Math.abs(daysRemaining)}d overdue` : daysRemaining === 0 ? 'Today' : `${daysRemaining}d`}
                        </span>
                    </div>

                    {/* Subtasks */}
                    {totalSubtasks > 0 && (
                        <div className="flex items-center gap-1 text-gray-600 flex-shrink-0" title={`${completedSubtasks}/${totalSubtasks} subtasks completed`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span>{completedSubtasks}/{totalSubtasks}</span>
                        </div>
                    )}
                </div>

                {/* Status Badge */}
                <span className={`px-2 py-0.5 rounded text-xs font-medium border flex-shrink-0 ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                </span>
            </div>

            {/* Subtask Progress Bar */}
            {totalSubtasks > 0 && (
                <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                            className="bg-green-500 h-1 rounded-full transition-all"
                            style={{ width: `${subtaskProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Show Subtasks if enabled */}
            {showSubtasks && ticket.subtasks && ticket.subtasks.length > 0 && (
                <div className="mt-2 pl-4 border-l-2 border-gray-200 space-y-1">
                    {ticket.subtasks.slice(0, 3).map((subtask) => (
                        <div key={subtask.id} className="text-xs text-gray-600 flex items-center gap-2">
                            <span className={subtask.status === 'COMPLETED' || subtask.status === 'CLOSED' ? 'line-through' : ''}>
                                {getTypeIcon(subtask.ticketType)} {subtask.ticketNumber} - {subtask.title}
                            </span>
                        </div>
                    ))}
                    {ticket.subtasks.length > 3 && (
                        <div className="text-xs text-gray-500 italic">
                            +{ticket.subtasks.length - 3} more subtasks
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
