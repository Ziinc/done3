import { Button, Dropdown } from "antd";
import { MoreVertical, Plus, Target } from "lucide-react";
import { Counter } from "../api/counters";

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
    <div className="w-20">
      <Button
        block
        type="primary"
        shape="round"
        title={`Increase '${counter.name}' by 1`}
        onClick={onIncrease}
        icon={<Plus size={16} strokeWidth={3} />}
        className={[
          "flex flex-row items-center justify-between gap-1",
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
        {counter.count}
      </Button>
    </div>
    <div
      className="flex-grow"
      onClick={() => {
        onEdit();
      }}
    >
      <span className="text-lg">{counter.name}</span>
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
