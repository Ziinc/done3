import {
  Draggable,
  DraggableProvided,
  DraggableProvidedDraggableProps,
  DraggableProvidedDragHandleProps,
  Droppable,
} from "react-beautiful-dnd";
import { Counter } from "../api/counters";

type RenderCounter = (counter: Counter) => React.ReactNode;

interface Props {
  counters: Counter[];
  renderCounter: RenderCounter;
  className?: string;
}

const CounterList: React.FC<Props> = ({
  counters,
  renderCounter,
  className = "",
}) => {
  return (
    <>
      <Droppable droppableId="droppable-1" type="COUNTER">
        {(provided, snapshot) => (
          <ul
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={[
              className,
              "list-none",
              "flex flex-col gap-2 p-2",
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
    </>
  );
};

export default CounterList;
