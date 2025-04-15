import { useRef, useEffect, useCallback, useState } from "react";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import { path } from "../../../config/env";
import { useMainPageContext } from "../MainPageManager";
import { WsMessageType } from "../../types";
import NoTreeIsOpen from "./NoTreeIsOpen";
import { ReactFlow, type Node, type Edge, useReactFlow, ReactFlowProvider, NodeMouseHandler } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ELK from "elkjs/lib/elk.bundled.js";
import { forceSimulation, forceManyBody, forceCollide, Simulation } from "d3-force";

const elk = new ELK();
const elkOptions = {
  "elk.algorithm": "layered",
  "elk.direction": "DOWN", // 트리 구조
  "elk.layered.spacing.nodeNodeBetweenLayers": "100",
  "elk.spacing.nodeNode": "80",
};
let isSimulationActivated: Simulation<any, any> | null = null;
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
const applyForceLayoutAnimated = (nodes: any[], setNodes: React.Dispatch<React.SetStateAction<Node[]>>) => {
  if (isSimulationActivated) {
    isSimulationActivated.stop();
  }
  const sim = forceSimulation(nodes)
    .force("charge", forceManyBody().strength(-50)) // 서로 밀어내는 힘
    .force("collision", forceCollide().radius(80)) // 충돌 방지
    .alpha(1) // 초기 에너지 (애니메이션 강도)
    .alphaDecay(0.05) // 서서히 멈추게 하는 감쇠율
    .on("tick", () => {
      // 매 프레임마다 노드 위치 갱신
      setNodes((prevNodes) =>
        prevNodes.map((node, i) => ({
          ...node,
          position: {
            x: nodes[i].x ?? 0,
            y: nodes[i].y ?? 0,
          },
        }))
      );
    });
  isSimulationActivated = sim;

  //시뮬레이션 정지
  setTimeout(() => {
    sim.stop();
    if (isSimulationActivated === sim) {
      isSimulationActivated = null;
    }
  }, 2000);
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
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const prevTreeId = useRef<string | null>(null);
  const theme = useTheme();
  const { getNodes, fitView, setCenter } = useReactFlow();
  const [nodesReady, setNodesReady] = useState(false);

  const handleAddNode = (newNode: Node, newEdge: Edge) => {
    const updatedNodes = [...nodes, newNode];
    const updatedEdges = [...edges, newEdge];
    setEdges(updatedEdges);

    // 애니메이션으로 force 적용
    applyForceLayoutAnimated(updatedNodes, setNodes);
  };

  const handleNodeClick: NodeMouseHandler = (event, node) => {
    setLeafId(node.id);
    setIsPublicLeaf(isPublicTree);
  };

  const handleConquerClick = (event: any) => {
    const leafId = event.target.id();
    const isConquer = event.target.data("isConquer");
    ws?.send(JSON.stringify({ type: WsMessageType.UPDATE_TREE_CONQUER, data: { treeId, leafId, isConquer } }));
  };

  const wsMessageHandler: Record<string, (data: any) => void> = {
    [WsMessageType.UPDATE_TREE_LABEL]: (data) => {
      const targetId = data.leafId;
      const newTitle = data.title;
      if (nodes) setNodes((prev) => prev.map((elem) => (elem.data.id === targetId ? { ...elem, data: { ...elem.data, label: newTitle } } : elem)));
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
        const response = await axios.get(`${path}/tree/${treeId}`);
        const treeData = response.data;
        if (!treeData) throw new Error("[Tree]서버에서 받은 tree 데이터 없음");
        const initialNodes = treeData.nodes;
        const edges = treeData.edges;
        //elk로 layoutedNodes 만들기.
        const layoutedNodes = await getLayoutedNodes(initialNodes, edges);
        setNodes(layoutedNodes);
        setEdges(edges);
        setNodesReady(true);
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

  //leafId를 기준으로 노드 정렬.
  useEffect(() => {
    //leafId가 undefined 즉 정렬의 기준이 되는 노드가 없는 경우 디폴트 정렬.
    if (!leafId && nodes.length > 0) {
      fitView(); //nodes데이터 서버 응답 전이라면 정렬 안 됨, 응답 완료 플래그(nodesReady)를 하나 도입해서 deps에 추가.
      return;
    }
    const flowNodes = getNodes();
    const targetNode = flowNodes.find((n) => n.id === leafId);
    if (targetNode) {
      const { x, y } = targetNode.position;
      setCenter(x, y, { duration: 300 });
      targetNode.style = {
        ...(targetNode.style || {}),
        width: 200,
        height: 80,
        border: "2px solid red",
      };
      setNodes(flowNodes);
    }
  }, [leafId, nodesReady]);

  if (loading && treeId) {
    return <p>Loading tree data...</p>;
  }

  return treeId ? <ReactFlow nodes={nodes} edges={edges} onNodeClick={handleNodeClick} /> : <NoTreeIsOpen />;
};

export default Tree;
