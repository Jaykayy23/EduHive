export const educationalTips = [
  "Break down large tasks into smaller, manageable steps to avoid feeling overwhelmed.",
  "Use the Pomodoro Technique: 25 minutes of focused work, followed by a 5-minute break.",
  "Active recall is more effective than passive review. Test yourself frequently.",
  "Space out your study sessions over time instead of cramming.",
  "Explain concepts to someone else (or even yourself) to solidify your understanding.",
  "Get enough sleep! It's crucial for memory consolidation and cognitive function.",
  "Stay hydrated and eat nutritious meals to maintain energy levels.",
  "Find a study environment that minimizes distractions and promotes focus.",
  "Set clear, specific, and achievable goals for each study session.",
  "Review your notes regularly, ideally within 24 hours of a lecture.",
  "Don't be afraid to ask questions in class or seek help from professors/TAs.",
  "Form study groups to discuss material and learn from peers.",
  "Take short, frequent breaks to prevent burnout and improve retention.",
  "Prioritize your tasks using methods like the Eisenhower Matrix.",
  "Practice self-compassion and don't be too hard on yourself if you struggle.",
  "Utilize university resources like tutoring centers and writing labs.",
  "Connect new information to what you already know to build stronger neural connections.",
  "Vary your study methods to keep things interesting and engage different parts of your brain.",
  "Reward yourself after completing study goals to stay motivated.",
  "Stay organized with a planner or digital calendar to keep track of assignments and deadlines.",
]

export const getRandomTip = () => {
  const randomIndex = Math.floor(Math.random() * educationalTips.length)
  return educationalTips[randomIndex]
}

export const academicReferences = {
  "quantum mechanics": [
    {
      type: "video",
      title: "Quantum Mechanics (MIT OpenCourseWare)",
      url: "https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/",
      description: "Lectures and course materials from MIT's undergraduate quantum physics course.",
    },
    {
      type: "article",
      title: "Introduction to Quantum Mechanics - Wikipedia",
      url: "https://en.wikipedia.org/wiki/Introduction_to_quantum_mechanics",
      description: "A comprehensive overview of quantum mechanics concepts and history.",
    },
    {
      type: "video",
      title: "Quantum Mechanics for Dummies (3Blue1Brown)",
      url: "https://www.youtube.com/watch?v=pT5Ohg_E_2g",
      description: "An intuitive visual explanation of quantum mechanics principles.",
    },
  ],
  "machine learning": [
    {
      type: "video",
      title: "Machine Learning (Stanford University - Coursera)",
      url: "https://www.coursera.org/learn/machine-learning",
      description: "Andrew Ng's foundational course on machine learning, widely acclaimed.",
    },
    {
      type: "article",
      title: "Scikit-learn Documentation",
      url: "https://scikit-learn.org/stable/user_guide.html",
      description: "Official user guide for the popular Python machine learning library.",
    },
    {
      type: "article",
      title: "Deep Learning Book",
      url: "https://www.deeplearningbook.org/",
      description: "An online textbook covering deep learning by Goodfellow, Bengio, and Courville.",
    },
  ],
  calculus: [
    {
      type: "video",
      title: "Calculus 1 Course (Khan Academy)",
      url: "https://www.khanacademy.org/math/calculus-1",
      description: "Free online lessons, exercises, and quizzes covering differential calculus.",
    },
    {
      type: "article",
      title: "Calculus - Britannica",
      url: "https://www.britannica.com/science/calculus-mathematics",
      description: "An encyclopedia entry providing an overview of calculus and its history.",
    },
    {
      type: "video",
      title: "Essence of Calculus (3Blue1Brown)",
      url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-ryC_p8c_Qp1Q_N7f",
      description: "A visual and intuitive series explaining the core ideas of calculus.",
    },
  ],
  "organic chemistry": [
    {
      type: "article",
      title: "Organic Chemistry Portal",
      url: "https://www.organic-chemistry.org/",
      description: "A comprehensive resource for organic chemistry reactions, mechanisms, and concepts.",
    },
    {
      type: "video",
      title: "Organic Chemistry I (YaleCourses)",
      url: "https://www.youtube.com/playlist?list=PL02DCF09A6294695F",
      description: "Full lecture series on Organic Chemistry from Yale University.",
    },
    {
      type: "article",
      title: "Master Organic Chemistry",
      url: "https://www.masterorganicchemistry.com/",
      description: "Study guides, practice problems, and tips for organic chemistry students.",
    },
  ],
  "molecular biology": [
    {
      type: "video",
      title: "Molecular Biology (MIT OpenCourseWare)",
      url: "https://ocw.mit.edu/courses/7-01sc-fundamentals-of-biology-fall-2011/pages/molecular-biology/",
      description: "Course materials and lectures on molecular biology from MIT.",
    },
    {
      type: "article",
      title: "Molecular Biology - Nature Education",
      url: "https://www.nature.com/scitable/topicpage/molecular-biology-13829349/",
      description: "Articles and resources on molecular biology from Nature Education.",
    },
    {
      type: "video",
      title: "The Central Dogma (Khan Academy)",
      url: "https://www.khanacademy.org/science/biology/gene-expression-central-dogma/central-dogma-of-molecular-biology/v/the-central-dogma-of-molecular-biology",
      description: "An animated explanation of DNA, RNA, and protein synthesis.",
    },
  ],
  "study techniques": [
    {
      type: "article",
      title: "Learning How to Learn (Coursera)",
      url: "https://www.coursera.org/learn/learning-how-to-learn",
      description: "A popular course on effective learning strategies and cognitive science.",
    },
    {
      type: "article",
      title: "Spaced Repetition - Wikipedia",
      url: "https://en.wikipedia.org/wiki/Spaced_repetition",
      description: "Explanation of a highly effective learning technique for long-term retention.",
    },
    {
      type: "video",
      title: "How to Study for Exams (College Info Geek)",
      url: "https://www.youtube.com/watch?v=CPxSzxylr94",
      description: "Practical tips and strategies for preparing for university exams.",
    },
  ],
  "general academic": [
    {
      type: "article",
      title: "Purdue OWL (Online Writing Lab)",
      url: "https://owl.purdue.edu/owl/index.html",
      description: "A comprehensive resource for writing, research, and citation styles.",
    },
    {
      type: "video",
      title: "How to Write a Research Paper (Scribbr)",
      url: "https://www.youtube.com/watch?v=o3b_A0g0g_8",
      description: "A step-by-step guide to writing academic research papers.",
    },
    {
      type: "article",
      title: "Academic Integrity - University of Oxford",
      url: "https://www.ox.ac.uk/students/academic/guidance/skills/academic-integrity",
      description: "Guidance on maintaining academic integrity and avoiding plagiarism.",
    },
  ],
}

export const getReferencesForSubject = (
  subject: string,
): (typeof academicReferences)[keyof typeof academicReferences] => {
  const lowerSubject = subject.toLowerCase()
  if (academicReferences[lowerSubject as keyof typeof academicReferences]) {
    return academicReferences[lowerSubject as keyof typeof academicReferences]
  }
  return academicReferences["general academic"]
}

// Alias used by the chatbot API route
export const getReferences = (
  subject: string,
  topic?: string,
): (typeof academicReferences)[keyof typeof academicReferences] => {
  if (topic) {
    const refs = getReferencesForSubject(topic)
    if (refs !== academicReferences["general academic"]) return refs
  }
  return getReferencesForSubject(subject)
}

// Comprehensive educational dataset used by the chatbot API route
export const universityEducationalDataset = {
  subjects: {
    mathematics: {
      keywords: [
        "math", "mathematics", "calculus", "algebra", "geometry", "statistics",
        "linear algebra", "probability", "discrete math", "number theory",
        "topology", "complex analysis", "numerical analysis", "mathematical logic",
      ],
      topics: [
        "Calculus", "Linear Algebra", "Statistics & Probability",
        "Differential Equations", "Discrete Mathematics", "Number Theory",
        "Topology", "Complex Analysis", "Numerical Methods", "Mathematical Logic",
      ],
      concepts: {
        calculus: [
          "Limits describe the value a function approaches as the input approaches a certain point, forming the foundation of calculus.",
          "Derivatives represent the instantaneous rate of change of a function, used extensively in physics and engineering.",
          "Integrals calculate the area under a curve and have applications in computing volumes, work, and probability distributions.",
          "The Fundamental Theorem of Calculus links differentiation and integration, showing they are inverse operations.",
        ],
        linearalgebra: [
          "Vectors and matrices are the core objects — vectors represent quantities with magnitude and direction, matrices represent linear transformations.",
          "Eigenvalues and eigenvectors reveal the principal directions along which a linear transformation acts by scaling.",
          "Systems of linear equations can be solved using Gaussian elimination, matrix inversion, or decomposition methods.",
          "Linear algebra is foundational to machine learning, computer graphics, quantum mechanics, and data science.",
        ],
        statisticsprobability: [
          "Probability theory quantifies uncertainty using axioms defined by Kolmogorov, including sample spaces and events.",
          "Descriptive statistics (mean, median, mode, variance) summarize datasets, while inferential statistics draw conclusions from samples.",
          "Hypothesis testing uses p-values and confidence intervals to determine if observed data is statistically significant.",
          "Bayesian statistics updates probabilities as new evidence is observed, contrasting with frequentist approaches.",
        ],
      },
    },
    "computer science": {
      keywords: [
        "programming", "coding", "algorithm", "software", "computer",
        "machine learning", "ai", "data structures", "operating systems",
        "networks", "cybersecurity", "javascript", "python", "react",
        "database", "web development", "frontend", "backend", "devops", "cloud computing",
      ],
      topics: [
        "Algorithms & Data Structures", "Machine Learning & AI",
        "Web Development", "Database Systems", "Operating Systems",
        "Computer Networks", "Cybersecurity", "Software Engineering",
        "Cloud Computing", "DevOps",
      ],
      concepts: {
        algorithmsdatastructures: [
          "Big-O notation describes algorithmic time and space complexity, helping compare efficiency of different approaches.",
          "Common data structures include arrays, linked lists, trees, graphs, hash tables, and heaps — each with different performance trade-offs.",
          "Sorting algorithms (quicksort, mergesort, heapsort) and searching algorithms (binary search, BFS, DFS) are fundamental building blocks.",
          "Dynamic programming solves complex problems by breaking them into overlapping sub-problems and caching results.",
        ],
        machinelearningai: [
          "Supervised learning trains models on labeled data for classification and regression tasks.",
          "Neural networks, inspired by biological neurons, power deep learning applications from image recognition to natural language processing.",
          "Overfitting occurs when a model learns noise in training data — regularization, cross-validation, and dropout help prevent it.",
          "Reinforcement learning trains agents through trial-and-error using rewards and penalties in an environment.",
        ],
        webdevelopment: [
          "Frontend development uses HTML, CSS, and JavaScript (with frameworks like React, Vue, Angular) to build user interfaces.",
          "Backend development handles server logic, databases, and APIs using technologies like Node.js, Python, or Go.",
          "RESTful APIs and GraphQL are common patterns for client-server communication in modern web applications.",
          "DevOps practices (CI/CD, containerization, infrastructure as code) streamline deployment and operations.",
        ],
      },
    },
    physics: {
      keywords: [
        "physics", "quantum", "mechanics", "electromagnetism", "thermodynamics",
        "relativity", "statistical mechanics", "solid state physics", "nuclear physics",
        "particle physics", "astrophysics", "optics", "fluid dynamics", "cosmology", "condensed matter",
      ],
      topics: [
        "Quantum Mechanics", "Classical Mechanics", "Electromagnetism",
        "Thermodynamics", "Special & General Relativity", "Particle Physics",
        "Astrophysics", "Optics", "Fluid Dynamics", "Condensed Matter Physics",
      ],
      concepts: {
        quantummechanics: [
          "Wave-particle duality shows that quantum entities exhibit both wave-like and particle-like behavior depending on the experiment.",
          "The Schrödinger equation describes how the quantum state of a physical system evolves over time.",
          "Heisenberg's uncertainty principle states that position and momentum cannot both be precisely measured simultaneously.",
          "Quantum entanglement links particles such that measuring one instantly affects the other, regardless of distance.",
        ],
        electromagnetism: [
          "Maxwell's equations unify electricity and magnetism, predicting electromagnetic waves that travel at the speed of light.",
          "Coulomb's law describes the force between electric charges, while the Biot-Savart law describes magnetic fields from currents.",
          "Electromagnetic induction (Faraday's law) is the principle behind generators, transformers, and wireless charging.",
          "Electromagnetic radiation spans the spectrum from radio waves to gamma rays, with visible light in a narrow band.",
        ],
        thermodynamics: [
          "The first law of thermodynamics states that energy cannot be created or destroyed, only transformed between forms.",
          "Entropy (second law) measures disorder in a system and always increases in an isolated system.",
          "The third law states that entropy approaches zero as temperature approaches absolute zero.",
          "Heat engines, refrigerators, and heat pumps are practical applications of thermodynamic cycles like Carnot and Rankine.",
        ],
      },
    },
    chemistry: {
      keywords: [
        "chemistry", "chemical", "molecule", "atom", "reaction",
        "organic chemistry", "inorganic chemistry", "physical chemistry",
        "analytical chemistry", "biochemistry", "materials chemistry",
        "environmental chemistry", "medicinal chemistry", "polymer chemistry",
        "electrochemistry", "spectroscopy", "periodic table", "compound",
        "element", "lab", "synthesis", "bonding",
      ],
      topics: [
        "Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry",
        "Analytical Chemistry", "Biochemistry", "Materials Chemistry",
        "Environmental Chemistry", "Electrochemistry", "Spectroscopy",
        "Polymer Chemistry",
      ],
      concepts: {
        organicchemistry: [
          "Organic chemistry studies carbon-containing compounds and their reactions, forming the basis of pharmaceutical and materials science.",
          "Functional groups (hydroxyl, carboxyl, amino, etc.) determine the chemical behavior of organic molecules.",
          "Reaction mechanisms describe the step-by-step process of bond breaking and formation in chemical reactions.",
          "Stereochemistry deals with the 3D arrangement of atoms, crucial for understanding drug activity and biological interactions.",
        ],
        physicalchemistry: [
          "Chemical kinetics studies reaction rates and the factors that influence them (temperature, concentration, catalysts).",
          "Chemical equilibrium occurs when forward and reverse reaction rates are equal, described by the equilibrium constant.",
          "Quantum chemistry applies quantum mechanics to understand chemical bonding and molecular electronic structure.",
          "Thermochemistry measures heat changes in chemical reactions, key to understanding energy in chemical processes.",
        ],
      },
    },
    biology: {
      keywords: [
        "biology", "cell", "dna", "genetics", "evolution", "ecology",
        "physiology", "microbiology", "immunology", "neuroscience",
        "developmental biology", "bioinformatics", "biotechnology",
        "molecular biology", "human body", "anatomy", "zoology", "botany", "virology",
      ],
      topics: [
        "Molecular Biology", "Genetics & Genomics", "Cell Biology",
        "Evolutionary Biology", "Ecology", "Microbiology",
        "Immunology", "Neuroscience", "Developmental Biology", "Biotechnology",
      ],
      concepts: {
        molecularbiology: [
          "The central dogma describes information flow from DNA to RNA to protein through transcription and translation.",
          "DNA replication is semi-conservative — each new double helix contains one original and one new strand.",
          "Gene regulation controls when and how much of a gene is expressed, involving promoters, enhancers, and transcription factors.",
          "CRISPR-Cas9 is a revolutionary gene-editing tool that allows precise modifications to DNA sequences.",
        ],
        geneticsgenomics: [
          "Mendelian genetics describes inheritance patterns through dominant and recessive alleles.",
          "Genomics studies entire genomes, enabling personalized medicine and understanding of genetic diseases.",
          "Epigenetics explores heritable changes in gene expression without altering the DNA sequence itself.",
          "Population genetics examines allele frequency changes in populations over time, linking to evolution.",
        ],
      },
    },
    engineering: {
      keywords: [
        "engineering", "mechanical", "electrical", "civil",
        "chemical engineering", "aerospace engineering", "biomedical engineering",
        "environmental engineering", "industrial engineering", "materials engineering",
        "software engineering", "systems engineering", "design", "construction",
        "project", "technical", "robotics", "automation",
      ],
      topics: [
        "Mechanical Engineering", "Electrical Engineering", "Civil Engineering",
        "Aerospace Engineering", "Biomedical Engineering", "Software Engineering",
        "Environmental Engineering", "Robotics & Automation", "Materials Engineering",
        "Systems Engineering",
      ],
      concepts: {
        mechanicalengineering: [
          "Statics and dynamics analyze forces on structures and moving bodies, fundamental to machine design.",
          "Thermodynamics and heat transfer principles are essential for designing engines, HVAC systems, and energy systems.",
          "Materials science studies the properties of metals, polymers, ceramics, and composites for engineering applications.",
          "CAD/CAM software enables precise 3D modeling and manufacturing of mechanical components.",
        ],
        electricalengineering: [
          "Circuit analysis using Kirchhoff's laws and Ohm's law forms the foundation of electrical engineering.",
          "Digital logic design uses Boolean algebra and logic gates to build processors and digital systems.",
          "Signal processing transforms and analyzes signals for communications, audio, and image processing applications.",
          "Power systems engineering deals with generation, transmission, and distribution of electrical energy.",
        ],
      },
    },
  },
  studyTips: [
    "Use active recall — test yourself instead of passively re-reading notes.",
    "Space out your study sessions using spaced repetition for better long-term retention.",
    "Teach what you've learned to someone else; it's one of the most effective ways to solidify knowledge.",
    "Break study sessions into 25-minute Pomodoro intervals with short breaks in between.",
    "Create mind maps or concept diagrams to visualize connections between ideas.",
    "Review material within 24 hours of learning it to strengthen memory consolidation.",
    "Use practice problems and past exams as your primary study tool.",
    "Study in different locations to create varied memory cues and improve recall.",
  ],
  examTips: [
    "Start reviewing early — cramming the night before is far less effective than distributed practice.",
    "Practice with past exam papers under timed conditions to simulate the real experience.",
    "Focus on understanding concepts rather than memorizing facts — deep understanding enables flexible problem-solving.",
    "Get a good night's sleep before the exam; sleep is critical for memory consolidation.",
    "Read all questions carefully before starting and allocate time proportional to marks.",
    "For multiple-choice questions, eliminate obviously wrong answers first to improve your odds.",
    "Show your working in calculation-based exams — partial credit can significantly boost your grade.",
    "Stay calm and manage anxiety with deep breathing techniques before and during the exam.",
  ],
  researchTips: [
    "Start with a clear, focused research question — broad topics lead to scattered efforts.",
    "Use academic databases like Google Scholar, PubMed, and IEEE Xplore for credible sources.",
    "Keep a detailed research journal to track your findings, methodology, and evolving ideas.",
    "Learn to critically evaluate sources — check methodology, sample size, peer-review status, and potential biases.",
    "Use reference management tools like Zotero or Mendeley to organize your citations.",
    "Write as you research — don't wait until you've finished all reading to start writing.",
    "Seek feedback from your advisor or peers regularly to stay on track.",
    "Familiarize yourself with your field's citation style (APA, MLA, Chicago, IEEE) early on.",
  ],
}
