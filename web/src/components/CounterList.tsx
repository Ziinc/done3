import { Divider } from "antd";
import React, { HTMLProps } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { Counter, CountMapping, CountTally } from "../api/counters";

type RenderCounter = (
  counter: Counter,
  tally: CountTally,
  // note: adding types for the draggable props is not worth the effort
  state: {
    className?: string;
    isDragging: boolean;
    draggableProps: any;
    previousCounter: Counter | null;
    subcounterChildren?: React.ReactNode;
  }
) => React.ReactNode;

interface Props extends HTMLProps<HTMLUListElement> {
  counters: Counter[];
  countMapping: CountMapping;
  renderCounter: RenderCounter;
  className?: string;
  noDataFallback: React.ReactNode;
  header: React.ReactNode;
}

const CounterList: React.FC<Props> = ({
  counters,
  countMapping,
  renderCounter,
  className = "",
  noDataFallback,
  header,
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
            // "transition-all duration-300",
            snapshot.isDraggingOver ? "bg-sky-200" : "bg-blue-100",
          ].join(" ")}
        >
          {header}
          <Divider className="my-1" />
          {counters.length === 0 && noDataFallback}
          {counters.length > 0 &&
            counters.map((counter, index) => (
              <React.Fragment key={counter.id}>
                <Draggable
                  draggableId={`counter-${counter.id}`}
                  index={index}
                  key={counter.id}
                >
                  {(provided, parentSnapshot) => (
                    <>
                      {renderCounter(counter, countMapping[counter.id], {
                        draggableProps: {
                          ref: provided.innerRef,
                          ...provided.draggableProps,
                          ...provided.dragHandleProps,
                        },
                        previousCounter: index > 0 ? counters[index - 1] : null,
                        isDragging: parentSnapshot.isDragging,
                        subcounterChildren: (
                          <Droppable
                            droppableId="droppable-subcounters-1"
                            type="SUBCOUNTER"
                          >
                            {(provided, snapshot) => (
                              <ul
                                ref={provided.innerRef}
                                className={[
                                  counter.subcounters?.length > 0
                                    ? ""
                                    : "hidden",
                                  "list-none p-0 ml-10",
                                  "flex flex-col gap-2",
                                  // "transition-all duration-300",
                                  parentSnapshot.isDragging ? "hidden" : "",
                                  snapshot.isDraggingOver
                                    ? "bg-sky-200"
                                    : "bg-blue-100",
                                ].join(" ")}
                                {...provided.droppableProps}
                                {...props}
                              >
                                {counter.subcounters?.length > 0 &&
                                  counter.subcounters.map(
                                    (subcounter, index) => (
                                      <Draggable
                                        draggableId={`subcounter-${subcounter.id}`}
                                        index={index}
                                        key={subcounter.id}
                                      >
                                        {(provided, snapshot) => (
                                          <>
                                            {renderCounter(
                                              subcounter,
                                              countMapping[subcounter.id],
                                              {
                                                draggableProps: {
                                                  ref: provided.innerRef,
                                                  ...provided.draggableProps,
                                                  ...provided.dragHandleProps,
                                                },
                                                previousCounter: null,
                                                isDragging: snapshot.isDragging,
                                              }
                                            )}
                                          </>
                                        )}
                                      </Draggable>
                                    )
                                  )}
                                {provided.placeholder}
                              </ul>
                            )}
                          </Droppable>
                        ),
                      })}
                    </>
                  )}
                </Draggable>
              </React.Fragment>
            ))}
          {provided.placeholder}
        </ul>
      )}
    </Droppable>
  );
};

export default CounterList;
