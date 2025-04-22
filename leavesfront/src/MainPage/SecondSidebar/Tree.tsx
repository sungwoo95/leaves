import { useRef, useEffect, useCallback, useState } from "react";
import axios from "axios";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape, { CollectionReturnValue, EdgeCollection, NodeCollection } from "cytoscape";
import { useTheme } from "@mui/material/styles";
import { path } from "../../../config/config";
import { useMainPageContext } from "../MainPageManager";
import { Edge, Node, WsMessageType } from "../../types";
import NoTreeIsOpen from "./NoTreeIsOpen";
import contextMenus from "cytoscape-context-menus";
import "cytoscape-context-menus/cytoscape-context-menus.css";
import { forceSimulation, forceManyBody, forceCollide, Simulation, forceLink } from "d3-force";

cytoscape.use(contextMenus); // 플러그인 활성화

const NodeOffset = { x: 50, y: 50 };

let isSimulationActivated: Simulation<any, any> | null = null;

const changeNodePosition = (newNode: any, fromNode: CollectionReturnValue) => {
  const pos = fromNode.position();
  const randomXOffset = Math.random() * 5;
  newNode.position = {
    x: pos.x + randomXOffset,
    y: pos.y + NodeOffset.y,
  };
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
  const cyRef = useRef<cytoscape.Core | undefined>(undefined);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const prevTreeId = useRef<string | null>(null);
  const theme = useTheme();
  const [treeDataFlag, setTreeDataFlag] = useState<boolean>(false);
  const wsMessageHandler: Record<string, (data: any, cy: cytoscape.Core) => void> = {
    [WsMessageType.UPDATE_TREE_LABEL]: (data, cy: cytoscape.Core) => {
      const targetId = data.leafId;
      const newTitle = data.title;
      const targetNode = cy.getElementById(targetId);
      if (targetNode) {
        targetNode.data("label", newTitle);
      }
    },
    [WsMessageType.UPDATE_TREE_ADD_CHILD_LEAF]: (data, cy: cytoscape.Core) => {
      const { fromNodeId, newNode, newEdge } = data;
      //newNode의 포지션 설정.
      const fromNode = cy.getElementById(fromNodeId);
      if (!fromNode || fromNode.empty()) return;
      changeNodePosition(newNode, fromNode);
      cy.add(newNode);
      cy.add(newEdge);
      const nodes = cy.nodes();
      const edges = cy.edges();
      applyForceForAddNode(nodes, edges);
    },
    [WsMessageType.UPDATE_TREE_ADD_PARENT_LEAF]: (data, cy: cytoscape.Core) => {
      const { newNode, deleteEdge, newEdgeList } = data;
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
              y: cy.height() / 2 - leafPosition.y * zoom,
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

  const applyForceForAddNode = (nodes: NodeCollection, edges: EdgeCollection) => {
    if (isSimulationActivated) {
      isSimulationActivated.stop();
    }
    const d3Edges = edges.map((edge) => ({
      source: edge.source().id(),
      target: edge.target().id(),
    }));
    const d3Nodes = nodes.map((ele) => ({
      id: ele.id(),
      x: ele.position().x,
      y: ele.position().y,
    }));
    const sim = forceSimulation(d3Nodes)
      .force("charge", forceManyBody().strength(-30)) // 서로 밀어내는 힘
      .force(
        "link",
        forceLink(d3Edges)
          .id((n: any) => n.id)
          .distance(100)
          .strength(0.1)
      ) // 서로 당기는 힘
      .force("collision", forceCollide().radius(30)) // 충돌 방지
      .alpha(0.1) // 초기 에너지 (애니메이션 강도)
      .alphaDecay(0.05) // 서서히 멈추게 하는 감쇠율
      .on("tick", () => {
        d3Nodes.forEach((node) => {
          const ele = cyRef.current!.getElementById(node.id);
          if (ele) {
            ele.position({
              x: node.x ?? 0,
              y: node.y ?? 0,
            });
          }
        });
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

  const applyForceForFirstLayout = (nodes: NodeCollection, edges: EdgeCollection) => {
    if (isSimulationActivated) {
      isSimulationActivated.stop();
    }
    const d3Edges = edges.map((edge) => ({
      source: edge.source().id(),
      target: edge.target().id(),
    }));
    const d3Nodes = nodes.map((ele) => ({
      id: ele.id(),
      x: ele.position().x,
      y: ele.position().y,
    }));
    const sim = forceSimulation(d3Nodes)
      .force("charge", forceManyBody().strength(-30)) // 서로 밀어내는 힘
      .force(
        "link",
        forceLink(d3Edges)
          .id((n: any) => n.id)
          .distance(100)
          .strength(1)
      ) // 서로 당기는 힘
      .force("collision", forceCollide().radius(30)) // 충돌 방지
      .alpha(0.1) // 초기 에너지 (애니메이션 강도)
      .alphaDecay(0.05) // 서서히 멈추게 하는 감쇠율
      .on("tick", () => {
        d3Nodes.forEach((node) => {
          const ele = cyRef.current!.getElementById(node.id);
          if (ele) {
            ele.position({
              x: node.x ?? 0,
              y: node.y ?? 0,
            });
          }
        });
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

  //노드 데이터 설정하기.
  useEffect(() => {
    const getTreeData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${path}/tree/${treeId}`);
        const treeData = response.data;
        if (treeData) {
          const { nodes, edges } = treeData;
          // const layoutedNodes = await getLayoutedNodes(nodes, edges);
          setNodes(nodes);
          setEdges(edges);
          setTreeDataFlag((prev) => !prev);
        }
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

  //tree그룹(websocket)에 참가하기.
  useEffect(() => {
    const joinTreeGroup = () => {
      if (ws && treeId) {
        ws.send(JSON.stringify({ type: WsMessageType.JOIN_TREE, data: { treeId, prevTreeId: prevTreeId.current } }));
        prevTreeId.current = treeId;
      }
    };
    const handleMessage = (event: MessageEvent) => {
      const cy = cyRef.current;
      if (!cy) return;
      const message = JSON.parse(event.data);
      const { type, data } = message;
      if (data.treeId !== treeId) return;
      if (wsMessageHandler[type]) {
        wsMessageHandler[type](data, cy);
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

  //노드 정렬.
  useEffect(() => {
    focusCurrentNode();
  }, [leafId, focusCurrentNode]);

  //그래프 정렬.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.layout({
      name: "breadthfirst",
      directed: true,
      spacingFactor: 1,
      nodeDimensionsIncludeLabels: true,
    }).run();
    const nodes = cy.nodes();
    const edges = cy.edges();
    if (nodes.length > 0) {
      applyForceForFirstLayout(nodes, edges);
    }
  }, [treeDataFlag]);

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
