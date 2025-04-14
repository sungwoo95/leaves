import { useRef, useEffect, useCallback, useState } from "react";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import { path } from "../../../config/env";
import { useMainPageContext } from "../MainPageManager";
import { WsMessageType } from "../../types";
import NoTreeIsOpen from "./NoTreeIsOpen";
import { ReactFlow, type Node, type Edge, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ELK, { ElkNode } from "elkjs/lib/elk.bundled.js";

const elk = new ELK();
const elkOptions = {
  "elk.algorithm": "layered",
  "elk.direction": "DOWN", // 트리 구조
  "elk.layered.spacing.nodeNodeBetweenLayers": "100",
  "elk.spacing.nodeNode": "80",
};
const getLayoutedNodes = async (nodes: Node[], edges: Edge[]): Promise<Node[]> => {
  const graph = {
    id: "root",
    layoutOptions: elkOptions,
    children: nodes.map((node) => ({
      ...node,
      width: 150,
      height: 50,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })),
  };
  try {
    const layoutedGraph = await elk.layout(graph);
    if (!layoutedGraph.children) {
      throw new Error("[Tree] Layout calculation failed: children is undefined.");
    }
    const layoutedNodes: Node[] = layoutedGraph.children.map((node) => {
      const { x, y, width, height, ...rest } = node;
      return {
        ...rest,
        position: {
          x: x ?? 0, // x가 null또는 undefined일 경우 0.
          y: y ?? 0,
        },
      };
    });
    return layoutedNodes;
  } catch (error) {
    console.log("[Tree]elk.layout 에러");
    return [];
  }
};
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

  //그래프 데이터 설정하기.
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
          { id: "1", data: { label: "Root Node" }, position: { x: 0, y: 0 } },
          { id: "2", data: { label: "Child A" }, position: { x: 0, y: 0 } },
          { id: "3", data: { label: "Child B" }, position: { x: 0, y: 0 } },
          { id: "4", data: { label: "Grandchild A1" }, position: { x: 0, y: 0 } },
          { id: "5", data: { label: "Grandchild A2" }, position: { x: 0, y: 0 } },
          { id: "6", data: { label: "Grandchild B1" }, position: { x: 0, y: 0 } },
          { id: "7", data: { label: "Grandchild B2" }, position: { x: 0, y: 0 } },
        ];

        const edges: Edge[] = [
          { id: "e1-2", source: "1", target: "2" },
          { id: "e1-3", source: "1", target: "3" },
          { id: "e2-4", source: "2", target: "4" },
          { id: "e2-5", source: "2", target: "5" },
          { id: "e3-6", source: "3", target: "6" },
          { id: "e3-7", source: "3", target: "7" },
        ];

        //elk로 layoutedNodes 만들기.
        const layoutedNodes = await getLayoutedNodes(initialNodes, edges);
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
