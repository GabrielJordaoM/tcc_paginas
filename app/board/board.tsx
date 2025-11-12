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
import Header from "../../components/header/Header";

// Material UI
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import dayjs from "dayjs";

// Boring Avatars
import Avatar from "boring-avatars";

/* -------------------------- TIPOS -------------------------- */
type User = {
  id: string;
  name: string;
};

type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  assignees: User[];
  technologies: string[];
  mode?: "aprendizado" | "efetivo";
};

type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

/* ------------------- VARIANTE DO AVATAR ------------------- */
const getAvatarVariant = (
  name: string
): "ring" | "sunset" | "bauhaus" | "marble" | "geometric" => {
  if (name.includes("Pedro")) return "ring";
  if (name.includes("Maria")) return "sunset";
  if (name.includes("Gabriel")) return "bauhaus";
  if (name.includes("Moises")) return "marble";
  return "geometric";
};

/* -------------------------- DADOS -------------------------- */
const mockUsers: User[] = [
  { id: "1", name: "Pedro Silva" },
  { id: "2", name: "Maria Oliveira" },
  { id: "3", name: "Gabriel Jordao" },
  { id: "4", name: "Moises" },
];

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
        assignees: [mockUsers[0], mockUsers[1]],
        technologies: ["React", "TypeScript"],
      },
      {
        id: "2",
        title: "Tarefa 2",
        description: "Revisar documento",
        dueDate: null,
        assignees: [mockUsers[2]],
        technologies: ["Node.js", "MongoDB"],
      },
    ],
  },
  { id: "inprogress", title: "In Progress", tasks: [] },
  { id: "done", title: "Done", tasks: [] },
];

/* -------------------------- COMPONENTE PRINCIPAL -------------------------- */
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
    assignees: [],
    technologies: [],
    mode: "efetivo",
  });
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  /* ---------- MODAL TAREFA ---------- */
  const openTaskModalHandler = (columnId: string, task?: Task) => {
    setSelectedColumnId(columnId);
    if (task) {
      setEditingTask(task);
      setNewTask({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        assignees: task.assignees,
        technologies: task.technologies ?? [],
        mode: task.mode ?? "efetivo",
      });
    } else {
      setEditingTask(null);
      setNewTask({
        title: "",
        description: "",
        dueDate: null,
        assignees: [],
        technologies: [],
        mode: "efetivo",
      });
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
        col.id === selectedColumnId ? { ...col, tasks: [...col.tasks, task] } : col
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

  /* ---------- MODAL COLUNA ---------- */
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
        col.id === editingColumn.id ? { ...col, title: newColumnTitle.trim() } : col
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

  /* ---------- DRAG & DROP ---------- */
  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const activeData = active.data.current;
    if (activeData?.type === "task") {
      const task = columns.flatMap((c) => c.tasks).find((t) => t.id === active.id);
      setActiveTask(task ?? null);
    } else if (activeData?.type === "column") {
      const column = columns.find((c) => c.id === active.id);
      setActiveColumn(column ?? null);
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

    if (activeData?.type === "column" && overData?.type === "column") {
      setColumns((prev) => {
        const oldIdx = prev.findIndex((c) => c.id === activeId);
        const newIdx = prev.findIndex((c) => c.id === overId);
        return arrayMove(prev, oldIdx, newIdx);
      });
      return;
    }

    if (activeData?.type === "task") {
      const activeColumnId = activeData.columnId;
      const overColumnId =
        overData?.type === "column"
          ? overId
          : columns.find((c) => c.tasks.some((t) => t.id === overId))?.id;
      if (!activeColumnId || !overColumnId) return;

      setColumns((prev) => {
        const srcCol = prev.find((c) => c.id === activeColumnId);
        const dstCol = prev.find((c) => c.id === overColumnId);
        if (!srcCol || !dstCol) return prev;

        const taskIdx = srcCol.tasks.findIndex((t) => t.id === activeId);
        if (taskIdx === -1) return prev;

        const [moved] = srcCol.tasks.splice(taskIdx, 1);
        if (overData?.type === "column") {
          dstCol.tasks.push(moved);
        } else {
          const insertIdx = dstCol.tasks.findIndex((t) => t.id === overId);
          dstCol.tasks.splice(insertIdx, 0, moved);
        }
        return [...prev];
      });
    }
  }

  /* ---------- RENDER ---------- */
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

            {/* DRAG OVERLAY */}
            <DragOverlay>
              {activeTask && (
                <div
                  className="task-overlay"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px",
                    background: "white",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  {activeTask.assignees.length > 0 && (
                    <Avatar
                      name={activeTask.assignees[0].name}
                      variant={getAvatarVariant(activeTask.assignees[0].name)}
                      size={24}
                    />
                  )}
                  <div>
                    <strong>{activeTask.title}</strong>
                    {activeTask.assignees.length > 0 && (
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontSize: "0.875rem",
                          color: "#555",
                        }}
                      >
                        Por: {activeTask.assignees[0].name}
                        {activeTask.assignees.length > 1 &&
                          ` +${activeTask.assignees.length - 1}`}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {activeColumn && (
                <div className="column-overlay">
                  <h2>{activeColumn.title}</h2>
                  <p>
                    {activeColumn.tasks.length} tarefa
                    {activeColumn.tasks.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </DragOverlay>
          </DndContext>

          {/* MODAL TAREFA */}
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

              {/* RESPONSÁVEIS */}
              <Autocomplete
                multiple
                options={mockUsers}
                getOptionLabel={(opt) => opt.name}
                value={newTask.assignees}
                onChange={(_, v) => setNewTask({ ...newTask, assignees: v })}
                renderInput={(params) => (
                  <TextField {...params} label="Responsáveis" margin="normal" fullWidth />
                )}
                renderOption={(props, option) => {
                  const { key, ...rest } = props as any;
                  return (
                    <Box
                      component="li"
                      {...rest}
                      key={key}
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <Avatar
                        name={option.name}
                        variant={getAvatarVariant(option.name)}
                        size={32}
                      />
                      {option.name}
                    </Box>
                  );
                }}
                renderTags={(value, getTagProps) =>
                  value.map((opt, idx) => (
                    <Chip
                      avatar={
                        <Avatar
                          name={opt.name}
                          variant={getAvatarVariant(opt.name)}
                          size={20}
                        />
                      }
                      label={opt.name}
                      {...getTagProps({ idx })}
                      key={opt.id}
                    />
                  ))
                }
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
              />

              {/* TECNOLOGIAS */}
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={newTask.technologies}
                onChange={(_, v) => setNewTask({ ...newTask, technologies: v })}
                renderTags={(value, getTagProps) =>
                  value.map((opt, idx) => (
                    <Chip
                      label={opt}
                      {...getTagProps({ idx })}
                      key={opt}
                      color="primary"
                      variant="outlined"
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tecnologias Necessárias"
                    margin="normal"
                    fullWidth
                    placeholder="Ex: React, Node.js, Docker..."
                  />
                )}
              />

              <DatePicker
                label="Prazo"
                value={newTask.dueDate ? dayjs(newTask.dueDate) : null}
                onChange={(date) =>
                  setNewTask({
                    ...newTask,
                    dueDate: date ? date.format("YYYY-MM-DD") : null,
                  })
                }
                slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
              />

              <div style={{ display: "flex", alignItems: "center", marginTop: "16px" }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newTask.mode === "aprendizado"}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          mode: e.target.checked ? "aprendizado" : "efetivo",
                        })
                      }
                    />
                  }
                  label={newTask.mode === "aprendizado" ? "Aprendizado" : "Efetivo"}
                />
                <Button variant="outlined" onClick={() => {}} style={{ marginLeft: "auto" }}>
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

          {/* MODAL COLUNA */}
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

/* -------------------------- COLUNA -------------------------- */
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
      className={`column ${isDragging ? "dragging" : ""}`}
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

/* -------------------------- TAREFA -------------------------- */
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
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
      className={`task ${isDragging ? "dragging" : ""}`}
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
        {/* RESPONSÁVEL PRINCIPAL */}
        {task.assignees.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
            <Avatar
              name={task.assignees[0].name}
              variant={getAvatarVariant(task.assignees[0].name)}
              size={20}
            />
            <span style={{ fontSize: "0.875rem" }}>
              <strong>Responsável:</strong> {task.assignees[0].name}
              {task.assignees.length > 1 && ` +${task.assignees.length - 1}`}
            </span>
          </Box>
        )}

        {/* PRAZO */}
        {task.dueDate && (
          <span
            className="due-date"
            style={{ display: "block", marginTop: "4px", fontSize: "0.875rem" }}
          >
            <strong>Prazo:</strong> {dayjs(task.dueDate).format("DD/MM/YYYY")}
          </span>
        )}

        {/* TECNOLOGIAS */}
        {task.technologies.length > 0 && (
          <Box sx={{ mt: 0.5, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {task.technologies.map((tech) => (
              <Chip
                key={tech}
                label={tech}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: "0.7rem", height: 20 }}
              />
            ))}
          </Box>
        )}
      </div>
    </div>
  );
}