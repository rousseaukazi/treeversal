"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  TreeData,
  TreeNode,
  loadTreeData,
  getNodeChoices,
  getNodeById,
} from "../lib/treeData";

interface TreecognitionState {
  currentNodeId: string | null;
  visitedPath: string[];
  treeData: TreeData | null;
  selectedIndex: number | null;
  showModal: boolean;
  animationStep: number;
  isAnimating: boolean;
  loading: boolean;
  error: string | null;
}

// Animation timing configuration - easy to tweak!
const ANIMATION_CONFIG = {
  drawBranches: 125, // 2x faster animations
  pauseToSee: 100, // 2x faster pause
  drawChoice: 150, // 2x faster draw
  moveToNext: 75, // 2x faster transition
};

// Calculate total time per level for easier timing
const TIME_PER_LEVEL =
  ANIMATION_CONFIG.drawBranches +
  ANIMATION_CONFIG.pauseToSee +
  ANIMATION_CONFIG.drawChoice +
  ANIMATION_CONFIG.moveToNext;

// Branch-based color system - consistent meaning across all choices
const BRANCH_COLORS = {
  optimistic: {
    name: "Optimistic",
    main: "#1e40af", // blue-700
    neon: "#3b82f6", // bright blue-500 for tree lines
    bg: "bg-blue-100",
    border: "border-blue-600",
    accent: "text-blue-700",
    text: "text-blue-900",
  },
  moderate: {
    name: "Moderate",
    main: "#8b5cf6", // purple-500
    neon: "#a855f7", // bright purple-500 for tree lines
    bg: "bg-purple-100",
    border: "border-purple-600",
    accent: "text-purple-700",
    text: "text-purple-900",
  },
  pessimistic: {
    name: "Pessimistic",
    main: "#dc2626", // red-600
    neon: "#ef4444", // bright red-500 for tree lines
    bg: "bg-red-100",
    border: "border-red-600",
    accent: "text-red-700",
    text: "text-red-900",
  },
} as const;

export default function Home() {
  const [state, setState] = useState<TreecognitionState>({
    currentNodeId: null,
    visitedPath: [],
    treeData: null,
    selectedIndex: null,
    showModal: false,
    animationStep: 0,
    isAnimating: false,
    loading: true,
    error: null,
  });

  // Initialize by loading tree data
  useEffect(() => {
    console.log("🌳 TreeCognition initializing...");

    loadTreeData()
      .then((treeData) => {
        console.log("✅ Tree data loaded:", {
          scenario: treeData.scenario,
          totalNodes: treeData.metadata.totalNodes,
          rootNode: treeData.rootNodeId,
        });

        setState((prev) => ({
          ...prev,
          treeData,
          currentNodeId: null, // Start with no current node to show world state
          visitedPath: [],
          loading: false,
          error: null,
        }));
      })
      .catch((error) => {
        console.error("❌ Failed to load tree data:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      });
  }, []);

  // Log state changes
  useEffect(() => {
    if (state.visitedPath.length > 0 && state.treeData) {
      const pathNodes = state.visitedPath.map((nodeId) => {
        const node = getNodeById(state.treeData!, nodeId);
        return `${node?.branchType}(${node?.title?.substring(0, 30)}...)`;
      });

      console.log("📈 State update:", {
        currentNodeId: state.currentNodeId,
        totalSteps: state.visitedPath.length,
        fullPath: state.visitedPath.join(" → "),
        pathWithTitles: pathNodes.join(" → "),
      });
    }
  }, [state.visitedPath, state.currentNodeId, state.treeData]);

  const getCurrentChoices = (): TreeNode[] => {
    if (!state.treeData) return [];

    // If we haven't made any choices yet, show the depth 0 nodes (first decision from world state)
    if (state.visitedPath.length === 0) {
      return Object.values(state.treeData.nodes).filter(
        (node) => node.depth === 0
      );
    }

    // Otherwise, get choices from current node
    if (!state.currentNodeId) return [];
    return getNodeChoices(state.treeData, state.currentNodeId);
  };

  const getCurrentNode = (): TreeNode | null => {
    if (!state.treeData) return null;

    // If we haven't made any choices yet, return null to show world state
    if (state.visitedPath.length === 0) return null;

    // Otherwise, get the current node
    if (!state.currentNodeId) return null;
    return getNodeById(state.treeData, state.currentNodeId);
  };

  const canGoBack = (): boolean => {
    return state.visitedPath.length > 0;
  };

  const handleChoice = (choice: TreeNode, index: number) => {
    console.log("🎯 Choice selected:", {
      nodeId: choice.id,
      branchType: choice.branchType,
      title: choice.title,
      buttonIndex: index + 1,
      currentDepth: state.visitedPath.length,
    });

    // Show selection animation
    setState((prev) => ({ ...prev, selectedIndex: index }));

    // Delay state change to show animation
    setTimeout(() => {
      setState((prev) => {
        const newState = {
          ...prev,
          currentNodeId: choice.id,
          visitedPath: [...prev.visitedPath, choice.id],
          selectedIndex: null,
          showModal: false,
          animationStep: 0,
          isAnimating: false,
        };

        console.log("✅ Navigation complete:", {
          newNodeId: newState.currentNodeId,
          pathLength: newState.visitedPath.length,
          depth: choice.depth,
        });

        return newState;
      });
    }, 300);
  };

  const goBack = () => {
    if (!canGoBack()) return;

    console.log("⬅️ Going back from:", state.currentNodeId);

    setState((prev) => {
      const newPath = [...prev.visitedPath];
      const previousNodeId = newPath.pop();
      const parentNodeId =
        newPath.length > 0 ? newPath[newPath.length - 1] : null; // Go back to world state

      console.log("✅ Back navigation complete:", {
        fromNodeId: previousNodeId,
        toNodeId: parentNodeId || "world state",
        newPathLength: newPath.length,
      });

      return {
        ...prev,
        currentNodeId: parentNodeId,
        visitedPath: newPath,
        selectedIndex: null,
        showModal: false,
      };
    });
  };

  const resetTreecognition = () => {
    console.log("🔄 Treecognition reset triggered");
    if (state.treeData && state.visitedPath.length > 0) {
      const pathNodes = state.visitedPath.map((nodeId) => {
        const node = getNodeById(state.treeData!, nodeId);
        return `${node?.branchType}(${node?.title?.substring(0, 20)}...)`;
      });
      console.log("📈 Final treecognition path was:", pathNodes.join(" → "));
      console.log("📊 Total choices made:", state.visitedPath.length);
    }

    setState((prev) => ({
      ...prev,
      currentNodeId: null, // Reset to world state
      visitedPath: [],
      selectedIndex: null,
      showModal: false,
      animationStep: 0,
      isAnimating: false,
    }));

    console.log("✅ Treecognition reset complete - back to root");
  };

  const openModal = () => {
    setState((prev) => ({
      ...prev,
      showModal: true,
      animationStep: 0,
      isAnimating: true,
    }));
  };

  // Animation controller
  useEffect(() => {
    if (!state.isAnimating || !state.showModal) return;

    const totalLevels = state.visitedPath.length;
    const totalSteps = totalLevels * 4; // 4 phases per level: draw branches, pause, draw choice, move to next

    if (state.animationStep >= totalSteps) {
      // Animation complete
      setState((prev) => ({ ...prev, isAnimating: false }));
      return;
    }

    // Calculate which phase we're in
    const currentLevel = Math.floor(state.animationStep / 4);
    const currentPhase = state.animationStep % 4; // 0: draw branches, 1: pause, 2: draw choice, 3: move to next

    let delay = 0;
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
      setState((prev) => ({
        ...prev,
        animationStep: prev.animationStep + 1,
      }));
    }, delay);

    return () => clearTimeout(timer);
  }, [
    state.animationStep,
    state.isAnimating,
    state.showModal,
    state.visitedPath.length,
  ]);

  const closeModal = () => {
    setState((prev) => ({
      ...prev,
      showModal: false,
      animationStep: 0,
      isAnimating: false,
    }));
  };

  // Add keyboard event listener for hotkeys
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key;

      // Close modal with Escape key
      if (key === "Escape" && state.showModal) {
        closeModal();
        return;
      }

      // Open modal with 'v' key
      if (key === "v" && !state.showModal && state.visitedPath.length > 0) {
        openModal();
        return;
      }

      // Go back with Backspace
      if (key === "Backspace" && !state.showModal && canGoBack()) {
        goBack();
        return;
      }

      // Don't handle number keys if modal is open
      if (state.showModal) return;

      if (["1", "2", "3"].includes(key)) {
        const index = parseInt(key) - 1;
        const choices = getCurrentChoices();
        if (choices[index]) {
          console.log("⌨️ Hotkey used:", {
            key: key,
            nodeId: choices[index].id,
            branchType: choices[index].branchType,
            inputMethod: "keyboard",
          });
          handleChoice(choices[index], index);
        } else {
          console.log(
            "❌ Invalid hotkey pressed:",
            key,
            "- no choice available at index",
            index
          );
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    state.showModal,
    state.visitedPath.length,
    state.currentNodeId,
    state.treeData,
  ]);

  const choices = getCurrentChoices();
  const currentNode = getCurrentNode();

  // Branch-based color system - consistent across all choice sets
  const getButtonColors = (branchType: string) => {
    const branchColor = BRANCH_COLORS[branchType as keyof typeof BRANCH_COLORS];

    // Add hover effects to the background
    const bgWithHover =
      branchColor.bg + " hover:" + branchColor.bg.replace("-100", "-200");

    return {
      bg: bgWithHover,
      border: branchColor.border,
      accent: branchColor.accent,
      text: branchColor.text,
    };
  };

  // Get the branch-based color for a specific choice in the treeversal
  const getChoiceColors = (choiceIndex: number) => {
    if (!state.treeData || choiceIndex >= state.visitedPath.length) {
      return BRANCH_COLORS.moderate; // fallback
    }

    const nodeId = state.visitedPath[choiceIndex];
    const node = getNodeById(state.treeData, nodeId);
    return BRANCH_COLORS[node?.branchType || "moderate"];
  };

  // Create gradient for tree lines between choices using neon colors
  const getGradientColors = (fromIndex: number, toIndex: number) => {
    // Start with bright purple for the first line
    const fromColor =
      fromIndex === -1 ? "#a855f7" : getChoiceColors(fromIndex).neon;
    const toColor = getChoiceColors(toIndex).neon;

    // If same color, make it solid instead of gradient
    const isSameColor = fromColor === toColor;

    return { fromColor, toColor, isSameColor };
  };

  // Get the numeric path representation
  const getNumericPath = () => {
    if (state.visitedPath.length === 0) return "Start your journey...";

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

  // Loading state
  if (state.loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Loading tree data...</div>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">
            Failed to load tree data
          </div>
          <div className="text-white text-sm">{state.error}</div>
        </div>
      </div>
    );
  }

  if (!state.treeData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">No tree data available</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Left Side - Current Choice Display */}
      <div className="w-[45%] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-2xl"></div>
        </div>

        {/* Main content area - fills space between top and footer */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="relative z-10 w-full max-w-3xl">
            {/* Current Future Button - This is what gets centered */}
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl p-8 text-left">
              <div className="flex justify-start mb-4">
                <div className="text-xs bg-white/20 rounded px-3 py-2 font-bold uppercase tracking-wide text-white/90">
                  {state.visitedPath.length === 0
                    ? "World State"
                    : "Current Future"}
                </div>
              </div>
              <div className="text-white/90">
                <div className="text-lg prose prose-invert prose-stone max-w-none markdown-content markdown-content-dark max-h-64 md:max-h-80 lg:max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  <ReactMarkdown>
                    {state.visitedPath.length === 0
                      ? state.treeData.worldState.description
                      : currentNode?.worldUpdate || "Loading..."}
                  </ReactMarkdown>
                </div>
                <div className="text-sm text-white/70 mt-4">
                  <strong>Date:</strong>{" "}
                  {state.visitedPath.length === 0
                    ? state.treeData.worldState.currentDate
                    : currentNode?.timelineDate || "Loading..."}
                </div>

                {/* Key Players Tags - only show on world state */}
                {state.visitedPath.length === 0 &&
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

        {/* Left Side Footer - Treecognition Tracker */}
        <div className="relative z-10 bg-black/20 backdrop-blur-sm border-t border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-200 mb-2">
                PreCog: {state.treeData.scenario}
              </p>
              <p className="text-lg font-mono font-bold text-white tracking-wider">
                {getNumericPath()}
              </p>
            </div>
            <div className="flex gap-2">
              {canGoBack() && (
                <button
                  onClick={goBack}
                  className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 backdrop-blur-sm"
                >
                  Back
                </button>
              )}
              <button
                onClick={
                  state.visitedPath.length > 0 ? openModal : resetTreecognition
                }
                className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 backdrop-blur-sm"
              >
                {state.visitedPath.length > 0 ? "View" : "Reset"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Choice Options */}
      <div className="w-[55%] bg-gradient-to-br from-orange-50/50 via-amber-50/50 to-yellow-50/50 flex flex-col relative h-screen overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/15 via-amber-50/10 to-yellow-50/20"></div>

        {/* Header */}
        <div className="relative z-10 text-center pt-8 pb-0 px-8 flex-shrink-0 bg-white/0">
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">
            {currentNode ? currentNode.title : "Choose Your Path"}
          </h2>
          <p className="text-base text-gray-600">
            Use hotkeys 1-3 for quick selection • Backspace to go back
          </p>
        </div>

        {/* Scrollable content area */}
        <div className="relative z-20 flex-1 overflow-y-auto px-12 pt-12 pb-12">
          <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
            {choices.map((choice, index) => {
              const colors = getButtonColors(choice.branchType);
              const isSelected = state.selectedIndex === index;

              return (
                <button
                  key={choice.id}
                  onClick={() => {
                    console.log("🖱️ Button clicked:", {
                      nodeId: choice.id,
                      branchType: choice.branchType,
                      buttonIndex: index + 1,
                      inputMethod: "mouse",
                    });
                    handleChoice(choice, index);
                  }}
                  disabled={state.selectedIndex !== null}
                  className={`${colors.bg} ${colors.border} py-10 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl border-2 relative overflow-hidden text-left`}
                >
                  {/* Loading animation overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/10 animate-pulse">
                      <div className="h-full bg-black/5 animate-[loading_0.3s_ease-out_forwards]"></div>
                    </div>
                  )}

                  <div className="relative z-10">
                    <div className="flex justify-start mb-2">
                      <div
                        className={`text-sm bg-black/10 rounded px-3 py-2 font-bold uppercase tracking-wide ${colors.accent}`}
                      >
                        {choice.branchType}
                      </div>
                    </div>
                    <div className={`text-lg leading-relaxed ${colors.text}`}>
                      <span
                        className={`${colors.accent} mr-2 text-xl font-semibold`}
                      >
                        {index + 1}.
                      </span>
                      <div className="font-semibold mb-2">{choice.title}</div>
                      <div className="text-base">{choice.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {state.showModal && state.treeData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  Treecognition Journey
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {state.treeData.scenario}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // Generate shareable URL with URL-safe base64 encoding
                    const treversalData = btoa(
                      JSON.stringify(state.visitedPath)
                    )
                      .replace(/\+/g, "-")
                      .replace(/\//g, "_")
                      .replace(/=/g, "");
                    const shareUrl = `${window.location.origin}/share/${treversalData}`;
                    navigator.clipboard.writeText(shareUrl);
                    console.log("Share URL generated:", shareUrl);
                    console.log("Treecognition data:", state.visitedPath);
                    alert("Share URL copied to clipboard!");
                  }}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Share
                </button>
                <button
                  onClick={closeModal}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Combined Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-10 py-6 space-y-8">
              {/* Tree Visualization */}
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
                      {/* Generate gradient definitions for each choice line */}
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

                    {/* Generate tree branches sequentially */}
                    {(() => {
                      const elements = [];
                      const levels = state.visitedPath.length;

                      // Fixed positioning for consistent 95% frame with enlarged nodes
                      const VIEW_WIDTH = 800;
                      const VIEW_HEIGHT = 400;
                      const MARGIN_PERCENT = 0.025; // 2.5% frame
                      const NODE_RADIUS = 6; // reduced node size

                      // Node centres must be shifted so their edges are at the frame
                      const TREE_START_X =
                        VIEW_WIDTH * MARGIN_PERCENT + NODE_RADIUS; // 20px + r
                      const TREE_END_X =
                        VIEW_WIDTH * (1 - MARGIN_PERCENT) - NODE_RADIUS; // 780px - r
                      const TREE_WIDTH = TREE_END_X - TREE_START_X; // 744px

                      // Calculate path length based on available width and number of levels
                      const pathLength =
                        levels > 0 ? TREE_WIDTH / levels : TREE_WIDTH;

                      // Dynamic vertical scaling (fill 95% height, accounting for node radius)
                      const centerY = VIEW_HEIGHT / 2; // 200px
                      const usableHeight =
                        VIEW_HEIGHT * (1 - 2 * MARGIN_PERCENT) -
                        2 * NODE_RADIUS;
                      const branchSpacing = usableHeight / 2; // distance between branch rows (3 branches = 2 gaps)

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
                        const node = getNodeById(state.treeData!, nodeId);

                        // Map branch types to positions (optimistic=1, moderate=2, pessimistic=3)
                        const branchPositions = {
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

              {/* Vertical Feed of Path Answers */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  Your Journey
                </h3>
                <div className="relative">
                  {/* Connecting line */}
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
                          {/* Choice content */}
                          <div>
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
