import { HTMLProps } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { Counter } from "../api/counters";

type RenderCounter = (counter: Counter, state: {isDragging: boolean}) => React.ReactNode;

interface Props extends HTMLProps<HTMLUListElement> {
  counters: Counter[];
  renderCounter: RenderCounter;
  className?: string;
  noDataFallback: React.ReactNode;
}

const CounterList: React.FC<Props> = ({
  counters,
  renderCounter,
  className = "",
  noDataFallback,
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
            "transition-all duration-300",
            snapshot.isDraggingOver ? "bg-sky-200" : "bg-blue-100",
          ].join(" ")}
        >
          {counters.length === 0 && noDataFallback}
          {counters.length > 0 &&
            counters.map((counter, index) => (
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
                    {renderCounter(counter, {
                      isDragging: snapshot.isDragging
                    } )}
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
