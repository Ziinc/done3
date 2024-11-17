import {
  Box,
  Button,
  IconButton,
  ListItemText,
  MenuItem,
  Modal,
  TextField,
} from "@mui/material";
import { ChangeEvent, useMemo, useState } from "react";
import { Note, deleteNote, updateNote } from "../api/notes";

import ListItem from "@mui/material/ListItem";
import debounce from "lodash/debounce";
import Editor from "./Editor";
import DropdownMenu from "./DropdownMenu";
import { MoreVert } from "@mui/icons-material";
import CenteredModal from "./CenteredModal";
interface Props {
  note: Note;
  onDelete: () => void;
  onUpdate: (newNote: Note) => void;
}

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 750,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

const NoteItem = ({ note, onDelete, onUpdate }: Props) => {
  const debouncedUpdateNote = useMemo(
    () =>
      debounce(
        async (name, attrs) => {
          updateNote(name, attrs).then(note => onUpdate(note!));
        },
        800,
        { maxWait: 5000 }
      ),
    []
  );

  const handleDelete = async () => {
    await deleteNote(note.id);
    onDelete();
  };
  const handleBodyChange = async (value: string) => {
    debouncedUpdateNote(note.id, {
      title: note.raw.title,
      text: value,
    });
  };

  const handleTitleChange = async (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    debouncedUpdateNote(note.id, {
      title: e.target.value,
      text: note.raw.body.text.text,
    });
  };
  if (!note.raw) {
    return null;
  }
  return (
    <>
      <CenteredModal
        renderTrigger={({ open, setOpen }) => (
          <ListItem
            onClick={() => {
              setOpen(true);
            }}
            className="group relative w-32">
            <ListItemText
              primary={note.raw?.title}
              secondary={
                note.raw.body.text.text.slice(0, 100) +
                (note.raw.body.text.text.length > 100 ? "..." : "")
              }
            />
            <div>
              <DropdownMenu
                renderTrigger={({ ref, onClick }) => (
                  <IconButton
                    title="More note options"
                    sx={{ position: "absolute" }}
                    className="group-hover:opacity-100 opacity-0 right-0 top-3"
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
                <MenuItem onClick={handleDelete}>Delete note</MenuItem>
              </DropdownMenu>
            </div>
          </ListItem>
        )}
        renderContent={
          <>
            <TextField
              label="Title"
              name="title"
              defaultValue={note.raw?.title}
              onChange={handleTitleChange}
              variant="standard"
            />
            {note.raw && note.raw.body.text?.text && (
              <>
                <Editor
                  onChange={handleBodyChange}
                  defaultValue={note.raw.body.text.text}
                />
              </>
            )}
          </>
        }></CenteredModal>
    </>
  );
};

export default NoteItem;
