import { Task } from "../../api/tasks";
import {
  Box,
  Button,
  Chip,
  ClickAwayListener,
  Collapse,
  Fade,
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
import NotesIcon from "@mui/icons-material/Notes";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckIcon from "@mui/icons-material/Check";
import { Delete, MoreVert } from "@mui/icons-material";
import React, { useEffect } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import DropdownMenu from "../DropdownMenu";
import { grey } from "@mui/material/colors";
import { isEqual } from "lodash";
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
  const defaultValues = {
    title: task.raw.title,
    notes: task.raw.notes,
  };
  const [editData, setEditData] = React.useState(defaultValues);
  const [editing, setEditing] = React.useState(false);
  const [showNoteInput, setShowNoteInput] = React.useState(
    Boolean(task.raw.notes)
  );

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
    if (e.ctrlKey && e.key === "Enter") {
      // submit form
      setEditing(false);
    }
    if (e.key === "Escape") {
      // close form
      setEditing(false);
    }
  };

  const maybeSubmit = () => {
    if (!!editing && !isEqual(editData, defaultValues)) {
      maybeHideNotesInput();
      handleSubmit();
    }
  };
  useEffect(() => {
    maybeSubmit();
  }, [editing]);

  const maybeHideNotesInput = () => {
    if (editData.notes) {
      setShowNoteInput(true);
    } else {
      setShowNoteInput(false);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", hotkeyHandler);
    return () => removeEventListener("keydown", hotkeyHandler, false);
  }, []);

  return (
    <ListItem key={task.id} sx={{ p: 0 }} alignItems="flex-start">
      <ListItemIcon>
        <IconButton color={"primary"} onClick={() => onToggleTask(task)}>
          {task.raw.status == "needsAction" ? (
            <RadioButtonUncheckedIcon />
          ) : (
            <CheckIcon />
          )}
        </IconButton>
      </ListItemIcon>
      <ListItemText
        className="group  w-32 relative"
        onClick={() => {
          setEditing(true);
        }}>
        <ClickAwayListener
          onClickAway={() => {
            if (editing) {
              setEditing(false);
              maybeSubmit()
            }
          }}>
          <Stack
            direction="column"
            align-items="start"
            justifyContent="space-between"
            gap={0}>
            <Box
              className={[
                editing ? "h-0 opacity-0" : "opacity-100",
                "delay-50  transition-all",
              ].join(" ")}>
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
            </Box>
            <Collapse in={editing}>
              <form
                onSubmit={e => {
                  e.preventDefault();
                }}>
                <TextField
                  name="taskTitle"
                  value={editData.title}
                  hiddenLabel
                  required
                  sx={{
                    // pt: 1,
                    width: "100%",
                  }}
                  multiline
                  variant="standard"
                  size="small"
                  onChange={e => {
                    setEditData(prev => ({
                      ...prev,
                      title: e.target.value,
                    }));
                  }}
                />
                <Box sx={{ mb: 1 }}>
                  <button
                    type="button"
                    onClick={() => setShowNoteInput(true)}
                    className={[
                      "bg-transparent relative text-gray-700  outlne-none ring-0 rounded focus:ring-1 border-none flex flex-row  gap-1 my-1 ring-transparent",
                      showNoteInput ? "hidden" : "",
                    ].join(" ")}>
                    <NotesIcon
                      fontSize="small"
                      // sx={{ position: "absolute" }}
                      className="inset-y-0 left-0"
                    />
                    <Typography className="hover:cursor-text " fontSize={12}>
                      Details
                    </Typography>
                  </button>

                  <TextField
                    autoFocus
                    name="notes"
                    value={editData.notes}
                    hiddenLabel
                    placeholder="Details"
                    variant="standard"
                    size="small"
                    onBlur={e => {
                      e.preventDefault();
                      maybeHideNotesInput();
                    }}
                    inputProps={{
                      sx: {
                        fontSize: 12,
                      },
                    }}
                    sx={{
                      display: showNoteInput ? "block" : "none",
                    }}
                    onChange={e => {
                      setEditData(prev => ({
                        ...prev,
                        notes: e.target.value,
                      }));
                    }}
                  />
                </Box>
                <DatePicker
                  label="Date/time"
                  defaultValue={task.raw.due ? dayjs(task.raw.due) : undefined}
                  // sx={{fontSize: 12}}
                  slotProps={{
                    textField: {
                      variant: "standard",
                      size: "small",
                      sx: {
                        fontSize: 12,
                      }
                      // placeholder: "Due Date"
                    },
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
            </Collapse>
          </Stack>
        </ClickAwayListener>
      </ListItemText>
    </ListItem>
  );
};
export default TaskListItem;
