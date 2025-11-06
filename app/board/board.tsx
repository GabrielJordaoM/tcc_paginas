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
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import "./BoardPage.scss";
import Header from '../../components/header/Header';
// Material UI
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import dayjs from 'dayjs';

type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  assignee: string;
  mode?: 'aprendizado' | 'efetivo';
};

type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

const initialColumns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    tasks: [
      {
        id: "1",
        title: "Tarefa 1",
        description: "Fazer algo importante",
        dueDate: "2025-11-05",
        assignee: "João",
      },
      {
        id: "2",
        title: "Tarefa 2",
        description: "Revisar documento",
        dueDate: null,
        assignee: "Maria",
      },
    ],
  },
  { id: "inprogress", title: "In Progress", tasks: [] },
  { id: "done", title: "Done", tasks: [] },
];

export default function BoardPage() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  // Modais
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [openColumnModal, setOpenColumnModal] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  // Formulários
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    dueDate: null,
    assignee: "",
    mode: 'efetivo',
  });
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // === MODAL TAREFA ===
  const openTaskModalHandler = (columnId: string, task?: Task) => {
    setSelectedColumnId(columnId);
    if (task) {
      setEditingTask(task);
      setNewTask({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        assignee: task.assignee,
        mode: task.mode || 'efetivo',
      });
    } else {
      setEditingTask(null);
      setNewTask({ title: "", description: "", dueDate: null, assignee: "", mode: 'efetivo' });
    }
    setOpenTaskModal(true);
  };

  const closeTaskModal = () => {
    setOpenTaskModal(false);
    setSelectedColumnId(null);
    setEditingTask(null);
  };

  const handleAddTask = () => {
    if (!newTask.title.trim() || !selectedColumnId) return;
    const task: Task = { ...newTask, id: `${Date.now()}` };
    setColumns((prev) =>
      prev.map((col) =>
        col.id === selectedColumnId
          ? { ...col, tasks: [...col.tasks, task] }
          : col
      )
    );
    closeTaskModal();
  };

  const handleEditTask = () => {
    if (!editingTask || !newTask.title.trim()) return;
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        tasks: col.tasks.map((t) =>
          t.id === editingTask.id ? { ...t, ...newTask } : t
        ),
      }))
    );
    closeTaskModal();
  };

  // === MODAL COLUNA ===
  const openColumnModalHandler = (column?: Column) => {
    if (column) {
      setEditingColumn(column);
      setNewColumnTitle(column.title);
    } else {
      setEditingColumn(null);
      setNewColumnTitle("");
    }
    setOpenColumnModal(true);
  };

  const closeColumnModal = () => {
    setOpenColumnModal(false);
    setEditingColumn(null);
  };

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;
    const column: Column = {
      id: `${Date.now()}`,
      title: newColumnTitle.trim(),
      tasks: [],
    };
    setColumns((prev) => [...prev, column]);
    closeColumnModal();
  };

  const handleEditColumn = () => {
    if (!editingColumn || !newColumnTitle.trim()) return;
    setColumns((prev) =>
      prev.map((col) =>
        col.id === editingColumn.id
          ? { ...col, title: newColumnTitle.trim() }
          : col
      )
    );
    closeColumnModal();
  };

  const deleteColumn = (columnId: string) => {
    if (!confirm("Excluir coluna e todas as tarefas?")) return;
    setColumns((prev) => prev.filter((col) => col.id !== columnId));
  };

  const deleteTask = (columnId: string, taskId: string) => {
    if (!confirm("Excluir tarefa?")) return;
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
          : col
      )
    );
  };

  // === DRAG & DROP ===
  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const activeData = active.data.current;
    if (activeData?.type === "task") {
      const task = columns.flatMap((col) => col.tasks).find((t) => t.id === active.id);
      setActiveTask(task || null);
    } else if (activeData?.type === "column") {
      const column = columns.find((c) => c.id === active.id);
      setActiveColumn(column || null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    setActiveColumn(null);
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    const activeData = active.data.current;
    const overData = over.data.current;

    // Reordenar colunas
    if (activeData?.type === "column" && overData?.type === "column") {
      setColumns((prev) => {
        const oldIndex = prev.findIndex((c) => c.id === activeId);
        const newIndex = prev.findIndex((c) => c.id === overId);
        return arrayMove(prev, oldIndex, newIndex);
      });
      return;
    }

    // Mover tarefa
    if (activeData?.type === "task") {
      const activeColumnId = activeData.columnId;
      const overColumnId = overData?.type === "column" ? overId : columns.find((c) => c.tasks.some((t) => t.id === overId))?.id;
      if (!activeColumnId || !overColumnId) return;
      setColumns((prev) => {
        const activeCol = prev.find((c) => c.id === activeColumnId);
        const overCol = prev.find((c) => c.id === overColumnId);
        if (!activeCol || !overCol) return prev;
        const taskIndex = activeCol.tasks.findIndex((t) => t.id === activeId);
        if (taskIndex === -1) return prev;
        const [movedTask] = activeCol.tasks.splice(taskIndex, 1);
        if (overData?.type === "column") {
          overCol.tasks.push(movedTask);
        } else {
          const insertIndex = overCol.tasks.findIndex((t) => t.id === overId);
          overCol.tasks.splice(insertIndex, 0, movedTask);
        }
        return [...prev];
      });
    }
  }

  return (
    <div className="board-page">
      <Header />
      <div className="board-wrapper">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={columns.map((c) => c.id)}
              strategy={horizontalListSortingStrategy}
            >
              {columns.map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  onAddTask={() => openTaskModalHandler(column.id)}
                  onEditTask={(task) => openTaskModalHandler(column.id, task)}
                  onEditColumn={() => openColumnModalHandler(column)}
                  deleteColumn={deleteColumn}
                  deleteTask={deleteTask}
                />
              ))}
            </SortableContext>
            <DragOverlay>
              {activeTask && (
                <div className="task-overlay">
                  <strong>{activeTask.title}</strong>
                  {activeTask.assignee && <p>Por: {activeTask.assignee}</p>}
                </div>
              )}
              {activeColumn && (
                <div className="column-overlay">
                  <h2>{activeColumn.title}</h2>
                  <p>{activeColumn.tasks.length} tarefa{activeColumn.tasks.length !== 1 ? "s" : ""}</p>
                </div>
              )}
            </DragOverlay>
          </DndContext>
          {/* Modal Tarefa */}
          <Dialog open={openTaskModal} onClose={closeTaskModal} maxWidth="sm" fullWidth>
            <DialogTitle>{editingTask ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
            <DialogContent>
              <TextField
                label="Título"
                fullWidth
                margin="normal"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
              <TextField
                label="Descrição"
                fullWidth
                multiline
                rows={3}
                margin="normal"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <TextField
                label="Responsável"
                fullWidth
                margin="normal"
                value={newTask.assignee}
                onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
              />
              <DatePicker
                label="Prazo"
                value={newTask.dueDate ? dayjs(newTask.dueDate) : null}
                onChange={(date) =>
                  setNewTask({ ...newTask, dueDate: date ? date.format("YYYY-MM-DD") : null })
                }
                slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
              />
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '16px' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newTask.mode === 'aprendizado'}
                      onChange={(e) => setNewTask({ ...newTask, mode: e.target.checked ? 'aprendizado' : 'efetivo' })}
                    />
                  }
                  label={newTask.mode === 'aprendizado' ? 'Aprendizado' : 'Efetivo'}
                />
                <Button
                  variant="outlined"
                  onClick={() => {}}
                  style={{ marginLeft: 'auto' }}
                >
                  Gerar com IA
                </Button>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeTaskModal}>Cancelar</Button>
              <Button
                onClick={editingTask ? handleEditTask : handleAddTask}
                variant="contained"
                disabled={!newTask.title.trim()}
              >
                {editingTask ? "Salvar" : "Adicionar"}
              </Button>
            </DialogActions>
          </Dialog>
          {/* Modal Coluna */}
          <Dialog open={openColumnModal} onClose={closeColumnModal} maxWidth="xs" fullWidth>
            <DialogTitle>{editingColumn ? "Editar Coluna" : "Nova Coluna"}</DialogTitle>
            <DialogContent>
              <TextField
                label="Título da Coluna"
                fullWidth
                margin="normal"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                autoFocus
                required
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={closeColumnModal}>Cancelar</Button>
              <Button
                onClick={editingColumn ? handleEditColumn : handleAddColumn}
                variant="contained"
                disabled={!newColumnTitle.trim()}
              >
                {editingColumn ? "Salvar" : "Adicionar"}
              </Button>
            </DialogActions>
          </Dialog>
        </LocalizationProvider>
        <div className="add-column">
          <button className="add-column-btn" onClick={() => openColumnModalHandler()}>
            <FaPlus /> Nova Coluna
          </button>
        </div>
      </div>
    </div>
  );
}

// === COLUNA ===
function Column({
  column,
  onAddTask,
  onEditTask,
  onEditColumn,
  deleteColumn,
  deleteTask,
}: {
  column: Column;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onEditColumn: () => void;
  deleteColumn: (id: string) => void;
  deleteTask: (colId: string, taskId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "column" },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`column ${isDragging ? 'dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="column-header">
        <h2>{column.title}</h2>
        <div className="column-actions">
          <button className="edit-btn" onClick={(e) => { e.stopPropagation(); onEditColumn(); }}>
            <FaEdit />
          </button>
          <button className="delete-btn" onClick={(e) => { e.stopPropagation(); deleteColumn(column.id); }}>
            <FaTrash />
          </button>
        </div>
      </div>
      <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        {column.tasks.map((task) => (
          <Task
            key={task.id}
            task={task}
            columnId={column.id}
            deleteTask={deleteTask}
            onEdit={onEditTask}
          />
        ))}
      </SortableContext>
      <button className="add-task-btn" onClick={onAddTask}>
        <FaPlus /> Adicionar Tarefa
      </button>
    </div>
  );
}

// === TAREFA ===
function Task({
  task,
  columnId,
  deleteTask,
  onEdit,
}: {
  task: Task;
  columnId: string;
  deleteTask: (colId: string, taskId: string) => void;
  onEdit: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", columnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task ${isDragging ? 'dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="task-header">
        <strong className="task-title">{task.title}</strong>
        <div className="task-actions">
          <button className="edit-btn" onClick={(e) => { e.stopPropagation(); onEdit(task); }}>
            <FaEdit />
          </button>
          <button className="delete-btn" onClick={(e) => { e.stopPropagation(); deleteTask(columnId, task.id); }}>
            <FaTrash />
          </button>
        </div>
      </div>
      {task.description && <p className="task-description">{task.description}</p>}
      <div className="task-meta">
        {task.assignee && (
          <span className="assignee">
            <strong>Responsável:</strong> {task.assignee}
          </span>
        )}
        {task.dueDate && (
          <span className="due-date">
            <strong>Prazo:</strong> {dayjs(task.dueDate).format("DD/MM/YYYY")}
          </span>
        )}
      </div>
    </div>
  );
}