import { useComponentsContext } from "@blocknote/react";

const AddLeafFormattingToolBarButton = () => {
  const Components = useComponentsContext()!;

  return (
    <Components.FormattingToolbar.Button
      mainTooltip={"Create new Leaf"}
      onClick={() => {
        console.log("[AddLeafFormattingToolBarButton]clicked");
      }}>
      <img src={"/leavesfront/public/addLeafIconDayMode.png"} />
    </Components.FormattingToolbar.Button>
  );
}

export default AddLeafFormattingToolBarButton;
