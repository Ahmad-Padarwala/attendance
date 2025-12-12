# Ticket System - Implementation Guide

## Overview
A complete Jira-like ticket management system has been implemented for your attendance application. This allows admins to create, assign, and track tickets for staff members, with full commenting capabilities.

## Features Implemented

### 1. Database Schema
- **Ticket Model**: Stores ticket information with auto-generated ticket numbers (TKT-0001, TKT-0002, etc.)
- **TicketComment Model**: Stores comments on tickets
- **Ticket Status**: OPEN, IN_PROGRESS, RESOLVED, CLOSED
- **Ticket Priority**: LOW, MEDIUM, HIGH, URGENT

### 2. Admin Capabilities
Admins can:
- ✅ Create new tickets with title, description, priority, and assignment
- ✅ View all tickets with filtering by status and priority
- ✅ Edit ticket details (status, priority, assignment)
- ✅ Delete tickets
- ✅ Add comments to any ticket
- ✅ Assign/reassign tickets to staff members
- ✅ View ticket statistics (Open, In Progress, Resolved, Closed)

### 3. Staff Capabilities
Staff members can:
- ✅ View all tickets assigned to them
- ✅ Filter tickets by status
- ✅ View ticket details and comments
- ✅ Add comments to their assigned tickets
- ✅ Track ticket progress through status updates

## File Structure

### API Routes
```
app/api/admin/tickets/
  ├── route.ts                      # GET (list), POST (create)
  ├── [id]/route.ts                 # GET (single), PUT (update), DELETE
  └── [id]/comments/route.ts        # POST (add comment)

app/api/staff/tickets/
  ├── route.ts                      # GET (assigned tickets)
  ├── [id]/route.ts                 # GET (single ticket)
  └── [id]/comments/route.ts        # POST (add comment)
```

### UI Components
```
components/
  ├── CreateTicketModal.tsx         # Modal for creating new tickets
  ├── TicketList.tsx               # Display list of tickets
  └── TicketComments.tsx           # Display and add comments
```

### Pages
```
app/admin/tickets/
  ├── page.tsx                      # List all tickets (admin)
  └── [id]/page.tsx                # Ticket detail page (admin)

app/staff/tickets/
  ├── page.tsx                      # List assigned tickets (staff)
  └── [id]/page.tsx                # Ticket detail page (staff)
```

## How to Use

### For Admins

#### Creating a Ticket
1. Navigate to Admin Dashboard
2. Click on "Tickets" button in the header
3. Click "Create Ticket" button
4. Fill in:
   - **Title**: Brief description of the ticket
   - **Description**: Detailed explanation
   - **Assign To**: Select a staff member (optional)
   - **Priority**: LOW, MEDIUM, HIGH, or URGENT
5. Click "Create Ticket"

#### Managing Tickets
1. From the tickets page, click on any ticket to view details
2. Click "Edit" to update:
   - Status (OPEN → IN_PROGRESS → RESOLVED → CLOSED)
   - Priority
   - Assignment
3. Add comments to communicate with staff
4. Click "Delete" to remove a ticket (with confirmation)

#### Filtering Tickets
- Use the status dropdown to filter by ticket status
- Use the priority dropdown to filter by priority level
- View statistics at the top showing counts for each status

### For Staff

#### Viewing Assigned Tickets
1. Navigate to Staff Dashboard
2. Click on "My Tickets" button in the header
3. View all tickets assigned to you

#### Working with Tickets
1. Click on a ticket to view full details
2. Read the description and comments
3. Add comments to update progress or ask questions
4. The admin will update the status as work progresses

## API Endpoints

### Admin Endpoints

#### Get All Tickets
```
GET /api/admin/tickets
Query params: ?status=OPEN&priority=HIGH
```

#### Create Ticket
```
POST /api/admin/tickets
Body: {
  title: string,
  description: string,
  assignedToId?: number,
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
}
```

#### Get Single Ticket
```
GET /api/admin/tickets/[id]
```

#### Update Ticket
```
PUT /api/admin/tickets/[id]
Body: {
  title?: string,
  description?: string,
  status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED",
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  assignedToId?: number | null
}
```

#### Delete Ticket
```
DELETE /api/admin/tickets/[id]
```

#### Add Comment (Admin)
```
POST /api/admin/tickets/[id]/comments
Body: {
  comment: string
}
```

### Staff Endpoints

#### Get Assigned Tickets
```
GET /api/staff/tickets
Query params: ?status=OPEN
```

#### Get Single Ticket
```
GET /api/staff/tickets/[id]
```

#### Add Comment (Staff)
```
POST /api/staff/tickets/[id]/comments
Body: {
  comment: string
}
```

## Database Schema

### Ticket Table
```sql
CREATE TABLE tickets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticketNumber VARCHAR(191) UNIQUE,
  title VARCHAR(191),
  description TEXT,
  status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
  assignedToId INT,
  createdById INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assignedToId) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE CASCADE
);
```

### TicketComment Table
```sql
CREATE TABLE ticket_comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticketId INT,
  userId INT,
  comment TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ticketId) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

## Styling & UI

The ticket system follows the same design language as the rest of the application:
- **Modern gradient backgrounds** with animated blobs
- **Card-based layouts** with hover effects
- **Color-coded status badges** for easy visual identification
- **Responsive design** that works on all screen sizes
- **Smooth animations** and transitions

### Status Colors
- **OPEN**: Blue
- **IN_PROGRESS**: Yellow/Orange
- **RESOLVED**: Green
- **CLOSED**: Gray

### Priority Colors
- **LOW**: Gray
- **MEDIUM**: Blue
- **HIGH**: Orange
- **URGENT**: Red

## Security Features

1. **Authentication Required**: All endpoints require valid JWT token
2. **Role-Based Access**:
   - Admins can access and modify all tickets
   - Staff can only view and comment on their assigned tickets
3. **Authorization Checks**: Staff cannot view tickets assigned to others
4. **Input Validation**: All inputs are validated before processing

## Best Practices

1. **Ticket Naming**: Use clear, descriptive titles
2. **Priorities**: 
   - LOW: Nice-to-have improvements
   - MEDIUM: Regular tasks
   - HIGH: Important issues
   - URGENT: Critical problems needing immediate attention
3. **Status Updates**: Keep tickets updated as work progresses
4. **Comments**: Use comments for progress updates and clarifications
5. **Assignment**: Assign tickets to appropriate staff members

## Testing the System

1. **As Admin**:
   - Login as admin user
   - Create a test ticket
   - Assign it to a staff member
   - Add a comment
   - Update the status

2. **As Staff**:
   - Login as staff user
   - View your assigned tickets
   - Open a ticket and read details
   - Add a comment
   - Verify you cannot see unassigned tickets

## Future Enhancements (Optional)

- Email notifications when tickets are assigned/updated
- File attachments to tickets
- Ticket due dates and reminders
- Ticket categories/tags
- Advanced search and filtering
- Ticket history/activity log
- Dashboard widgets for ticket statistics
- Bulk ticket operations

## Troubleshooting

### Issue: Tickets not showing
- Check if staff member is properly assigned
- Verify authentication token is valid
- Check browser console for errors

### Issue: Cannot create ticket
- Ensure all required fields are filled
- Verify admin authentication
- Check database connection

### Issue: Comments not appearing
- Refresh the page to see latest comments
- Verify user has permission to comment
- Check network tab for API errors

## Support

For any issues or questions regarding the ticket system, please refer to:
- This documentation
- API endpoint responses for error messages
- Browser developer console for client-side issues
- Server logs for backend issues

---

**Implementation Date**: December 12, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅

