'use client';

interface TicketFiltersProps {
    filters: {
        type: string;
        status: string;
        priority: string;
        assignee: string;
        search: string;
    };
    onFilterChange: (filters: any) => void;
    onCreateClick?: () => void;
    staffList?: Array<{
        id: number;
        email: string;
        staffProfile?: { fullName: string };
    }>;
    projects?: Array<{ id: number; name: string; color: string }>;
    selectedProjectId?: number | null;
    onProjectChange?: (projectId: number | null) => void;
    onCreateProjectClick?: () => void;
    onEditProjectClick?: (project: any) => void;
}

export default function TicketFilters({
    filters,
    onFilterChange,
    onCreateClick,
    staffList = [],
    projects = [],
    selectedProjectId = null,
    onProjectChange,
    onCreateProjectClick,
    onEditProjectClick
}: TicketFiltersProps) {
    const hasActiveFilters = Object.values(filters).some(v => v !== '');

    const clearFilters = () => {
        onFilterChange({
            type: '',
            status: '',
            priority: '',
            assignee: '',
            search: '',
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
            {/* Project Filter - Horizontal List */}
            <div className="w-full pb-4 border-b border-gray-100 mb-4 overflow-x-auto">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">Projects</span>

                    <div className="flex items-center gap-2">
                        {/* All Projects */}
                        <button
                            onClick={() => onProjectChange && onProjectChange(null)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-medium whitespace-nowrap ${selectedProjectId === null
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${selectedProjectId === null ? 'bg-white' : 'bg-blue-600'}`}></span>
                            All Projects
                        </button>

                        {/* Dynamic Projects */}
                        {projects.map((project) => (
                            <button
                                key={project.id}
                                onClick={() => onProjectChange && onProjectChange(project.id)}
                                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-medium whitespace-nowrap ${selectedProjectId === project.id
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: project.color }}
                                ></span>
                                {project.name}

                                {/* Edit Icon - Visible on Hover (or always if selected?) */}
                                {onEditProjectClick && (
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditProjectClick(project);
                                        }}
                                        className={`ml-1 p-0.5 rounded transition-all ${selectedProjectId === project.id
                                            ? 'hover:bg-white/20 text-white'
                                            : 'hover:bg-gray-300 text-gray-500 opacity-0 group-hover:opacity-100'}`}
                                        title="Edit Project"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Create Project Button */}
                    {onCreateProjectClick && (
                        <button
                            onClick={onCreateProjectClick}
                            className="w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center justify-center transition-colors shadow-sm ml-1 flex-shrink-0"
                            title="Create Project"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Search</label>
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                        placeholder="Search tickets..."
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm text-gray-900 placeholder-gray-400"
                    />
                </div>

                {/* Type Filter */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                    <select
                        value={filters.type}
                        onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
                        className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm font-medium text-gray-900"
                    >
                        <option value="">All Types</option>
                        <option value="EPIC">🎯 Epic</option>
                        <option value="STORY">📖 Story</option>
                        <option value="IMPROVEMENT">⚡ Improvement</option>
                        <option value="BUG">🐛 Bug</option>
                    </select>
                </div>

                {/* Status Filter */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
                        className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm font-medium text-gray-900"
                    >
                        <option value="">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="ON_HOLD">On Hold</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>

                {/* Priority Filter */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Priority</label>
                    <select
                        value={filters.priority}
                        onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
                        className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm font-medium text-gray-900"
                    >
                        <option value="">All Priorities</option>
                        <option value="LOW">⬇ Low</option>
                        <option value="MEDIUM">➡ Medium</option>
                        <option value="HIGH">⬆ High</option>
                        <option value="CRITICAL">⬆⬆ Critical</option>
                    </select>
                </div>

                {/* Assignee Filter */}
                {staffList.length > 0 && (
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Assignee</label>
                        <select
                            value={filters.assignee}
                            onChange={(e) => onFilterChange({ ...filters, assignee: e.target.value })}
                            className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm font-medium text-gray-900"
                        >
                            <option value="">All Assignees</option>
                            <option value="unassigned">Unassigned</option>
                            {staffList.map((staff) => (
                                <option key={staff.id} value={staff.id.toString()}>
                                    {staff.staffProfile?.fullName || staff.email}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="mt-5 text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Clear Filters
                    </button>
                )}

                {/* Create Ticket Button */}
                {onCreateClick && (
                    <button
                        onClick={onCreateClick}
                        className="mt-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2 whitespace-nowrap"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Ticket
                    </button>
                )}
            </div>

            {/* Active Filter Badges */}
            {hasActiveFilters && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {filters.type && (
                        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                            Type: {filters.type}
                            <button onClick={() => onFilterChange({ ...filters, type: '' })} className="hover:text-purple-900">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    )}
                    {filters.status && (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                            Status: {filters.status.replace('_', ' ')}
                            <button onClick={() => onFilterChange({ ...filters, status: '' })} className="hover:text-blue-900">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    )}
                    {filters.priority && (
                        <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                            Priority: {filters.priority}
                            <button onClick={() => onFilterChange({ ...filters, priority: '' })} className="hover:text-orange-900">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    )}
                    {filters.assignee && (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            Assignee: {filters.assignee === 'unassigned' ? 'Unassigned' : staffList.find(s => s.id.toString() === filters.assignee)?.staffProfile?.fullName || 'Unknown'}
                            <button onClick={() => onFilterChange({ ...filters, assignee: '' })} className="hover:text-green-900">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    )}
                    {filters.search && (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                            Search: &quot;{filters.search}&quot;
                            <button onClick={() => onFilterChange({ ...filters, search: '' })} className="hover:text-gray-900">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
