import { useRef, useEffect, useCallback, useState } from "react";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import { path } from "../../../config/env";
import { useMainPageContext } from "../MainPageManager";
import { IsConquer, Node, TreeData, WsMessageType } from "../../types";
import NoTreeIsOpen from "./NoTreeIsOpen";
import "aframe"; // react-force-graph보다 먼저 import
import { ForceGraph2D } from "react-force-graph";
import { forceCollide } from "d3-force";

const Tree = ({ containerRef }: { containerRef: any | null }) => {
  // const sampleTreeData: TreeData = {
  //   nodes: [
  //     { id: "1", label: "Main Root Node", isConquer: IsConquer.FALSE },
  //     { id: "2", label: "Introduction to Topic A", isConquer: IsConquer.TRUE },
  //     { id: "3", label: "Overview of Topic B", isConquer: IsConquer.FALSE },
  //     { id: "4", label: "Deep Dive into Topic C", isConquer: IsConquer.FALSE },
  //     { id: "5", label: "Details of A1 Subpart", isConquer: IsConquer.TRUE },
  //     { id: "6", label: "Exploring A2 Section", isConquer: IsConquer.FALSE },
  //     { id: "7", label: "B1 Concepts Explained", isConquer: IsConquer.FALSE },
  //     { id: "8", label: "Summary of B2 Ideas", isConquer: IsConquer.TRUE },
  //     { id: "9", label: "Understanding C1 Flow", isConquer: IsConquer.FALSE },
  //     { id: "10", label: "C2 Key Takeaways", isConquer: IsConquer.TRUE },
  //     { id: "11", label: "A1-1 Extended Notes", isConquer: IsConquer.FALSE },
  //     { id: "12", label: "B1-1 Final Thoughts", isConquer: IsConquer.TRUE },
  //   ],
  //   links: [
  //     { source: "1", target: "2" },
  //     { source: "1", target: "3" },
  //     { source: "1", target: "4" },
  //     { source: "2", target: "5" },
  //     { source: "2", target: "6" },
  //     { source: "3", target: "7" },
  //     { source: "3", target: "8" },
  //     { source: "4", target: "9" },
  //     { source: "4", target: "10" },
  //     { source: "5", target: "11" },
  //     { source: "7", target: "12" },
  //   ],
  // };
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
  const [loading, setLoading] = useState<boolean>(true);
  const prevTreeId = useRef<string | null>(null);
  const theme = useTheme();
  const [treeData, setTreeData] = useState<TreeData | undefined>(undefined);
  const fgRef = useRef<any>(undefined);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const wsMessageHandler: Record<string, (data: any) => void> = {
    [WsMessageType.UPDATE_TREE_LABEL]: (data) => {},
    [WsMessageType.UPDATE_TREE_ADD_CHILD_LEAF]: (data) => {
      //const { newNode, newEdge } = data;
    },
    [WsMessageType.UPDATE_TREE_ADD_PARENT_LEAF]: (data) => {
      //const { newNode, deleteEdge, newEdgeList } = data;
    },
    [WsMessageType.UPDATE_TREE_CONQUER]: (data) => {
      //const { nodes } = data;
    },
  };

  const handleNodeClick = (node: Node) => {
    const leafId = node.id;
    setLeafId(leafId);
    setIsPublicLeaf(isPublicTree);
  };

  const handleConquerClick = (node: Node) => {
    const leafId = node.id;
    const isConquer = node.isConquer;
    ws?.send(JSON.stringify({ type: WsMessageType.UPDATE_TREE_CONQUER, data: { treeId, leafId, isConquer } }));
  };

  //tree데이터 가져오기.
  useEffect(() => {
    if (!treeId) return;
    const getTreeData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${path}/tree/${treeId}`);
        if (response.data) {
          setTreeData(response.data);
        }
      } catch (error) {
        console.log("[Tree][getTreeData]Error fetching tree data:", error);
      } finally {
        setLoading(false);
      }
    };
    getTreeData();
  }, [treeId]);

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

  //observer등록. 추적하는 컴포넌트의 크기가 변경되면 setDimensions호출.
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDimensions({ width, height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  //노드들이 겹치지 않게. force설정.
  //마운트 시 fgRef.current는 undefined이므로, treeData가 변하면 effect 다시 호출.
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force("collide", forceCollide(20));
    }
  }, [treeData]);

  if (loading && treeId) {
    return <p>Loading tree data...</p>;
  }

  return treeData ? (
    <ForceGraph2D
      ref={fgRef}
      graphData={treeData}
      width={dimensions.width}
      height={dimensions.height}
      nodeCanvasObject={(node, ctx, globalScale) => {
        //node : 노드 데이터.
        //ctx:캔버스 2D 렌더링 컨텍스트(접근 가능한 정보나 기능의 집합).
        //globalScale: 줌 레벨.
        const label = node.label;
        const fontSize = 12 / globalScale;
        const radius = 5 / globalScale;
        const isConquer = node.isConquer;
        //도형 그리기.
        ctx.beginPath(); //이전 경로를 끊고, 새로운 도형을 그리기 위한 경로를 시작
        ctx.arc(
          node.x!, // 원의 중심 x 좌표 (노드 위치)
          node.y!, // 원의 중심 y 좌표 (노드 위치)
          radius, // 반지름
          0, // 시작 각도 (0 라디안)
          2 * Math.PI // 끝 각도 (360도 = 2π 라디안)
        );
        ctx.fillStyle = isConquer === IsConquer.TRUE ? "red" : "green";
        ctx.fill(); // 설정된 색상으로 원을 채움

        //텍스트 그리기.
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = theme.palette.mode === "dark" ? "white" : "black";
        ctx.fillText(label, node.x!, node.y! - radius - fontSize / 2);
      }}
      dagMode="td" // top-down 계층 구조
      dagLevelDistance={70} // 계층 간 거리
      onNodeClick={handleNodeClick}
      linkColor={(link) => {
        return theme.palette.mode === "dark" ? "#888" : "rgba(0,0,0,0.2)";
      }}
    />
  ) : (
    <NoTreeIsOpen />
  );
};

export default Tree;
