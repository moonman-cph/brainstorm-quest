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
      key: 'moment',
      xpReward: 50,
      type: 'text',
      defaultPrompt: 'Name a specific moment the system failed you.',
      defaultSubtext: 'Not a general frustration — a real scene. Last Tuesday. A name, a place, a thing that went wrong. The more specific, the more powerful.',
      classOverrides: {
        wizard: {
          prompt: 'Describe the last time you watched a system produce an obviously wrong answer — and everyone just accepted it.',
          subtext: 'A specific meeting, output, or decision. The moment the pattern broke and nobody else blinked.',
        },
        warrior: {
          prompt: 'Describe the last time a tool forced you to do something a computer should be doing.',
          subtext: 'Specific task, specific tool, specific day. The busywork that made you lose twenty minutes you needed for actual work.',
        },
        rogue: {
          prompt: 'Describe the last time you found the back door everyone else was still using the front entrance for.',
          subtext: 'A workaround, a shortcut, a hack. The moment you realised the official path was theater.',
        },
        bard: {
          prompt: 'Describe the last time you had to translate something between two groups who should have understood each other.',
          subtext: "A specific conversation. Two rooms that didn't speak the same language. You were the bridge.",
        },
      },
      placeholder: 'It was a Tuesday. Specifically...',
    },
    {
      id: 'q2',
      key: 'contraband',
      xpReward: 50,
      type: 'text',
      defaultPrompt: 'What do you know how to do that surprises people?',
      defaultSubtext: 'A skill, fluency, or instinct you have that most people in your field lack. Not your job title — the thing underneath it that you do without thinking.',
      classOverrides: {
        wizard: {
          prompt: "What lens do you look through that most people around you don't have?",
          subtext: "A mental model, a discipline, a field you wandered through that left you seeing things differently.",
        },
        warrior: {
          prompt: 'What can you build or assemble that others treat as a specialist job?',
          subtext: 'A thing you ship, configure, or construct that usually requires a team, a vendor, or three months of procurement.',
        },
        bard: {
          prompt: 'What can you make a roomful of confused people understand in under five minutes?',
          subtext: "A topic, a product, a situation that reliably loses people — and you reliably don't lose them.",
        },
      },
      placeholder: 'People are always surprised that I can...',
    },
    {
      id: 'q3',
      key: 'borrowing',
      xpReward: 50,
      type: 'text',
      defaultPrompt: "What does another industry do brilliantly that yours has never borrowed?",
      defaultSubtext: 'Pick a world outside your day job — logistics, theatre, Formula 1, emergency medicine, fine dining — and name one thing they do that would be a superpower if transplanted into your field.',
      classOverrides: {
        wizard: {
          prompt: "What concept from a completely unrelated field explains your industry's biggest unsolved problem?",
          subtext: "Physics, evolutionary biology, urban planning — something that maps onto a broken pattern you've been watching.",
        },
        rogue: {
          prompt: "What does the black market, the grey market, or the workaround economy do better than the official version?",
          subtext: "Informal systems often solve real demand faster than incumbents. What's the underground version of something your industry does badly?",
        },
      },
      placeholder: "In [other industry] they... and we've never...",
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
        { value: 'saas',        label: '🏰 SaaS Fortress',       description: 'A software tool people pay for monthly' },
        { value: 'marketplace', label: '🗺️ The Marketplace',      description: 'Connect buyers and sellers, take a cut' },
        { value: 'alchemy',     label: "⚗️ The Alchemist's Lab",  description: 'Community, platform, or transformation play' },
        { value: 'service',     label: '⚔️ The Mercenary Guild',  description: 'Do the hard thing as a service for others' },
      ],
    },
    {
      id: 'q5',
      key: 'conviction',
      xpReward: 50,
      type: 'text',
      defaultPrompt: 'What do you believe that most people in your world think is wrong or naive?',
      defaultSubtext: "A real conviction — not a polished thesis, a raw one. Something you'd still work on in year seven when the first version fails.",
      classOverrides: {
        wizard: {
          prompt: 'What prediction about the next ten years would get you laughed out of a normal meeting?',
          subtext: "The thing you actually believe is coming that the consensus has decided is too early, too weird, or too threatening.",
        },
        warrior: {
          prompt: "What problem are people trying to solve with software that actually needs to be solved with process — or vice versa?",
          subtext: "The category error you keep watching people make. The tool that should be a habit, or the habit everyone keeps trying to automate.",
        },
        rogue: {
          prompt: "What 'best practice' in your field is actually protecting an incumbent at everyone else's expense?",
          subtext: "The received wisdom that turns out to be a moat in disguise.",
        },
        bard: {
          prompt: 'What story is your industry telling itself that is going to look obviously wrong in ten years?',
          subtext: "The narrative everyone nods along to. The one you're fairly sure will age like milk left in the sun.",
        },
      },
      placeholder: 'I genuinely believe that...',
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
