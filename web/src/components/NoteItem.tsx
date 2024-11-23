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
import { Delete, MoreVert } from "@mui/icons-material";
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
  const truncatedText =
    note.raw.body.text.text.slice(0, 100) +
    (note.raw.body.text.text.length > 100 ? "..." : "");
  return (
    <>
      <ListItem className="group relative w-32">
        <CenteredModal
          actions={[
            <DropdownMenu
              key="more"
              placement="bottom-end"
              sx={{ zIndex: 99999 }}
              renderTrigger={({ ref, onClick }) => (
                <IconButton
                  ref={ref}
                  onClick={onClick}
                  title={`More options for note`}>
                  <MoreVert />
                </IconButton>
              )}>
              {[
                {
                  label: "Delete note",
                  key: "delete",
                  onClick: onDelete,
                },
              ].map(item => (
                <MenuItem onClick={item.onClick} key={item.label}>
                  {item.label}
                </MenuItem>
              ))}
            </DropdownMenu>,
          ]}
          renderTrigger={({ open, setOpen }) => (
            <ListItemText
              onClick={() => {
                setOpen(true);
              }}
              primary={note.raw?.title ? note.raw?.title : truncatedText}
              secondary={note.raw?.title ? truncatedText : null}
            />
          )}
          renderContent={
            <>
              <TextField
                label="Title"
                name="title"
                defaultValue={note.raw?.title}
                onChange={handleTitleChange}
                variant="filled"
                className="w-full"
              />
              {note.raw && note.raw.body.text?.text && (
                <Box sx={{ mt: 2 }}>
                  <Editor
                    onChange={handleBodyChange}
                    defaultValue={note.raw.body.text.text}
                  />
                </Box>
              )}
            </>
          }
        />
      </ListItem>
    </>
  );
};

export default NoteItem;
