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
import "./BoardPage.scss";

type Task = { id: string; content: string };
type Column = { id: string; title: string; tasks: Task[] };

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
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event: any) {
    const { active } = event;
    const activeTask = columns.flatMap((col) => col.tasks).find((task) => task.id === active.id);
    setActiveTask(activeTask || null);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over || !active) return;

    const activeColumnId = active.data.current?.columnId;
    const overId = over.id;
    const overColumn = columns.find((col) => col.id === overId);
    const overTaskColumn = columns.find((col) => col.tasks.some((task) => task.id === overId));
    if (!activeColumnId) return;

    setColumns((prevColumns) => {
      const activeColumnIndex = prevColumns.findIndex((col) => col.id === activeColumnId);
      if (activeColumnIndex === -1) return prevColumns;
      const activeTaskIndex = prevColumns[activeColumnIndex].tasks.findIndex((task) => task.id === active.id);
      if (activeTaskIndex === -1) return prevColumns;

      if (overColumn) {
        const overColumnIndex = prevColumns.findIndex((col) => col.id === overId);
        const [movedTask] = prevColumns[activeColumnIndex].tasks.splice(activeTaskIndex, 1);
        prevColumns[overColumnIndex].tasks.push(movedTask);
        return [...prevColumns];
      }

      if (overTaskColumn) {
        const overColumnIndex = prevColumns.findIndex((col) => col.tasks.some((task) => task.id === overId));
        if (activeColumnIndex === overColumnIndex) {
          const oldIndex = activeTaskIndex;
          const newIndex = prevColumns[overColumnIndex].tasks.findIndex((task) => task.id === overId);
          prevColumns[overColumnIndex].tasks = arrayMove(prevColumns[overColumnIndex].tasks, oldIndex, newIndex);
        } else {
          const [movedTask] = prevColumns[activeColumnIndex].tasks.splice(activeTaskIndex, 1);
          prevColumns[overColumnIndex].tasks.push(movedTask);
        }
        return [...prevColumns];
      }
      return prevColumns;
    });
  }

  function toggleTaskForm(columnId: string) {
    setShowTaskForm((prev) => ({ ...prev, [columnId]: !prev[columnId] }));
    setNewTaskContent((prev) => ({ ...prev, [columnId]: "" }));
  }

  function addTask(columnId: string, content: string) {
    if (!content.trim()) return;
    const newTask: Task = { id: `${Date.now()}`, content: content.trim() };
    setColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col))
    );
    setShowTaskForm((prev) => ({ ...prev, [columnId]: false }));
    setNewTaskContent((prev) => ({ ...prev, [columnId]: "" }));
  }

  function addColumn(title: string) {
    if (!title.trim()) return;
    const newColumn: Column = { id: `${Date.now()}`, title: title.trim(), tasks: [] };
    setColumns((prev) => [...prev, newColumn]);
    setNewColumnTitle("");
    setShowColumnForm(false);
  }

  function deleteColumn(columnId: string) {
    if (!confirm("Excluir coluna?")) return;
    setColumns((prev) => prev.filter((col) => col.id !== columnId));
  }

  function updateTask(columnId: string, taskId: string, content: string) {
    if (!content.trim()) return;
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, tasks: col.tasks.map((task) => (task.id === taskId ? { ...task, content } : task)) }
          : col
      )
    );
    setEditTaskState(null);
  }

  function deleteTask(columnId: string, taskId: string) {
    if (!confirm("Excluir tarefa?")) return;
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, tasks: col.tasks.filter((task) => task.id !== taskId) } : col
      )
    );
  }

  return (
    <div className="board-page">
      <nav className="navbar">
        <h1 className="navbar-title">Tasks</h1>
        <div className="navbar-actions">
          <button>Boards</button>
          <button>Profile</button>
        </div>
      </nav>

      <div className="board-wrapper">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
            {activeTask && <div className="task-overlay">{activeTask.content}</div>}
          </DragOverlay>
        </DndContext>

        <div className="add-column">
          {showColumnForm ? (
            <div className="add-column-form">
              <input
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addColumn(newColumnTitle);
                  if (e.key === "Escape") setShowColumnForm(false);
                }}
                placeholder="Enter column title..."
                autoFocus
              />
              <div className="form-actions">
                <button onClick={() => addColumn(newColumnTitle)}>Add</button>
                <button onClick={() => setShowColumnForm(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="add-column-btn" onClick={() => setShowColumnForm(true)}>
              <FaPlus /> Add Column
            </button>
          )}
        </div>
      </div>
    </div>
  );
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
}: any) {
  const { attributes, listeners, setNodeRef } = useSortable({ id: column.id, disabled: true });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className="column">
      <div className="column-header">
        <h2>{column.title}</h2>
        <button onClick={() => deleteColumn(column.id)}><FaTrash /></button>
      </div>
      <SortableContext items={[...column.tasks.map((t: any) => t.id), column.id]} strategy={verticalListSortingStrategy}>
        {column.tasks.map((task: any) => (
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
        <div className="add-task-form">
          <input
            value={newTaskContent}
            onChange={(e) => setNewTaskContent((prev: any) => ({ ...prev, [column.id]: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTask(column.id, newTaskContent);
              if (e.key === "Escape") toggleTaskForm(column.id);
            }}
            placeholder="Enter task name..."
            autoFocus
          />
          <div className="form-actions">
            <button onClick={() => addTask(column.id, newTaskContent)}>Add</button>
            <button onClick={() => toggleTaskForm(column.id)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="add-task-btn" onClick={() => toggleTaskForm(column.id)}>
          <FaPlus /> Add Task
        </button>
      )}
    </div>
  );
}

function Task({ task, columnId, editTask, deleteTask, isEditing, editContent, setEditTask }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { columnId },
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="task">
      {isEditing ? (
        <div className="task-edit">
          <input
            value={editContent}
            onChange={(e) => setEditTask({ columnId, taskId: task.id, content: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") editTask(columnId, task.id, editContent);
              if (e.key === "Escape") setEditTask(null);
            }}
            autoFocus
          />
          <div className="form-actions">
            <button onClick={() => editTask(columnId, task.id, editContent)}>Save</button>
            <button onClick={() => setEditTask(null)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <span {...attributes} {...listeners} className="task-content">{task.content}</span>
          <div className="task-actions">
            <button onClick={() => setEditTask({ columnId, taskId: task.id, content: task.content })}><FaEdit /></button>
            <button onClick={() => deleteTask(columnId, task.id)}><FaTrash /></button>
          </div>
        </>
      )}
    </div>
  );
}
