import { PropsOf } from "@headlessui/react/dist/types";
import { HTMLProps } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { Counter } from "../api/counters";

type RenderCounter = (counter: Counter) => React.ReactNode;

interface Props extends HTMLProps<HTMLUListElement> {
  counters: Counter[];
  renderCounter: RenderCounter;
  className?: string;
}

const CounterList: React.FC<Props> = ({
  counters,
  renderCounter,
  className = "",
  ...props
}) => {
  return (
    <Droppable droppableId="droppable-1" type="COUNTER">
      {(provided, snapshot) => (
        <ul
          ref={provided.innerRef}
          {...provided.droppableProps}
          {...props}
          className={[
            className,
            "list-none",
            "flex flex-col gap-2 p-4 rounded-lg",
            "transition-all duration-500",
            snapshot.isDraggingOver ? "bg-sky-300" : "bg-sky-200",
          ].join(" ")}
        >
          {counters.map((counter, index) => (
            <Draggable
              draggableId={`counter-${counter.id}`}
              index={index}
              key={counter.id}
            >
              {(provided, snapshot) => (
                <span
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  {renderCounter(counter)}
                </span>
              )}
            </Draggable>
          ))}
        </ul>
      )}
    </Droppable>
  );
};

export default CounterList;
