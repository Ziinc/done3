import useSWR from "swr";
import { TaskList } from "../../api/task_lists";
import { Task, insertTask, listTasks, patchTask } from "../../api/tasks";
import {
    Container,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Button } from "@mui/material";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckIcon from "@mui/icons-material/Check";
import {
  ChevronRightRounded,
  ChevronRightSharp,
  Refresh,
} from "@mui/icons-material";
import { useMemo, useState } from "react";
interface Props {
  taskList: TaskList;
}

const TaskList = ({ taskList }: Props) => {
  const [showCompleted, setShowCompleted] = useState(false);
  let {
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
    () => tasks.filter((t) => t.status === "completed"),
    [tasks]
  );
  const pendingTasks = useMemo(
    () => tasks.filter((t) => t.status !== "completed"),
    [tasks]
  );

  const onToggleTask = async (task: Task) => {
    if (task.status === "needsAction") {
      patchTask(taskList.id, task.id, {
        status: "completed",
      });
      const updated = tasks.map((t) =>
        t.id === task.id ? { ...t, status: "completed" as const } : t
      );
      mutateTasks(updated);
    } else {
      patchTask(taskList.id, task.id, {
        status: "needsAction",
      });
      const updated = tasks.map((t) =>
        t.id === task.id ? { ...t, status: "needsAction" as const } : t
      );
      mutateTasks(updated, { revalidate: false });
    }
  };
  return (
    <Paper elevation={1}  sx={{ borderRadius: 3, p: 2, width: 350}}>
      <Stack direction="row" alignItems="center">
        <h3>{taskList.title}</h3>
        <IconButton onClick={() => mutateTasks()}>
          <Refresh />
        </IconButton>
      </Stack>

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
          <List>
            {pendingTasks.map((task) => (
              <Task key={task.id} task={task} onToggleTask={onToggleTask} />
            ))}
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
                onClick={() => setShowCompleted(!showCompleted)}
              >
                <Typography variant="subtitle1" className="text-gray-600">
                  Completed ({completedTasks.length})
                </Typography>
              </Button>
            )}
            {showCompleted &&
              completedTasks.map((task) => (
                <Task task={task} onToggleTask={onToggleTask} />
              ))}
          </List>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const title = e.currentTarget.taskTitle.value;
              insertTask(taskList.id, { title });
            }}
          >
            <TextField name="taskTitle" label="Outlined" variant="outlined" />
            <Button type="submit">Add</Button>
          </form>
        </>
      )}
    </Paper>
  );
};

interface TaskProps {
  task: Task;
  onToggleTask: (task: Task) => void;
}
const Task = ({ task, onToggleTask }: TaskProps) => (
  <ListItem key={task.id} sx={{ p: 0 }} alignItems="center">
    <ListItemAvatar>
      <IconButton color={"primary"} onClick={() => onToggleTask(task)}>
        {task.status == "needsAction" ? (
          <RadioButtonUncheckedIcon />
        ) : (
          <CheckIcon />
        )}
      </IconButton>
    </ListItemAvatar>
    <ListItemText>
      <Typography
        variant="body1"
        className={task.status === "completed" ? "text-gray-600" : ""}
        sx={{
          textDecoration: task.status === "completed" ? "line-through" : null,
        }}
      >
        {task.title}
      </Typography>
      <Typography variant="body2" className="text-gray-500">
        {task.notes}
      </Typography>
    </ListItemText>
  </ListItem>
);
export default TaskList;
