export interface Quote {
  text: string
  author: string
}

export const QUOTES: Quote[] = [
  {
    text: "Again and again I will suffer; again and again I will get back on my feet. I will not be defeated. I won't let my spirit be destroyed.",
    author: 'Mahoko Yoshimoto',
  },
  {
    text: "Fall seven times, stand up eight.",
    author: 'Unknown',
  },
  {
    text: "The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.",
    author: 'Albert Camus',
  },
  {
    text: "There are years that ask questions and years that answer.",
    author: 'Zora Neale Hurston',
  },
  {
    text: "The world breaks everyone, and afterward, many are strong at the broken places.",
    author: 'Ernest Hemingway',
  },
]

export function getRandomQuote(): Quote {
  const index = Math.floor(Math.random() * QUOTES.length)
  return QUOTES[index]
}
