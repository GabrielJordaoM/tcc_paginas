"use client";
import { useEffect, useState } from "react";
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

//TaksService
import {Task, Column, getTasks, setTask, deleteTask, AiChoice, setTaskIA} from "@/lib/task"
import { getAllUsers, getUser, User } from "@/lib/user";
import Select from "@mui/material/Select/Select";
import MenuItem from "@mui/material/MenuItem/MenuItem";
import { CircularProgress, Skeleton } from "@mui/material";


/* ------------------- CONSTANTES ------------------- */
const predefinedSkills = [
  'HTML', 'CSS', 'JavaScript', 'SASS', 'React', 'Next.js', 'Python', 'Django',
  'Django Rest', 'Comunicacao', 'Docker', 'SQL', 'PostgreSQL', 'Java',
  'React Native', 'Spring Boot', 'Seguranca', 'ESG'
];

const defaultUser = {
  email: "",
  id: "",
  name: ""
} as User

const defaultAiChoice = {
    hoursToComplete: 0,
    reason: "",
    user: defaultUser
} as AiChoice

/* -------------------------- COMPONENTE PRINCIPAL -------------------------- */
export default function BoardPage() {
  //Loading
  const [loading, setLoading] = useState(true);

  //Dados
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Modais
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [openColumnModal, setOpenColumnModal] = useState(false);
  const [openAiModal, setOpenAiModal] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [loadingChoice, setLoadingChoice] = useState(true)
  const [aiChoice, setAiChoice] = useState<AiChoice>(defaultAiChoice);

  // Formulários
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    dueDate: null,
    assignee: null,
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
        assignee: task.assignee,
        technologies: task.technologies ?? [],
        mode: task.mode ?? "efetivo",
      });
    } else {
      setEditingTask(null);
      setNewTask({
        title: "",
        description: "",
        dueDate: null,
        assignee: null,
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
    if (!newTask.title.trim() || !selectedColumnId || !newTask.description.trim) return;
    const task: Task = { ...newTask, id: `0` };
    setTask(task, columns.find((col) => col.id == selectedColumnId))
    .then((res) => {
      setColumns((prev) =>
        prev.map((col) =>
          col.id === selectedColumnId ? { ...col, tasks: [...col.tasks, res] } : col
        )
      );
    }).catch((err) => {
      console.log(err)
      alert("Erro ao criar uma nova task")
    })
    .finally(() => {
      closeTaskModal();
    })
  };

  const handleEditTask = () => {
    if (!editingTask || !newTask.title.trim()) return;
    
    const coll = columns.find((col) => col.tasks.find((task) => task.id == editingTask.id).id == editingTask.id)

    setTask({...editingTask, ...newTask}, coll)
    .then((res) => {
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.id == coll.id ? col.tasks.map((t) =>
            t.id === editingTask.id ? res : t
          ): col.tasks,
        }))
      );
    })
    .catch((err) => {
      console.error(err)
      alert("Erro ao editar a task")
    })
    .finally(() => {
      closeTaskModal();
    })
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

  const confirmUser = () => {
    setNewTask({...newTask, assignee: aiChoice.user})
    closeAiModal();
  }

  const closeAiModal = () => {
    setOpenAiModal(false);
    setAiChoice(defaultAiChoice)
    setLoadingChoice(true)
  }

  const handleAiChoiceOpen = (mode: string) => {
    const treatedMode = mode == "efetivo"? "proficiency" : "knowledge"
    setOpenAiModal(true)
    setTaskIA({...newTask, id: editingTask.id}, treatedMode)
    .then((res) => {
      setAiChoice(res)
      setLoadingChoice(false)
      })
    .catch((err) => {
      console.error(err)
      alert("Erro ao pedir para selecionar usuário via IA")
      closeAiModal()
    })
  }

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;
    const column: Column = {
      id: `${Date.now()}`,
      title: newColumnTitle.trim(),
      tasks: [],
    };
    setTask({
      title:"__init__",
      description: "_",
      id: "0"
    } as Task, column)
    .then((res) => {
      column.tasks.push(res)
      setColumns((prev) => [...prev, column]);
    })
    .catch((res) => {
      console.error(res)
      alert("Erro ao criar uma nova coluna")
    })
    .finally(() => {
    closeColumnModal();
    })
  };

  const handleEditColumn = () => {
    if (!editingColumn || !newColumnTitle.trim()) return;
    if(editingColumn.tasks.length > 1){
      alert("A coluna não pode conter tasks")
      closeColumnModal();
      return;
    }

    const task = editingColumn.tasks.find((task) => task.title== "__init__")
    setTask(task, {...editingColumn, title: newColumnTitle.trim()})
    .then((res) => {
      setColumns((prev) =>
        prev.map((col) =>
          col.id === editingColumn.id ? { ...col, title: newColumnTitle.trim(), tasks: [res] } : col
        )
      );
    })
    .catch((err) => {
      console.error(err)
      alert("Erro ao trocar o nome da coluna")
    })
    .finally(() => {
      closeColumnModal();
    })
  };

  const deleteColumn = (columnId: string) => {
    const col = columns.find((c) => c.id === columnId)    
    if(col.tasks.length > 1) {
      alert("A coluna não pode conter tasks")
      return
    }
    if (!confirm("Excluir coluna?")) return;
    
    const task = col.tasks.find((t) => t.title === "__init__")
    deleteTask(task)
    .then((res) => {
      setColumns((prev) => prev.filter((col) => col.id !== columnId));
    })
    .catch((err) => {
      console.error(err)
      alert("Erro ao deletar a coluna")
    })
  };

  const handleDeleteTask = (columnId: string, taskId: string) => {
    if (!confirm("Excluir tarefa?")) return;

    const task = columns.find((col => col.id == columnId))
                  .tasks.find((task) => task.id == taskId)

    deleteTask(task)
    .then(() => {
      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId
            ? { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
            : col
        )
      );
    })
    .catch((err) => {
      console.error(err)
      alert("Erro ao deletar tarefa")
    })
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

      const srcCol = columns.find((c) => c.id === activeColumnId);
      const dstCol = columns.find((c) => c.id === overColumnId);
      const task = srcCol.tasks.find((t) => t.id === activeId)

      setTask(task, dstCol)
      .then((res) => {
        setColumns((prev) => {
          const srcCol = prev.find((c) => c.id === activeColumnId);
          const dstCol = prev.find((c) => c.id === overColumnId);
          if (!srcCol || !dstCol) return prev;

          const taskIdx = srcCol.tasks.findIndex((t) => t.id === activeId);
          if (taskIdx === -1) return prev;

          const [moved] = srcCol.tasks.splice(taskIdx, 1);
          if (overData?.type === "column") {
            dstCol.tasks.push(res);
          } else {
            const insertIdx = dstCol.tasks.findIndex((t) => t.id === overId);
            dstCol.tasks.splice(insertIdx, 0, moved);
          }
          return [...prev];
        });
      })
      .catch((err) => {
        console.error(err)
        alert("Erro ao movimentar a task")
      })
    }
  }

  /* ---------- UseEffect ---------- */
  useEffect(() => {
    getTasks().
    then((res) => {
      setColumns(res)
      console.log(res)
      getAllUsers()
      .then((res) => {
        setUsers(res)
      })
      .catch((err) => {
        console.error(err)
      })
    }).catch((err) => {
      console.error(err)
    }).finally(() => {
      setLoading(false)
    })
  },[]);

  /* ---------- RENDER ---------- */
  return (
    <div className="board-page">
      <Header />
      <div className="board-wrapper">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {loading?
          <Skeleton
            variant="rounded"
            sx={{width: "100vw", height: "100vh"}}
          />
          :
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
                <ColumnEl
                  key={column.id}
                  column={column}
                  onAddTask={() => openTaskModalHandler(column.id)}
                  onEditTask={(task) => openTaskModalHandler(column.id, task)}
                  onEditColumn={() => openColumnModalHandler(column)}
                  deleteColumn={deleteColumn}
                  deleteTask={handleDeleteTask}
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
                  {activeTask.assignee && (
                    <Avatar
                      name={activeTask.assignee.name}
                      variant="geometric"
                      size={24}
                    />
                  )}
                  <div>
                    <strong>{activeTask.title}</strong>
                    {activeTask.assignee && (
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontSize: "0.875rem",
                          color: "#555",
                        }}
                      >
                        Por: {activeTask.assignee.name}
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
          }

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
                required
              />

              {/* RESPONSÁVEIS */}
              <Select
                  label="Responsável"

                  style={{width: "100%", color: "#00000"}}
                  
                  // 1. O 'value' do Select agora é o ID do usuário.
                  // Usamos '?' (optional chaining) para o caso de 'assignee' ser null.
                  value={newTask.assignee?.id || ''}
                  
                  onChange={(event) => {
                    // 2. O valor recebido agora é o ID (string)
                    const selectedId = event.target.value as string;

                    // 3. Encontramos o objeto 'User' completo em 'mockUsers'
                    const selectedUser = users.find(user => user.id === selectedId) || null;

                    // 4. Atualizamos o estado 'assignee' com o objeto encontrado
                    setNewTask({ ...newTask, assignee: selectedUser });
                  }}
                >
                  {/* Opção para "nenhum" */}
                  <MenuItem value="">
                    <em>Nenhum</em>
                  </MenuItem>

                  {users.map((option) => (
                    // 5. O 'value' do MenuItem agora é o ID (string),
                    //    o que resolve o erro do TypeScript.
                    <MenuItem key={option.id} value={option.id}>
                      
                      {/* Seu layout customizado de 'renderOption' */}
                      <Box
                        component="span"
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          name={option.name}
                          variant="geometric"
                          size={32}
                        />
                        {option.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>

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
                <Button variant="outlined"
                  disabled={editingTask? false: true}
                  onClick={() => {
                    handleAiChoiceOpen(newTask.mode);
                  }} style={{ marginLeft: "auto" }}
                >
                  Selecionar responsável com IA
                </Button>
              </div>

              {/* TECNOLOGIAS */}
              <Autocomplete
                multiple
                freeSolo
                options={predefinedSkills}
                value={newTask.technologies}
                onChange={(_, v) => setNewTask({ ...newTask, technologies: v })}
                renderTags={(value, getTagProps) =>
                  value.map((opt, idx: number) => (
                    <Chip
                      label={opt}
                      {...getTagProps({ index: idx })}
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

          {/* MODAL AI */}
          <Dialog open={openAiModal} onClose={closeAiModal} maxWidth="sm" fullWidth>
            { loadingChoice?
            <>
             <DialogTitle>Seleção de usuário via IA</DialogTitle>
             <DialogContent>
              <div style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center"
              }}>
                Aguarde enquanto selecionamos o melhor usuário para completar essa tarefa
                <CircularProgress/>
              </div>
             </DialogContent>
            </>:
            <>
              <DialogTitle>Seleção de usuário via IA</DialogTitle>
              <DialogContent>
              <div style={{display: "flex", marginBottom: 18, alignItems: "center"}}>
                O usuário recomendado para essa task é
                <Box
                  component="span"
                  sx={{ display: "flex", alignItems: "center", gap: 1, marginLeft: 8}}
                >
                  <Avatar
                    name={aiChoice.user.name}
                    variant="geometric"
                    size={32}
                  />
                  {aiChoice.user.name}
                </Box>
              </div>
              <div style={{marginBottom: 18}}>
                O motivo para a escolha desse usuário foi:
                <div style={{
                  backgroundColor: "#e8eaed",
                  padding: 6,
                  width: "95%",
                  borderRadius: 5
                }}>
                  {aiChoice.reason}
                </div>
              </div>
              <div>
                O tempo esperado para que esse usuário complete a tarefa é {aiChoice.hoursToComplete} horas
              </div>
              </DialogContent>
              <DialogActions>
                <Button onClick={closeAiModal}>Cancelar</Button>
                <Button
                  onClick={confirmUser}
                  variant="contained"
                >
                  Confirmar Usuário
                </Button>
              </DialogActions>
            </>
          }
          </Dialog>
        </LocalizationProvider>

        {!loading &&
        <div className="add-column">
          <button className="add-column-btn" onClick={() => openColumnModalHandler()}>
            <FaPlus /> Nova Coluna
          </button>
        </div>
        }
      </div>
    </div>
  );
}

/* -------------------------- COLUNA -------------------------- */
function ColumnEl({
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
        {column.tasks.map((task) => {
          if(task.title != "__init__") {
            return (<TaskEl
              key={task.id}
              task={task}
              columnId={column.id}
              deleteTask={deleteTask}
              onEdit={onEditTask}
            />)
          }
        }
        )}
      </SortableContext>

      <button className="add-task-btn" onClick={onAddTask}>
        <FaPlus /> Adicionar Tarefa
      </button>
    </div>
  );
}

/* -------------------------- TAREFA -------------------------- */
function TaskEl({
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
        {task.assignee && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
            <Avatar
              name={task.assignee.name}
              variant="geometric"
              size={20}
            />
            <span style={{ fontSize: "0.875rem", color: "black" }}>
              <strong>Responsável:</strong> {task.assignee.name}
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