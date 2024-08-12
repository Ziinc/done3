import {
  Box,
  Button,
  ListItemText,
  Modal,
  TextField,
} from "@mui/material";
import { ChangeEvent, useMemo, useState } from "react";
import { Note, deleteNote, updateNote } from "../api/notes";

import ListItem from "@mui/material/ListItem";
import debounce from "lodash/debounce";
import Editor from "./Editor";
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
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
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
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <TextField
            label="Title"
            name="title"
            defaultValue={note.raw?.title}
            onChange={handleTitleChange}
          />
          {note.raw && note.raw.body.text?.text && (
            <>
              <Editor
                onChange={handleBodyChange}
                defaultValue={note.raw.body.text.text}
              />
            </>
          )}
        </Box>
      </Modal>
      <ListItem
        onClick={() => {
          setOpen(true);
        }}>
        <ListItemText
          primary={note.raw?.title}
          secondary={
            note.raw.body.text.text.slice(0, 100) +
            (note.raw.body.text.text.length > 100 ? "..." : "")
          }
        />
        <Button onClick={handleDelete}>Delete</Button>
      </ListItem>
    </>
  );
};

export default NoteItem;
