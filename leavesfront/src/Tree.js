import React, { useRef, useEffect, useCallback } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { useAppContext } from "./Space";

export default function Tree() {
  const { searchDirectory, setSearchDirectory,
    setCurrentNodeDirectory,
    currentNodeTreeId, setCurrentNodeTreeId,
    currentNodeId, setCurrentNodeId } = useAppContext();
  const cyRef = useRef(null);

  // 노드 데이터
  const nodes = [
    { data: { id: "root", label: "Root Node" }, position: { x: 300, y: 50 } },
    { data: { id: "child1", label: "Child Node 1" }, position: { x: 200, y: 200 } },
    { data: { id: "child2", label: "Child Node 2" }, position: { x: 400, y: 200 } },
  ];

  // 엣지 데이터
  const edges = [
    { data: { source: "root", target: "child1", label: "Edge to Child 1" } },
    { data: { source: "root", target: "child2", label: "Edge to Child 2" } },
  ];

  const focusCurrentNode = useCallback(() => {
    if (cyRef.current && currentNodeId) {
      const cy = cyRef.current;
      const node = cy.getElementById(currentNodeId);

      if (node && node.isNode()) {
        cy.center(node);

        // 강조 스타일 적용
        cy.style()
          .selector(`node[id = "${currentNodeId}"]`)
          .style({
            width: "50px",
            height: "50px",
            "background-color": "blue",
          })
          .update();
      }
    }
  }, [currentNodeId]);

  const handleNodeClick = useCallback(
    (event) => {
      const nodeId = event.target.id();
      setCurrentNodeId(nodeId);
    },
    [setCurrentNodeId]
  );

  // Cytoscape 이벤트 리스너 설정
  useEffect(() => {
    if (cyRef.current) {
      const cy = cyRef.current;
      cy.on("tap", "node", handleNodeClick);

      // 컴포넌트 언마운트 시 이벤트 리스너 정리
      return () => {
        cy.off("tap", "node", handleNodeClick);
      };
    }
  }, [handleNodeClick]);

  // 마운트, currentNodeId 변경 시 노드 정렬.
  useEffect(() => {
    focusCurrentNode();
  }, [currentNodeId, focusCurrentNode]);

  return (
    <CytoscapeComponent
      cy={(cy) => {
        cyRef.current = cy; // Cytoscape 인스턴스 참조 저장
      }}
      elements={CytoscapeComponent.normalizeElements({ nodes, edges })}
      style={{ width: "600px", height: "600px" }}
      layout={{ name: "preset" }}
      stylesheet={[
        {
          selector: "node",
          style: {
            "background-color": "green",
            "label": "data(label)",
            width: "30px",
            height: "30px",
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
}
