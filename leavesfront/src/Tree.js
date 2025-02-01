import React from "react";
import CytoscapeComponent from "react-cytoscapejs";

export default function Tree() {
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

  return (
    <CytoscapeComponent
      elements={CytoscapeComponent.normalizeElements({ nodes, edges })} // 노드와 엣지를 분리해 병합
      style={{ width: "600px", height: "600px" }} // Cytoscape 캔버스 크기
      layout={{ name: "preset" }} // 노드 위치 고정
      stylesheet={[
        {
          selector: "node", // 모든 노드에 적용
          style: {
            "background-color": "green", // 노드 배경색
            "label": "data(label)", // 노드에 라벨 표시
          },
        },
        {
          selector: "edge", // 모든 엣지에 적용
          style: {
            "width": 2, // 엣지 두께
            "line-color": "#ccc", // 엣지 선 색상
          },
        },
      ]}
    />
  );
}
