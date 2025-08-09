// brainforge/lib/utils.ts

export const getQuestionTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "mcq":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "true_false":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "fill_in":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

export const formatQuestionType = (type: string) => {
  switch (type.toLowerCase()) {
    case "mcq":
      return "Multiple Choice";
    case "true_false":
      return "True/False";
    case "fill_in":
      return "Fill in the Blank";
    default:
      return type;
  }
};

/**
 * Shuffles an array in-place using the Fisher-Yates algorithm and returns it.
 * @param array The array to shuffle.
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};
