Day 1-2:   npx create-next-app listago-kanban --typescript --tailwind --app
           Install: zustand @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
           Define types/index.ts (copy from your data models)

Day 3-4:   Build useTaskStore.ts (port taskManager.js logic)
           Build KanbanBoard → KanbanColumn → KanbanCard
           Get drag-and-drop working between columns

Day 5-6:   Build TaskModal (port your Jira-style modal to React)
           Add create/edit/delete functionality
           Style with glassmorphism Tailwind classes

Day 7-8:   Add Sidebar with project filtering
           Add search bar
           Add priority badges and due date indicators

Day 9-10:  Polish: animations, empty states, responsive mobile layout
           Deploy to Vercel


✅ Phase 1: Foundation (types, stores, DnD Kanban board)
✅ Phase 2: Layout & Modals (sidebar, header, task CRUD, search)
👉 Phase 3: Project Management (YOU ARE HERE)
⬜ Phase 4: Dashboard & Views (stats, Today/Upcoming/Overdue, charts)
⬜ Phase 5: Polish (animations, keyboard shortcuts, CKEditor, mobile)
⬜ Phase 6: Stretch Goals (auth, database, real-time collab)