import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";
import { BlockNoteView } from "@blocknote/mantine";
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  ColorStyleButton,
  CreateLinkButton,
  FileCaptionButton,
  FileReplaceButton,
  FormattingToolbar,
  FormattingToolbarController,
  NestBlockButton,
  TextAlignButton,
  UnnestBlockButton,
} from "@blocknote/react";
import CreateChildLeafFormattingToolBarButton from "./CreateChildLeafFormattingToolBarButton";
import CreateParentLeafFormattingToolBarButton from "./CreateParentLeafFormattingToolBarButton";
import { useStorage } from "@liveblocks/react/suspense";

const Editor = ({ owningTreeId, parentLeafIdRef }: { owningTreeId: string; parentLeafIdRef: React.RefObject<string | null> }) => {
  const storage = useStorage((root) => root);
  const editor = useCreateBlockNoteWithLiveblocks({});

  return (
    <BlockNoteView editor={editor} formattingToolbar={false} data-theming-css-variables-demo>
      <FormattingToolbarController
        formattingToolbar={() => (
          <FormattingToolbar>
            <BlockTypeSelect key={"blockTypeSelect"} />
            <CreateParentLeafFormattingToolBarButton parentLeafIdRef={parentLeafIdRef} owningTreeId={owningTreeId} key={"CreateParentLeafButton"} />
            <CreateChildLeafFormattingToolBarButton owningTreeId={owningTreeId} key={"CreateChildLeafButton"} />
            <FileCaptionButton key={"fileCaptionButton"} />
            <FileReplaceButton key={"replaceFileButton"} />

            <BasicTextStyleButton basicTextStyle={"bold"} key={"boldStyleButton"} />
            <BasicTextStyleButton basicTextStyle={"italic"} key={"italicStyleButton"} />
            <BasicTextStyleButton basicTextStyle={"underline"} key={"underlineStyleButton"} />
            <BasicTextStyleButton basicTextStyle={"strike"} key={"strikeStyleButton"} />
            {/* Extra button to toggle code styles */}
            <BasicTextStyleButton key={"codeStyleButton"} basicTextStyle={"code"} />

            <TextAlignButton textAlignment={"left"} key={"textAlignLeftButton"} />
            <TextAlignButton textAlignment={"center"} key={"textAlignCenterButton"} />
            <TextAlignButton textAlignment={"right"} key={"textAlignRightButton"} />

            <ColorStyleButton key={"colorStyleButton"} />

            <NestBlockButton key={"nestBlockButton"} />
            <UnnestBlockButton key={"unnestBlockButton"} />

            <CreateLinkButton key={"createLinkButton"} />
          </FormattingToolbar>
        )}
      />
    </BlockNoteView>
  );
};

export default Editor;
