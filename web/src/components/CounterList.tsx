import { Divider } from "antd";
import React, { HTMLProps, useState } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { Counter, CountMapping, CountTally } from "../api/counters";
import { Button, ClickAwayListener, Paper, Typography } from "@mui/material";
import CounterForm, { CounterFormProps } from "./CounterForm";
import { AddBoxOutlined } from "@mui/icons-material";

type RenderCounter = (
  counter: Counter,
  tally: CountTally,
  // note: adding types for the draggable props is not worth the effort
  state: { isDragging: boolean; draggableProps: any }
) => React.ReactNode;

interface Props extends HTMLProps<HTMLUListElement> {
  onAddCounter: CounterFormProps["onSubmit"];
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
  onAddCounter,
  ...props
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <Droppable droppableId="droppable-1" type="COUNTER">
      {(provided, snapshot) => (
        <Paper
          className={[
            className,
            "list-none",
            "pt-5 px-4 rounded-lg",
            "transition-all duration-300",
            snapshot.isDraggingOver ? "bg-sky-200" : "",
          ].join(" ")}
        >
          <ul
            ref={provided.innerRef}
            {...provided.droppableProps}
            {...props}
            className={["list-none", "flex flex-col p-0 gap-1 rounded-lg"].join(
              " "
            )}
          >
            <div className="flex flex-col justify-start items-start gap-2">
              <Typography variant="h6">Counters</Typography>
              <Button
                startIcon={<AddBoxOutlined />}
                onClick={() => setShowAddForm(true)}
              >
                Add a counter
              </Button>
            </div>
            {showAddForm && (
              <ClickAwayListener onClickAway={() => setShowAddForm(false)}>
                <div>
                  <CounterForm
                    onSubmit={(...args) => {
                      onAddCounter(...args);
                      setShowAddForm(false);
                    }}
                    onCancel={() => setShowAddForm(false)}
                  />
                </div>
              </ClickAwayListener>
            )}
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
        </Paper>
      )}
    </Droppable>
  );
};

export default CounterList;
