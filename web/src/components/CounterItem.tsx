import { Counter, CounterAttrs } from "../api/counters";
import { marked } from "marked";
import DOMPurify from "dompurify";
import CountDisplay from "./CountDisplay";
import React, { useState } from "react";
import {
  Box,
  Button,
  ClickAwayListener,
  IconButton,
  MenuItem,
  Typography,
} from "@mui/material";
import { Add, MoreVert } from "@mui/icons-material";
import DropdownMenu from "./DropdownMenu";
import CounterForm from "./CounterForm";
interface Props extends React.HTMLProps<HTMLDivElement & HTMLLIElement> {
  wrapperTag?: "li" | "div";
  wrapperProps?: object;
  className?: string;
  counter: Counter;
  isDragging?: boolean;
  isHovering?: boolean;
  count: number;
  onUpdate: (attrs: Partial<CounterAttrs>) => void;
  onDelete: () => void;
  onIncrease: (value: number) => void;
}

const CounterItem: React.FC<Props> = ({
  wrapperTag: WrapperTag = "div",
  wrapperProps = {},
  className = "",
  onUpdate,
  onDelete,
  onIncrease,
  counter,
  isHovering = false,
  isDragging = false,
  count,
  ref,
  ...rest
}) => {
  const [editing, setEditing] = useState(false);
  return (
    <Box className="w-full">
      <div
        className={[
          "w-full group",
          className,
          isDragging ? "shadow-lg ring-2 ring-violet-300" : "",
          "rounded-lg p-2 transition-all ",
          "flex flex-row gap-4 items-center justify-between",
        ].join(" ")}
        // ref={ref}
        // {...wrapperProps}
        {...rest}>
        <Button
          variant="contained"
          color={
            count >= counter.target
              ? "success"
              : count < counter.target
                ? "warning"
                : count > counter.target * 5
                  ? "info"
                  : "primary"
          }
          size="small"
          title={`Increase '${counter.name}' by 1`}
          onClick={() => onIncrease?.(1)}
          startIcon={<Add />}>
          <CountDisplay value={count} />
        </Button>
        <div className="flex-grow" onClick={() => setEditing(true)}>
          <Typography variant="subtitle1">{counter.name}</Typography>

          {counter.notes && (
            <Typography
              variant="body1"
              className="text-xs text-slate-700 max-h-12 overflow-hidden"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(marked.parse(counter.notes), {
                  USE_PROFILES: { html: true },
                }),
              }}></Typography>
          )}
        </div>

        <DropdownMenu
          renderTrigger={({ ref, onClick }) => (
            <IconButton
              ref={ref}
              onClick={onClick}
              className="group-hover:visible invisible"
              title={`More options for '${counter.name}'`}>
              <MoreVert />
            </IconButton>
          )}>
          {[
            {
              label: "Delete counter",
              key: "delete",
              onClick: onDelete,
            },
          ].map(item => (
            <MenuItem onClick={item.onClick} key={item.label}>
              {item.label}
            </MenuItem>
          ))}
        </DropdownMenu>
      </div>
      {editing && (
        <ClickAwayListener
          onClickAway={e => {
            setEditing(false);
          }}>
          <div className="flex flex-col gap-4 mt-4 px-2">
            {editing && (
              <div className="flex flex-col w-full items-center justify-center">
                <div className="flex flex-row gap-1">
                  <Button
                    className="flex flex-row justify-center items-center"
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={() => onIncrease(1)}>
                    1
                  </Button>
                  <Button
                    className="flex flex-row justify-center items-center"
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={() => onIncrease(5)}>
                    5
                  </Button>

                  <Button
                    className="flex flex-row justify-center items-center"
                    variant="contained"
                    color="primary"
                    onClick={() => onIncrease(10)}
                    startIcon={<Add />}>
                    10
                  </Button>
                </div>
              </div>
            )}
            <CounterForm
              onCancel={() => setEditing(false)}
              defaultValues={counter}
              onSubmit={async (data, { cancelLoading }) => {
                if (onUpdate) {
                  await onUpdate(data);
                }
                cancelLoading();
                setEditing(false);
              }}
            />
          </div>
        </ClickAwayListener>
      )}
    </Box>
  );
};
export default CounterItem;
