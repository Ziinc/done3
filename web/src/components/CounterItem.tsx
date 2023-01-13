import { Button, Dropdown, Tooltip } from "antd";
import { MoreVertical, Plus } from "lucide-react";
import { Counter } from "../api/counters";
import { marked } from "marked";
import DOMPurify from "dompurify";
import CountDisplay from "./CountDisplay";

interface Props extends React.HTMLProps<HTMLDivElement & HTMLLIElement> {
  wrapperTag?: "li" | "div";
  className?: string;
  counter: Counter;
  isDragging?: boolean;
  isHovering?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onIncrease?: () => void;
  onArchive?: () => void;
}
const CounterItem: React.FC<Props> = ({
  wrapperTag: WrapperTag = "div",
  className = "",
  onEdit,
  onDelete,
  onIncrease,
  counter,
  isHovering = false,
  isDragging = false,
  onArchive,
  ...rest
}) => (
  <Tooltip
    mouseEnterDelay={1.5}
    title={
      <span>
        Press <span className="kbd kbd-xs kbd-light">e</span> to edit
      </span>
    }
  >
    <WrapperTag
      className={[
        className,
        isDragging || isHovering ? "bg-stone-100" : "bg-stone-50",
        isDragging ? "shadow-lg ring-2 ring-violet-300" : "",
        "rounded-lg p-2 transition-all ",
        "flex flex-row gap-4 items-center justify-between",
      ].join(" ")}
      {...rest}
    >
      <div className="w-fit">
        <Button
          block
          type="primary"
          shape="round"
          title={`Increase '${counter.name}' by 1`}
          onClick={onIncrease}
          icon={<Plus size={16} strokeWidth={3} />}
          className={[
            "gap-1",
            counter.count >= counter.target
              ? "bg-green-700 hover:!bg-green-600"
              : "",
            counter.count < counter.target
              ? "bg-yellow-600 hover:!bg-yellow-500"
              : "",
            counter.count > counter.target * 5
              ? "bg-sky-600 hover:!bg-sky-500"
              : "",
          ].join(" ")}
        >
          <CountDisplay value={counter.count} />
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
              key: "2",
              label: "Archive counter",
              onClick: onArchive,
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
          type="ghost"
          icon={<MoreVertical size={12} />}
          title={`More options for '${counter.name}'`}
        ></Button>
      </Dropdown>
    </WrapperTag>
  </Tooltip>
);

export default CounterItem;
