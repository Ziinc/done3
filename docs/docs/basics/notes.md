---
sidebar_position: 3
---

# Notes

Notes are organized into lists.

## Requirements

Notes uses Google Keep API to manage the Keep notes.

Using the Keep integration requires

## Under the hood

The Google Tasks API is used to interact with the Tasks data. Required Oauth2 permissions must be provided to interact with the API.

For performance, Done3 performs caching of the Task on the database, allowing for fast retrieval. Data is kept fresh via background syncing.

## Improvements

### Markdown support

Markdown text formatting and display is supported for notes.

Tables are not yet supported.

### Text and ToDo checkboxes

Instead of having only todos or text exclusively, you can now use both in a note in the form of markdown checkboxes.

Todo lists are automatically converted to Markdown tasks to allow text content to be interleaved between lists.

Checkboxes can be indented multiple levels as well when nesting, as opposed to official client limitation of only 1 level.

## Limitations

The Google Keep API caters largely to enterprise customers, resulting in severely lacking APIs for programmatically working with a Google Keep note.

For example, the following features are not exposed by the Tasks API:

- Updating a note
- Trashing
- Archiving
- Optical Character Recognition

Using this feature also requires Domain Wide Delegation, which is not accessible to non-Workspace accounts. Admins must add the OAuth ID and necessary roles in order for Done3 to work correctly.

To use the drawing feature that Keep has, it is recommended to use the official mobile and web clients, as the necesssary APIs to perform image updating and creation are not exposed.
