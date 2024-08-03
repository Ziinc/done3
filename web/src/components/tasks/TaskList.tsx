import useSWR, { unstable_serialize } from "swr";
import { TaskList, patchTaskList } from "../../api/task_lists";
import {
  Task,
  deleteTask,
  insertTask,
  listTasks,
  patchTask,
} from "../../api/tasks";
import {
  ClickAwayListener,
  IconButton,
  List,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Button } from "@mui/material";
import {
  AddTask,
  CancelOutlined,
  ChevronRightSharp,
  Delete,
  Refresh,
} from "@mui/icons-material";
import { useMemo, useState } from "react";
import TaskListItem from "./Task";
import { Draggable, Droppable } from "react-beautiful-dnd";
import sortBy from "lodash/sortBy";
interface Props {
  taskList: TaskList;
  onDeleteTaskList: () => void;
  onUpdateTaskList: (attrs: Parameters<typeof patchTaskList>[1]) => void;
}

const TaskListComponent = ({
  taskList,
  onDeleteTaskList,
  onUpdateTaskList,
}: Props) => {
  const [showCompleted, setShowCompleted] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const {
    data: tasks = [],
    isLoading: isLoadingTasks,
    mutate: mutateTasks,
  } = useSWR(["taskslist", taskList.id], () => listTasks(taskList.id), {
    revalidateOnFocus: false,
    refreshInterval: 60 * 1000 * 10,
    revalidateIfStale: true,
    revalidateOnMount: true,
    revalidateOnReconnect: true,
  });

  const completedTasks = useMemo(
    () => tasks.filter(t => t.status === "completed"),
    [tasks]
  );
  const pendingTasks = useMemo(
    () => tasks.filter(t => t.status !== "completed"),
    [tasks]
  );

  const onToggleTask = async (task: Task) => {
    if (task.status === "needsAction") {
      patchTask(taskList.id, task.id, {
        status: "completed",
      });
      const updated = tasks.map(t =>
        t.id === task.id ? { ...t, status: "completed" as const } : t
      );
      mutateTasks(updated);
    } else {
      patchTask(taskList.id, task.id, {
        status: "needsAction",
      });
      const updated = tasks.map(t =>
        t.id === task.id ? { ...t, status: "needsAction" as const } : t
      );
      mutateTasks(updated, { revalidate: false });
    }
  };
  const handleDelete = async (task: Task) => {
    deleteTask(taskList.id, task.id);
    const updated = tasks.filter(t => t.id !== task.id);
    mutateTasks(updated, { revalidate: false });
  };
  const handleUpdate = async (taskId: string, attrs: Partial<Task>) => {
    patchTask(taskList.id, taskId, attrs).then();
    const updated = tasks.map(t => {
      if (t.id == taskId) {
        return { ...t, ...attrs };
      } else {
        return t;
      }
    });

    mutateTasks(updated, { revalidate: false });
  };
  return (
    <Paper
      elevation={1}
      sx={{ borderRadius: 3, p: 2, flexGrow: "inherit", height: "100%" }}>
      <Stack direction="row" alignItems="center">
        {editingTitle ? (
          <>
            <>
              <form onSubmit={e => e.preventDefault()}>
                <TextField
                  name="listTitle"
                  label="List title"
                  defaultValue={taskList.title}
                  onBlur={e => {
                    const value = e.currentTarget.value;
                    setEditingTitle(false);
                    if (value !== taskList.title) {
                      // save the value
                      onUpdateTaskList({ title: value });
                    }
                  }}
                />
                <Button hidden type="submit">
                  Submit
                </Button>
              </form>
            </>
          </>
        ) : (
          <Button onClick={() => setEditingTitle(true)}>
            <h3>{taskList.title}</h3>
          </Button>
        )}
        <IconButton onClick={() => mutateTasks()}>
          <Refresh />
        </IconButton>
        <IconButton onClick={onDeleteTaskList}>
          <Delete />
        </IconButton>
      </Stack>
      <Button startIcon={<AddTask />} onClick={() => setShowNewForm(true)}>
        Add a task
      </Button>
      {showNewForm ? (
        <ClickAwayListener onClickAway={() => setShowNewForm(false)}>
          <form
            onSubmit={async e => {
              e.preventDefault();
              const title = e.currentTarget.taskTitle.value;
              await insertTask(taskList.id, { title });
              mutateTasks([
                { id: "new", title, status: "needsAction" } as Task,
                ...tasks,
              ]);
            }}>
            <TextField name="taskTitle" label="Task title" variant="outlined" />
            <Button type="submit">Add</Button>
            <IconButton onClick={() => setShowNewForm(false)}>
              <CancelOutlined />
            </IconButton>
          </form>
        </ClickAwayListener>
      ) : null}
      {isLoadingTasks ? (
        <Stack spacing={1}>
          <Skeleton variant="rounded" height={30} />
          <Skeleton variant="rounded" height={30} />
          <Skeleton variant="rounded" height={30} />
          <Skeleton variant="rounded" height={30} />
          <Skeleton variant="rounded" height={30} />
        </Stack>
      ) : (
        <>
          <Droppable droppableId={`taskList-${taskList.id}`} type="TASK">
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <List>
                  {sortBy(pendingTasks, 'position').map((task, index) => (
                    <Draggable
                      draggableId={`task-${taskList.id}-${task.id}`}
                      index={index}
                      key={task.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          key={task.id}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}>
                          <TaskListItem
                            task={task}
                            onDeleteTask={() => handleDelete(task)}
                            onToggleTask={onToggleTask}
                            onUpdateTask={handleUpdate}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  <div>
                    {completedTasks.length > 0 && (
                      <Button
                        variant="text"
                        startIcon={
                          <ChevronRightSharp
                            sx={{
                              rotate: showCompleted ? "90deg" : 0,
                            }}
                          />
                        }
                        onClick={() => setShowCompleted(!showCompleted)}>
                        <Typography
                          variant="subtitle1"
                          className="text-gray-600">
                          Completed ({completedTasks.length})
                        </Typography>
                      </Button>
                    )}
                    {provided.placeholder}

                    {showCompleted &&
                      completedTasks.map((task, index) => (
                        <TaskListItem
                          key={task.id}
                          task={task}
                          onDeleteTask={() => handleDelete(task)}
                          onToggleTask={onToggleTask}
                          onUpdateTask={handleUpdate}
                        />
                      ))}
                  </div>
                </List>

                {/* {counters.length > 0 &&
            counters.map((counter, index) => (
              <Draggable
                draggableId={`counter-${counter.id}`}
                index={index}
                key={counter.id}>
                {(provided, snapshot) => (
                  <>
                    {renderCounter(counter, countMapping[counter.id], {
                      draggableProps: {
                        ref: provided.innerRef,
                        ...provided.draggableProps,
                        ...provided.dragHandleProps,
                      },
                      isDragging: snapshot.isDragging,
                    })}
                  </>
                )}
              </Draggable>
            ))} */}
              </div>
            )}
          </Droppable>
        </>
      )}
    </Paper>
  );
};
export default TaskListComponent;
