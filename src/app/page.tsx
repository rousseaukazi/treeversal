'use client'

import { useState, useEffect } from 'react'

type Choice = {
  id: string
  text: string
  distribution: string
}

interface TreeversalState {
  currentChoice: Choice
  treeversal: Choice[]
  expectingLetters: boolean
  selectedIndex: number | null
}

export default function Home() {
  const [state, setState] = useState<TreeversalState>({
    currentChoice: { id: '1', text: 'Begin your exploration of probabilistic futures. You will navigate through different scenarios, each building upon your previous choices to create a unique path through potential futures.', distribution: 'Start' },
    treeversal: [],
    expectingLetters: false,
    selectedIndex: null
  })

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
    // Show selection animation
    setState(prev => ({ ...prev, selectedIndex: index }))
    
    // Delay state change to show animation
    setTimeout(() => {
      setState(prev => ({
        currentChoice: choice,
        treeversal: [...prev.treeversal, choice],
        expectingLetters: false,
        selectedIndex: null
      }))
    }, 300)
  }

  const resetTreeversal = () => {
    setState({
      currentChoice: { id: '1', text: 'Begin your exploration of probabilistic futures. You will navigate through different scenarios, each building upon your previous choices to create a unique path through potential futures.', distribution: 'Start' },
      treeversal: [],
      expectingLetters: false,
      selectedIndex: null
    })
  }

  // Add keyboard event listener for hotkeys
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key
      if (['1', '2', '3', '4', '5'].includes(key)) {
        const index = parseInt(key) - 1
        const choices = getCurrentChoices()
        if (choices[index]) {
          handleChoice(choices[index], index)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const choices = getCurrentChoices()

  // Rotating color schemes for different choice sets
  const getButtonColors = (index: number) => {
    const colorSets = [
      // Set 1: Warm tones (Economics)
      [
        { bg: 'bg-red-100 hover:bg-red-200', border: 'border-red-600', accent: 'text-red-700', text: 'text-red-900' },
        { bg: 'bg-orange-100 hover:bg-orange-200', border: 'border-orange-600', accent: 'text-orange-700', text: 'text-orange-900' },
        { bg: 'bg-yellow-100 hover:bg-yellow-200', border: 'border-yellow-600', accent: 'text-yellow-700', text: 'text-yellow-900' },
        { bg: 'bg-green-100 hover:bg-green-200', border: 'border-green-600', accent: 'text-green-700', text: 'text-green-900' },
        { bg: 'bg-purple-100 hover:bg-purple-200', border: 'border-purple-600', accent: 'text-purple-700', text: 'text-purple-900' }
      ],
      // Set 2: Cool tones (Policy)
      [
        { bg: 'bg-blue-100 hover:bg-blue-200', border: 'border-blue-600', accent: 'text-blue-700', text: 'text-blue-900' },
        { bg: 'bg-indigo-100 hover:bg-indigo-200', border: 'border-indigo-600', accent: 'text-indigo-700', text: 'text-indigo-900' },
        { bg: 'bg-cyan-100 hover:bg-cyan-200', border: 'border-cyan-600', accent: 'text-cyan-700', text: 'text-cyan-900' },
        { bg: 'bg-teal-100 hover:bg-teal-200', border: 'border-teal-600', accent: 'text-teal-700', text: 'text-teal-900' },
        { bg: 'bg-slate-100 hover:bg-slate-200', border: 'border-slate-600', accent: 'text-slate-700', text: 'text-slate-900' }
      ],
      // Set 3: Earth tones (Social)
      [
        { bg: 'bg-amber-100 hover:bg-amber-200', border: 'border-amber-600', accent: 'text-amber-700', text: 'text-amber-900' },
        { bg: 'bg-lime-100 hover:bg-lime-200', border: 'border-lime-600', accent: 'text-lime-700', text: 'text-lime-900' },
        { bg: 'bg-emerald-100 hover:bg-emerald-200', border: 'border-emerald-600', accent: 'text-emerald-700', text: 'text-emerald-900' },
        { bg: 'bg-stone-100 hover:bg-stone-200', border: 'border-stone-600', accent: 'text-stone-700', text: 'text-stone-900' },
        { bg: 'bg-rose-100 hover:bg-rose-200', border: 'border-rose-600', accent: 'text-rose-700', text: 'text-rose-900' }
      ],
      // Set 4: Vibrant tones (Technology)
      [
        { bg: 'bg-pink-100 hover:bg-pink-200', border: 'border-pink-600', accent: 'text-pink-700', text: 'text-pink-900' },
        { bg: 'bg-violet-100 hover:bg-violet-200', border: 'border-violet-600', accent: 'text-violet-700', text: 'text-violet-900' },
        { bg: 'bg-fuchsia-100 hover:bg-fuchsia-200', border: 'border-fuchsia-600', accent: 'text-fuchsia-700', text: 'text-fuchsia-900' },
        { bg: 'bg-sky-100 hover:bg-sky-200', border: 'border-sky-600', accent: 'text-sky-700', text: 'text-sky-900' },
        { bg: 'bg-gray-100 hover:bg-gray-200', border: 'border-gray-600', accent: 'text-gray-700', text: 'text-gray-900' }
      ]
    ];

    const currentColorSet = state.treeversal.length % colorSets.length;
    return colorSets[currentColorSet][index];
  }

  return (
    <div className="flex h-screen">
      {/* Left Side - Current Choice Display */}
      <div className="flex-1 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-2xl"></div>
        </div>
        
        {/* Main content area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative z-10 text-center text-white px-12 max-w-2xl">
            <div className="mb-8">
              <h1 className="text-4xl font-light mb-2 tracking-wide">Future Treeversal</h1>
              <p className="text-purple-200 text-lg font-light">Explore probabilistic futures</p>
            </div>
            
            <div className="mb-8">
              <div className="text-6xl font-light mb-6 text-white/90">
                {state.currentChoice.id}
              </div>
              <div className="text-xl font-light leading-relaxed text-white/80 mb-4">
                {state.currentChoice.text}
              </div>
              <p className="text-purple-200 text-sm uppercase tracking-wider">
                {state.treeversal.length > 0 ? `Round ${state.treeversal.length + 1}` : 'Begin Journey'}
              </p>
            </div>
          </div>
        </div>

        {/* Left Side Footer - Treeversal Tracker */}
        <div className="relative z-10 bg-black/20 backdrop-blur-sm border-t border-white/10 p-6">
          <div>
            <p className="text-sm font-medium text-purple-200 mb-1">Treeversal Path</p>
            <p className="text-lg font-mono font-bold text-white tracking-wider mb-2">
              {state.treeversal.length > 0 
                ? state.treeversal.map(choice => choice.id).join(' → ')
                : 'Start your journey...'
              }
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-200">
                  Round {state.treeversal.length + 1} • {state.treeversal.length} {state.treeversal.length === 1 ? 'choice' : 'choices'} made
                </p>
                <p className="text-sm text-purple-300">
                  {state.treeversal.length === 0 ? 'Begin your exploration' : 'Continue your journey...'}
                </p>
              </div>
              <button
                onClick={resetTreeversal}
                className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 backdrop-blur-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Choice Options */}
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-white flex flex-col relative h-screen overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50"></div>
        
        {/* Header */}
        <div className="relative z-10 text-center py-8 px-8 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {getChoiceSetTitle()}
          </h2>
          <p className="text-sm text-gray-500">
            Use hotkeys 1-5 for quick selection
          </p>
        </div>

        {/* Scrollable content area */}
        <div className="relative z-10 flex-1 overflow-y-auto px-8 pb-8">
          <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full">
            {choices.map((choice, index) => {
              const colors = getButtonColors(index)
              const isSelected = state.selectedIndex === index
              
              return (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice, index)}
                  disabled={state.selectedIndex !== null}
                  className={`${colors.bg} ${colors.border} py-6 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl border-2 relative overflow-hidden text-left`}
                >
                  {/* Loading animation overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/10 animate-pulse">
                      <div className="h-full bg-black/5 animate-[loading_0.3s_ease-out_forwards]"></div>
                    </div>
                  )}
                  
                  <div className="relative z-10">
                    <div className="flex justify-start mb-2">
                      <div className={`text-xs bg-black/10 rounded px-2 py-1 font-bold uppercase tracking-wide ${colors.accent}`}>
                        {choice.distribution}
                      </div>
                    </div>
                    <div className={`text-sm leading-relaxed ${colors.text}`}>
                      <span className={`${colors.accent} mr-1`}>{choice.id}.</span>
                      {choice.text}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
} 