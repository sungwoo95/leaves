import React, { useRef, useEffect, useCallback, useState } from "react";
import axios from "axios"
import CytoscapeComponent from "react-cytoscapejs";
import { useSpaceContext } from "./Space";

export default function Tree() {
  const { treeId,leafId,setLeafId } = useSpaceContext();
  const cyRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const path = window.location.hostname === "localhost"
    ? "http://localhost:3001"  
    : "https://api.mywebsite.com"; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${path}/api/trees/${treeId}`);

        setNodes(response.data.nodes);
        setEdges(response.data.edges);
      } catch (error) {
        console.error("Error fetching tree data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (treeId) {
      fetchData();
    }
  }, [treeId]); 

  const focusCurrentNode = useCallback(() => {
    if (cyRef.current && leafId) {
      const cy = cyRef.current;
      const node = cy.getElementById(leafId);

      if (node && node.isNode()) {
        cy.center(node);

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

  const handleNodeClick = useCallback(
    (event) => {
      const nodeId = event.target.id();
      setLeafId(nodeId);
    },
    [setLeafId]
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

  // 마운트, leafId 변경 시 노드 정렬.
  useEffect(() => {
    focusCurrentNode();
  }, [leafId, focusCurrentNode]);

  if (loading) {
    return <p>Loading tree data...</p>;
  }
  
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
