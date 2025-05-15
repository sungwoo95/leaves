import { BlockNoteView } from '@blocknote/mantine';
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
  useCreateBlockNote,
} from '@blocknote/react';
import CreateChildLeafFormattingToolBarButton from './CreateChildLeafFormattingToolBarButton';
import CreateParentLeafFormattingToolBarButton from './CreateParentLeafFormattingToolBarButton';
import { useEffect } from 'react';

const DevEditor = ({
  owningTreeId,
  parentLeafId,
  editorRef,
}: {
  owningTreeId: string;
  parentLeafId: string | null;
  editorRef: any;
}) => {
  const editor = useCreateBlockNote();
  useEffect(() => {
    editorRef.current = editor;
  }, []);
  return (
    <BlockNoteView
      editor={editor}
      formattingToolbar={false}
      data-theming-css-variables-demo
    >
      <FormattingToolbarController
        formattingToolbar={() => (
          <FormattingToolbar>
            <BlockTypeSelect key={'blockTypeSelect'} />
            <CreateParentLeafFormattingToolBarButton
              parentLeafId={parentLeafId}
              owningTreeId={owningTreeId}
              key={'CreateParentLeafButton'}
            />
            <CreateChildLeafFormattingToolBarButton
              owningTreeId={owningTreeId}
              key={'CreateChildLeafButton'}
            />
            <FileCaptionButton key={'fileCaptionButton'} />
            <FileReplaceButton key={'replaceFileButton'} />

            <BasicTextStyleButton
              basicTextStyle={'bold'}
              key={'boldStyleButton'}
            />
            <BasicTextStyleButton
              basicTextStyle={'italic'}
              key={'italicStyleButton'}
            />
            <BasicTextStyleButton
              basicTextStyle={'underline'}
              key={'underlineStyleButton'}
            />
            <BasicTextStyleButton
              basicTextStyle={'strike'}
              key={'strikeStyleButton'}
            />
            {/* Extra button to toggle code styles */}
            <BasicTextStyleButton
              key={'codeStyleButton'}
              basicTextStyle={'code'}
            />

            <TextAlignButton
              textAlignment={'left'}
              key={'textAlignLeftButton'}
            />
            <TextAlignButton
              textAlignment={'center'}
              key={'textAlignCenterButton'}
            />
            <TextAlignButton
              textAlignment={'right'}
              key={'textAlignRightButton'}
            />

            <ColorStyleButton key={'colorStyleButton'} />

            <NestBlockButton key={'nestBlockButton'} />
            <UnnestBlockButton key={'unnestBlockButton'} />

            <CreateLinkButton key={'createLinkButton'} />
          </FormattingToolbar>
        )}
      />
    </BlockNoteView>
  );
};

export default DevEditor;
