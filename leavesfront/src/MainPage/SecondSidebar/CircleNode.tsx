import { Handle, NodeProps, Position } from "@xyflow/react";
import { CustomNode, IsConquer } from "../../types";
const CircleNode = (node: NodeProps<CustomNode>) => {
  return (
    <div style={{ position: "relative", width: 30, height: 30 }}>
      {/* 라벨 */}
      <div
        style={{
          position: "absolute",
          top: -24,
          left: "50%",
          transform: "translateX(-50%)",
          fontWeight: "bold",
        }}>
        {node.data.label}
      </div>

      {/* 원 */}
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: node.data.isConquer===IsConquer.FALSE?"green":"red"
        }}>
        {/* 핸들 (예: 연결점) */}
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
      </div>
    </div>
  );
};
export default CircleNode;
