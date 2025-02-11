const treeData = {
  "1": {
    nodes: [
      { data: { id: "root", label: "Root Node" }, position: { x: 300, y: 50 } },
      { data: { id: "child1", label: "Child Node 1" }, position: { x: 200, y: 200 } },
      { data: { id: "child2", label: "Child Node 2" }, position: { x: 400, y: 200 } },
    ],
    edges: [
      { data: { source: "root", target: "child1", label: "Edge to Child 1" } },
      { data: { source: "root", target: "child2", label: "Edge to Child 2" } },
    ],
  },
};

export const getTreeData = (req, res) => {
  const { treeId } = req.params;

  if (treeData[treeId]) {
    res.json(treeData[treeId]);
  } else {
    res.status(404).json({ error: "Tree not found" });
  }
};

export const deleteTree = (req, res) => {
  const { treeId } = req.params;

  if (treeData[treeId]) {
    delete treeData[treeId]; 
    res.json({ message: `Tree ${treeId} has been deleted.` });
  } else {
    res.status(404).json({ error: "Tree not found" });
  }
};
