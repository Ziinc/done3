import { Button, Dropdown } from "antd";
import { MoreVerticalIcon, Plus } from "lucide-react";
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
      "flex flex-row gap-2 items-center justify-between",
    ].join(" ")}
  >
    <div>
      <Button
        type="primary"
        shape="round"
        title={`Increase '${counter.name}' by 1`}
        onClick={onIncrease}
        icon={<Plus size={16} strokeWidth={3}/>}
        className="flex flex-row items-center gap-1"
      >
        {counter.count}
      </Button>
    </div>
    <span className="text-lg">{counter.name}</span>
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
        icon={<MoreVerticalIcon size={12} />}
        title={`More options for '${counter.name}'`}
      ></Button>
    </Dropdown>
  </WrapperTag>
);

export default CounterItem;
