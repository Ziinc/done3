import { Counter } from "../api/counters";
import { marked } from "marked";
import DOMPurify from "dompurify";
import CountDisplay from "./CountDisplay";
import React from "react";
import { Button, MenuItem, Typography } from "@mui/material";
import { Add, MoreVert } from "@mui/icons-material";
import DropdownMenu from "./DropdownMenu";
interface Props extends React.HTMLProps<HTMLDivElement & HTMLLIElement> {
  wrapperTag?: "li" | "div";
  wrapperProps?: object;
  className?: string;
  counter: Counter;
  isDragging?: boolean;
  isHovering?: boolean;
  count: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onIncrease?: (value: number) => void;
}

const CounterItem: React.FC<Props> = ({
  wrapperTag: WrapperTag = "div",
  wrapperProps = {},
  className = "",
  onEdit,
  onDelete,
  onIncrease,
  counter,
  isHovering = false,
  isDragging = false,
  count,
  ref,
  ...rest
}) => (
  <>
    <WrapperTag
      className={[
        className,
        isDragging || isHovering ? "bg-stone-100" : "bg-slate-50",
        isDragging ? "shadow-lg ring-2 ring-violet-300" : "",
        "rounded-lg p-2 transition-all ",
        "flex flex-row gap-4 items-center justify-between",
      ].join(" ")}
      ref={ref}
      {...wrapperProps}
      {...rest}>
      <div className="w-fit">
        <Button
          variant="contained"
          color="primary"
          title={`Increase '${counter.name}' by 1`}
          onClick={() => onIncrease?.(1)}
          startIcon={<Add />}
          className={[
            "gap-1",
            count >= counter.target ? "!bg-green-700 hover:!bg-green-600" : "",
            count < counter.target ? "!bg-yellow-600 hover:!bg-yellow-500" : "",
            count > counter.target * 5 ? "!bg-sky-600 hover:!bg-sky-500" : "",
          ].join(" ")}>
          <CountDisplay value={count} />
        </Button>
      </div>
      <div className="flex-grow" onClick={onEdit}>
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
          <Button
            ref={ref}
            onClick={onClick}
            variant="text"
            startIcon={<MoreVert />}
            title={`More options for '${counter.name}'`}></Button>
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
    </WrapperTag>
  </>
);
export default CounterItem;
