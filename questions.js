const QUEST_CONFIG = {
  classes: [
    {
      id: 'wizard',
      icon: '🧙',
      label: 'The Wizard',
      tagline: 'Visionary & Pattern-Seeker',
      description: 'You see patterns others miss. Or you just drink a lot of coffee. Either way, welcome.',
      color: '#7C5CBF',
    },
    {
      id: 'warrior',
      icon: '⚔️',
      label: 'The Warrior',
      tagline: 'Builder & Executor',
      description: 'You build things. Real things. You are suspicious of roadmaps longer than two weeks.',
      color: '#C0392B',
    },
    {
      id: 'rogue',
      icon: '🗡️',
      label: 'The Rogue',
      tagline: 'Disruptor & Skeptic',
      description: "You find the gap in every plan. This is both your gift and the reason you weren't invited to the last planning session.",
      color: '#27AE60',
    },
    {
      id: 'bard',
      icon: '🎵',
      label: 'The Bard',
      tagline: 'Storyteller & Connector',
      description: 'You explain things to people. You are the reason the pitch deck makes sense to humans.',
      color: '#E67E22',
    },
  ],

  questions: [
    {
      id: 'q1',
      key: 'dragon',
      xpReward: 50,
      type: 'text',
      defaultPrompt: 'What dragon have you been forced to fight?',
      defaultSubtext: 'Describe a real frustration or broken thing you have personally lived with.',
      classOverrides: {
        wizard: {
          prompt: 'What pattern keeps repeating that no one else seems to notice?',
          subtext: 'A systemic problem hiding in plain sight. Your pattern-brain sees it.',
        },
        rogue: {
          prompt: 'What broken system have you learned to work around?',
          subtext: 'The workaround you built because the official solution was hopeless.',
        },
      },
      placeholder: 'The dragon was...',
    },
    {
      id: 'q2',
      key: 'spell',
      xpReward: 50,
      type: 'text',
      defaultPrompt: "What's your most powerful spell?",
      defaultSubtext: 'Knowledge or skill that most adventurers lack. Your unfair advantage.',
      classOverrides: {
        warrior: {
          prompt: 'What can you build or make that most people cannot?',
          subtext: 'A craft, a system, a thing you can assemble that others struggle with.',
        },
        bard: {
          prompt: 'What can you explain or translate that others struggle to communicate?',
          subtext: "The bridge you build between ideas and people. That's your spell.",
        },
      },
      placeholder: 'My spell is...',
    },
    {
      id: 'q3',
      key: 'who',
      xpReward: 50,
      type: 'text',
      defaultPrompt: 'Who is your quest for?',
      defaultSubtext: 'If you could only solve a problem for ONE type of person, who would it be?',
      classOverrides: {
        bard: {
          prompt: 'Who deserves a better story?',
          subtext: "Someone whose life is harder than it needs to be, and who hasn't found their voice yet.",
        },
        rogue: {
          prompt: "Who is getting a bad deal that nobody's talking about?",
          subtext: 'The underserved, the overlooked, the person the market forgot.',
        },
      },
      placeholder: 'I fight for...',
    },
    {
      id: 'q4',
      key: 'path',
      xpReward: 50,
      type: 'chips',
      defaultPrompt: 'Which path calls to you?',
      defaultSubtext: 'Choose the kind of solution that excites you most.',
      classOverrides: {},
      options: [
        { value: 'saas', label: '🏰 SaaS Fortress', description: 'A software tool people pay for monthly' },
        { value: 'marketplace', label: '🗺️ The Marketplace', description: 'Connect buyers and sellers, take a cut' },
        { value: 'alchemy', label: '⚗️ The Alchemist\'s Lab', description: 'Community, platform, or transformation play' },
        { value: 'service', label: '⚔️ The Mercenary Guild', description: 'Do the hard thing as a service for others' },
      ],
    },
    {
      id: 'q5',
      key: 'curse',
      xpReward: 50,
      type: 'text',
      defaultPrompt: 'What curse has been cast upon the land?',
      defaultSubtext: "Something obviously broken that no hero has fixed yet. The gap in the world.",
      classOverrides: {
        wizard: {
          prompt: 'What obvious solution is everyone too busy to build?',
          subtext: "The thing that makes you think 'why doesn't this exist yet?'",
        },
        warrior: {
          prompt: "What's a problem where the solution clearly exists, but nobody's shipped it well?",
          subtext: 'A known problem with a known shape — just waiting for someone to actually execute.',
        },
      },
      placeholder: 'The curse is...',
    },
  ],

  provocations: [
    { bold: 'The best quests solve a curse the hero once lived.', fine: null },
    { bold: 'The most powerful parties have conflicting instincts.', fine: '(Also conflicting opinions about lunch. That\'s fine.)' },
    { bold: 'Every great company started as an absurd idea.', fine: 'This one might still be absurd. That\'s fine.' },
    { bold: 'Your answers are being read by an ancient oracle.', fine: 'The oracle is a language model. It\'s still pretty good.' },
    { bold: 'You are now 40% less confused than when you started.', fine: 'Probably.' },
    { bold: 'The best startups are painkiller, not vitamins.', fine: 'The oracle has been told this approximately 4,000 times. It still checks.' },
    { bold: 'What would you build if you couldn\'t fail?', fine: '(Please still account for the possibility of failure. Just in case.)' },
  ],
};
