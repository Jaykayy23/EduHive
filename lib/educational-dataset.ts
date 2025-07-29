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
