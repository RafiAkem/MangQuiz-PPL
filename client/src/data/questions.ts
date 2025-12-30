import { Question } from '../types/game';

export const CATEGORIES = [
  'Ancient History',
  'Medieval History',
  'Modern History',
  'World Wars',
  'American History',
  'European History',
  'Asian History',
  'General History'
];

export const QUESTIONS: Question[] = [
  // Ancient History
  {
    id: '1',
    category: 'Ancient History',
    question: 'Who was the first emperor of Rome?',
    options: ['Julius Caesar', 'Augustus', 'Nero', 'Trajan'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'Augustus (originally named Octavian) became the first Roman Emperor in 27 BCE.'
  },
  {
    id: '2',
    category: 'Ancient History',
    question: 'Which ancient wonder was located in Alexandria?',
    options: ['Colossus of Rhodes', 'Lighthouse of Alexandria', 'Hanging Gardens', 'Statue of Zeus'],
    correctAnswer: 1,
    difficulty: 'easy',
    explanation: 'The Lighthouse of Alexandria was one of the Seven Wonders of the Ancient World.'
  },
  {
    id: '3',
    category: 'Ancient History',
    question: 'In which year did Alexander the Great die?',
    options: ['336 BCE', '323 BCE', '301 BCE', '315 BCE'],
    correctAnswer: 1,
    difficulty: 'hard',
    explanation: 'Alexander the Great died in 323 BCE in Babylon at the age of 32.'
  },

  // Medieval History
  {
    id: '4',
    category: 'Medieval History',
    question: 'When did the Battle of Hastings take place?',
    options: ['1066', '1067', '1065', '1068'],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'The Battle of Hastings occurred on October 14, 1066, marking the Norman conquest of England.'
  },
  {
    id: '5',
    category: 'Medieval History',
    question: 'Who led the First Crusade?',
    options: ['Richard the Lionheart', 'Godfrey of Bouillon', 'Saladin', 'Frederick Barbarossa'],
    correctAnswer: 1,
    difficulty: 'hard',
    explanation: 'Godfrey of Bouillon was one of the principal leaders of the First Crusade (1096-1099).'
  },
  {
    id: '6',
    category: 'Medieval History',
    question: 'Which empire was ruled by Charlemagne?',
    options: ['Byzantine Empire', 'Holy Roman Empire', 'Carolingian Empire', 'Ottoman Empire'],
    correctAnswer: 2,
    difficulty: 'medium',
    explanation: 'Charlemagne ruled the Carolingian Empire and was crowned Emperor in 800 CE.'
  },

  // Modern History
  {
    id: '7',
    category: 'Modern History',
    question: 'When did the French Revolution begin?',
    options: ['1788', '1789', '1790', '1791'],
    correctAnswer: 1,
    difficulty: 'easy',
    explanation: 'The French Revolution began in 1789 with the storming of the Bastille on July 14.'
  },
  {
    id: '8',
    category: 'Modern History',
    question: 'Who was the first person to walk on the moon?',
    options: ['Buzz Aldrin', 'Neil Armstrong', 'John Glenn', 'Alan Shepard'],
    correctAnswer: 1,
    difficulty: 'easy',
    explanation: 'Neil Armstrong was the first person to walk on the moon on July 20, 1969.'
  },
  {
    id: '9',
    category: 'Modern History',
    question: 'In which year did the Berlin Wall fall?',
    options: ['1987', '1988', '1989', '1990'],
    correctAnswer: 2,
    difficulty: 'medium',
    explanation: 'The Berlin Wall fell on November 9, 1989, marking a key moment in the end of the Cold War.'
  },

  // World Wars
  {
    id: '10',
    category: 'World Wars',
    question: 'Which event triggered World War I?',
    options: ['Invasion of Poland', 'Attack on Pearl Harbor', 'Assassination of Archduke Franz Ferdinand', 'Sinking of Lusitania'],
    correctAnswer: 2,
    difficulty: 'medium',
    explanation: 'The assassination of Archduke Franz Ferdinand in Sarajevo on June 28, 1914, triggered WWI.'
  },
  {
    id: '11',
    category: 'World Wars',
    question: 'When did D-Day occur?',
    options: ['June 6, 1944', 'June 4, 1944', 'July 6, 1944', 'May 6, 1944'],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'D-Day, the Allied invasion of Normandy, occurred on June 6, 1944.'
  },
  {
    id: '12',
    category: 'World Wars',
    question: 'Which city was the target of the first atomic bomb?',
    options: ['Nagasaki', 'Tokyo', 'Hiroshima', 'Osaka'],
    correctAnswer: 2,
    difficulty: 'easy',
    explanation: 'Hiroshima was the target of the first atomic bomb on August 6, 1945.'
  },

  // American History
  {
    id: '13',
    category: 'American History',
    question: 'Who was the first President of the United States?',
    options: ['Thomas Jefferson', 'John Adams', 'George Washington', 'Benjamin Franklin'],
    correctAnswer: 2,
    difficulty: 'easy',
    explanation: 'George Washington was the first President of the United States (1789-1797).'
  },
  {
    id: '14',
    category: 'American History',
    question: 'When did the American Civil War end?',
    options: ['1864', '1865', '1866', '1867'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'The American Civil War ended in 1865 with the surrender at Appomattox Court House.'
  },
  {
    id: '15',
    category: 'American History',
    question: 'Which purchase doubled the size of the United States?',
    options: ['Alaska Purchase', 'Louisiana Purchase', 'Gadsden Purchase', 'Texas Annexation'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'The Louisiana Purchase in 1803 doubled the size of the United States.'
  },

  // European History
  {
    id: '16',
    category: 'European History',
    question: 'Who was known as the "Iron Chancellor"?',
    options: ['Otto von Bismarck', 'Klemens von Metternich', 'Napoleon Bonaparte', 'Winston Churchill'],
    correctAnswer: 0,
    difficulty: 'hard',
    explanation: 'Otto von Bismarck was known as the "Iron Chancellor" for his role in unifying Germany.'
  },
  {
    id: '17',
    category: 'European History',
    question: 'When did the Soviet Union collapse?',
    options: ['1989', '1990', '1991', '1992'],
    correctAnswer: 2,
    difficulty: 'medium',
    explanation: 'The Soviet Union officially collapsed on December 26, 1991.'
  },
  {
    id: '18',
    category: 'European History',
    question: 'Which treaty ended World War I?',
    options: ['Treaty of Versailles', 'Treaty of Paris', 'Treaty of Vienna', 'Treaty of Westphalia'],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'The Treaty of Versailles, signed in 1919, officially ended World War I.'
  },

  // Asian History
  {
    id: '19',
    category: 'Asian History',
    question: 'Which dynasty built the Great Wall of China?',
    options: ['Han Dynasty', 'Tang Dynasty', 'Ming Dynasty', 'Qin Dynasty'],
    correctAnswer: 3,
    difficulty: 'medium',
    explanation: 'The Qin Dynasty began construction of the Great Wall, though it was later rebuilt by the Ming Dynasty.'
  },
  {
    id: '20',
    category: 'Asian History',
    question: 'Who was the founder of the Mongol Empire?',
    options: ['Kublai Khan', 'Genghis Khan', 'Ögedei Khan', 'Möngke Khan'],
    correctAnswer: 1,
    difficulty: 'easy',
    explanation: 'Genghis Khan founded the Mongol Empire in 1206.'
  },
  {
    id: '21',
    category: 'Asian History',
    question: 'When did Japan attack Pearl Harbor?',
    options: ['December 7, 1941', 'December 6, 1941', 'December 8, 1941', 'December 5, 1941'],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'Japan attacked Pearl Harbor on December 7, 1941, bringing the US into World War II.'
  },

  // General History
  {
    id: '22',
    category: 'General History',
    question: 'Which empire was largest in history by land area?',
    options: ['Roman Empire', 'British Empire', 'Mongol Empire', 'Ottoman Empire'],
    correctAnswer: 2,
    difficulty: 'medium',
    explanation: 'The Mongol Empire was the largest contiguous land empire in history.'
  },
  {
    id: '23',
    category: 'General History',
    question: 'When was the printing press invented?',
    options: ['1440s', '1450s', '1460s', '1470s'],
    correctAnswer: 0,
    difficulty: 'hard',
    explanation: 'Johannes Gutenberg invented the printing press around 1440.'
  },
  {
    id: '24',
    category: 'General History',
    question: 'Which explorer completed the first circumnavigation of the globe?',
    options: ['Christopher Columbus', 'Vasco da Gama', 'Ferdinand Magellan', 'Juan Sebastián Elcano'],
    correctAnswer: 3,
    difficulty: 'hard',
    explanation: 'Juan Sebastián Elcano completed the first circumnavigation after Magellan died during the voyage.'
  },
  {
    id: '25',
    category: 'General History',
    question: 'In which century did the Renaissance begin?',
    options: ['13th century', '14th century', '15th century', '16th century'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'The Renaissance began in the 14th century in Italy.'
  }
];

export const getRandomQuestions = (count: number, categories?: string[]): Question[] => {
  let availableQuestions = QUESTIONS;
  
  if (categories && categories.length > 0) {
    availableQuestions = QUESTIONS.filter(q => categories.includes(q.category));
  }
  
  const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};
