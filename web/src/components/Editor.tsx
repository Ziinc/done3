import { Transaction } from "@tiptap/pm/state";
import {
  EditorProvider,
  FloatingMenu,
  BubbleMenu,
  EditorEvents,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { Markdown } from "tiptap-markdown";
import {
  HeadingWithAnchor,
  MenuButtonBlockquote,
  MenuButtonBold,
  MenuButtonBulletedList,
  MenuButtonCode,
  MenuButtonCodeBlock,
  MenuButtonHorizontalRule,
  MenuButtonItalic,
  MenuButtonOrderedList,
  MenuButtonRedo,
  MenuButtonTaskList,
  MenuButtonUnderline,
  MenuButtonUndo,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditor,
  TableImproved,
  type RichTextEditorRef,
  MenuButtonAddTable,
  TableBubbleMenu,
  LinkBubbleMenu,
  LinkBubbleMenuHandler,
} from "mui-tiptap";
import { useRef } from "react";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";

// define your extension array
const extensions = [
  StarterKit,
  TaskItem.configure({
    nested: true,
  }),
  TaskList,
  Markdown,
  Underline,

  LinkBubbleMenuHandler,

  Link.configure({
    openOnClick: false,
    autolink: true,

    defaultProtocol: "https",
    protocols: ["https", "mailto"],
  }),
];

interface Props {
  defaultValue: string;
  onChange: (markdown: string) => void;
}
const Editor = ({ defaultValue, onChange }: Props) => {
  const rteRef = useRef<RichTextEditorRef>(null);
  const handleUpdate = ({ editor, transaction }: EditorEvents["update"]) => {
    const md = editor.storage.markdown.getMarkdown();
    onChange(md);
  };
  return (
    <RichTextEditor
      ref={rteRef}
      extensions={extensions}
      content={defaultValue}
      renderControls={() => (
        <MenuControlsContainer>
          <MenuButtonUndo />
          <MenuButtonRedo />
          <MenuDivider />
          <MenuSelectHeading />
          <MenuDivider />
          <MenuButtonBold />
          <MenuButtonItalic />
          <MenuButtonUnderline />
          <MenuButtonCode />
          <MenuDivider />
          <MenuButtonCodeBlock />
          <MenuButtonBlockquote />
          <MenuButtonHorizontalRule />
          <MenuDivider />
          <MenuButtonBulletedList />
          <MenuButtonOrderedList />
          <MenuButtonTaskList />
          <TableBubbleMenu />
          {/* Add more controls of your choosing here */}
        </MenuControlsContainer>
      )}
      onUpdate={handleUpdate}></RichTextEditor>
  );
};

export default Editor;
