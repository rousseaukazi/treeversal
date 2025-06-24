export interface TreeNode {
  id: string;
  depth: number;
  title: string;
  description: string;
  worldUpdate: string;
  timelineDate: string;
  branchType: "optimistic" | "moderate" | "pessimistic";
  children?: string[];
  parentId?: string;
}

export interface WorldState {
  description: string;
  currentDate: string;
  keyEvents: string[];
  keyPlayers: string[];
  contextualFactors: string[];
}

export interface TreeData {
  id: string;
  scenario: string;
  worldState: WorldState;
  timeHorizonMonths: number;
  nodes: Record<string, TreeNode>;
  rootNodeId: string;
  metadata: any;
}

export async function loadTreeData(): Promise<TreeData> {
  const response = await fetch("/example.json");
  if (!response.ok) {
    throw new Error(`Failed to load tree data: ${response.statusText}`);
  }
  return await response.json();
}

export function getNodeChoices(treeData: TreeData, nodeId: string): TreeNode[] {
  const node = treeData.nodes[nodeId];
  if (!node?.children) return [];

  return node.children
    .map((childId) => treeData.nodes[childId])
    .filter(Boolean);
}

export function getNodeById(
  treeData: TreeData,
  nodeId: string
): TreeNode | null {
  return treeData.nodes[nodeId] || null;
}

export function getPathFromRoot(
  treeData: TreeData,
  targetNodeId: string
): string[] {
  const path: string[] = [];
  let currentNodeId = targetNodeId;

  while (currentNodeId && currentNodeId !== treeData.rootNodeId) {
    path.unshift(currentNodeId);
    const node = treeData.nodes[currentNodeId];
    currentNodeId = node?.parentId || "";
  }

  return path;
}
