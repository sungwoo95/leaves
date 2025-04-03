import { useRef, useEffect, useCallback, useState } from "react";
import axios from "axios";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import { useTheme } from "@mui/material/styles";
import { path } from "../../../config/env";
import { useMainPageContext } from "../MainPageManager";
import { WsMessageType } from "../../types";
import NoTreeIsOpen from "./NoTreeIsOpen";
import contextMenus from "cytoscape-context-menus";
import "cytoscape-context-menus/cytoscape-context-menus.css";

cytoscape.use(contextMenus); // 플러그인 활성화

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
  const wsMessageHandler: Record<string, (data: any) => void> = {
    [WsMessageType.UPDATE_TREE_LABEL]: (data) => {
      const targetId = data.leafId;
      const newTitle = data.title;
      setNodes((prev) => prev.map((elem) => (elem.data.id === targetId ? { ...elem, data: { ...elem.data, label: newTitle } } : elem)));
    },
    [WsMessageType.UPDATE_TREE_ADD_CHILD_LEAF]: (data) => {
      const { newNode, newEdge } = data;
      const cy = cyRef.current!;
      const currentZoom = cy.zoom();
      const currentPan = cy.pan();
      cy.add(newNode);
      cy.add(newEdge);
      const layout = cy.layout({
        name: "breadthfirst",
        directed: true,
        spacingFactor: 1,
      });
      layout.run();
      cy.zoom(currentZoom);
      cy.pan(currentPan);
    },
    [WsMessageType.UPDATE_TREE_ADD_PARENT_LEAF]: (data) => {
      const { newNode, deleteEdge, newEdgeList } = data;
      const cy = cyRef.current!;
      const currentZoom = cy.zoom();
      const currentPan = cy.pan();
      cy.add(newNode);
      if (deleteEdge) {
        const { source, target } = deleteEdge.data;
        const targetEdges = cy.edges(`[source="${source}"][target="${target}"]`);
        targetEdges.remove();
      }
      newEdgeList.forEach((elem: any) => {
        cy.add(elem);
      });
      const layout = cy.layout({
        name: "breadthfirst",
        directed: true,
        spacingFactor: 1,
      });
      layout.run();
      cy.zoom(currentZoom);
      cy.pan(currentPan);
    },
    [WsMessageType.UPDATE_TREE_CONQUER]: (data) => {
      const { nodes } = data;
      setNodes(nodes);
    },
  };

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
            width: "20px",
            height: "20px",
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

  const handleConquerClick = (event: cytoscape.EventObject) => {
    const leafId = event.target.id();
    const isConquer = event.target.data("isConquer");
    ws?.send(JSON.stringify({ type: WsMessageType.UPDATE_TREE_CONQUER, data: { treeId, leafId, isConquer } }));
  };
  //tree데이터 가져오기.
  //tree그룹(websocket)에 참가하기.
  useEffect(() => {
    const getTreeData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${path}/tree/${treeId}`);
        if (response.data) {
          setNodes(response.data.nodes);
          setEdges(response.data.edges);
        }
      } catch (error) {
        console.log("[Tree][getTreeData]Error fetching tree data:", error);
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
      if (data.treeId !== treeId) return;
      if (wsMessageHandler[type]) {
        wsMessageHandler[type](data);
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
    return () => {
      ws?.removeEventListener("message", handleMessage);
    };
  }, [treeId, ws]);

  //노드 정렬.
  useEffect(() => {
    focusCurrentNode();
  }, [leafId, focusCurrentNode]);

  if (loading && treeId) {
    return <p>Loading tree data...</p>;
  }

  return treeId ? (
    <CytoscapeComponent
      cy={(cy) => {
        cyRef.current = cy;
        cy.on("tap", "node", handleLeafClick);
        //우클릭 메뉴 추가.
        cy.contextMenus({
          menuItems: [
            {
              id: "conquer",
              content: "Conquer",
              selector: "node",
              onClickFunction: handleConquerClick,
            },
          ],
        });
      }}
      elements={CytoscapeComponent.normalizeElements({ nodes, edges })}
      style={{ width: "100%", height: "100%" }}
      layout={{
        name: "breadthfirst",
        directed: true,
        spacingFactor: 1,
      }}
      stylesheet={[
        {
          selector: "node",
          style: {
            "background-color": "green",
            label: "data(label)",
            width: "10px",
            height: "10px",
            color: theme.palette.mode === "dark" ? "white" : "black",
            "text-margin-y": -2, // 여백
            "font-size": "10px",
          },
        },
        {
          selector: "node[isConquer='true']", //isConquer가 true인 노드는 다음 style이 overwright.
          style: {
            "background-color": "red",
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
  ) : (
    <NoTreeIsOpen />
  );
};

export default Tree;
