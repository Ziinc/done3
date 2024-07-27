import {
  ClickAwayListener,
  Grow,
  MenuList,
  Paper,
  Popper,
} from "@mui/material";
import React from "react";

interface RenderTriggerArgs {
  onClick: () => void;
  ref: React.Ref<HTMLButtonElement>;
}
interface DropdownMenuProps {
  children: React.ReactNode;
  onClose?: () => void;
  renderTrigger: (args: RenderTriggerArgs) => React.ReactNode;
}
const DropdownMenu = ({
  children,
  onClose,
  renderTrigger,
}: DropdownMenuProps) => {
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
    if (onClose) onClose();
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
    <>
      {renderTrigger({ ref: anchorRef, onClick: () => setOpen(true) })}
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
                  {children}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default DropdownMenu;
