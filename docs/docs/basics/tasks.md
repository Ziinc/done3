---
sidebar_position: 1
---

# Tasks

Tasks can be organized into multiple task lists. Lists are organized in a kanban board, with each list containing multiple tasks.

## Under the hood

The Google Tasks API is used to interact with the Tasks data. Required Oauth2 permissions must be provided to interact with the API.

For performance, Done3 performs caching of the Task on the database, allowing for fast retrieval. Data is kept fresh via background syncing.

## Differences between official clients

### Copying of tasks and lists

Tasks can be copied easily, along with any subtasks.

Entire lists can be copied, with each task in the list being copied in a one-for-one manner.

### Recurring due dates can be deleted

In the official clients, once a due date is set to recur, it cannot be removed from the task. However, with Done3, the recurrence model is not tied to the Google Calendar events generated, hence recurrence and due dates can be removed from the task, resulting in tasks not being generated for future dates.

## Limitations

Certain features are not exposed by the Tasks API, hence limiting the amount of inter-operability that Done3 has with the official clients. Google also does not seem inclined to expose more features via their API, hence Done3 uses many workarounds in order to achieve feature parity. This means that certain features within Done3 might not propagate to official clients in the same way as if one were to use the official clients only.

For example, the following features are not exposed by the Tasks API:

- Recurring due dates
- Starring of tasks
