"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";

// Types
type Task = { id: string; content: string };
type Column = { id: string; title: string; tasks: Task[] };

// Initial data
const initialColumns: Column[] = [
  { id: "todo", title: "To Do", tasks: [{ id: "1", content: "Tarefa 1" }, { id: "2", content: "Tarefa 2" }] },
  { id: "inprogress", title: "In Progress", tasks: [{ id: "3", content: "Tarefa 3" }] },
  { id: "done", title: "Done", tasks: [] },
];

export default function BoardPage() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [newTaskContent, setNewTaskContent] = useState<{ [key: string]: string }>({});
  const [showTaskForm, setShowTaskForm] = useState<{ [key: string]: boolean }>({});
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [editTaskState, setEditTaskState] = useState<{ columnId: string; taskId: string; content: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // Prevent accidental drags
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Handle drag start to set the active task for DragOverlay
  function handleDragStart(event: any) {
    const { active } = event;
    const activeTask = columns
      .flatMap((col) => col.tasks)
      .find((task) => task.id === active.id);
    setActiveTask(activeTask || null);
  }

  // Handle drag end to update column/task positions
  function handleDragEnd(event: any) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !active) return;

    const activeColumnId = active.data.current?.columnId;
    const overId = over.id;

    // Find the column or task being dropped over
    const overColumn = columns.find((col) => col.id === overId);
    const overTaskColumn = columns.find((col) => col.tasks.some((task) => task.id === overId));

    if (!activeColumnId) return;

    setColumns((prevColumns) => {
      const activeColumnIndex = prevColumns.findIndex((col) => col.id === activeColumnId);
      if (activeColumnIndex === -1) return prevColumns;

      const activeTaskIndex = prevColumns[activeColumnIndex].tasks.findIndex((task) => task.id === active.id);
      if (activeTaskIndex === -1) return prevColumns;

      // Drop on a column (including empty columns)
      if (overColumn) {
        const overColumnIndex = prevColumns.findIndex((col) => col.id === overId);
        if (overColumnIndex === -1) return prevColumns;

        const [movedTask] = prevColumns[activeColumnIndex].tasks.splice(activeTaskIndex, 1);
        prevColumns[overColumnIndex].tasks.push(movedTask);
        return [...prevColumns];
      }

      // Drop on a task within a column
      if (overTaskColumn) {
        const overColumnIndex = prevColumns.findIndex((col) => col.tasks.some((task) => task.id === overId));
        if (overColumnIndex === -1) return prevColumns;

        if (activeColumnIndex === overColumnIndex) {
          // Reorder tasks within the same column
          const oldIndex = activeTaskIndex;
          const newIndex = prevColumns[overColumnIndex].tasks.findIndex((task) => task.id === overId);
          prevColumns[overColumnIndex].tasks = arrayMove(prevColumns[overColumnIndex].tasks, oldIndex, newIndex);
          return [...prevColumns];
        } else {
          // Move task to another column
          const [movedTask] = prevColumns[activeColumnIndex].tasks.splice(activeTaskIndex, 1);
          prevColumns[overColumnIndex].tasks.push(movedTask);
          return [...prevColumns];
        }
      }

      return prevColumns;
    });
  }

  // Handle opening/closing the task form
  function toggleTaskForm(columnId: string) {
    setShowTaskForm((prev) => ({ ...prev, [columnId]: !prev[columnId] }));
    setNewTaskContent((prev) => ({ ...prev, [columnId]: "" }));
  }

  // Handle adding a new task
  function addTask(columnId: string, content: string) {
    if (!content.trim()) return; // Prevent empty tasks

    const newTask: Task = {
      id: `${Date.now()}`, // Simple ID generation
      content: content.trim(),
    };

    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col
      )
    );
    setShowTaskForm((prev) => ({ ...prev, [columnId]: false }));
    setNewTaskContent((prev) => ({ ...prev, [columnId]: "" }));
  }

  // Handle adding a new column
  function addColumn(title: string) {
    if (!title.trim()) return; // Prevent empty columns

    const newColumn: Column = {
      id: `${Date.now()}`, // Simple ID generation
      title: title.trim(),
      tasks: [],
    };

    setColumns((prevColumns) => [...prevColumns, newColumn]);
    setNewColumnTitle("");
    setShowColumnForm(false);
  }

  // Handle deleting a column
  function deleteColumn(columnId: string) {
    if (!confirm(`Are you sure you want to delete the column "${columns.find((col) => col.id === columnId)?.title}"?`)) {
      return;
    }

    setColumns((prevColumns) => prevColumns.filter((col) => col.id !== columnId));
    setShowTaskForm((prev) => {
      const newFormState = { ...prev };
      delete newFormState[columnId];
      return newFormState;
    });
    setNewTaskContent((prev) => {
      const newContentState = { ...prev };
      delete newContentState[columnId];
      return newContentState;
    });
  }

  // Handle editing a task
  function updateTask(columnId: string, taskId: string, content: string) {
    if (!content.trim()) return; // Prevent empty tasks

    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === columnId
          ? {
              ...col,
              tasks: col.tasks.map((task) =>
                task.id === taskId ? { ...task, content: content.trim() } : task
              ),
            }
          : col
      )
    );
    setEditTaskState(null);
  }

  // Handle deleting a task
  function deleteTask(columnId: string, taskId: string) {
    if (!confirm(`Are you sure you want to delete the task?`)) {
      return;
    }

    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === columnId
          ? { ...col, tasks: col.tasks.filter((task) => task.id !== taskId) }
          : col
      )
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar with custom color #4D8CB8 */}
      <nav className="bg-[#4D8CB8] text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold">Tasks</h1>
        </div>
        <div className="flex space-x-4">
          <button className="hover:bg-[#3b6b8a] px-3 py-1 rounded">Boards</button>
          <button className="hover:bg-[#3b6b8a] px-3 py-1 rounded">Profile</button>
        </div>
      </nav>

      {/* Board */}
      <div className="p-6">
        <div className="flex space-x-4 overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                showForm={showTaskForm[column.id] || false}
                newTaskContent={newTaskContent[column.id] || ""}
                setNewTaskContent={setNewTaskContent}
                toggleTaskForm={toggleTaskForm}
                addTask={addTask}
                deleteColumn={deleteColumn}
                editTask={updateTask}
                deleteTask={deleteTask}
                editTaskState={editTaskState}
                setEditTask={setEditTaskState}
              />
            ))}
            <DragOverlay>
              {activeTask ? (
                <div className="bg-white p-3 rounded shadow cursor-grabbing opacity-90">
                  {activeTask.content}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Add Column Form */}
          <div className="w-64 min-w-[16rem] flex flex-col">
            {showColumnForm ? (
              <div className="bg-gray-200 p-4 rounded-lg">
                <input
                  type="text"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addColumn(newColumnTitle);
                    if (e.key === "Escape") setShowColumnForm(false);
                  }}
                  placeholder="Enter column title..."
                  className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4D8CB8]"
                  autoFocus
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => addColumn(newColumnTitle)}
                    className="bg-[#4D8CB8] text-white px-3 py-1 rounded hover:bg-[#3b6b8a]"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowColumnForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowColumnForm(true)}
                className="bg-gray-200 p-4 rounded-lg text-gray-500 hover:text-gray-700 flex items-center"
              >
                <FaPlus className="mr-1" /> Add Column
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Column Component
interface ColumnProps {
  column: Column;
  showForm: boolean;
  newTaskContent: string;
  setNewTaskContent: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  toggleTaskForm: (columnId: string) => void;
  addTask: (columnId: string, content: string) => void;
  deleteColumn: (columnId: string) => void;
  editTask: (columnId: string, taskId: string, content: string) => void;
  deleteTask: (columnId: string, taskId: string) => void;
  editTaskState: { columnId: string; taskId: string; content: string } | null;
  setEditTask: React.Dispatch<
    React.SetStateAction<{ columnId: string; taskId: string; content: string } | null>
  >;
}

function Column({
  column,
  showForm,
  newTaskContent,
  setNewTaskContent,
  toggleTaskForm,
  addTask,
  deleteColumn,
  editTask,
  deleteTask,
  editTaskState,
  setEditTask,
}: ColumnProps) {
  const { attributes, listeners, setNodeRef } = useSortable({
    id: column.id,
    disabled: true, // Disable column dragging
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="bg-gray-200 p-4 rounded-lg w-64 min-w-[16rem] flex flex-col"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold text-lg text-gray-800">{column.title}</h2>
        <button
          onClick={() => deleteColumn(column.id)}
          className="text-gray-500 hover:text-red-500"
        >
          <FaTrash />
        </button>
      </div>
      <SortableContext
        items={[...column.tasks.map((task) => task.id), column.id]} // Include column ID for empty columns
        strategy={verticalListSortingStrategy}
      >
        {column.tasks.map((task) => (
          <Task
            key={task.id}
            task={task}
            columnId={column.id}
            editTask={editTask}
            deleteTask={deleteTask}
            isEditing={editTaskState?.taskId === task.id && editTaskState?.columnId === column.id}
            editContent={editTaskState?.taskId === task.id ? editTaskState.content : ""}
            setEditTask={setEditTask}
          />
        ))}
      </SortableContext>
      {showForm ? (
        <div className="mt-2">
          <input
            type="text"
            value={newTaskContent}
            onChange={(e) => setNewTaskContent((prev) => ({ ...prev, [column.id]: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTask(column.id, newTaskContent);
              if (e.key === "Escape") toggleTaskForm(column.id);
            }}
            placeholder="Enter task name..."
            className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4D8CB8]"
            autoFocus
          />
          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => addTask(column.id, newTaskContent)}
              className="bg-[#4D8CB8] text-white px-3 py-1 rounded hover:bg-[#3b6b8a]"
            >
              Add
            </button>
            <button
              onClick={() => toggleTaskForm(column.id)}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => toggleTaskForm(column.id)}
          className="mt-2 text-gray-500 hover:text-gray-700 flex items-center"
        >
          <FaPlus className="mr-1" /> Add Task
        </button>
      )}
    </div>
  );
}

// Task Component
interface TaskProps {
  task: Task;
  columnId: string;
  editTask: (columnId: string, taskId: string, content: string) => void;
  deleteTask: (columnId: string, taskId: string) => void;
  isEditing: boolean;
  editContent: string;
  setEditTask: React.Dispatch<
    React.SetStateAction<{ columnId: string; taskId: string; content: string } | null>
  >;
}

function Task({ task, columnId, editTask, deleteTask, isEditing, editContent, setEditTask }: TaskProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { columnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white p-3 mb-2 rounded shadow flex justify-between items-center"
    >
      {isEditing ? (
        <div className="w-full">
          <input
            type="text"
            value={editContent}
            onChange={(e) => setEditTask({ columnId, taskId: task.id, content: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") editTask(columnId, task.id, editContent);
              if (e.key === "Escape") setEditTask(null);
            }}
            className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4D8CB8]"
            autoFocus
          />
          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => editTask(columnId, task.id, editContent)}
              className="bg-[#4D8CB8] text-white px-3 py-1 rounded hover:bg-[#3b6b8a]"
            >
              Save
            </button>
            <button
              onClick={() => setEditTask(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <span {...attributes} {...listeners} className="flex-grow cursor-grab">
            {task.content}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setEditTask({ columnId, taskId: task.id, content: task.content })}
              className="text-gray-500 hover:text-[#4D8CB8]"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => deleteTask(columnId, task.id)}
              className="text-gray-500 hover:text-red-500"
            >
              <FaTrash />
            </button>
          </div>
        </>
      )}
    </div>
  );
}