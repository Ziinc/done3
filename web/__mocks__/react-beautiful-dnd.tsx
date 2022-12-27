import React, { useRef } from "react";
import { vi } from "vitest";

export const DragDropContext: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <> {children} </>;

export const Draggable = vi.fn().mockImplementation(({ children }) => {
  const ref = useRef(null);

  return (
    <>
      {children(
        { innerRef: ref, draggableProps: {}, dragHandleProps: {} },
        vi.fn()
      )}
    </>
  );
});

export const Droppable = vi.fn().mockImplementation(({ children }) => {
  const ref = useRef(null);
  return (
    <>
      {children(
        { innerRef: ref, droppableProps: {} },
        { isDraggingOver: false }
      )}
    </>
  );
});
