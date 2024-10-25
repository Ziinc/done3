import { Task } from "../../api/tasks";
import {
  Button,
  Chip,
  ClickAwayListener,
  Grow,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckIcon from "@mui/icons-material/Check";
import { Delete, MoreVert } from "@mui/icons-material";
import React, { useEffect } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import DropdownMenu from "../DropdownMenu";
interface TaskProps {
  task: Task;
  onToggleTask: (task: Task) => void;
  // bound
  onDeleteTask: () => void;
  onUpdateTask: (taskId: string, attrs: Partial<Task>) => void;
}
const TaskListItem = ({
  task,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
}: TaskProps) => {
  const [open, setOpen] = React.useState(false);
  const [editData, setEditData] = React.useState({
    title: task.raw.title,
    notes: task.raw.notes,
  });
  const [editing, setEditing] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
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

  const handleSubmit = async () => {
    // check if there are any changes
    const changedKeys = Object.keys(editData).filter(key => {
      return (task as any)[key] !== (editData as any)[key];
    });

    if (changedKeys.length === 0) return;
    if (editData.title === "") return;

    const taken = changedKeys.reduce((acc: any, k) => {
      acc[k] = (editData as any)[k];
      return acc;
    }, {});
    onUpdateTask(task.id, taken);
  };

  const hotkeyHandler = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === "Enter" && editing === true) {
      // submit form
      handleSubmit();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", hotkeyHandler);
    return () => removeEventListener("keydown", hotkeyHandler, false);
  }, []);

  return (
    <ListItem key={task.id} sx={{ p: 0 }} alignItems="center">
      <ListItemAvatar>
        <IconButton color={"primary"} onClick={() => onToggleTask(task)}>
          {task.raw.status == "needsAction" ? (
            <RadioButtonUncheckedIcon />
          ) : (
            <CheckIcon />
          )}
        </IconButton>
      </ListItemAvatar>
      <ListItemText
        className="group  w-32 relative"
        onClick={() => {
          setEditing(true);
        }}>
        <ClickAwayListener
          onClickAway={() => {
            if (editing) {
              setEditing(false);
              handleSubmit();
            }
          }}>
          <Stack
            direction="column"
            align-items="start"
            justifyContent="space-between">
            {editing ? (
              <>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                  }}>
                  <TextField
                    name="taskTitle"
                    defaultValue={task.raw.title}
                    hiddenLabel
                    label="Title"
                    required
                    variant="standard"
                    size="small"
                    onChange={e => {
                      setEditData(prev => ({
                        ...prev,
                        title: e.target.value,
                      }));
                    }}
                  />
                  <TextField
                    name="notes"
                    defaultValue={task.raw.notes}
                    label="Notes"
                    hiddenLabel
                    variant="standard"
                    size="small"
                    onChange={e => {
                      setEditData(prev => ({
                        ...prev,
                        notes: e.target.value,
                      }));
                    }}
                  />
                  <DatePicker
                    label="Due date"
                    defaultValue={
                      task.raw.due ? dayjs(task.raw.due) : undefined
                    }
                    slotProps={{
                      field: {
                        clearable: true,
                        onClear: () => {
                          setEditData(prev => ({
                            ...prev,
                            due: null,
                          }));
                        },
                      },
                    }}
                    name="due"
                    onChange={value => {
                      setEditData(prev => ({
                        ...prev,
                        due: value?.toISOString(),
                      }));
                    }}
                  />
                </form>
              </>
            ) : (
              <>
                <Typography
                  variant="body1"
                  className={
                    task.raw.status === "completed" ? "text-gray-600" : ""
                  }
                  sx={{
                    textDecoration:
                      task.raw.status === "completed" ? "line-through" : null,
                  }}>
                  {task.raw.title}
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                  {task.raw.notes}
                </Typography>
                {task.raw.due && (
                  <Chip
                    label={dayjs(task.raw.due).format("D MMM")}
                    variant="outlined"
                  />
                )}
                {import.meta.env.DEV &&
                  import.meta.env.VITE_SHOW_IDS === "true" && (
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.7rem" }}
                      className="text-gray-500">
                      id: {task.id}
                      <br />
                      raw: {task.raw.id}
                    </Typography>
                  )}
              </>
            )}
          </Stack>
        </ClickAwayListener>
        <div>
          <DropdownMenu
            renderTrigger={({ ref, onClick }) => (
              <IconButton
                title="More task options"
                sx={{ position: "absolute" }}
                className="group-hover:opacity-100 opacity-0 right-0 top-0"
                size="small"
                ref={ref}
                id="composition-button"
                aria-controls={open ? "composition-menu" : undefined}
                aria-expanded={open ? "true" : undefined}
                aria-haspopup="true"
                onClick={onClick}>
                <MoreVert />
              </IconButton>
            )}>
            <MenuItem
              onClick={e => {
                onDeleteTask();
                handleClose(e);
              }}>
              Delete task
            </MenuItem>
          </DropdownMenu>
        </div>
      </ListItemText>
    </ListItem>
  );
};
export default TaskListItem;
