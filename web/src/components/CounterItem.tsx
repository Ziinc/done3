import { Button, Dropdown } from "antd";
import { MoreVertical, Plus, Target } from "lucide-react";
import { Counter } from "../api/counters";
import { marked } from "marked";
import DOMPurify from "dompurify";
import CountDisplay from "./CountDisplay";

interface Props {
  wrapperTag?: keyof JSX.IntrinsicElements;
  className?: string;
  counter: Counter;
  onEdit: () => void;
  onDelete: () => void;
  onIncrease: () => void;
}
const CounterItem: React.FC<Props> = ({
  wrapperTag: WrapperTag = "div",
  className = "",
  onEdit,
  onDelete,
  onIncrease,
  counter,
}) => (
  <WrapperTag
    className={[
      className,
      "rounded-lg p-2 bg-stone-100",
      "flex flex-row gap-4 items-center justify-between",
    ].join(" ")}
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
    <div
      className="flex-grow"
      onClick={() => {
        onEdit();
      }}
    >
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
            label: "Edit",
            onClick: onEdit,
          },
          {
            key: "2",
            label: "Delete",
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
);

export default CounterItem;
