import { useEffect, useState } from "react";
import {
  Counter,
  createCounter,
  deleteCounter,
  rearrangeCounters,
  increaseCounter,
  listCounters,
  updateCounter,
  upsertCounters,
  getCounts,
  CountMapping,
  CountTally,
} from "../api/counters";
import CounterForm from "../components/CounterForm";
import CounterItem from "../components/CounterItem";
import {
  DragDropContext,
  OnDragEndResponder,
  OnDragUpdateResponder,
} from "react-beautiful-dnd";
import CounterList from "../components/CounterList";
import useSWR, { unstable_serialize } from "swr";
import {
  deleteTaskList,
  insertTaskList,
  listTaskLists,
  putTaskList,
  syncTaskLists,
} from "../api/task_lists";
import TaskList from "../components/tasks/TaskList";
import {
  ClickAwayListener,
  Container,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import { Add, Cancel } from "@mui/icons-material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { useSWRConfig } from "swr";
import { Task, moveTask } from "../api/tasks";
import sortBy from "lodash/sortBy";
import { syncNotes } from "../api/notes";
import Navbar from "../components/Navbar";
const Home: React.FC = () => {
  const { cache, mutate } = useSWRConfig();
  const { mutate: syncLists } = useSWR("lists/sync", () => syncTaskLists(), {
    revalidateOnFocus: false,
    refreshInterval: 60 * 1000 * 5,
  });
  const { mutate: refreshNotes } = useSWR("notes/sync", () => syncNotes(), {
    revalidateOnFocus: false,
    refreshInterval: 60 * 1000 * 5,
  });

  const { data: taskLists = [], mutate: mutateTaskLists } = useSWR(
    "tasklists",
    () => listTaskLists().then(result => result.data),
    {
      revalidateOnFocus: false,
    }
  );

  const [newList, setNewList] = useState(false);
  const [keydown, setKeydown] = useState<string | null>(null);

  const handleTaskDrag: OnDragEndResponder &
    OnDragUpdateResponder = async args => {
    const { draggableId, destination } = args;
    if (destination?.index === undefined) return;
    const destinationTaskListId = destination.droppableId.split("-")[1];
    const taskId = draggableId.split("-")[2];
    const sourceTaskListId = draggableId.split("-")[1];

    const destinationTaskListIdSerialized = unstable_serialize([
      "taskslist",
      destinationTaskListId,
    ]);
    const destinationTaskList = cache.get(destinationTaskListIdSerialized);
    const destinationTasks = sortBy(
      destinationTaskList?.data || [],
      "position"
    );

    const sourceTaskListIdSerialized = unstable_serialize([
      "taskslist",
      sourceTaskListId,
    ]);
    const sourceTaskList = cache.get(sourceTaskListIdSerialized);
    const sourceTasks = sourceTaskList?.data || [];
    let prev;
    if (
      destination?.index !== 0 &&
      destinationTaskListId !== sourceTaskListId
    ) {
      prev = destinationTasks.at(destination?.index - 1);
    } else if (
      destination?.index !== 0 &&
      destinationTaskListId === sourceTaskListId
    ) {
      // moving within the same list
      prev = destinationTasks.at(destination?.index);
    }
    // do api call to move the task
    const { data: task } = await moveTask(taskId, {
      parent: undefined,
      previous: prev ? prev.id : null,
      destinationTasklist:
        sourceTaskListId === destinationTaskListId
          ? undefined
          : destinationTaskListId,
    });

    if (sourceTaskListId === destinationTaskListId) {
      await mutate(
        ["taskslist", sourceTaskListId],
        async (tasks: Task[] | undefined) => {
          const filtered = (tasks || []).filter(t => t.id !== taskId);
          if (task) {
            filtered.push(task);
          }
          return filtered;
        },
        { revalidate: true }
      );
    } else {
      await mutate(
        ["taskslist", sourceTaskListId],
        async (tasks: Task[] | undefined) => {
          return (tasks || []).filter((t: Task) => t.id !== taskId);
        },
        { revalidate: true }
      );
      await mutate(
        ["taskslist", destinationTaskListId],
        async (tasks: Task[] | undefined) => {
          if (!tasks) return;
          const head = tasks.slice(0, destination?.index);
          const tail = tasks.slice(destination?.index, tasks.length);
          if (task) {
            tasks.push(task);
          }
          return tasks;
        },
        { revalidate: true }
      );
    }
  };

  // hotkey management
  useEffect(() => {
    if (!keydown) return;
  }, [keydown]);

  const hotkeyHandler = (e: KeyboardEvent) => {
    setKeydown(e.key);
  };

  useEffect(() => {
    document.addEventListener("keydown", hotkeyHandler);
    return () => removeEventListener("keydown", hotkeyHandler, false);
  }, []);

  return (
    <>
      <Navbar
        refresh={async () => {
          await syncLists();
          await refreshNotes();
          const taskLists = await mutateTaskLists();
          taskLists?.forEach(list => {
            mutate(["taskslist", list.id]);
            mutate(["taskslist", list.id, "notes"]);
            mutate(["taskslist", list.id, "counters"]);
            mutate("counts");
          });
        }}
      />

      <Grid
        container
        spacing={1}
        direction="row"
        sx={{ overflowX: "scroll" }}
        wrap="nowrap"
        justifyContent={"start"}
        gap={1}
        overflow="scroll"
        flexGrow="inherit">
        <DragDropContext onDragEnd={handleTaskDrag}>
          {taskLists &&
            taskLists.map(list => (
              <Grid minWidth={380} xs={12} md={4} key={list.id}>
                <TaskList
                  key={list.id}
                  taskList={list}
                  onDeleteTaskList={() => {
                    deleteTaskList(list.id);
                    const updated = taskLists.filter(tl => tl.id !== list.id);
                    mutateTaskLists(updated, { revalidate: false });
                  }}
                  onUpdateTaskList={async attrs => {
                    const { data: updated } = await putTaskList(list.id, attrs);
                    if (updated) {
                      const updatedLists = taskLists.map(tl =>
                        tl.id === list.id ? updated : tl
                      );
                      mutateTaskLists(updatedLists, { revalidate: false });
                    }
                  }}
                />
              </Grid>
            ))}
        </DragDropContext>

        <div>
          {newList ? (
            <>
              <form
                className="w-48"
                onSubmit={async e => {
                  e.preventDefault();
                  const { data } = await insertTaskList({
                    title: e.currentTarget.taskListTitle.value,
                  });
                  if (data && taskLists) {
                    mutateTaskLists([...taskLists, data]);
                  }
                }}>
                <TextField label="Title" name="taskListTitle" required />
                <Button variant="outlined" color="secondary" type="submit">
                  Add list
                </Button>
                <IconButton type="button" onClick={() => setNewList(false)}>
                  <Cancel />
                </IconButton>
              </form>
            </>
          ) : (
            <Container sx={{ minWidth: 380, p: 1 }}>
              <Button
                variant="contained"
                sx={{ width: 300 }}
                onClick={() => setNewList(true)}>
                Add new list
              </Button>
            </Container>
          )}
        </div>
      </Grid>
    </>
  );
};

export default Home;
