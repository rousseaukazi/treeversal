'use client'

import { useState, useEffect } from 'react'

type Choice = {
  id: string
  text: string
  distribution: string
}

interface TreecognitionState {
  currentChoice: Choice
  treeversal: Choice[]
  expectingLetters: boolean
  selectedIndex: number | null
  showModal: boolean
  animationStep: number
  isAnimating: boolean
}

// Animation timing configuration - easy to tweak!
const ANIMATION_CONFIG = {
  drawBranches: 125,      // 2x faster animations
  pauseToSee: 100,        // 2x faster pause
  drawChoice: 150,        // 2x faster draw
  moveToNext: 75,         // 2x faster transition
}

// Calculate total time per level for easier timing
const TIME_PER_LEVEL = ANIMATION_CONFIG.drawBranches + 
                       ANIMATION_CONFIG.pauseToSee + 
                       ANIMATION_CONFIG.drawChoice + 
                       ANIMATION_CONFIG.moveToNext;

// Risk-based color system - consistent meaning across all choices
const RISK_COLORS = {
  1: { 
    name: 'Conservative',
    main: '#1e40af',           // blue-700
    neon: '#3b82f6',           // bright blue-500 for tree lines
    bg: 'bg-blue-100',         
    border: 'border-blue-600', 
    accent: 'text-blue-700',   
    text: 'text-blue-900'      
  },
  2: { 
    name: 'Moderate-',
    main: '#0891b2',           // cyan-600
    neon: '#06b6d4',           // bright cyan-500 for tree lines
    bg: 'bg-cyan-100',         
    border: 'border-cyan-600', 
    accent: 'text-cyan-700',   
    text: 'text-cyan-900'      
  },
  3: { 
    name: 'Moderate',
    main: '#8b5cf6',           // purple-500
    neon: '#a855f7',           // bright purple-500 for tree lines
    bg: 'bg-purple-100',       
    border: 'border-purple-600', 
    accent: 'text-purple-700', 
    text: 'text-purple-900'    
  },
  4: { 
    name: 'Moderate+',
    main: '#ea580c',           // orange-600
    neon: '#f97316',           // bright orange-500 for tree lines
    bg: 'bg-orange-100',       
    border: 'border-orange-600', 
    accent: 'text-orange-700', 
    text: 'text-orange-900'    
  },
  5: { 
    name: 'Aggressive',
    main: '#dc2626',           // red-600
    neon: '#ef4444',           // bright red-500 for tree lines
    bg: 'bg-red-100',          
    border: 'border-red-600',  
    accent: 'text-red-700',    
    text: 'text-red-900'       
  }
} as const

export default function Home() {
  const [state, setState] = useState<TreecognitionState>({
    currentChoice: { id: '1', text: 'Begin your exploration of probabilistic futures. You will navigate through different scenarios, each building upon your previous choices to create a unique path through potential futures.', distribution: 'Start' },
    treeversal: [],
    expectingLetters: false,
    selectedIndex: null,
    showModal: false,
    animationStep: 0,
    isAnimating: false
  })

  // Initialize logging
  useEffect(() => {
    console.log('�� PreCog Future Treecognition initialized')
    console.log('📊 Initial state:', state)
  }, [])

  // Log state changes
  useEffect(() => {
    if (state.treeversal.length > 0) {
      console.log('📈 State update:', {
        currentChoiceId: state.currentChoice.id,
        totalSteps: state.treeversal.length,
        fullPath: state.treeversal.map(c => c.id).join(' → '),
        pathWithDistributions: state.treeversal.map(c => `${c.id}(${c.distribution})`).join(' → ')
      });
    }
  }, [state.treeversal, state.currentChoice])

  const getCurrentChoices = (): Choice[] => {
    const choiceSets = [
      // Set 1: Economic Scenarios
      [
        { id: '1', text: 'Economic markets crash within 6 months due to escalating geopolitical tensions and supply chain disruptions. Widespread unemployment follows as major corporations downsize operations, consumer spending plummets, and financial institutions face liquidity crises.', distribution: 'Conservative' },
        { id: '2', text: 'Moderate economic downturn with selective sector impacts and gradual recovery over 18 months. While some industries like hospitality and retail struggle, others like technology and healthcare show resilience.', distribution: 'Moderate-' },
        { id: '3', text: 'Economic stability maintained with minor fluctuations and continued growth in key sectors. Employment rates remain steady with slight wage increases across most industries.', distribution: 'Moderate' },
        { id: '4', text: 'Strong economic growth driven by breakthrough technological innovations, particularly in renewable energy and artificial intelligence. Consumer confidence reaches new highs as unemployment drops to historic lows.', distribution: 'Moderate+' },
        { id: '5', text: 'Explosive economic boom with rapid expansion across all sectors and unprecedented market gains. Stock markets reach record highs daily, cryptocurrency adoption becomes mainstream, and venture capital funding increases by 500%.', distribution: 'Aggressive' }
      ],
      // Set 2: Policy Responses
      [
        { id: '1', text: 'Government implements emergency economic controls with strict price regulations, nationalization of key industries, and massive public works programs. Individual freedoms are restricted but social safety nets are strengthened.', distribution: 'Conservative' },
        { id: '2', text: 'Balanced fiscal policy with targeted stimulus packages for affected sectors and moderate tax adjustments. Unemployment benefits are extended while encouraging private sector recovery.', distribution: 'Moderate-' },
        { id: '3', text: 'Current policies maintained with minor adjustments to interest rates and regulatory oversight. Market forces are allowed to determine most outcomes with minimal intervention.', distribution: 'Moderate' },
        { id: '4', text: 'Pro-growth policies enacted with significant tax cuts for businesses and individuals, reduced regulations, and increased infrastructure investment. Innovation incentives are maximized to attract investment.', distribution: 'Moderate+' },
        { id: '5', text: 'Complete economic liberalization with all price controls removed, privatization of government services, and elimination of most regulatory barriers. Pure market capitalism is embraced with minimal safety nets.', distribution: 'Aggressive' }
      ],
      // Set 3: Social Outcomes
      [
        { id: '1', text: 'Society becomes increasingly polarized with widespread civil unrest and breakdown of social cohesion. Communities retreat into isolated groups, trust in institutions collapses, and authoritarian movements gain strength.', distribution: 'Conservative' },
        { id: '2', text: 'Social tensions rise but are managed through dialogue and compromise. Some protests occur but democratic institutions remain stable. Community organizations work to bridge divides.', distribution: 'Moderate-' },
        { id: '3', text: 'Social fabric remains largely intact with normal levels of political discourse and civic engagement. Established institutions continue to function effectively while adapting to new challenges.', distribution: 'Moderate' },
        { id: '4', text: 'Communities become more resilient and collaborative, with increased civic participation and innovative social programs. Technology enables better communication and cooperation between diverse groups.', distribution: 'Moderate+' },
        { id: '5', text: 'Society undergoes rapid transformation with new forms of organization emerging. Traditional hierarchies dissolve as technology enables direct democracy and decentralized decision-making on an unprecedented scale.', distribution: 'Aggressive' }
      ],
      // Set 4: Technological Impact
      [
        { id: '1', text: 'Technology development stagnates as resources are diverted to crisis management. Innovation slows dramatically, existing systems break down, and society becomes increasingly dependent on outdated infrastructure.', distribution: 'Conservative' },
        { id: '2', text: 'Technological progress continues at a measured pace with focus on practical applications. AI development is regulated carefully, and new technologies are implemented gradually with strong oversight.', distribution: 'Moderate-' },
        { id: '3', text: 'Technology evolves steadily with balanced adoption of new innovations. Automation increases efficiency while workforce retraining programs help people adapt to changing job markets.', distribution: 'Moderate' },
        { id: '4', text: 'Rapid technological advancement transforms multiple industries simultaneously. Breakthrough innovations in energy, medicine, and communications create new economic opportunities and improve quality of life.', distribution: 'Moderate+' },
        { id: '5', text: 'Technological singularity approaches as AI systems become increasingly autonomous and capable. Genetic engineering, quantum computing, and nanotechnology converge to fundamentally alter human civilization.', distribution: 'Aggressive' }
      ]
    ];

    const currentSet = state.treeversal.length % choiceSets.length;
    const setNames = ["Economic Scenarios", "Policy Responses", "Social Outcomes", "Technological Impact"];
    
    console.log('🎨 Loading choice set:', {
      setIndex: currentSet,
      setName: setNames[currentSet],
      totalChoicesInSet: choiceSets[currentSet].length,
      currentStep: state.treeversal.length + 1
    });
    
    return choiceSets[currentSet];
  }

  const getChoiceSetTitle = (): string => {
    const titles = [
      "Economic Scenarios",
      "Policy Responses", 
      "Social Outcomes",
      "Technological Impact"
    ];
    
    const currentSet = state.treeversal.length % titles.length;
    return titles[currentSet];
  }

  const handleChoice = (choice: Choice, index: number) => {
    console.log('🎯 Choice selected:', {
      choiceId: choice.id,
      choiceText: choice.text.substring(0, 50) + '...',
      distribution: choice.distribution,
      buttonIndex: index + 1,
      currentRound: state.treeversal.length + 1,
      choiceSet: getChoiceSetTitle()
    })

    // Show selection animation
    setState(prev => ({ ...prev, selectedIndex: index }))
    
    // Delay state change to show animation
    setTimeout(() => {
              setState(prev => {
        const newState = {
          currentChoice: choice,
          treeversal: [...prev.treeversal, choice],
          expectingLetters: false,
          selectedIndex: null,
          showModal: false,
          animationStep: 0,
          isAnimating: false
        }
        
        const titles = ["Economic Scenarios", "Policy Responses", "Social Outcomes", "Technological Impact"];
        const nextSetIndex = newState.treeversal.length % titles.length;
        
        console.log('✅ State updated after choice:', {
          newCurrentChoice: newState.currentChoice.id,
          treeversal: newState.treeversal.map(c => c.id).join(' → '),
          totalChoices: newState.treeversal.length,
          nextChoiceSet: titles[nextSetIndex]
        })
        
        return newState
      })
    }, 300)
  }

  const resetTreecognition = () => {
    console.log('🔄 Treecognition reset triggered')
    console.log('📈 Final treecognition path was:', state.treeversal.map(c => `${c.id}(${c.distribution})`).join(' → '))
    console.log('📊 Total choices made:', state.treeversal.length)
    
    setState({
      currentChoice: { id: '1', text: 'Begin your exploration of probabilistic futures. You will navigate through different scenarios, each building upon your previous choices to create a unique path through potential futures.', distribution: 'Start' },
      treeversal: [],
      expectingLetters: false,
      selectedIndex: null,
      showModal: false,
      animationStep: 0,
      isAnimating: false
    })
    
    console.log('✅ Treecognition reset complete - back to initial state')
  }

  const openModal = () => {
    setState(prev => ({ 
      ...prev, 
      showModal: true, 
      animationStep: 0, 
      isAnimating: true 
    }))
  }

  // Animation controller
  useEffect(() => {
    if (!state.isAnimating || !state.showModal) return

    const totalLevels = state.treeversal.length
    const totalSteps = totalLevels * 4 // 4 phases per level: draw branches, pause, draw choice, move to next
    
    if (state.animationStep >= totalSteps) {
      // Animation complete
      setState(prev => ({ ...prev, isAnimating: false }))
      return
    }

    // Calculate which phase we're in
    const currentLevel = Math.floor(state.animationStep / 4)
    const currentPhase = state.animationStep % 4 // 0: draw branches, 1: pause, 2: draw choice, 3: move to next
    
    let delay = 0
    switch (currentPhase) {
      case 0: delay = ANIMATION_CONFIG.drawBranches; break
      case 1: delay = ANIMATION_CONFIG.pauseToSee; break
      case 2: delay = ANIMATION_CONFIG.drawChoice; break
      case 3: delay = ANIMATION_CONFIG.moveToNext; break
    }

    const timer = setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        animationStep: prev.animationStep + 1 
      }))
    }, delay)

    return () => clearTimeout(timer)
  }, [state.animationStep, state.isAnimating, state.showModal, state.treeversal.length])

  const closeModal = () => {
    setState(prev => ({ 
      ...prev, 
      showModal: false, 
      animationStep: 0, 
      isAnimating: false 
    }))
  }

  // Add keyboard event listener for hotkeys
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key
      
      // Close modal with Escape key
      if (key === 'Escape' && state.showModal) {
        closeModal()
        return
      }
      
      // Open modal with 'v' key
      if (key === 'v' && !state.showModal && state.treeversal.length > 0) {
        openModal()
        return
      }
      
      // Don't handle number keys if modal is open
      if (state.showModal) return
      
      if (['1', '2', '3', '4', '5'].includes(key)) {
        const index = parseInt(key) - 1
        const choices = getCurrentChoices()
        if (choices[index]) {
          console.log('⌨️ Hotkey used:', {
            key: key,
            choiceId: choices[index].id,
            distribution: choices[index].distribution,
            inputMethod: 'keyboard'
          })
          handleChoice(choices[index], index)
        } else {
          console.log('❌ Invalid hotkey pressed:', key, '- no choice available at index', index)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [state.showModal, state.treeversal.length])

  const choices = getCurrentChoices()

  // Risk-based color system - consistent across all choice sets
  const getButtonColors = (index: number) => {
    const choiceNumber = (index + 1) as keyof typeof RISK_COLORS; // Convert 0-4 index to 1-5 choice
    const riskColor = RISK_COLORS[choiceNumber];
    
    // Add hover effects to the background
    const bgWithHover = riskColor.bg + ' hover:' + riskColor.bg.replace('-100', '-200');
    
    return {
      bg: bgWithHover,
      border: riskColor.border,
      accent: riskColor.accent,
      text: riskColor.text
    };
  }

  // Get the risk-based color for a specific choice in the treeversal
  const getChoiceColors = (choiceIndex: number) => {
    const choiceId = parseInt(state.treeversal[choiceIndex].id) as keyof typeof RISK_COLORS;
    return RISK_COLORS[choiceId];
  }

  // Create gradient for tree lines between choices using neon colors
  const getGradientColors = (fromIndex: number, toIndex: number) => {
    // Start with bright purple for the first line
    const fromColor = fromIndex === -1 ? '#a855f7' : RISK_COLORS[parseInt(state.treeversal[fromIndex].id) as keyof typeof RISK_COLORS].neon;
    const toColor = RISK_COLORS[parseInt(state.treeversal[toIndex].id) as keyof typeof RISK_COLORS].neon;
    
    // If same color, make it solid instead of gradient
    const isSameColor = fromColor === toColor;
    
    return { fromColor, toColor, isSameColor };
  }

  const getChoiceSetTitleForIndex = (index: number): string => {
    const titles = [
      "Economic Scenarios",
      "Policy Responses", 
      "Social Outcomes",
      "Technological Impact"
    ];
    
    return titles[index % titles.length];
  }

  return (
    <div className="flex h-screen">
      {/* Left Side - Current Choice Display */}
      <div className="w-[35%] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col relative overflow-hidden">
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
                  Current Future
                </div>
              </div>
              <div className="text-white/90">
                <span className="text-white/70 mr-2">{state.currentChoice.id}.</span>
                <span className="text-lg leading-relaxed">{state.currentChoice.text}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Left Side Footer - Treecognition Tracker */}
        <div className="relative z-10 bg-black/20 backdrop-blur-sm border-t border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-200 mb-2">PreCog: Explore probabilistic futures</p>
              <p className="text-lg font-mono font-bold text-white tracking-wider">
                {state.treeversal.length > 0 
                  ? state.treeversal.map(choice => choice.id).join(' → ')
                  : 'Start your journey...'
                }
              </p>
            </div>
            <button
              onClick={state.treeversal.length > 0 ? openModal : resetTreecognition}
              className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 backdrop-blur-sm"
            >
              {state.treeversal.length > 0 ? 'View' : 'Reset'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Choice Options */}
      <div className="w-[65%] bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex flex-col relative h-screen overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 via-amber-100/15 to-yellow-100/25"></div>
        
        {/* Header */}
        <div className="relative z-10 text-center pt-8 pb-0 px-8 flex-shrink-0 bg-white/0">
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">
            {getChoiceSetTitle()}
          </h2>
          <p className="text-base text-gray-600">
            Use hotkeys 1-5 for quick selection
          </p>
        </div>

        {/* Scrollable content area */}
        <div className="relative z-20 flex-1 overflow-y-auto px-12 pt-12 pb-12">
          <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
            {choices.map((choice, index) => {
              const colors = getButtonColors(index)
              const isSelected = state.selectedIndex === index
              
              return (
                <button
                  key={choice.id}
                  onClick={() => {
                    console.log('🖱️ Button clicked:', {
                      choiceId: choice.id,
                      distribution: choice.distribution,
                      buttonIndex: index + 1,
                      inputMethod: 'mouse'
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
                      <div className={`text-sm bg-black/10 rounded px-3 py-2 font-bold uppercase tracking-wide ${colors.accent}`}>
                        {choice.distribution}
                      </div>
                    </div>
                    <div className={`text-lg leading-relaxed ${colors.text}`}>
                      <span className={`${colors.accent} mr-2 text-xl font-semibold`}>{choice.id}.</span>
                      {choice.text}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {state.showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Treecognition Journey</h2>
                <p className="text-sm text-gray-500 mt-1">Your path through probabilistic futures</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // Generate shareable URL with URL-safe base64 encoding
                    const treversalData = btoa(JSON.stringify(state.treeversal))
                      .replace(/\+/g, '-')
                      .replace(/\//g, '_')
                      .replace(/=/g, '')
                    const shareUrl = `${window.location.origin}/share/${treversalData}`
                    navigator.clipboard.writeText(shareUrl)
                    console.log('Share URL generated:', shareUrl)
                    console.log('Treecognition data:', state.treeversal)
                    alert('Share URL copied to clipboard!')
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
                <h3 className="text-lg font-medium text-gray-800 mb-3">Decision Tree</h3>
                <div className="bg-gray-50 rounded-lg p-6 min-h-[200px]">
                  <svg 
                     width="95%"  
                     height="95%" 
                     viewBox="0 0 800 400" 
                     className="overflow-visible"
                   >
                     <defs>
                       {/* Generate gradient definitions for each choice line */}
                       {state.treeversal.map((_, index) => {
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
                     
                     {/* Generate tree branches sequentially */}
                     {(() => {
                       const elements = [];
                       const levels = state.treeversal.length;
                       
                       // Fixed positioning for consistent 95% frame with enlarged nodes
                       const VIEW_WIDTH = 800;
                       const VIEW_HEIGHT = 400;
                       const MARGIN_PERCENT = 0.025;  // 2.5% frame
                       const NODE_RADIUS = 6;         // reduced node size
                       
                       // Node centres must be shifted so their edges are at the frame
                       const TREE_START_X = VIEW_WIDTH * MARGIN_PERCENT + NODE_RADIUS;              // 20px + r
                       const TREE_END_X   = VIEW_WIDTH * (1 - MARGIN_PERCENT) - NODE_RADIUS;       // 780px - r
                       const TREE_WIDTH   = TREE_END_X - TREE_START_X;                             // 744px
                       
                       // Calculate path length based on available width and number of levels
                       const pathLength = levels > 0 ? TREE_WIDTH / levels : TREE_WIDTH;
                       
                       // Dynamic vertical scaling (fill 95% height, accounting for node radius)
                       const centerY = VIEW_HEIGHT / 2; // 200px
                       const usableHeight = (VIEW_HEIGHT * (1 - 2*MARGIN_PERCENT)) - 2*NODE_RADIUS;
                       const branchSpacing = usableHeight / 4;  // distance between distribution rows
                       
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
                         const chosenPath = parseInt(state.treeversal[level].id);
                         
                         // Calculate which animation phase we're in for this level
                         const levelStartStep = level * 4; // 4 steps per level
                         const currentPhase = state.isAnimating ? 
                           Math.max(0, state.animationStep - levelStartStep) : 99; // If not animating, show final state
                         
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
                                   className={state.isAnimating && currentPhase === 1 ? "draw-branches" : ""}
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
                                   className={state.isAnimating && currentPhase === 1 ? "fade-in-circle" : ""}
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
                               stroke={isSameColor ? toColor : `url(#gradient-${level})`}
                               strokeWidth="4"
                               opacity="1"
                               className={state.isAnimating && currentPhase === 3 ? "draw-choice" : ""}
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
                               className={state.isAnimating && currentPhase === 4 ? "fade-in-endpoint" : ""}
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
                  {state.treeversal.length > 1 && (
                    <div className="absolute left-1/2 top-6 bottom-6 w-0.5 bg-gray-300 transform -translate-x-1/2 z-0"></div>
                  )}
                  
                  <div className="space-y-6 relative z-10">
                    {state.treeversal.map((choice, index) => {
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
      )}
    </div>
  )
} 