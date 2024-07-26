import { Task } from "../../api/tasks";
import {
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
    title: task.title,
    notes: task.notes,
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
          {task.status == "needsAction" ? (
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
        <IconButton
          title="More task options"
          sx={{ position: "absolute" }}
          className="group-hover:opacity-100 opacity-0 right-0 top-0"
          size="small"
          ref={anchorRef}
          id="composition-button"
          aria-controls={open ? "composition-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
          onClick={handleToggle}>
          <MoreVert />
        </IconButton>
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
                    defaultValue={task.title}
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
                    defaultValue={task.notes}
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
                </form>
              </>
            ) : (
              <>
                <Typography
                  variant="body1"
                  className={task.status === "completed" ? "text-gray-600" : ""}
                  sx={{
                    textDecoration:
                      task.status === "completed" ? "line-through" : null,
                  }}>
                  {task.title}
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                  {task.notes}
                </Typography>
              </>
            )}
          </Stack>
        </ClickAwayListener>
        <div>
          <Popper
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            placement="bottom-start"
            transition>
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin:
                    placement === "bottom-start" ? "left top" : "left bottom",
                }}>
                <Paper>
                  <ClickAwayListener onClickAway={handleClose}>
                    <MenuList
                      autoFocusItem={open}
                      id="composition-menu"
                      aria-labelledby="composition-button"
                      onKeyDown={handleListKeyDown}>
                      <MenuItem
                        onClick={e => {
                          onDeleteTask();
                          handleClose(e);
                        }}>
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
      </ListItemText>
    </ListItem>
  );
};
export default TaskListItem;
