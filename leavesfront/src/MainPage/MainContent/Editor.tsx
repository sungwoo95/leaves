import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";
import { BlockNoteView } from "@blocknote/mantine";

export function Editor() {
  const editor = useCreateBlockNoteWithLiveblocks({});

  return (
    <div>
      <BlockNoteView editor={editor} data-theming-css-variables-demo />
    </div>
  );
}
