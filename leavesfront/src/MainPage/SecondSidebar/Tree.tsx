import { useRef, useEffect, useCallback, useState } from "react";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import { path } from "../../../config/env";
import { useMainPageContext } from "../MainPageManager";
import { IsConquer, TreeData, WsMessageType } from "../../types";
import NoTreeIsOpen from "./NoTreeIsOpen";
import "aframe"; // react-force-graph보다 먼저 import
import { ForceGraph2D } from "react-force-graph";

const Tree = ({ containerRef }: { containerRef: any | null }) => {
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

  // const handleNodeClick = (event: cytoscape.EventObject) => {
  //   const leafId = event.target.id();
  //   setLeafId(leafId);
  //   setIsPublicLeaf(isPublicTree);
  // };

  // const handleConquerClick = (event: cytoscape.EventObject) => {
  //   const leafId = event.target.id();
  //   const isConquer = event.target.data("isConquer");
  //   ws?.send(JSON.stringify({ type: WsMessageType.UPDATE_TREE_CONQUER, data: { treeId, leafId, isConquer } }));
  // };

  const sampleTreeData: TreeData = {
    nodes: [
      { id: "1", label: "Root", isConquer: IsConquer.FALSE },
      { id: "2", label: "Child 1", isConquer: IsConquer.TRUE },
      { id: "3", label: "Child 2", isConquer: IsConquer.FALSE },
      { id: "4", label: "Leaf", isConquer: IsConquer.TRUE },
    ],
    links: [
      { source: "1", target: "2" },
      { source: "1", target: "3" },
      { source: "2", target: "4" },
    ],
  };

  //tree데이터 가져오기.
  //tree그룹(websocket)에 참가하기.
  useEffect(() => {
    const getTreeData = async () => {
      try {
        setLoading(true);
        setTreeData(sampleTreeData);
        // todo
        // const response = await axios.get(`${path}/tree/${treeId}`);
        // if (response.data) {
        // }
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

  if (loading && treeId) {
    return <p>Loading tree data...</p>;
  }

  return treeData ? <ForceGraph2D ref={fgRef} graphData={treeData} width={dimensions.width} height={dimensions.height} /> : <NoTreeIsOpen />;
};

export default Tree;
