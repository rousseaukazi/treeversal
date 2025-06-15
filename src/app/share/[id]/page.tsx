'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'

// Types
type Choice = {
  id: string
  text: string
  distribution: string
}

// Risk-based color system
const RISK_COLORS = {
  1: {
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    accent: 'text-blue-800',
    text: 'text-blue-900',
    neon: '#3b82f6'
  },
  2: {
    bg: 'bg-cyan-100', 
    border: 'border-cyan-300',
    accent: 'text-cyan-800',
    text: 'text-cyan-900',
    neon: '#06b6d4'
  },
  3: {
    bg: 'bg-purple-100',
    border: 'border-purple-300', 
    accent: 'text-purple-800',
    text: 'text-purple-900',
    neon: '#8b5cf6'
  },
  4: {
    bg: 'bg-orange-100',
    border: 'border-orange-300',
    accent: 'text-orange-800', 
    text: 'text-orange-900',
    neon: '#f97316'
  },
  5: {
    bg: 'bg-red-100',
    border: 'border-red-300',
    accent: 'text-red-800',
    text: 'text-red-900',
    neon: '#ef4444'
  }
} as const

// Animation configuration
const ANIMATION_CONFIG = {
  drawBranches: 150,
  pauseToSee: 100,
  drawChoice: 200,
  moveToNext: 50
}

export default function SharePage() {
  const params = useParams()
  const [treeversal, setTreeversal] = useState<Choice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [animationStep, setAnimationStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    try {
      if (params.id) {
        console.log('Share page - Raw params.id:', params.id)
        
        // Convert URL-safe base64 back to regular base64
        let base64Data = (params.id as string)
          .replace(/-/g, '+')
          .replace(/_/g, '/')
        
        // Add padding if needed
        const padding = base64Data.length % 4
        if (padding) {
          base64Data += '='.repeat(4 - padding)
        }
        
        console.log('Share page - Processed base64:', base64Data)
        
        const decodedData = atob(base64Data)
        console.log('Share page - Decoded string:', decodedData)
        
        const treversalData = JSON.parse(decodedData) as Choice[]
        console.log('Share page - Parsed treeversal:', treversalData)
        
        setTreeversal(treversalData)
        setIsAnimating(true)
        setAnimationStep(0)
      }
      setLoading(false)
    } catch (err) {
      console.error('Share page error:', err)
      setError('Invalid share link')
      setLoading(false)
    }
  }, [params.id])

  // Animation controller
  useEffect(() => {
    if (!isAnimating || treeversal.length === 0) return

    const totalLevels = treeversal.length
    const totalSteps = totalLevels * 4
    
    if (animationStep >= totalSteps) {
      setIsAnimating(false)
      return
    }

    let delay = 0
    const currentPhase = animationStep % 4
    switch (currentPhase) {
      case 0: delay = ANIMATION_CONFIG.drawBranches; break
      case 1: delay = ANIMATION_CONFIG.pauseToSee; break
      case 2: delay = ANIMATION_CONFIG.drawChoice; break
      case 3: delay = ANIMATION_CONFIG.moveToNext; break
    }

    const timer = setTimeout(() => {
      setAnimationStep(prev => prev + 1)
    }, delay)

    return () => clearTimeout(timer)
  }, [animationStep, isAnimating, treeversal.length])

  // Get the risk-based color for a specific choice in the treeversal
  const getChoiceColors = (choiceIndex: number) => {
    const choiceId = parseInt(treeversal[choiceIndex].id) as keyof typeof RISK_COLORS;
    return RISK_COLORS[choiceId];
  }

  // Create gradient for tree lines between choices using neon colors
  const getGradientColors = (fromIndex: number, toIndex: number) => {
    const fromColor = fromIndex === -1 ? '#a855f7' : RISK_COLORS[parseInt(treeversal[fromIndex].id) as keyof typeof RISK_COLORS].neon;
    const toColor = RISK_COLORS[parseInt(treeversal[toIndex].id) as keyof typeof RISK_COLORS].neon;
    const isSameColor = fromColor === toColor;
    return { fromColor, toColor, isSameColor };
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading shared treeversal...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-2xl"></div>
      </div>
      
      {/* Main Content Container */}
      <div className="relative z-10 bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Treeversal Journey</h2>
            <p className="text-sm text-gray-500 mt-1">Your path through probabilistic futures</p>
          </div>
        </div>

        {/* Combined Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-10 py-6 space-y-8">
          {/* Tree Visualization */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Decision Tree</h3>
            <div className="bg-gray-50 rounded-lg p-6 min-h-[200px]">
              <svg 
                 width="95%"  
                 height="95%" 
                 viewBox="0 0 800 400" 
                 className="overflow-visible"
               >
                 <defs>
                   {treeversal.map((_, index) => {
                     const { fromColor, toColor } = getGradientColors(index - 1, index);
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
                   const levels = treeversal.length;
                   
                   const VIEW_WIDTH = 800;
                   const VIEW_HEIGHT = 400;
                   const MARGIN_PERCENT = 0.025;  // 2.5% margin each side
                   const NODE_RADIUS = 6;
                   
                   const TREE_START_X = VIEW_WIDTH * MARGIN_PERCENT + NODE_RADIUS;  // 20 + r
                   const TREE_END_X = VIEW_WIDTH * (1 - MARGIN_PERCENT) - NODE_RADIUS; // 780 - r
                   const TREE_WIDTH = TREE_END_X - TREE_START_X; // 744
                   
                   // Calculate path length based on available width and number of levels
                   const pathLength = levels > 0 ? TREE_WIDTH / levels : TREE_WIDTH;
                   
                   // Dynamic vertical scaling (accounting for node size)
                   const centerY = VIEW_HEIGHT / 2; // 200px
                   const usableHeight = (VIEW_HEIGHT * (1 - 2*MARGIN_PERCENT)) - 2*NODE_RADIUS;
                   const branchSpacing = usableHeight / 4;
                   
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
                     const chosenPath = parseInt(treeversal[level].id);
                     
                     // Calculate which animation phase we're in for this level
                     const levelStartStep = level * 4; // 4 steps per level
                     const currentPhase = isAnimating ? 
                       Math.max(0, animationStep - levelStartStep) : 99; // If not animating, show final state
                     
                     const chosenBranchY = centerY + (chosenPath - 3) * branchSpacing;
                     const { fromColor, toColor, isSameColor } = getGradientColors(level - 1, level);
                     
                     // Show this level if animation has started (phase 1+) or not animating
                     if (currentPhase >= 1) {
                       // 1. Gray branches to unchosen paths only
                       for (let branch = 1; branch <= 5; branch++) {
                         if (branch !== chosenPath) {
                           const branchY = centerY + (branch - 3) * branchSpacing;
                           
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
                               className={isAnimating && currentPhase === 1 ? "draw-branches" : ""}
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
                               className={isAnimating && currentPhase === 1 ? "fade-in-circle" : ""}
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
                           stroke={`url(#gradient-${level})`}
                           strokeWidth="4"
                           opacity="1"
                           className={isAnimating && currentPhase === 3 ? "draw-choice" : ""}
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
                           className={isAnimating && currentPhase === 4 ? "fade-in-endpoint" : ""}
                         />
                       );
                     }
                     
                     // Update position for next level
                     currentX = nextX;
                     currentY = centerY + (chosenPath - 3) * branchSpacing;
                   }
                   
                   return elements;
                 })()}
               </svg>
            </div>
          </div>
          
          {/* Vertical Feed of Path Answers */}
          <div>
            <div className="relative">
              {/* Connecting line */}
              {treeversal.length > 1 && (
                <div className="absolute left-1/2 top-6 bottom-6 w-0.5 bg-gray-300 transform -translate-x-1/2 z-0"></div>
              )}
              
              <div className="space-y-6 relative z-10">
                {treeversal.map((choice, index) => {
                  const colors = getChoiceColors(index);
                  
                  return (
                    <div key={index} className="relative">
                      {/* Choice content */}
                      <div>
                        <div className={`${colors.bg} ${colors.border} py-4 px-4 rounded-lg border-2 shadow-sm`}>
                          <div className="flex justify-start mb-2">
                            <div className={`text-xs bg-black/10 rounded px-2 py-1 font-bold uppercase tracking-wide ${colors.accent}`}>
                              {choice.distribution}
                            </div>
                          </div>
                          <div className={`text-sm leading-relaxed ${colors.text}`}>
                            <span className={`${colors.accent} mr-1 font-medium`}>{choice.id}.</span>
                            {choice.text}
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
  )
} 