import { useBlockNoteEditor, useComponentsContext } from "@blocknote/react";
import { useMainPageContext } from "../MainPageManager";
import { WsMessageType } from "../../types";

const CreateParentLeafFormattingToolBarButton = ({ owningTreeId, parentLeafId }: { owningTreeId: string; parentLeafId: string | null }) => {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext()!;
  const mainPageContext = useMainPageContext();
  if (!mainPageContext) {
    return <p>mainPageContext.Provider의 하위 컴포넌트가 아님.</p>;
  }
  const { leafId, ws } = mainPageContext;
  return (
    <Components.FormattingToolbar.Button
      mainTooltip={"Create parent leaf"}
      onClick={() => {
        const selectedText = editor.getSelectedText();
        console.log("[CreateParentLeafFormattingToolBarButton] Selected text:", selectedText);
        if (ws) {
          ws.send(JSON.stringify({ type: WsMessageType.ADD_LEAF, data: { leafId, owningTreeId, title: selectedText } }));
        }
      }}>
      <img src={"/addParentLeafIcon.png"} style={{ width: "15px", height: "20px" }} />
    </Components.FormattingToolbar.Button>
  );
};

export default CreateParentLeafFormattingToolBarButton;
