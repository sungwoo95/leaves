import React, { useRef, useEffect, useCallback, useState } from "react";
import axios from "axios"
import CytoscapeComponent from "react-cytoscapejs";
import { useSpaceContext } from "./Space";

export default function Tree() {
  const { treeId, leafId, setLeafId } = useSpaceContext();
  const cyRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const path = window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "https://api.mywebsite.com";

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
              x: (cy.width() / 2 - leafPosition.x * zoom),
              y: (cy.width() / 2 - leafPosition.y * zoom),
            }
          },
          {
            duration: 600,
            easing: "ease-in-out"
          }
        )

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

  const handleLeafClick = (event) => {
    console.log("handleLeafClick 호출");
    const leafId = event.target.id();
    setLeafId(leafId);
  }

  //tree데이터 가져오기.
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`fetchData called, treeID:${treeId}`);
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
  }, [path, treeId]);

  //노드 정렬.
  useEffect(() => {
    focusCurrentNode();
  }, [leafId, focusCurrentNode]);

  if (loading) {
    return <p>Loading tree data...</p>;
  }

  return (
    <CytoscapeComponent
      cy={(cy) => {
        cyRef.current = cy;
        cy.on("tap", "node", handleLeafClick);
      }}
      elements={CytoscapeComponent.normalizeElements({ nodes, edges })}
      style={{ width: "100%", height: "100%" }}
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
