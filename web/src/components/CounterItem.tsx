import { Dropdown } from "antd";
import { MoreVertical, Plus } from "lucide-react";
import { Counter } from "../api/counters";
import { marked } from "marked";
import DOMPurify from "dompurify";
import CountDisplay from "./CountDisplay";
import React from "react";
import { Button } from "@mui/material";
interface Props extends React.HTMLProps<HTMLDivElement & HTMLLIElement> {
  wrapperTag?: "li" | "div";
  wrapperProps?: Object;
  className?: string;
  counter: Counter;
  isDragging?: boolean;
  isHovering?: boolean;
  count: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onIncrease?: (value: number) => void;
  onArchive?: () => void;
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
  onArchive,
  count,
  ref,
  ...rest
}) => (
  <Dropdown
    menu={{
      items: [
        {
          label: "Increase by 1",
          key: "inc-1",
          onClick: () => onIncrease?.(1),
        },
        {
          label: "Increase by 5",
          key: "inc-5",
          onClick: () => onIncrease?.(5),
        },
        {
          label: "Increase by 10",
          key: "inc-10",
          onClick: () => onIncrease?.(10),
        },

        {
          type: "divider",
          className: "!bg-slate-200",
        },
        {
          label: "Edit counter",
          key: "edit",
          onClick: onEdit,
        },
        {
          label: "Delete counter",
          key: "delete",
          onClick: onDelete,
        },
      ],
    }}
    trigger={["contextMenu"]}
  >
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
      {...rest}
    >
      <div className="w-fit">
        <Button
          variant="contained"
          color="primary"
          title={`Increase '${counter.name}' by 1`}
          onClick={() => onIncrease?.(1)}
          startIcon={<Plus size={16} strokeWidth={3} />}
          className={[
            "gap-1",
            count >= counter.target ? "!bg-green-700 hover:!bg-green-600" : "",
            count < counter.target ? "!bg-yellow-600 hover:!bg-yellow-500" : "",
            count > counter.target * 5 ? "!bg-sky-600 hover:!bg-sky-500" : "",
          ].join(" ")}
        >
          <CountDisplay value={count} />
        </Button>
      </div>
      <div className="flex-grow" onClick={onEdit}>
        <span className="text-lg">{counter.name}</span>

        {counter.notes && (
          <div
            className="text-xs text-slate-700 max-h-12 overflow-hidden"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(marked.parse(counter.notes), {
                USE_PROFILES: { html: true },
              }),
            }}
          ></div>
        )}
      </div>
      <Dropdown
        menu={{
          items: [
            {
              key: "1",
              label: "Edit counter",
              onClick: onEdit,
            },
            {
              key: "3",
              label: "Delete counter",
              onClick: onDelete,
            },
          ],
        }}
      >
        <Button
          variant="text"
          startIcon={<MoreVertical size={12} />}
          title={`More options for '${counter.name}'`}
        ></Button>
      </Dropdown>
    </WrapperTag>
  </Dropdown>
);
export default CounterItem;
