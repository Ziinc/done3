import useSWR from "swr";
import { TaskList } from "../../api/task_lists";
import {
  Task,
  deleteTask,
  insertTask,
  listTasks,
  patchTask,
} from "../../api/tasks";
import {
  ClickAwayListener,
  Grow,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Button } from "@mui/material";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckIcon from "@mui/icons-material/Check";
import {
  ChevronRightSharp,
  Delete,
  MoreVert,
  Refresh,
} from "@mui/icons-material";
import React, { useMemo, useState } from "react";
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
  const handleDelete = async (task: Task) => {
    deleteTask(taskList.id, task.id);
    const updated = tasks.filter((t) => t.id !== task.id);
    mutateTasks(updated, { revalidate: false });
  };
  return (
    <Paper elevation={1} sx={{ borderRadius: 3, p: 2, width: 350 }}>
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
              <Task
                key={task.id}
                task={task}
                onToggleTask={onToggleTask}
                onDeleteTask={() => handleDelete(task)}
              />
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
                <Task
                  task={task}
                  onDeleteTask={() => handleDelete(task)}
                  onToggleTask={onToggleTask}
                />
              ))}
          </List>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const title = e.currentTarget.taskTitle.value;
              await insertTask(taskList.id, { title });
              mutateTasks([
                { id: "new", title, status: "needsAction" } as any,
                ...tasks,
              ]);
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
  // bound
  onDeleteTask: () => void;
}
const Task = ({ task, onToggleTask, onDeleteTask }: TaskProps) => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }
  return (
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
      <ListItemText className="group">
        <Stack
          direction="row"
          align-items="start"
          justifyContent="space-between"
        >
          <Typography
            variant="body1"
            className={task.status === "completed" ? "text-gray-600" : ""}
            sx={{
              textDecoration:
                task.status === "completed" ? "line-through" : null,
            }}
          >
            {task.title}
          </Typography>
          <IconButton
            title="More task options"
            className="group-hover:opacity-100 opacity-0"
            size="small"
            ref={anchorRef}
            id="composition-button"
            aria-controls={open ? "composition-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
          >
            <MoreVert />
          </IconButton>
        </Stack>
        <div>
          <Popper
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            placement="bottom-start"
            transition
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin:
                    placement === "bottom-start" ? "left top" : "left bottom",
                }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={handleClose}>
                    <MenuList
                      autoFocusItem={open}
                      id="composition-menu"
                      aria-labelledby="composition-button"
                      onKeyDown={handleListKeyDown}
                    >
                      <MenuItem
                        onClick={(e) => {
                          onDeleteTask();
                          handleClose(e);
                        }}
                      >
                        <ListItemIcon>
                          <Delete />
                        </ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                      </MenuItem>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </div>

        <Typography variant="body2" className="text-gray-500">
          {task.notes}
        </Typography>
      </ListItemText>
    </ListItem>
  );
};
export default TaskList;
