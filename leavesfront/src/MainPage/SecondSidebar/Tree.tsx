import { useRef, useEffect, useCallback, useState } from "react";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import { path } from "../../../config/env";
import { useMainPageContext } from "../MainPageManager";
import { WsMessageType } from "../../types";
import NoTreeIsOpen from "./NoTreeIsOpen";
import {
  ReactFlow,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type FitViewOptions,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type OnNodeDrag,
  type DefaultEdgeOptions,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

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
  const [nodes, setNodes] = useState<Node[] | undefined>(undefined);
  const [edges, setEdges] = useState<Edge[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const prevTreeId = useRef<string | null>(null);
  const theme = useTheme();
  const wsMessageHandler: Record<string, (data: any) => void> = {
    [WsMessageType.UPDATE_TREE_LABEL]: (data) => {
      const targetId = data.leafId;
      const newTitle = data.title;
      if (nodes)
        setNodes((prev) => {
          if (prev) {
            return prev.map((elem) => (elem.data.id === targetId ? { ...elem, data: { ...elem.data, label: newTitle } } : elem));
          }
        });
    },
    [WsMessageType.UPDATE_TREE_ADD_CHILD_LEAF]: (data) => {
      const { newNode, newEdge } = data;
    },
    [WsMessageType.UPDATE_TREE_ADD_PARENT_LEAF]: (data) => {
      const { newNode, deleteEdge, newEdgeList } = data;
    },
    [WsMessageType.UPDATE_TREE_CONQUER]: (data) => {
      const { nodes } = data;
    },
  };

  // //leafId로 중앙 정렬.
  // const focusCurrentNode = useCallback(() => {
  //   if (cyRef.current && leafId) {
  //     const cy = cyRef.current;
  //     const leaf = cy.getElementById(leafId);

  //     if (leaf && leaf.isNode()) {
  //       const leafPosition = leaf.position();
  //       const zoom = cy.zoom();

  //       cy.animate(
  //         {
  //           pan: {
  //             x: cy.width() / 2 - leafPosition.x * zoom,
  //             y: cy.width() / 2 - leafPosition.y * zoom,
  //           },
  //         },
  //         {
  //           duration: 600,
  //           easing: "ease-in-out",
  //         }
  //       );

  //       // 강조 스타일 적용
  //       cy.style()
  //         .selector(`node[id = "${leafId}"]`)
  //         .style({
  //           width: "20px",
  //           height: "20px",
  //         })
  //         .update();
  //     }
  //   }
  // }, [leafId]);

  const handleLeafClick = (event: any) => {
    const leafId = event.target.id();
    setLeafId(leafId);
    setIsPublicLeaf(isPublicTree);
  };

  const handleConquerClick = (event: any) => {
    const leafId = event.target.id();
    const isConquer = event.target.data("isConquer");
    ws?.send(JSON.stringify({ type: WsMessageType.UPDATE_TREE_CONQUER, data: { treeId, leafId, isConquer } }));
  };

  //tree그룹(websocket)에 참가하기.
  useEffect(() => {
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
      joinTreeGroup();
      addWsEventListener();
    }
    return () => {
      ws?.removeEventListener("message", handleMessage);
    };
  }, [treeId, ws]);

  //tree데이터 가져오기.
  useEffect(() => {
    const getTreeData = async () => {
      try {
        setLoading(true);
        ////서버에서 초기 데이터 가져오기.
        // const response = await axios.get(`${path}/tree/${treeId}`);
        // if (response.data) {
        //   setNodes(response.data.nodes);
        //   setEdges(response.data.edges);
        // }
        const initialNodes: Node[] = [
          { id: "1", data: { label: "Node 1" }, position: { x: 5, y: 5 } },
          { id: "2", data: { label: "Node 2" }, position: { x: 5, y: 100 } },
        ];

        const edges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }];

        //elk로 layoutedNodes 만들기.
        const layoutedNodes = initialNodes;
        //nodes,edges설정하기.
        setNodes(layoutedNodes);
        setEdges(edges);
      } catch (error) {
        console.log("[Tree][getTreeData]Error fetching tree data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (treeId) {
      getTreeData();
    }
  }, [treeId]);

  // //노드 정렬.
  // useEffect(() => {
  //   focusCurrentNode();
  // }, [leafId, focusCurrentNode]);

  if (loading && treeId) {
    return <p>Loading tree data...</p>;
  }

  return nodes && edges ? <ReactFlow nodes={nodes} edges={edges} /> : <NoTreeIsOpen />;
};

export default Tree;
