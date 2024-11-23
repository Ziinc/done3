import { PropsWithChildren, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  ListItemText,
  MenuItem,
  Modal,
  TextField,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 750,
  py: 1.6,
  px: 3,
  pb: 0.4,
};

interface Props {
  open?: boolean;
  onClose?: () => void;
  showClose?: boolean;
  actions?: React.ReactNode[];
  renderContent:
    | React.ReactNode
    | ((args: RenderTriggerArgs) => React.ReactNode);
  renderTrigger:
    | React.ReactNode
    | ((args: RenderTriggerArgs) => React.ReactNode);
}
interface RenderTriggerArgs {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
}
const CenteredModal = ({
  renderContent,
  showClose = true,
  renderTrigger,
  open: controlledOpen,
  onClose,
  actions,
}: PropsWithChildren<Props>) => {
  const [uncontrolledOpen, setOpen] = useState(controlledOpen || false);
  const open = controlledOpen ?? uncontrolledOpen;
  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };
  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <>
          {/* <Box sx={style}> */}
          <Card raised sx={style}>
            {typeof renderContent === "function"
              ? renderContent({ open, setOpen })
              : renderContent}
            <CardActions
              sx={{ flexDirection: "row", justifyContent: "flex-end" }}>
              {actions && actions.map(action => action)}
              {showClose && <Button onClick={handleClose}>Close</Button>}
            </CardActions>
          </Card>

          {/* </Box> */}
        </>
      </Modal>

      {typeof renderTrigger === "function"
        ? renderTrigger({ setOpen, open })
        : renderTrigger}
    </>
  );
};
export default CenteredModal;
