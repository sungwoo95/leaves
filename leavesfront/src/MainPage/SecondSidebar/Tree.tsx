import { useRef, useEffect, useCallback, useState } from "react";
import axios from "axios";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import { useTheme } from "@mui/material/styles";
import { path } from "../../../config/env";
import { useMainPageContext } from "../MainPageManager";
import { WsMessageType } from "../../types";

const Tree: React.FC = () => {
  const mainPageContext = useMainPageContext();
  try {
    if (!mainPageContext) {
      //mainPageContext.Provider의 하위 컴포넌트가 아닐 경우
      throw new Error("//mainPageContext.Provider의 하위 컴포넌트가 아님");
    }
  } catch (err) {
    console.error((err as Error).message);
    return <p>오류가 발생했습니다.</p>;
  }
  const { ws, treeId, leafId, setLeafId, isPublicTree, setIsPublicLeaf } = mainPageContext;
  const cyRef = useRef<cytoscape.Core | undefined>(undefined);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const prevTreeId = useRef<string | null>(null);
  const theme = useTheme();

  //leafId로 중앙 정렬.
  const focusCurrentNode = useCallback(() => {
    if (cyRef.current && leafId) {
      const cy = cyRef.current;
      const leaf = cy.getElementById(leafId);

      if (leaf && leaf.isNode()) {
        const leafPosition = leaf.position();
        const zoom = cy.zoom();

        cy.animate(
          {
            pan: {
              x: cy.width() / 2 - leafPosition.x * zoom,
              y: cy.width() / 2 - leafPosition.y * zoom,
            },
          },
          {
            duration: 600,
            easing: "ease-in-out",
          }
        );

        // 강조 스타일 적용
        cy.style()
          .selector(`node[id = "${leafId}"]`)
          .style({
            width: "40px",
            height: "40px",
          })
          .update();
      }
    }
  }, [leafId]);

  const handleLeafClick = (event: cytoscape.EventObject) => {
    const leafId = event.target.id();
    setLeafId(leafId);
    setIsPublicLeaf(isPublicTree);
  };

  //tree데이터 가져오기.
  //tree그룹(websocket)에 참가하기.
  useEffect(() => {
    const getTreeData = async () => {
      try {
        setLoading(true);
        console.log("[Tree][getTreeData]treeId:", treeId);
        const response = await axios.get(`${path}/tree/${treeId}`);
        setNodes(response.data.nodes);
        setEdges(response.data.edges);
      } catch (error) {
        console.error("Error fetching tree data:", error);
      } finally {
        setLoading(false);
      }
    };
    const joinTreeGroup = () => {
      if (ws && treeId) {
        ws.send(JSON.stringify({ type: WsMessageType.JOIN_TREE, data: { treeId, prevTreeId: prevTreeId.current } }));
        prevTreeId.current = treeId;
      }
    };
    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      const { type, data } = message;
      if (type === WsMessageType.UPDATE_TREE_LABEL && data.treeId === treeId) {
        const targetId = data.leafId;
        const newTitle = data.title;
        console.log(targetId, newTitle);
        setNodes((prev) => {
          const newNodes = prev.map((elem) => {
            return elem.data.id === targetId ? { ...elem, data: { ...elem.data, label: newTitle } } : elem;
          });
          return newNodes;
        });
      }
    };
    const addWsEventListener = () => {
      if (ws) {
        ws.addEventListener("message", handleMessage);
      }
    };
    if (treeId) {
      getTreeData();
      joinTreeGroup();
      addWsEventListener();
    }
  }, [treeId, ws]);

  //노드 정렬.
  useEffect(() => {
    focusCurrentNode();
  }, [leafId, focusCurrentNode]);

  if (loading) {
    return <p>Loading tree data...</p>;
  }

  return (
    <CytoscapeComponent
      cy={(cy) => {
        cyRef.current = cy;
        cy.on("tap", "node", handleLeafClick);
      }}
      elements={CytoscapeComponent.normalizeElements({ nodes, edges })}
      style={{ width: "100%", height: "100%" }}
      layout={{ name: "preset" }}
      stylesheet={[
        {
          selector: "node",
          style: {
            "background-color": "green",
            label: "data(label)",
            width: "30px",
            height: "30px",
            color: theme.palette.mode === "dark" ? "white" : "black",
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#ccc",
          },
        },
      ]}
    />
  );
};

export default Tree;
