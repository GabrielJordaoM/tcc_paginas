# Projeto de TCC - Paginas (por enquanto separadas)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). It implements a task management board inspired by Trello, allowing users to create, edit, delete, and drag tasks across columns, as well as manage columns themselves.

## Features

- **Drag-and-Drop Tasks**: Move tasks between columns or reorder them within the same column using a smooth drag-and-drop interface powered by `@dnd-kit`.
- **Task Management**: Add, edit, and delete tasks within columns. Tasks can be edited via a form with Enter/Escape support, and deletions require confirmation.
- **Column Management**: Create and delete columns with a simple form and confirmation dialog for deletions.
- **Trello-like Styling**: A clean interface with a navbar in `#4D8CB8`, light gray columns (`bg-gray-200`), and white task cards (`bg-white`).
- **Responsive Design**: Horizontal scrolling for columns to support various screen sizes.

## Dependencies

This project uses the following libraries:
- **Next.js**: React framework for server-side rendering and static site generation.
- **@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities**: For drag-and-drop functionality.
- **react-icons**: For icons like add (`FaPlus`), edit (`FaEdit`), and delete (`FaTrash`).
- **next/font**: To automatically optimize and load [Geist](https://vercel.com/font), a font family for Vercel.

To install dependencies, run:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities react-icons
```

## Getting Started

First, install the dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Then, run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000/board](http://localhost:3000/board) with your browser to see the result.

You can start editing the page by modifying `app/board/page.tsx`. The page auto-updates as you edit the file.

## Usage

- **Add a Task**: Click "Add Task" in a column, enter a task name, and press Enter or click "Add". Press Escape to cancel.
- **Edit a Task**: Click the edit icon (`FaEdit`) on a task, modify the text, and press Enter or click "Save". Press Escape to cancel.
- **Delete a Task**: Click the trash icon (`FaTrash`) on a task and confirm the deletion.
- **Add a Column**: Click "Add Column", enter a title, and press Enter or click "Add". Press Escape to cancel.
- **Delete a Column**: Click the trash icon (`FaTrash`) on a column and confirm the deletion.
- **Drag-and-Drop**: Drag tasks between columns or within the same column. Empty columns accept dragged tasks.

## Learn More

To learn more about Next.js, take a look at the following resources:
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Next Steps

- **Backend Integration**: Add persistence with Supabase or Firebase.
- **Additional Features**: Implement task labels, due dates, or comments.
- **Visual Enhancements**: Add animations for forms or drag-and-drop feedback.
- **Column Reordering**: Enable dragging columns to reorder them.
