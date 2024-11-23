import {
  ClickAwayListener,
  Grow,
  MenuList,
  Paper,
  Popper,
  PopperProps,
  SxProps,
} from "@mui/material";
import React from "react";

interface RenderTriggerArgs {
  onClick: () => void;
  ref: any;
}
interface DropdownMenuProps {
  children: React.ReactNode;
  sx?: SxProps;
  placement?: PopperProps["placement"];
  onClose?: () => void;
  renderTrigger: (args: RenderTriggerArgs) => React.ReactNode;
}
const DropdownMenu = ({
  children,
  onClose,
  renderTrigger,
  sx,
  placement = "bottom-start",
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
        placement={placement}
        sx={sx}
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
