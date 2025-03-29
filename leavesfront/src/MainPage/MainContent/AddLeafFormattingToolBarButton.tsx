import { useBlockNoteEditor, useComponentsContext } from "@blocknote/react";
import { useMainPageContext } from "../MainPageManager";
import { WsMessageType } from "../../types";

const AddLeafFormattingToolBarButton = ({ owningTreeId }: { owningTreeId: string }) => {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext()!;
  const mainPageContext = useMainPageContext();
  if (!mainPageContext) {
    return <p>mainPageContext.Provider의 하위 컴포넌트가 아님.</p>;
  }
  const { leafId, ws } = mainPageContext;
  return (
    <Components.FormattingToolbar.Button
      mainTooltip={"Create new Leaf"}
      onClick={() => {
        const selectedText = editor.getSelectedText();
        console.log("[AddLeafFormattingToolBarButton] Selected text:", selectedText);
        if (ws) {
          ws.send(JSON.stringify({ type: WsMessageType.ADD_LEAF, data: { leafId, owningTreeId, title: selectedText } }));
        }
      }}>
      <img src={"/leafIcon.png"} style={{ width: "20px", height: "20px" }} />
    </Components.FormattingToolbar.Button>
  );
};

export default AddLeafFormattingToolBarButton;
