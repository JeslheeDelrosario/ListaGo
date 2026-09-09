# ListaGo - Modern ToDo List Application with Project Management

A beautiful, feature-rich task management application with a modern glassmorphism design, built with vanilla JavaScript and ES6 modules. Track your tasks, organize them into projects, manage priorities, and collaborate with a comprehensive dashboard that looks and feels professional.

![ListaGo App Screenshot](assets/screenshots/dashboard.png)

## ✨ Features

### 🎯 Core Task Management
- **Jira-Style Task Creation**: Professional modal for creating tasks with comprehensive fields
- **Rich Text Descriptions**: CKEditor 5 integration for formatted task descriptions
- **Task Priorities**: Assign Low, Medium, High, or Urgent priorities with visual indicators
- **Task Statuses**: Track tasks with To Do, In Progress, Review, and Done statuses
- **Complete Tasks**: Check/uncheck tasks with smooth animations (synced with status field)
- **Edit Tasks**: Inline editing with enhanced modal dialog
- **Bulk Delete**: Delete multiple selected tasks at once with confirmation
- **Delete Tasks**: Safe deletion with confirmation modal
- **Filter Tasks**: View All, Active, or Completed tasks
- **Due Dates**: Assign dates to tasks and track overdue items
- **Persistent Storage**: Tasks and projects saved in browser's localStorage
- **Search Tasks**: Real-time search across all your tasks

### 📁 Advanced Project Management
- **Create Projects**: Organize tasks into custom projects with beautiful cards
- **Custom Icons & Colors**: Choose from a variety of icons and colors to personalize each project
- **Project Filtering**: View tasks by specific project from sidebar navigation
- **Default Inbox**: Catch-all project for uncategorized tasks
- **Project Deletion**: Safe project removal with task handling options
- **Visual Project Indicators**: Each task displays its project's color and icon

### 📊 Comprehensive Dashboard & Views
- **Dashboard**: Overview with statistics cards and organized task sections (Today, Upcoming, Overdue)
- **Today View**: See all tasks due today in a clean list
- **Upcoming View**: Track tasks due in the next 7 days
- **All Tasks View**: Complete list of every task in the system
- **Statistics Cards**: Visual metrics for total, pending, completed, and overdue tasks
- **Overdue Tracking**: Automatic highlighting of overdue tasks with pulse animations
- **Real-time Stats**: Sidebar displays live task counts that update automatically

### 🎨 Professional Modern Design
- **Glassmorphism UI**: Beautiful frosted glass effect with backdrop blur
- **Gradient Backgrounds**: Stunning purple-blue gradient theme (#0f0c29 to #24243e)
- **Smooth Animations**: Subtle transitions, hover effects, and slide-in animations
- **Fully Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **Dark Theme**: Easy on the eyes with carefully chosen contrast ratios
- **Font Awesome Icons**: Professional iconography throughout the interface
- **Collapsible Sidebar**: Hamburger menu for mobile with overlay backdrop
- **Professional Modals**: Jira-inspired task creation modal with clean form design
- **Priority Badges**: Color-coded priority indicators (Urgent: red, High: orange, Medium: yellow, Low: green)

### ⌨️ Keyboard Shortcuts
- `Ctrl/Cmd + A` - Focus input field
- `Delete` - Clear all completed tasks (with confirmation)
- `Escape` - Close any open modal or reset filters
- `Enter` - Add task (when input is focused)
- `/` - Focus search bar from anywhere in the app

### 🛡️ Enterprise-Grade Features
- **XSS Protection**: All user input is properly escaped before rendering
- **Input Validation**: Maximum task length of 200 characters, project name validation (50 char limit)
- **Duplicate Prevention**: Cannot add identical tasks or projects with the same name
- **Error Handling**: Graceful handling of localStorage quota issues
- **Debouncing**: Prevents accidental double-clicks and excessive API calls
- **Multiple Modals**: Task creation, edit, delete, bulk delete, project creation, and project deletion modals
- **UUID Generation**: Unique identifiers for all tasks and projects using crypto.randomUUID()
- **Date Filtering**: Intelligent filtering of tasks by due date with automatic categorization
- **Real-time Search**: Instant search across all task titles and descriptions
- **Mobile-First Approach**: Fully responsive with touch-friendly interactions
- **Rich Text Support**: CKEditor 5 integration for professional task descriptions

## 🚀 Quick Start

1. **Clone or Download** the project files
2. **Open** `index.html` in your web browser
3. **Start Adding Tasks** - no setup required!

## 📁 Project Structure

```
listaGo/
├── index.html              # Main HTML file
├── modal-test.html         # Modal testing page
├── assets/                 # Assets directory
│   ├── favicon/            # Favicon files
│   │   ├── favicon.ico
│   │   ├── apple-touch-icon.png
│   │   ├── site.webmanifest
│   │   └── ...
│   ├── icon/               # App icon
│   │   └── icon.jpeg
│   └── screenshots/        # Screenshot files
│       ├── default.png
│       ├── addtask.png
│       └── deletemodal.png
├── css/
│   ├── style.css           # Main styling with glassmorphism design
│   ├── modal.css           # All modal styles
│   └── dashboard.css       # Dashboard-specific styling
├── js/
│   ├── app.js              # Main application entry point
│   ├── script-backup.js    # Legacy backup script
│   └── modules/
│       ├── storage.js                      # localStorage operations
│       ├── taskManager.js                  # Enhanced task CRUD with priorities & statuses
│       ├── projectManager.js               # Project management functionality
│       ├── uiRenderer.js                   # UI rendering functions
│       ├── sidebar.js                      # Sidebar navigation and view switching
│       ├── notifications.js                # Toast notification system
│       ├── modal.js                        # Delete confirmation modal
│       ├── editModal.js                    # Legacy edit task modal (for backward compatibility)
│       ├── projectModal.js                 # Project creation modal
│       ├── taskFormModal.js                # NEW: Jira-style task creation modal
│       ├── uiRenderer.js                   # UI rendering with priority badges and status indicators
│       ├── utils.js                        # Helper functions including debouncing
│       └── views/
│           └── dashboardView.js            # Dashboard view rendering with statistics
├── LICENSE                # MIT License
├── README.md              # This file
└── .gitignore             # Git ignore file
```

## 🎨 Design System

### Colors
- **Primary**: `#6366f1` (Indigo) to `#8b5cf6` (Purple) gradient
- **Background**: Dark purple-blue gradient (`#0f0c29` to `#24243e`)
- **Glass Effect**: `rgba(255, 255, 255, 0.08)` with `backdrop-filter: blur(20px)`
- **Text**: Light gray (`#e0e0e0`) for optimal readability

### Typography
- **Font**: Inter (system-ui stack) for modern, clean text
- **Sizes**: Responsive scaling from 0.8rem to 1.8rem
- **Weights**: 400 (normal), 600 (semibold), 700 (bold)

### Animations
- **Task Entry**: Slide-in with scale animation
- **Hover Effects**: Subtle lift and shadow
- **Notifications**: Slide from right with fade
- **Modal**: Smooth fade-in overlay

## 💻 Technical Details

### Architecture
- **ES6 Modules**: Clean separation of concerns
- **Event Delegation**: Efficient event handling
- **State Management**: Centralized task state
- **No Dependencies**: Pure vanilla JavaScript

### Browser Support
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers

### Performance
- **Lazy Loading**: Modules loaded on demand
- **Debouncing**: Prevents excessive function calls
- **Efficient DOM Updates**: Minimal re-renders
- **Local Storage**: Fast client-side persistence
- **Responsive Grid Layouts**: CSS Grid for efficient space utilization

### Data Models

**Task Object**
```javascript
{
  id: "uuid-string",
  title: "Task description",
  text: "Task description", // Backward compatibility
  description: "Rich text description of the task",
  completed: false,
  createdAt: "ISO-date-string",
  dueDate: "YYYY-MM-DD" || null,
  createdDate: "Date.toDateString()",
  projectId: "project-uuid" || null,
  priority: "low" | "medium" | "high" | "urgent",
  status: "todo" | "inprogress" | "review" | "done"
}
```

**Project Object**
```javascript
{
  id: "uuid-string",
  name: "Project Name",
  color: "#hex-color",
  icon: "fas fa-icon-name",
  createdAt: "ISO-date-string"
}
```

## 🔧 Customization

### Changing Colors
Edit the CSS variables in [`style.css`](css/style.css):

```css
:root {
  --primary-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  --bg-gradient: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
}
```

### Modifying Task Limits
Change the maximum task length in [`taskManager.js`](js/modules/taskManager.js):

```javascript
const MAX_TASK_LENGTH = 200; // Change as needed
```

### Customizing Dashboard Animations
Adjust pulse animation for overdue tasks in [`dashboard.css`](css/dashboard.css):

```css
.stat-card-compact.overdue.has-overdue {
    animation: pulse 2s infinite;
}
```

### Adding More Project Icons
Extend the available project icons in [`projectModal.js`](js/modules/projectModal.js) to add more Font Awesome icons for projects.

### Customizing Project Colors
Add more color options to the project creation modal in the color picker to expand your customization options.

## 🐛 Troubleshooting

### Tasks Not Saving
- Check if localStorage is enabled in your browser
- Ensure you're not in private/incognito mode
- Try clearing browser data and reloading

### Projects Not Loading
- Clear browser cache and refresh
- Check browser console for JSON parsing errors
- Ensure localStorage has sufficient space available

### Dashboard Not Rendering
- Check if you have JavaScript enabled
- Verify all module files are present in the correct directories
- Check browser console for module loading errors

### Search Not Working
- Refresh the page to reset the search functionality
- Clear any browser extensions that might interfere with input events

### Buttons Not Working
- Refresh the page (F5)
- Check browser console for errors
- Ensure JavaScript is enabled

### Mobile Issues
- Try rotating your device
- Clear browser cache
- Update to latest browser version
- Verify glassmorphism effects are supported on your mobile browser

## 🤝 Contributing

Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Share your customizations

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Design inspired by modern glassmorphism trends
- Color palette from Tailwind CSS
- Icons from emoji set
- Built with love and vanilla JavaScript

---

**Made with ❤️ for productivity enthusiasts**