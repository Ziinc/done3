---
sidebar_position: 3
---

# Notes

Notes are organized into lists.

## Improvements

### Markdown support

Markdown text formatting and display is supported for notes. Text formatting such as italic, bold, and underline are supported, along with utility formatting such as URLs and lists.

Images with external `src` is supported.

Tables are not supported.

### Text and ToDo checkboxes

Instead of having only todos or text exclusively, you can now use both in a note in the form of markdown checkboxes.

Todo lists are automatically converted to Markdown tasks to allow text content to be interleaved between lists.

Checkboxes can be indented multiple levels as well when nesting, as opposed to official client limitation of only 1 level.


## Under the hood

The Done3 app uses our own Google service account to access your user data. This is done through [service account impersonation](https://cloud.google.com/docs/authentication/use-service-account-impersonation), and this is the only way that Google allows usage of the Keep API.

Your Google Workspace Administrator must provide this access in order for the service account to make requests to the Google Keep API, otherwise the Keep integration will not work.

For safety and security purposes, the Done3 source code is fully available and [open-source](https://github.com/Ziinc/done3) to facilitate auditing.

### Limitations

The Google Keep API caters largely to enterprise customers, resulting in severely lacking APIs for programmatically working with a Google Keep note.

For example, the following features are not exposed by the Tasks API:

- Updating a note
- Trashing
- Archiving
- Optical Character Recognition
- Reminders
- Drawings
- Labels

Using this feature also requires Domain Wide Delegation, which is not accessible to non-Workspace accounts. Admins must add the OAuth ID and necessary roles in order for Done3 to work correctly.

To use the drawing feature that Keep has, it is recommended to use the official mobile client, as the necesssary APIs to perform image updating and creation are not exposed.
