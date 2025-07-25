import { useRef, useEffect, useCallback, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape, {
  CollectionReturnValue,
  EdgeCollection,
  NodeCollection,
} from 'cytoscape';
import { useTheme } from '@mui/material/styles';
import { useMainPageContext } from '../MainPageManager';
import {
  DeleteCase,
  DeleteLeafData,
  Edge,
  IsConquer,
  Node,
  WsMessageType,
} from '../../types';
import NoTreeIsOpen from './NoTreeIsOpen';
import contextMenus from 'cytoscape-context-menus';
import 'cytoscape-context-menus/cytoscape-context-menus.css';
import {
  forceSimulation,
  forceManyBody,
  forceCollide,
  Simulation,
  forceLink,
} from 'd3-force';
import axiosInstance from '../../axiosInstance';
import LoadingSpinner from '../LoadingSpinner';

cytoscape.use(contextMenus); // 플러그인 활성화

const NodeOffset = { x: 50, y: 50 };

let isSimulationActivated: Simulation<any, any> | null = null;

const setChildNodePosition = (
  newNode: any,
  fromNode: CollectionReturnValue
) => {
  const pos = fromNode.position();
  const randomXOffset = Math.random() * 5;
  newNode.position = {
    x: pos.x + randomXOffset,
    y: pos.y + NodeOffset.y,
  };
};

const setParentNodePosition = (
  newNode: any,
  fromNode: CollectionReturnValue
) => {
  const pos = fromNode.position();
  newNode.position = {
    x: pos.x,
    y: pos.y - NodeOffset.y,
  };
};

const Tree: React.FC = () => {
  const mainPageContext = useMainPageContext();
  try {
    if (!mainPageContext) {
      //mainPageContext.Provider의 하위 컴포넌트가 아닐 경우
      throw new Error('//mainPageContext.Provider의 하위 컴포넌트가 아님');
    }
  } catch (err) {
    console.error((err as Error).message);
    return <p>오류가 발생했습니다.</p>;
  }
  const {
    ws,
    treeId,
    leafId,
    setLeafId,
    isPublicTree,
    setIsPublicLeaf,
    owningTreeId,
    isReady,
    setTreeForestId,
    setTreeId,
  } = mainPageContext;
  const cyRef = useRef<cytoscape.Core | undefined>(undefined);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const prevTreeId = useRef<string | null>(null);
  const theme = useTheme();
  const [treeDataFlag, setTreeDataFlag] = useState<boolean>(false);
  const wsMessageHandler: Record<
    string,
    (data: any, cy: cytoscape.Core) => void
  > = {
    [WsMessageType.UPDATE_TREE_LABEL]: (data, cy: cytoscape.Core) => {
      const targetId = data.leafId;
      const newTitle = data.title;
      const targetNode = cy.getElementById(targetId);
      if (targetNode) {
        targetNode.data('label', newTitle);
      }
    },
    [WsMessageType.UPDATE_TREE_ADD_CHILD_LEAF]: (data, cy: cytoscape.Core) => {
      const { fromNodeId, newNode, newEdge } = data;
      //newNode의 포지션 설정.
      const fromNode = cy.getElementById(fromNodeId);
      if (!fromNode || fromNode.empty()) return;
      setChildNodePosition(newNode, fromNode);
      cy.batch(() => {
        cy.add(newNode);
        cy.add(newEdge);
      });
      applyForceForAddNode();
    },
    [WsMessageType.UPDATE_TREE_ADD_PARENT_LEAF]: (data, cy: cytoscape.Core) => {
      const { fromNodeId, newNode, deleteEdge, newEdgeList } = data;
      const fromNode = cy.getElementById(fromNodeId);
      setParentNodePosition(newNode, fromNode);
      cy.batch(() => {
        cy.add(newNode);
        if (deleteEdge) {
          const { source, target } = deleteEdge.data;
          const targetEdges = cy.edges(
            `[source="${source}"][target="${target}"]`
          );
          targetEdges.remove();
        }
        newEdgeList.forEach((elem: any) => {
          cy.add(elem);
        });
      });
      applyForceForAddNode();
    },
    [WsMessageType.UPDATE_TREE_CONQUER]: (data, cy: cytoscape.Core) => {
      const { targetNodeId, newIsConquer } = data;
      const targetNode = cy.getElementById(targetNodeId);
      targetNode.data('isConquer', newIsConquer);
    },
    [WsMessageType.UPDATE_TREE_DELETE_LEAF]: (data) => {
      const { leafId } = data;
      deleteNode(leafId);
    },
  };

  const prevLeafId = useRef<string | null>(null);

  //leafId로 중앙 정렬.
  const focusCurrentNode = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;

    // 1. 이전에 강조된 노드가 있다면 스타일을 원래대로 되돌립니다.
    if (prevLeafId.current && prevLeafId.current !== leafId) {
      const prevNode = cy.getElementById(prevLeafId.current);
      if (prevNode.length > 0) {
        prevNode.style({ width: '5px', height: '5px' });
      }
    }

    // 2. 현재 leafId에 해당하는 노드를 찾아 강조하고 중앙으로 이동합니다.
    if (leafId) {
      const leafNode = cy.getElementById(leafId);

      if (leafNode.length > 0 && leafNode.isNode()) {
        // 중앙 이동 애니메이션
        const leafPosition = leafNode.position();
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
            easing: 'ease-in-out',
          }
        );

        // 개별 노드에 직접 스타일을 적용하여 리렌더링 후에도 유지되도록 합니다.
        leafNode.style({
          width: '10px',
          height: '10px',
        });
      }
    }

    // 3. 현재 leafId를 "이전 ID"로 저장하여 다음 변경 시 사용합니다.
    prevLeafId.current = leafId;
  }, [leafId]);

  const handleLeafClick = (event: cytoscape.EventObject) => {
    const leafId = event.target.id();
    setLeafId(leafId);
    setIsPublicLeaf(isPublicTree);
  };

  const handleConquerClick = (event: cytoscape.EventObject) => {
    const leafId = event.target.id();
    const isConquer = event.target.data('isConquer');
    ws?.send(
      JSON.stringify({
        type: WsMessageType.UPDATE_TREE_CONQUER,
        data: { treeId, leafId, isConquer },
      })
    );
  };

  const handleDeleteClick = (event: cytoscape.EventObject) => {
    const nodeId = event.target.id();
    postDeleteNode(nodeId);
    deleteNode(nodeId);
  };

  const applyForceForAddNode = () => {
    const cy = cyRef.current;
    if (!cy) return;
    const nodes = cy.nodes();
    const edges = cy.edges();
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
      .force('charge', forceManyBody().strength(-30)) // 서로 밀어내는 힘
      .force(
        'link',
        forceLink(d3Edges)
          .id((n: any) => n.id)
          .distance(100)
          .strength(0.1)
      ) // 서로 당기는 힘
      .force('collision', forceCollide().radius(30)) // 충돌 방지
      .alpha(0.1) // 초기 에너지 (애니메이션 강도)
      .alphaDecay(0.05) // 서서히 멈추게 하는 감쇠율
      .on('tick', () => {
        cy.batch(() => {
          d3Nodes.forEach((node) => {
            const ele = cy.getElementById(node.id);
            if (ele) {
              ele.position({
                x: node.x ?? 0,
                y: node.y ?? 0,
              });
            }
          });
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

  const applyForceForFirstLayout = (
    nodes: NodeCollection,
    edges: EdgeCollection
  ) => {
    const cy = cyRef.current;
    if (!cy) return;

    // d3-force는 반복적으로 실행되지만, tick마다 화면을 업데이트하는 대신
    // 모든 계산이 끝난 후 최종 위치만 한 번에 적용하여 '즉시' 완료되는 것처럼 만듭니다.
    const d3Edges = edges.map((edge) => ({
      source: edge.source().id(),
      target: edge.target().id(),
    }));
    const d3Nodes = nodes.map((ele) => ({
      id: ele.id(),
      x: ele.position().x,
      y: ele.position().y,
    }));

    const simulation = forceSimulation(d3Nodes)
      .force('charge', forceManyBody().strength(-30))
      .force(
        'link',
        forceLink(d3Edges)
          .id((n: any) => n.id)
          .distance(100)
          .strength(1)
      )
      .force('collision', forceCollide().radius(30))
      .alpha(0.1)
      .alphaDecay(0.05)
      .stop(); // 자동 실행 중지

    // 시뮬레이션을 수동으로 실행하여 최종 레이아웃을 계산합니다.
    // alpha가 최소값에 도달할 때까지의 반복 횟수만큼 실행합니다.
    const numIterations = Math.ceil(
      Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())
    );
    for (let i = 0; i < numIterations; ++i) {
      simulation.tick();
    }

    // 계산된 최종 위치를 Cytoscape 노드에 한 번에 적용합니다.
    cy.batch(() => {
      d3Nodes.forEach((node) => {
        const ele = cy.getElementById(node.id);
        if (ele) {
          ele.position({
            x: node.x ?? 0,
            y: node.y ?? 0,
          });
        }
      });
    });
  };

  const applyForceForDeleteNode = () => {
    const cy = cyRef.current;
    if (!cy) return;
    const nodes = cy.nodes();
    const edges = cy.edges();
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
      .force('charge', forceManyBody().strength(-30)) // 서로 밀어내는 힘
      .force(
        'link',
        forceLink(d3Edges)
          .id((n: any) => n.id)
          .distance(100)
          .strength(1)
      ) // 서로 당기는 힘
      .force('collision', forceCollide().radius(30)) // 충돌 방지
      .alpha(0.1) // 초기 에너지 (애니메이션 강도)
      .alphaDecay(0.05) // 서서히 멈추게 하는 감쇠율
      .on('tick', () => {
        cy.batch(() => {
          d3Nodes.forEach((node) => {
            const ele = cy.getElementById(node.id);
            if (ele) {
              ele.position({
                x: node.x ?? 0,
                y: node.y ?? 0,
              });
            }
          });
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

  const joinGroup = (retry: number) => {
    if (ws && treeId && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: WsMessageType.JOIN_GROUP,
          data: { groupId: treeId, prevGroupId: prevTreeId.current },
        })
      );
      prevTreeId.current = treeId;
    } else if (retry < 100) {
      setTimeout(() => {
        joinGroup(retry + 1);
      }, 100);
    } else {
      console.error('[Tree][joinGroup]WebSocket not open after retries');
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
      ws.addEventListener('message', handleMessage);
    }
  };

  const getTreeData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/tree/${treeId}`);
      const treeData = response.data;
      if (treeData) {
        const { nodes, edges, forestId } = treeData;
        console.log('[Tree]forestId:', forestId);
        setNodes(nodes);
        setEdges(edges);
        setTreeForestId(forestId);
        setTreeDataFlag((prev) => !prev);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('[Tree][getTreeData] Tree not found, clearing treeId.');
        setTreeId(null);
      } else {
        console.log('[Tree][getTreeData] Error fetching tree data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const leaveGroup = (groupId: string) => {
    if (ws) {
      ws.send(
        JSON.stringify({ type: WsMessageType.LEAVE_GROUP, data: { groupId } })
      );
    }
  };

  const deleteNode = (nodeId: string) => {
    const cy = cyRef.current;
    if (!cy) return;
    const node = cy.getElementById(nodeId);
    if (!node.length) return;

    const parentEdges = node.incomers('edge'); // 부모로부터 오는 edge
    const childEdges = node.outgoers('edge'); // 자식으로 가는 edge

    const parentLeafId = parentEdges.length
      ? parentEdges[0].source().id()
      : null;

    if (parentLeafId) {
      cy.batch(() => {
        childEdges.forEach((edge) => {
          const childId = edge.target().id();
          cy.add({
            data: {
              source: parentLeafId,
              target: childId,
            },
          });
        });
        node.remove();
      });
    } else {
      if (childEdges.length === 1) {
        node.remove();
      } else {
        node.data({
          label: 'Empty Leaf',
          isConquer: IsConquer.FALSE,
        });
      }
    }
    applyForceForDeleteNode();
  };

  const postDeleteNode = (nodeId: string) => {
    const cy = cyRef.current;
    if (!cy || !ws || ws.readyState !== WebSocket.OPEN || !treeId) return;
    const node = cy.getElementById(nodeId);
    if (!node || node.empty()) return;

    const parentNodes = node.incomers('node');
    const parentNodeId = parentNodes.length ? parentNodes[0].id() : null;
    const childNodes = node.outgoers('node');
    const childNodeIdList = node.outgoers('node').map((n) => n.id());

    let deleteCase: DeleteCase;
    const addEdgeList: Edge[] = [];
    const deleteEdgeList: Edge[] = [];

    if (parentNodeId) {
      // case1: 상위 노드 있음
      deleteCase = DeleteCase.HAS_PARENT;
      //삭제할 엣지에 상위노드-타깃노드 엣지 추가.
      deleteEdgeList.push({ data: { source: parentNodeId, target: nodeId } });
      //삭제할 엣지에 타깃노드-하위노드 엣지 추가.
      childNodes.forEach((e) => {
        deleteEdgeList.push({ data: { source: nodeId, target: e.id() } });
      });
      //추가할 엣지에 상위노드-하위노드 엣지 추가.
      childNodes.forEach((e) => {
        addEdgeList.push({ data: { source: parentNodeId, target: e.id() } });
      });
    } else {
      if (childNodes.length === 1) {
        // case2: 상위 노드 없음 + 하위 노드 1개
        deleteCase = DeleteCase.ROOT_WITH_SINGLE_CHILD;
        //삭제할 엣지에 타깃노드-하위노드 엣지 추가.
        deleteEdgeList.push({
          data: { source: nodeId, target: childNodes[0].id() },
        });
      } else {
        // case3: 상위 노드 없음 + 하위 노드 0개 또는 2개 이상
        deleteCase = DeleteCase.CHANGE_TO_EMPTY_LEAF;
      }
    }
    const data: DeleteLeafData = {
      treeId,
      leafId: nodeId,
      deleteCase,
      addEdgeList,
      deleteEdgeList,
      parentLeafId: parentNodeId,
      childLeafIdList: childNodeIdList,
    };
    ws.send(
      JSON.stringify({
        type: WsMessageType.DELETE_LEAF,
        data,
      })
    );
  };

  //노드 데이터 설정하기.
  useEffect(() => {
    if (treeId) {
      getTreeData();
    }
  }, [treeId]);

  //tree그룹(websocket)에 참가하기.
  useEffect(() => {
    if (treeId) {
      joinGroup(0);
      addWsEventListener();
    }
    //treeId가 string->null로 변경 시
    if (prevTreeId.current && !treeId) {
      leaveGroup(prevTreeId.current);
      prevTreeId.current = null;
    }
    return () => {
      ws?.removeEventListener('message', handleMessage);
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

    // 1. 초기 위치를 breadthfirst로 빠르게 설정합니다.
    cy.layout({
      name: 'breadthfirst',
      directed: true,
      spacingFactor: 1,
      nodeDimensionsIncludeLabels: true,
    }).run();

    // 2. 동기화된 force-directed 레이아웃으로 위치를 미세 조정합니다.
    const nodes = cy.nodes();
    const edges = cy.edges();
    if (nodes.length > 0) {
      applyForceForFirstLayout(nodes, edges);
    }
    // 3. 레이아웃이 안정된 후, 포커스를 맞춥니다.
    cy.fit();
    if (treeId === owningTreeId) {
      focusCurrentNode();
    }
  }, [treeDataFlag]);

  if (!isReady || loading) {
    return <LoadingSpinner />;
  }

  if (!treeId) {
    return <NoTreeIsOpen />;
  }

  if (treeId) {
    return (
      <CytoscapeComponent
        cy={(cy) => {
          cyRef.current = cy;
          cy.on('tap', 'node', handleLeafClick);
          //우클릭 메뉴 추가.
          cy.contextMenus({
            menuItems: [
              {
                id: 'conquer',
                content: 'Conquer',
                selector: 'node',
                onClickFunction: handleConquerClick,
              },
              {
                id: 'delete',
                content: 'Delete',
                selector: 'node',
                onClickFunction: handleDeleteClick,
              },
            ],
          });
        }}
        elements={CytoscapeComponent.normalizeElements({ nodes, edges })}
        style={{ width: '100%', height: '100%' }}
        stylesheet={[
          {
            selector: 'node',
            style: {
              'background-color': 'rgb(48, 154, 48)',
              label: 'data(label)',
              width: '5px',
              height: '5px',
              color: theme.palette.mode === 'dark' ? 'white' : 'black',
              'text-margin-y': -2, // 여백
              'font-size': '10px',
            },
          },
          {
            selector: "node[isConquer='true']", //isConquer가 true인 노드는 다음 style이 overwright.
            style: {
              'background-color': 'rgb(213, 71, 71)',
            },
          },
          {
            selector: 'edge',
            style: {
              width: 1,
              'line-color': 'rgb(200, 208, 200)',
            },
          },
        ]}
      />
    );
  }
};

export default Tree;
