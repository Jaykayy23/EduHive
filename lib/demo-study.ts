export interface DemoQuestion {
  id: string;
  type: "Multiple choice" | "True or false" | "Fill in the blank";
  prompt: string;
  options?: readonly string[];
  answer: string;
  explanation: string;
}

export interface DemoSample {
  id: string;
  title: string;
  subject: string;
  source: string;
  questions: readonly DemoQuestion[];
}

export type DemoAnswers = Record<string, string>;

export const DEMO_SAMPLES: readonly DemoSample[] = [
  {
    id: "biology",
    title: "Small structures. Big jobs.",
    subject: "Cell biology",
    source:
      "Cells are the basic structural units of living organisms. In eukaryotic cells, mitochondria produce most ATP through cellular respiration. Plant cells and many algae contain chloroplasts, where photosynthesis converts light energy into chemical energy. Some bacteria also photosynthesize, so photosynthesis is not exclusive to plant cells. The cell membrane regulates the movement of substances into and out of a cell.",
    questions: [
      {
        id: "bio-1",
        type: "Multiple choice",
        prompt: "What is the main role of mitochondria in eukaryotic cells?",
        options: [
          "Store genetic information",
          "Produce ATP through cellular respiration",
          "Control what enters the cell",
        ],
        answer: "Produce ATP through cellular respiration",
        explanation:
          "Mitochondria generate most of a eukaryotic cell's ATP through cellular respiration. ATP supplies energy for many cellular processes.",
      },
      {
        id: "bio-2",
        type: "True or false",
        prompt: "Photosynthesis occurs only in plant cells.",
        options: ["True", "False"],
        answer: "False",
        explanation:
          "Many algae and some bacteria also photosynthesize. The source passage explicitly includes these organisms.",
      },
      {
        id: "bio-3",
        type: "Fill in the blank",
        prompt: "The cell ________ regulates what enters and leaves the cell.",
        answer: "membrane",
        explanation:
          "The cell membrane is selectively permeable: it controls the movement of substances into and out of the cell.",
      },
    ],
  },
  {
    id: "computing",
    title: "Make the web make sense.",
    subject: "Web fundamentals",
    source:
      "A browser requests a web page from a server using HTTP. HTTPS adds encryption through TLS, protecting data while it travels between the browser and server. HTML describes the structure of a document, CSS controls its presentation, and JavaScript can add interactive behavior. A server must validate permissions before returning private data; hiding a button in a browser is not an access-control mechanism.",
    questions: [
      {
        id: "web-1",
        type: "Multiple choice",
        prompt: "Which technology describes a web document's structure?",
        options: ["CSS", "HTML", "TLS"],
        answer: "HTML",
        explanation:
          "HTML defines document structure and meaning. CSS handles presentation, while TLS protects data in transit.",
      },
      {
        id: "web-2",
        type: "True or false",
        prompt: "Hiding a button is enough to protect private server data.",
        options: ["True", "False"],
        answer: "False",
        explanation:
          "The server must validate permissions. A person can send a request without using the visible page controls.",
      },
      {
        id: "web-3",
        type: "Fill in the blank",
        prompt: "HTTPS protects data in transit using ________.",
        answer: "TLS",
        explanation:
          "TLS encrypts the connection between browser and server. HTTPS is HTTP over a TLS-protected connection.",
      },
    ],
  },
];

export function isDemoAnswerCorrect(
  question: DemoQuestion,
  answer = "",
): boolean {
  return answer.trim().toLowerCase() === question.answer.trim().toLowerCase();
}

export function scoreDemo(
  questions: readonly DemoQuestion[],
  answers: DemoAnswers,
) {
  return {
    correct: questions.filter((q) => isDemoAnswerCorrect(q, answers[q.id]))
      .length,
    answered: questions.filter((q) => (answers[q.id] ?? "").trim().length > 0)
      .length,
    total: questions.length,
  };
}

export function createDemoExport(sample: DemoSample, answers: DemoAnswers) {
  return {
    kind: "eduhive-fixed-sample",
    liveGeneration: false,
    subject: sample.subject,
    source: sample.source,
    score: scoreDemo(sample.questions, answers),
    questions: sample.questions.map((q) => ({
      ...q,
      yourAnswer: answers[q.id] ?? "",
      correct: isDemoAnswerCorrect(q, answers[q.id]),
    })),
  };
}
