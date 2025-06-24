"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  TreeData,
  TreeNode,
  loadTreeData,
  getNodeById,
} from "../../../lib/treeData";
import ReactMarkdown from "react-markdown";

interface ShareState {
  visitedPath: string[];
  treeData: TreeData | null;
  showModal: boolean;
  animationStep: number;
  isAnimating: boolean;
  loading: boolean;
  error: string | null;
}

// Branch-based color system
const BRANCH_COLORS = {
  optimistic: {
    bg: "bg-blue-100",
    border: "border-blue-300",
    accent: "text-blue-800",
    text: "text-blue-900",
    neon: "#3b82f6",
  },
  moderate: {
    bg: "bg-purple-100",
    border: "border-purple-300",
    accent: "text-purple-800",
    text: "text-purple-900",
    neon: "#8b5cf6",
  },
  pessimistic: {
    bg: "bg-red-100",
    border: "border-red-300",
    accent: "text-red-800",
    text: "text-red-900",
    neon: "#ef4444",
  },
} as const;

// Animation configuration
const ANIMATION_CONFIG = {
  drawBranches: 150,
  pauseToSee: 100,
  drawChoice: 200,
  moveToNext: 50,
};

export default function SharePage() {
  const params = useParams();
  const [state, setState] = useState<ShareState>({
    visitedPath: [],
    treeData: null,
    showModal: false,
    animationStep: 0,
    isAnimating: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function loadData() {
      try {
        // Load tree data first
        const treeDataResponse = await loadTreeData();
        setState((prev) => ({ ...prev, treeData: treeDataResponse }));

        if (params.id) {
          console.log("Share page - Raw params.id:", params.id);

          // Convert URL-safe base64 back to regular base64
          let base64Data = (params.id as string)
            .replace(/-/g, "+")
            .replace(/_/g, "/");

          // Add padding if needed
          const padding = base64Data.length % 4;
          if (padding) {
            base64Data += "=".repeat(4 - padding);
          }

          console.log("Share page - Processed base64:", base64Data);

          const decodedData = atob(base64Data);
          console.log("Share page - Decoded string:", decodedData);

          const pathData = JSON.parse(decodedData) as string[];
          console.log("Share page - Parsed visited path:", pathData);

          setState((prev) => ({
            ...prev,
            visitedPath: pathData,
            isAnimating: true,
            animationStep: 0,
          }));
        }
        setState((prev) => ({ ...prev, loading: false }));
      } catch (err) {
        console.error("Share page error:", err);
        setState((prev) => ({
          ...prev,
          error: "Invalid share link or failed to load tree data",
          loading: false,
        }));
      }
    }

    loadData();
  }, [params.id]);

  // Animation controller
  useEffect(() => {
    if (!state.isAnimating || state.visitedPath.length === 0) return;

    const totalLevels = state.visitedPath.length;
    const totalSteps = totalLevels * 4;

    if (state.animationStep >= totalSteps) {
      setState((prev) => ({ ...prev, isAnimating: false }));
      return;
    }

    let delay = 0;
    const currentPhase = state.animationStep % 4;
    switch (currentPhase) {
      case 0:
        delay = ANIMATION_CONFIG.drawBranches;
        break;
      case 1:
        delay = ANIMATION_CONFIG.pauseToSee;
        break;
      case 2:
        delay = ANIMATION_CONFIG.drawChoice;
        break;
      case 3:
        delay = ANIMATION_CONFIG.moveToNext;
        break;
    }

    const timer = setTimeout(() => {
      setState((prev) => ({ ...prev, animationStep: prev.animationStep + 1 }));
    }, delay);

    return () => clearTimeout(timer);
  }, [state.animationStep, state.isAnimating, state.visitedPath.length]);

  // Get the branch-based color for a specific choice in the treeversal
  const getChoiceColors = (choiceIndex: number) => {
    if (!state.treeData || choiceIndex >= state.visitedPath.length) {
      return BRANCH_COLORS.moderate; // fallback
    }

    const nodeId = state.visitedPath[choiceIndex];
    const node = getNodeById(state.treeData, nodeId);
    const branchType = node?.branchType || "moderate";
    return BRANCH_COLORS[branchType as keyof typeof BRANCH_COLORS];
  };

  // Create gradient for tree lines between choices using neon colors
  const getGradientColors = (fromIndex: number, toIndex: number) => {
    const fromColor =
      fromIndex === -1 ? "#a855f7" : getChoiceColors(fromIndex).neon;
    const toColor = getChoiceColors(toIndex).neon;
    const isSameColor = fromColor === toColor;
    return { fromColor, toColor, isSameColor };
  };

  // Get the numeric path representation
  const getNumericPath = () => {
    if (state.visitedPath.length === 0) return "No journey to display";

    return state.visitedPath
      .map((nodeId, index) => {
        const node = getNodeById(state.treeData!, nodeId);
        // Map branch types to numbers: optimistic=1, moderate=2, pessimistic=3
        const branchNumbers: Record<string, number> = {
          optimistic: 1,
          moderate: 2,
          pessimistic: 3,
        };
        return branchNumbers[node?.branchType || "moderate"];
      })
      .join(" → ");
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading shared treeversal...</div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">
            Failed to load share data
          </div>
          <div className="text-white text-sm">{state.error}</div>
        </div>
      </div>
    );
  }

  if (!state.treeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">No tree data available</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Left Side - Journey Display */}
      <div className="w-[45%] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-2xl"></div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="relative z-10 w-full max-w-3xl">
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl p-8 text-left">
              <div className="flex justify-start mb-4">
                <div className="text-xs bg-white/20 rounded px-3 py-2 font-bold uppercase tracking-wide text-white/90">
                  Shared Journey
                </div>
              </div>
              <div className="text-white/90">
                <div className="text-lg leading-relaxed prose prose-invert max-w-none mb-4">
                  <ReactMarkdown>
                    {state.treeData?.worldState.description || "Loading..."}
                  </ReactMarkdown>
                </div>
                <div className="text-sm text-white/70">
                  <strong>Date:</strong>{" "}
                  {state.treeData?.worldState.currentDate}
                </div>

                {/* Key Players Tags */}
                {state.treeData?.worldState.keyPlayers &&
                  state.treeData.worldState.keyPlayers.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs text-white/60 mb-2 font-medium">
                        Key Players:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {state.treeData.worldState.keyPlayers.map(
                          (player, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-white/20 text-white/80 text-xs rounded-full border border-white/30"
                            >
                              {player}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Left Side Footer */}
        <div className="relative z-10 bg-black/20 backdrop-blur-sm border-t border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-200 mb-2">
                PreCog: {state.treeData?.scenario || "Loading..."}
              </p>
              <p className="text-lg font-mono font-bold text-white tracking-wider">
                {getNumericPath()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setState((prev) => ({ ...prev, showModal: true }))
                }
                className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 backdrop-blur-sm"
              >
                View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Path Details */}
      <div className="w-[55%] bg-gradient-to-br from-orange-50/50 via-amber-50/50 to-yellow-50/50 flex flex-col relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/15 via-amber-50/10 to-yellow-50/20"></div>

        <div className="relative z-10 text-center pt-8 pb-6 px-8">
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">
            Shared Treecognition Journey
          </h2>
          <p className="text-base text-gray-600">
            Exploring: {state.treeData?.scenario || "Loading..."}
          </p>
        </div>

        <div className="relative z-20 flex-1 overflow-y-auto px-12 py-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            {state.visitedPath.map((nodeId, index) => {
              const node = getNodeById(state.treeData!, nodeId);
              if (!node) return null;

              const colors = getChoiceColors(index);

              return (
                <div key={index} className="relative">
                  <div
                    className={`${colors.bg} ${colors.border} py-6 px-6 rounded-xl border-2 shadow-lg`}
                  >
                    <div className="flex justify-start mb-3">
                      <div
                        className={`text-sm bg-black/10 rounded px-3 py-2 font-bold uppercase tracking-wide ${colors.accent}`}
                      >
                        {node.branchType}
                      </div>
                    </div>
                    <div className={`leading-relaxed ${colors.text}`}>
                      <span
                        className={`${colors.accent} mr-2 text-lg font-semibold`}
                      >
                        {index + 1}.
                      </span>
                      <div className="font-semibold text-lg mb-2">
                        {node.title}
                      </div>
                      <div className="text-base mb-3">{node.description}</div>
                      <div className="text-sm opacity-75">
                        {node.timelineDate}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal - same as main page but with different data source */}
      {state.showModal && state.treeData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  Shared Treecognition Journey
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {state.treeData.scenario}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const currentUrl = window.location.href;
                    navigator.clipboard.writeText(currentUrl);
                    alert("Share URL copied to clipboard!");
                  }}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Copy Link
                </button>
                <button
                  onClick={() =>
                    setState((prev) => ({ ...prev, showModal: false }))
                  }
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-10 py-6 space-y-8">
              {/* Tree Visualization - same logic as main page */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  Decision Tree
                </h3>
                <div className="bg-gray-50 rounded-lg p-6 min-h-[200px]">
                  <svg
                    width="95%"
                    height="95%"
                    viewBox="0 0 800 400"
                    className="overflow-visible"
                  >
                    <defs>
                      {state.visitedPath.map((_, index) => {
                        const { fromColor, toColor } = getGradientColors(
                          index - 1,
                          index
                        );
                        return (
                          <linearGradient
                            key={`gradient-${index}`}
                            id={`gradient-${index}`}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                          >
                            <stop offset="0%" stopColor={fromColor} />
                            <stop offset="100%" stopColor={toColor} />
                          </linearGradient>
                        );
                      })}
                    </defs>

                    <style>{`
                       .draw-branches {
                         stroke-dasharray: 100;
                         stroke-dashoffset: 100;
                         animation: drawLine ${ANIMATION_CONFIG.drawBranches}ms ease-out forwards;
                       }
                       .draw-choice {
                         stroke-dasharray: 100;
                         stroke-dashoffset: 100;
                         animation: drawLine ${ANIMATION_CONFIG.drawChoice}ms ease-out forwards;
                       }
                       .fade-in-circle {
                         opacity: 0;
                         animation: fadeIn 200ms ease-out forwards;
                       }
                       .fade-in-endpoint {
                         opacity: 0;
                         animation: fadeIn 150ms ease-out forwards;
                       }
                       @keyframes drawLine {
                         to { stroke-dashoffset: 0; }
                       }
                       @keyframes fadeIn {
                         to { opacity: 1; }
                       }
                     `}</style>

                    {(() => {
                      const elements = [];
                      const levels = state.visitedPath.length;

                      const VIEW_WIDTH = 800;
                      const VIEW_HEIGHT = 400;
                      const MARGIN_PERCENT = 0.025; // 2.5% margin each side
                      const NODE_RADIUS = 6;

                      const TREE_START_X =
                        VIEW_WIDTH * MARGIN_PERCENT + NODE_RADIUS; // 20 + r
                      const TREE_END_X =
                        VIEW_WIDTH * (1 - MARGIN_PERCENT) - NODE_RADIUS; // 780 - r
                      const TREE_WIDTH = TREE_END_X - TREE_START_X; // 744

                      // Calculate path length based on available width and number of levels
                      const pathLength =
                        levels > 0 ? TREE_WIDTH / levels : TREE_WIDTH;

                      // Dynamic vertical scaling (accounting for node size)
                      const centerY = VIEW_HEIGHT / 2; // 200px
                      const usableHeight =
                        VIEW_HEIGHT * (1 - 2 * MARGIN_PERCENT) -
                        2 * NODE_RADIUS;
                      const branchSpacing = usableHeight / 2; // 3 branches = 2 gaps

                      // Start point - always at fixed position (bright purple)
                      elements.push(
                        <circle
                          key="start"
                          cx={TREE_START_X}
                          cy={centerY}
                          r={NODE_RADIUS}
                          fill="#a855f7"
                        />
                      );

                      let currentX = TREE_START_X;
                      let currentY = centerY;

                      // For each level in the treeversal
                      for (let level = 0; level < levels; level++) {
                        const nextX = currentX + pathLength;
                        const nodeId = state.visitedPath[level];
                        const node = getNodeById(state.treeData, nodeId);

                        // Map branch types to positions (optimistic=1, moderate=2, pessimistic=3)
                        const branchPositions: Record<string, number> = {
                          optimistic: 1,
                          moderate: 2,
                          pessimistic: 3,
                        };
                        const chosenBranch =
                          branchPositions[node?.branchType || "moderate"];

                        // Calculate which animation phase we're in for this level
                        const levelStartStep = level * 4; // 4 steps per level
                        const currentPhase = state.isAnimating
                          ? Math.max(0, state.animationStep - levelStartStep)
                          : 99; // If not animating, show final state

                        const chosenBranchY =
                          centerY + (chosenBranch - 2) * branchSpacing;
                        const { fromColor, toColor, isSameColor } =
                          getGradientColors(level - 1, level);

                        // Show this level if animation has started (phase 1+) or not animating
                        if (currentPhase >= 1) {
                          // 1. Gray branches to unchosen paths only
                          for (let branch = 1; branch <= 3; branch++) {
                            if (branch !== chosenBranch) {
                              const branchY =
                                centerY + (branch - 2) * branchSpacing;

                              elements.push(
                                <line
                                  key={`gray-line-${level}-${branch}`}
                                  x1={currentX}
                                  y1={currentY}
                                  x2={nextX}
                                  y2={branchY}
                                  stroke="#d1d5db"
                                  strokeWidth="2"
                                  opacity="0.5"
                                  className={
                                    state.isAnimating && currentPhase === 1
                                      ? "draw-branches"
                                      : ""
                                  }
                                />
                              );

                              elements.push(
                                <circle
                                  key={`gray-circle-${level}-${branch}`}
                                  cx={nextX}
                                  cy={branchY}
                                  r={NODE_RADIUS - 2}
                                  fill="#d1d5db"
                                  opacity="0.5"
                                  className={
                                    state.isAnimating && currentPhase === 1
                                      ? "fade-in-circle"
                                      : ""
                                  }
                                />
                              );
                            }
                          }
                        }

                        // 2. Gradient line to chosen path (phase 3+)
                        if (currentPhase >= 3) {
                          elements.push(
                            <line
                              key={`gradient-line-${level}`}
                              x1={currentX}
                              y1={currentY}
                              x2={nextX}
                              y2={chosenBranchY}
                              stroke={
                                isSameColor
                                  ? toColor
                                  : `url(#gradient-${level})`
                              }
                              strokeWidth="4"
                              opacity="1"
                              className={
                                state.isAnimating && currentPhase === 3
                                  ? "draw-choice"
                                  : ""
                              }
                            />
                          );
                        }

                        // 3. Endpoint circle (phase 4+ ONLY)
                        if (currentPhase >= 4) {
                          elements.push(
                            <circle
                              key={`endpoint-${level}`}
                              cx={nextX}
                              cy={chosenBranchY}
                              r={NODE_RADIUS}
                              fill={toColor}
                              opacity="1"
                              className={
                                state.isAnimating && currentPhase === 4
                                  ? "fade-in-endpoint"
                                  : ""
                              }
                            />
                          );
                        }

                        // Update position for next level
                        currentX = nextX;
                        currentY = centerY + (chosenBranch - 2) * branchSpacing;
                      }

                      return elements;
                    })()}
                  </svg>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  Journey Details
                </h3>
                <div className="relative">
                  {state.visitedPath.length > 1 && (
                    <div className="absolute left-1/2 top-6 bottom-6 w-0.5 bg-gray-300 transform -translate-x-1/2 z-0"></div>
                  )}

                  <div className="space-y-6 relative z-10">
                    {state.visitedPath.map((nodeId, index) => {
                      const node = getNodeById(state.treeData!, nodeId);
                      if (!node) return null;

                      const colors = getChoiceColors(index);

                      return (
                        <div key={index} className="relative">
                          <div
                            className={`${colors.bg} ${colors.border} py-4 px-4 rounded-lg border-2 shadow-sm`}
                          >
                            <div className="flex justify-start mb-2">
                              <div
                                className={`text-xs bg-black/10 rounded px-2 py-1 font-bold uppercase tracking-wide ${colors.accent}`}
                              >
                                {node.branchType}
                              </div>
                            </div>
                            <div
                              className={`text-sm leading-relaxed ${colors.text}`}
                            >
                              <span
                                className={`${colors.accent} mr-1 font-medium`}
                              >
                                {index + 1}.
                              </span>
                              <div className="font-medium mb-1">
                                {node.title}
                              </div>
                              <div className="text-xs text-gray-600">
                                {node.timelineDate}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
