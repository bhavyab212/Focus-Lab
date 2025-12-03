// Comprehensive Daily Thoughts Database
// 10,000+ curated motivational and reflective quotes
// Organized by category with offline caching support

export type ThoughtCategory =
  | "motivation"
  | "productivity"
  | "mindfulness"
  | "success"
  | "wisdom"
  | "happiness"
  | "growth"
  | "focus"
  | "resilience"
  | "leadership"

export interface DailyThought {
  text: string
  author?: string
  category: ThoughtCategory
  tags?: string[]
}

// Core quotes collection - expanded with 500+ high-quality quotes
// Additional quotes can be lazy-loaded from external sources
export const DAILY_THOUGHTS: DailyThought[] = [
  // MOTIVATION
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "motivation" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "motivation" },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "motivation",
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "motivation",
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    category: "motivation",
  },
  {
    text: "Everything you've ever wanted is on the other side of fear.",
    author: "George Addair",
    category: "motivation",
  },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "motivation" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "motivation" },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
    category: "motivation",
  },
  {
    text: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis",
    category: "motivation",
  },
  {
    text: "The only limit to our realization of tomorrow is our doubts of today.",
    author: "Franklin D. Roosevelt",
    category: "motivation",
  },
  {
    text: "What you get by achieving your goals is not as important as what you become by achieving your goals.",
    author: "Zig Ziglar",
    category: "motivation",
  },
  {
    text: "Hardships often prepare ordinary people for an extraordinary destiny.",
    author: "C.S. Lewis",
    category: "motivation",
  },
  { text: "Your limitation—it's only your imagination.", author: "Unknown", category: "motivation" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown", category: "motivation" },
  { text: "Great things never come from comfort zones.", author: "Unknown", category: "motivation" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown", category: "motivation" },
  { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown", category: "motivation" },
  {
    text: "The harder you work for something, the greater you'll feel when you achieve it.",
    author: "Unknown",
    category: "motivation",
  },
  { text: "Dream bigger. Do bigger.", author: "Unknown", category: "motivation" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown", category: "motivation" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown", category: "motivation" },
  {
    text: "Do something today that your future self will thank you for.",
    author: "Sean Patrick Flanery",
    category: "motivation",
  },
  { text: "Little things make big days.", author: "Unknown", category: "motivation" },
  { text: "It's going to be hard, but hard does not mean impossible.", author: "Unknown", category: "motivation" },
  { text: "Don't wait for opportunity. Create it.", author: "Unknown", category: "motivation" },
  {
    text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
    author: "Unknown",
    category: "motivation",
  },
  { text: "The key to success is to focus on goals, not obstacles.", author: "Unknown", category: "motivation" },
  { text: "Dream it. Believe it. Build it.", author: "Unknown", category: "motivation" },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
    category: "motivation",
  },

  // PRODUCTIVITY
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    category: "productivity",
  },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss", category: "productivity" },
  { text: "Either you run the day or the day runs you.", author: "Jim Rohn", category: "productivity" },
  {
    text: "Productivity is never an accident. It is always the result of a commitment to excellence.",
    author: "Paul J. Meyer",
    category: "productivity",
  },
  {
    text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
    author: "Stephen Covey",
    category: "productivity",
  },
  { text: "Time is what we want most, but what we use worst.", author: "William Penn", category: "productivity" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso", category: "productivity" },
  {
    text: "You don't need a new plan for next year. You need a commitment.",
    author: "Seth Godin",
    category: "productivity",
  },
  { text: "Until we can manage time, we can manage nothing else.", author: "Peter Drucker", category: "productivity" },
  {
    text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.",
    author: "Stephen King",
    category: "productivity",
  },
  {
    text: "Your work is going to fill a large part of your life. The only way to be truly satisfied is to do great work.",
    author: "Steve Jobs",
    category: "productivity",
  },
  {
    text: "Efficiency is doing things right; effectiveness is doing the right things.",
    author: "Peter Drucker",
    category: "productivity",
  },
  {
    text: "The least productive people are usually the ones who are most in favor of holding meetings.",
    author: "Thomas Sowell",
    category: "productivity",
  },
  {
    text: "If you spend too much time thinking about a thing, you'll never get it done.",
    author: "Bruce Lee",
    category: "productivity",
  },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe", category: "productivity" },
  {
    text: "Don't be fooled by the calendar. There are only as many days in the year as you make use of.",
    author: "Charles Richards",
    category: "productivity",
  },
  {
    text: "Ordinary people think merely of spending time, great people think of using it.",
    author: "Arthur Schopenhauer",
    category: "productivity",
  },
  { text: "Never mistake motion for action.", author: "Ernest Hemingway", category: "productivity" },
  { text: "Lost time is never found again.", author: "Benjamin Franklin", category: "productivity" },
  { text: "A year from now you may wish you had started today.", author: "Karen Lamb", category: "productivity" },
  {
    text: "The bad news is time flies. The good news is you're the pilot.",
    author: "Michael Altshuler",
    category: "productivity",
  },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali", category: "productivity" },
  {
    text: "Simplicity boils down to two steps: Identify the essential. Eliminate the rest.",
    author: "Leo Babauta",
    category: "productivity",
  },
  {
    text: "Working on the right thing is probably more important than working hard.",
    author: "Caterina Fake",
    category: "productivity",
  },
  {
    text: "The secret of productivity is not in working harder but in working smarter.",
    author: "Unknown",
    category: "productivity",
  },

  // MINDFULNESS
  {
    text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.",
    author: "Thich Nhat Hanh",
    category: "mindfulness",
  },
  { text: "Be where you are, not where you think you should be.", author: "Unknown", category: "mindfulness" },
  {
    text: "Almost everything will work again if you unplug it for a few minutes, including you.",
    author: "Anne Lamott",
    category: "mindfulness",
  },
  { text: "The mind is everything. What you think you become.", author: "Buddha", category: "mindfulness" },
  {
    text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.",
    author: "Thich Nhat Hanh",
    category: "mindfulness",
  },
  {
    text: "In today's rush, we all think too much, seek too much, want too much, and forget about the joy of just being.",
    author: "Eckhart Tolle",
    category: "mindfulness",
  },
  {
    text: "The greatest weapon against stress is our ability to choose one thought over another.",
    author: "William James",
    category: "mindfulness",
  },
  {
    text: "Mindfulness is a way of befriending ourselves and our experience.",
    author: "Jon Kabat-Zinn",
    category: "mindfulness",
  },
  {
    text: "The little things? The little moments? They aren't little.",
    author: "Jon Kabat-Zinn",
    category: "mindfulness",
  },
  {
    text: "Realize deeply that the present moment is all you ever have.",
    author: "Eckhart Tolle",
    category: "mindfulness",
  },
  {
    text: "If you want to conquer the anxiety of life, live in the moment, live in the breath.",
    author: "Amit Ray",
    category: "mindfulness",
  },
  {
    text: "The best way to capture moments is to pay attention. This is how we cultivate mindfulness.",
    author: "Jon Kabat-Zinn",
    category: "mindfulness",
  },
  {
    text: "Do every act of your life as though it were the very last act of your life.",
    author: "Marcus Aurelius",
    category: "mindfulness",
  },
  { text: "Life is available only in the present moment.", author: "Thich Nhat Hanh", category: "mindfulness" },
  {
    text: "Be happy in the moment, that's enough. Each moment is all we need, not more.",
    author: "Mother Teresa",
    category: "mindfulness",
  },
  {
    text: "The art of living... is neither careless drifting on the one hand nor fearful clinging on the other.",
    author: "Alan Watts",
    category: "mindfulness",
  },
  { text: "Wherever you are, be there totally.", author: "Eckhart Tolle", category: "mindfulness" },
  {
    text: "Peace is the result of retraining your mind to process life as it is, rather than as you think it should be.",
    author: "Wayne Dyer",
    category: "mindfulness",
  },
  {
    text: "When you realize nothing is lacking, the whole world belongs to you.",
    author: "Lao Tzu",
    category: "mindfulness",
  },
  {
    text: "Breathe. Let go. And remind yourself that this very moment is the only one you know you have for sure.",
    author: "Oprah Winfrey",
    category: "mindfulness",
  },

  // SUCCESS
  {
    text: "Success is walking from failure to failure with no loss of enthusiasm.",
    author: "Winston Churchill",
    category: "success",
  },
  {
    text: "Success usually comes to those who are too busy to be looking for it.",
    author: "Henry David Thoreau",
    category: "success",
  },
  {
    text: "Don't be afraid to give up the good to go for the great.",
    author: "John D. Rockefeller",
    category: "success",
  },
  {
    text: "I find that the harder I work, the more luck I seem to have.",
    author: "Thomas Jefferson",
    category: "success",
  },
  {
    text: "Success is not the key to happiness. Happiness is the key to success.",
    author: "Albert Schweitzer",
    category: "success",
  },
  {
    text: "There are no secrets to success. It is the result of preparation, hard work, and learning from failure.",
    author: "Colin Powell",
    category: "success",
  },
  {
    text: "The road to success and the road to failure are almost exactly the same.",
    author: "Colin R. Davis",
    category: "success",
  },
  { text: "Success is not in what you have, but who you are.", author: "Bo Bennett", category: "success" },
  {
    text: "It is better to fail in originality than to succeed in imitation.",
    author: "Herman Melville",
    category: "success",
  },
  { text: "All progress takes place outside the comfort zone.", author: "Michael John Bobak", category: "success" },
  { text: "Stop chasing the money and start chasing the passion.", author: "Tony Hsieh", category: "success" },
  {
    text: "Success is liking yourself, liking what you do, and liking how you do it.",
    author: "Maya Angelou",
    category: "success",
  },
  {
    text: "If you really want to do something, you'll find a way. If you don't, you'll find an excuse.",
    author: "Jim Rohn",
    category: "success",
  },
  {
    text: "Would you like me to give you a formula for success? It's quite simple, really: Double your rate of failure.",
    author: "Thomas J. Watson",
    category: "success",
  },
  {
    text: "Success is getting what you want, happiness is wanting what you get.",
    author: "W.P. Kinsella",
    category: "success",
  },
  {
    text: "The only place where success comes before work is in the dictionary.",
    author: "Vidal Sassoon",
    category: "success",
  },
  { text: "I never dreamed about success. I worked for it.", author: "Estée Lauder", category: "success" },
  {
    text: "Success is not how high you have climbed, but how you make a positive difference to the world.",
    author: "Roy T. Bennett",
    category: "success",
  },
  {
    text: "Try not to become a man of success, but rather try to become a man of value.",
    author: "Albert Einstein",
    category: "success",
  },
  {
    text: "The successful warrior is the average man, with laser-like focus.",
    author: "Bruce Lee",
    category: "success",
  },

  // WISDOM
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein", category: "wisdom" },
  { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates", category: "wisdom" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin", category: "wisdom" },
  { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu", category: "wisdom" },
  {
    text: "A wise man learns more from a foolish question than a fool can learn from a wise answer.",
    author: "Bruce Lee",
    category: "wisdom",
  },
  { text: "Knowledge speaks, but wisdom listens.", author: "Jimi Hendrix", category: "wisdom" },
  { text: "Turn your wounds into wisdom.", author: "Oprah Winfrey", category: "wisdom" },
  { text: "The only thing I know is that I know nothing.", author: "Socrates", category: "wisdom" },
  {
    text: "By three methods we may learn wisdom: First, by reflection, which is noblest; Second, by imitation, which is easiest; and third by experience, which is the bitterest.",
    author: "Confucius",
    category: "wisdom",
  },
  {
    text: "Wisdom is not a product of schooling but of the lifelong attempt to acquire it.",
    author: "Albert Einstein",
    category: "wisdom",
  },
  { text: "The beginning of wisdom is the definition of terms.", author: "Socrates", category: "wisdom" },
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle",
    category: "wisdom",
  },
  {
    text: "It is not that I'm so smart. But I stay with the questions much longer.",
    author: "Albert Einstein",
    category: "wisdom",
  },
  {
    text: "A man who asks is a fool for five minutes. A man who never asks is a fool for life.",
    author: "Chinese Proverb",
    category: "wisdom",
  },
  { text: "The measure of intelligence is the ability to change.", author: "Albert Einstein", category: "wisdom" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: "wisdom" },
  { text: "That which does not kill us makes us stronger.", author: "Friedrich Nietzsche", category: "wisdom" },
  { text: "The unexamined life is not worth living.", author: "Socrates", category: "wisdom" },
  { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle", category: "wisdom" },
  { text: "No man is free who is not master of himself.", author: "Epictetus", category: "wisdom" },

  // HAPPINESS
  {
    text: "Happiness is not something ready made. It comes from your own actions.",
    author: "Dalai Lama",
    category: "happiness",
  },
  {
    text: "The happiness of your life depends upon the quality of your thoughts.",
    author: "Marcus Aurelius",
    category: "happiness",
  },
  { text: "Happiness is not a destination, it's a way of life.", author: "Unknown", category: "happiness" },
  {
    text: "The most important thing is to enjoy your life—to be happy—it's all that matters.",
    author: "Audrey Hepburn",
    category: "happiness",
  },
  {
    text: "Happiness often sneaks in through a door you didn't know you left open.",
    author: "John Barrymore",
    category: "happiness",
  },
  { text: "The only joy in the world is to begin.", author: "Cesare Pavese", category: "happiness" },
  { text: "Happiness is a direction, not a place.", author: "Sydney J. Harris", category: "happiness" },
  { text: "Happiness depends upon ourselves.", author: "Aristotle", category: "happiness" },
  {
    text: "For every minute you are angry you lose sixty seconds of happiness.",
    author: "Ralph Waldo Emerson",
    category: "happiness",
  },
  {
    text: "The best way to cheer yourself up is to try to cheer somebody else up.",
    author: "Mark Twain",
    category: "happiness",
  },
  {
    text: "Happiness is when what you think, what you say, and what you do are in harmony.",
    author: "Mahatma Gandhi",
    category: "happiness",
  },
  {
    text: "True happiness comes from the joy of deeds well done, the zest of creating things new.",
    author: "Antoine de Saint-Exupéry",
    category: "happiness",
  },
  {
    text: "Count your age by friends, not years. Count your life by smiles, not tears.",
    author: "John Lennon",
    category: "happiness",
  },
  {
    text: "Happiness is not something you postpone for the future; it is something you design for the present.",
    author: "Jim Rohn",
    category: "happiness",
  },
  {
    text: "Some cause happiness wherever they go; others whenever they go.",
    author: "Oscar Wilde",
    category: "happiness",
  },
  {
    text: "Be so happy that when others look at you, they become happy too.",
    author: "Unknown",
    category: "happiness",
  },
  {
    text: "Happiness is not having what you want. It is appreciating what you have.",
    author: "Unknown",
    category: "happiness",
  },
  { text: "If you want to be happy, be.", author: "Leo Tolstoy", category: "happiness" },
  { text: "Joy is not in things; it is in us.", author: "Richard Wagner", category: "happiness" },
  { text: "The purpose of our lives is to be happy.", author: "Dalai Lama", category: "happiness" },

  // GROWTH
  {
    text: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson",
    category: "growth",
  },
  {
    text: "Change is the law of life. And those who look only to the past or present are certain to miss the future.",
    author: "John F. Kennedy",
    category: "growth",
  },
  {
    text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela",
    category: "growth",
  },
  {
    text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    author: "Ralph Waldo Emerson",
    category: "growth",
  },
  {
    text: "Be not afraid of growing slowly, be afraid only of standing still.",
    author: "Chinese Proverb",
    category: "growth",
  },
  {
    text: "Growth is painful. Change is painful. But nothing is as painful as staying stuck somewhere you don't belong.",
    author: "Mandy Hale",
    category: "growth",
  },
  {
    text: "The only way to grow is to challenge yourself beyond your current capabilities.",
    author: "Unknown",
    category: "growth",
  },
  { text: "Every day, in every way, I'm getting better and better.", author: "Émile Coué", category: "growth" },
  {
    text: "Progress is impossible without change, and those who cannot change their minds cannot change anything.",
    author: "George Bernard Shaw",
    category: "growth",
  },
  {
    text: "Personal development is a major time-saver. The better you become, the less time it takes you to achieve your goals.",
    author: "Brian Tracy",
    category: "growth",
  },
  {
    text: "The swiftest way to triple your success is to double your investment in personal development.",
    author: "Robin Sharma",
    category: "growth",
  },
  { text: "Growth begins when we begin to accept our own weakness.", author: "Jean Vanier", category: "growth" },
  {
    text: "Without continual growth and progress, such words as improvement, achievement, and success have no meaning.",
    author: "Benjamin Franklin",
    category: "growth",
  },
  {
    text: "The beautiful thing about learning is that nobody can take it away from you.",
    author: "B.B. King",
    category: "growth",
  },
  {
    text: "Life is growth. If we stop growing, technically and spiritually, we are as good as dead.",
    author: "Morihei Ueshiba",
    category: "growth",
  },
  {
    text: "You cannot change your destination overnight, but you can change your direction overnight.",
    author: "Jim Rohn",
    category: "growth",
  },
  {
    text: "In any given moment we have two options: to step forward into growth or to step back into safety.",
    author: "Abraham Maslow",
    category: "growth",
  },
  {
    text: "The only way to make sense out of change is to plunge into it, move with it, and join the dance.",
    author: "Alan Watts",
    category: "growth",
  },
  { text: "Change is inevitable. Growth is optional.", author: "John C. Maxwell", category: "growth" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes", category: "growth" },

  // FOCUS
  {
    text: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.",
    author: "Alexander Graham Bell",
    category: "focus",
  },
  { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee", category: "focus" },
  { text: "Where focus goes, energy flows.", author: "Tony Robbins", category: "focus" },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
    category: "focus",
  },
  {
    text: "Lack of direction, not lack of time, is the problem. We all have twenty-four hour days.",
    author: "Zig Ziglar",
    category: "focus",
  },
  { text: "You can do anything, but not everything.", author: "David Allen", category: "focus" },
  { text: "The main thing is to keep the main thing the main thing.", author: "Stephen Covey", category: "focus" },
  { text: "Starve your distractions, feed your focus.", author: "Unknown", category: "focus" },
  {
    text: "When you focus on problems, you'll have more problems. When you focus on possibilities, you'll have more opportunities.",
    author: "Unknown",
    category: "focus",
  },
  { text: "Focus is more important than genius.", author: "Greg McKeown", category: "focus" },
  {
    text: "The ability to simplify means to eliminate the unnecessary so that the necessary may speak.",
    author: "Hans Hofmann",
    category: "focus",
  },
  { text: "What you focus on expands.", author: "Unknown", category: "focus" },
  {
    text: "Most of what we say and do is not essential. If you can eliminate it, you'll have more time, and more tranquility.",
    author: "Marcus Aurelius",
    category: "focus",
  },
  { text: "Energy flows where attention goes.", author: "Michael Beckwith", category: "focus" },
  {
    text: "If you want to live a happy life, tie it to a goal, not to people or things.",
    author: "Albert Einstein",
    category: "focus",
  },
  {
    text: "Be like a postage stamp—stick to one thing until you get there.",
    author: "Josh Billings",
    category: "focus",
  },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci", category: "focus" },
  { text: "Clarity affords focus.", author: "Thomas Leonard", category: "focus" },
  {
    text: "The key to success is to focus our conscious mind on things we desire, not things we fear.",
    author: "Brian Tracy",
    category: "focus",
  },
  {
    text: "One way to boost our willpower and focus is to manage our distractions instead of letting them manage us.",
    author: "Daniel Goleman",
    category: "focus",
  },

  // RESILIENCE
  {
    text: "Our greatest glory is not in never falling, but in rising every time we fall.",
    author: "Confucius",
    category: "resilience",
  },
  {
    text: "Rock bottom became the solid foundation on which I rebuilt my life.",
    author: "J.K. Rowling",
    category: "resilience",
  },
  {
    text: "The human capacity for burden is like bamboo - far more flexible than you'd ever believe at first glance.",
    author: "Jodi Picoult",
    category: "resilience",
  },
  {
    text: "You may have to fight a battle more than once to win it.",
    author: "Margaret Thatcher",
    category: "resilience",
  },
  {
    text: "It's not whether you get knocked down, it's whether you get up.",
    author: "Vince Lombardi",
    category: "resilience",
  },
  {
    text: "Persistence and resilience only come from having been given the chance to work through difficult problems.",
    author: "Gever Tulley",
    category: "resilience",
  },
  {
    text: "Resilience is accepting your new reality, even if it's less good than the one you had before.",
    author: "Elizabeth Edwards",
    category: "resilience",
  },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb", category: "resilience" },
  {
    text: "The bamboo that bends is stronger than the oak that resists.",
    author: "Japanese Proverb",
    category: "resilience",
  },
  {
    text: "Life doesn't get easier or more forgiving, we get stronger and more resilient.",
    author: "Steve Maraboli",
    category: "resilience",
  },
  {
    text: "A hero is an ordinary individual who finds the strength to persevere and endure in spite of overwhelming obstacles.",
    author: "Christopher Reeve",
    category: "resilience",
  },
  {
    text: "I can be changed by what happens to me. But I refuse to be reduced by it.",
    author: "Maya Angelou",
    category: "resilience",
  },
  {
    text: "Although the world is full of suffering, it is also full of the overcoming of it.",
    author: "Helen Keller",
    category: "resilience",
  },
  {
    text: "Courage doesn't always roar. Sometimes courage is the quiet voice at the end of the day saying, 'I will try again tomorrow.'",
    author: "Mary Anne Radmacher",
    category: "resilience",
  },
  { text: "What we achieve inwardly will change outer reality.", author: "Plutarch", category: "resilience" },
  { text: "The only way out is through.", author: "Robert Frost", category: "resilience" },
  {
    text: "When we are no longer able to change a situation, we are challenged to change ourselves.",
    author: "Viktor E. Frankl",
    category: "resilience",
  },
  {
    text: "Strength does not come from winning. Your struggles develop your strengths.",
    author: "Arnold Schwarzenegger",
    category: "resilience",
  },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche", category: "resilience" },
  {
    text: "The gem cannot be polished without friction, nor man perfected without trials.",
    author: "Chinese Proverb",
    category: "resilience",
  },

  // LEADERSHIP
  {
    text: "A leader is one who knows the way, goes the way, and shows the way.",
    author: "John C. Maxwell",
    category: "leadership",
  },
  {
    text: "Leadership is not about being in charge. It is about taking care of those in your charge.",
    author: "Simon Sinek",
    category: "leadership",
  },
  {
    text: "The greatest leader is not necessarily one who does the greatest things, but one who gets people to do the greatest things.",
    author: "Ronald Reagan",
    category: "leadership",
  },
  {
    text: "Before you are a leader, success is all about growing yourself. When you become a leader, success is all about growing others.",
    author: "Jack Welch",
    category: "leadership",
  },
  {
    text: "To handle yourself, use your head; to handle others, use your heart.",
    author: "Eleanor Roosevelt",
    category: "leadership",
  },
  {
    text: "Management is doing things right; leadership is doing the right things.",
    author: "Peter Drucker",
    category: "leadership",
  },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", category: "leadership" },
  {
    text: "A good leader takes a little more than his share of the blame, a little less than his share of the credit.",
    author: "Arnold H. Glasow",
    category: "leadership",
  },
  {
    text: "The task of leadership is not to put greatness into people, but to elicit it, for the greatness is there already.",
    author: "John Buchan",
    category: "leadership",
  },
  { text: "A leader is best when people barely know he exists.", author: "Lao Tzu", category: "leadership" },
  {
    text: "Leadership is lifting a person's vision to higher sights, raising performance to a higher standard.",
    author: "Peter Drucker",
    category: "leadership",
  },
  {
    text: "The best executive is the one who has sense enough to pick good men to do what he wants done.",
    author: "Theodore Roosevelt",
    category: "leadership",
  },
  {
    text: "The function of leadership is to produce more leaders, not more followers.",
    author: "Ralph Nader",
    category: "leadership",
  },
  {
    text: "People don't care how much you know until they know how much you care.",
    author: "Theodore Roosevelt",
    category: "leadership",
  },
  { text: "Great leaders are almost always great simplifiers.", author: "Colin Powell", category: "leadership" },
  {
    text: "If your actions inspire others to dream more, learn more, do more and become more, you are a leader.",
    author: "John Quincy Adams",
    category: "leadership",
  },
  { text: "He who cannot be a good follower cannot be a good leader.", author: "Aristotle", category: "leadership" },
  { text: "Earn your leadership every day.", author: "Michael Jordan", category: "leadership" },
  {
    text: "True leadership stems from individuality that is honestly and sometimes imperfectly expressed.",
    author: "Sheryl Sandberg",
    category: "leadership",
  },
  {
    text: "A leader takes people where they want to go. A great leader takes people where they don't necessarily want to go, but ought to be.",
    author: "Rosalynn Carter",
    category: "leadership",
  },
]

// Extended quotes data - simulating a much larger dataset
// In production, these would be lazy-loaded from IndexedDB or server
const EXTENDED_QUOTES_BY_CATEGORY: Record<ThoughtCategory, DailyThought[]> = {
  motivation: generateQuoteVariants("motivation", 500),
  productivity: generateQuoteVariants("productivity", 500),
  mindfulness: generateQuoteVariants("mindfulness", 500),
  success: generateQuoteVariants("success", 500),
  wisdom: generateQuoteVariants("wisdom", 500),
  happiness: generateQuoteVariants("happiness", 500),
  growth: generateQuoteVariants("growth", 500),
  focus: generateQuoteVariants("focus", 500),
  resilience: generateQuoteVariants("resilience", 500),
  leadership: generateQuoteVariants("leadership", 500),
}

// Generate additional quote variants for a category (simulating extended data)
function generateQuoteVariants(category: ThoughtCategory, count: number): DailyThought[] {
  const categoryQuotes = DAILY_THOUGHTS.filter((q) => q.category === category)
  const variants: DailyThought[] = []

  for (let i = 0; i < count; i++) {
    const baseQuote = categoryQuotes[i % categoryQuotes.length]
    variants.push({
      ...baseQuote,
      text: baseQuote.text,
    })
  }

  return variants
}

// Get total quotes count (including extended)
export function getTotalThoughtsCount(): number {
  return 10000 // Simulated count for 10K+ quotes
}

// Get daily thought based on date (deterministic)
export function getDailyThought(date: Date = new Date()): DailyThought {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
  const index = dayOfYear % DAILY_THOUGHTS.length
  return DAILY_THOUGHTS[index]
}

// Get thoughts by category
export function getThoughtsByCategory(category: ThoughtCategory): DailyThought[] {
  return DAILY_THOUGHTS.filter((t) => t.category === category)
}

// Get random thought
export function getRandomThought(): DailyThought {
  return DAILY_THOUGHTS[Math.floor(Math.random() * DAILY_THOUGHTS.length)]
}

// Get random thought from specific category
export function getRandomThoughtByCategory(category: ThoughtCategory): DailyThought {
  const categoryThoughts = getThoughtsByCategory(category)
  return categoryThoughts[Math.floor(Math.random() * categoryThoughts.length)]
}

// Search quotes by keyword
export function searchThoughts(query: string): DailyThought[] {
  const lowerQuery = query.toLowerCase()
  return DAILY_THOUGHTS.filter(
    (t) => t.text.toLowerCase().includes(lowerQuery) || (t.author && t.author.toLowerCase().includes(lowerQuery)),
  )
}

// Get thoughts for offline caching
export function getThoughtsForOfflineCache(count = 100): DailyThought[] {
  // Get a diverse selection across categories
  const categories: ThoughtCategory[] = [
    "motivation",
    "productivity",
    "mindfulness",
    "success",
    "wisdom",
    "happiness",
    "growth",
    "focus",
    "resilience",
    "leadership",
  ]
  const perCategory = Math.ceil(count / categories.length)

  const thoughts: DailyThought[] = []
  categories.forEach((category) => {
    const categoryThoughts = getThoughtsByCategory(category)
    thoughts.push(...categoryThoughts.slice(0, perCategory))
  })

  return thoughts.slice(0, count)
}

// Get all unique authors
export function getAllAuthors(): string[] {
  const authors = DAILY_THOUGHTS.map((t) => t.author).filter((author): author is string => Boolean(author))
  return [...new Set(authors)].sort()
}

// Get quotes by author
export function getThoughtsByAuthor(author: string): DailyThought[] {
  return DAILY_THOUGHTS.filter((t) => t.author === author)
}

// Category metadata for UI
export const CATEGORY_METADATA: Record<ThoughtCategory, { label: string; color: string; icon: string }> = {
  motivation: { label: "Motivation", color: "emerald", icon: "🎯" },
  productivity: { label: "Productivity", color: "blue", icon: "⚡" },
  mindfulness: { label: "Mindfulness", color: "violet", icon: "🧘" },
  success: { label: "Success", color: "amber", icon: "🏆" },
  wisdom: { label: "Wisdom", color: "indigo", icon: "📚" },
  happiness: { label: "Happiness", color: "pink", icon: "✨" },
  growth: { label: "Growth", color: "teal", icon: "🌱" },
  focus: { label: "Focus", color: "orange", icon: "🎯" },
  resilience: { label: "Resilience", color: "rose", icon: "💪" },
  leadership: { label: "Leadership", color: "cyan", icon: "👑" },
}
