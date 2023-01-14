import React, { HTMLProps } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { Counter, CountMapping, CountTally } from "../api/counters";

type RenderCounter = (
  counter: Counter,
  tally: CountTally,
  // note: adding types for the draggable props is not worth the effort
  state: { isDragging: boolean; draggableProps: any }
) => React.ReactNode;

interface Props extends HTMLProps<HTMLUListElement> {
  counters: Counter[];
  countMapping: CountMapping;
  renderCounter: RenderCounter;
  className?: string;
  noDataFallback: React.ReactNode;
}

const CounterList: React.FC<Props> = ({
  counters,
  countMapping,
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
                  <>
                    {renderCounter(counter, countMapping[counter.id], {
                      draggableProps: {
                        ref: provided.innerRef,
                        ...provided.draggableProps,
                        ...provided.dragHandleProps,
                      },
                      isDragging: snapshot.isDragging,
                    })}
                  </>
                )}
              </Draggable>
            ))}
        </ul>
      )}
    </Droppable>
  );
};

export default CounterList;
