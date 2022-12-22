import { Button, Dropdown } from "antd";
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
  <WrapperTag className={[className, "rounded"].join(" ")}>
    <Button
      type="primary"
      title={`Increase '${counter.name}' by 1`}
      onClick={onIncrease}
    >
      +
    </Button>
    <span>{counter.name}</span>
    <span>{counter.count}</span>
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
      <Button title={`More options for '${counter.name}'`}>...</Button>
    </Dropdown>
  </WrapperTag>
);

export default CounterItem;
