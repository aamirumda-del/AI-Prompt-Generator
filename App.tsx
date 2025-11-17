import React, { useState, useEffect, useCallback } from 'react';
import { GeneratedStory } from './types';
import { generateStoryPrompts } from './services/geminiService';
import { Icon } from './components/Icons';

type Theme = 'light' | 'dark';

const ThemeToggle: React.FC<{ theme: Theme; toggleTheme: () => void }> = ({ theme, toggleTheme }) => (
  <button
    onClick={toggleTheme}
    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-light dark:focus:ring-offset-brand-dark"
    aria-label="Toggle theme"
  >
    {theme === 'dark' ? <Icon name="sun" className="w-6 h-6" /> : <Icon name="moon" className="w-6 h-6" />}
  </button>
);

const Loader: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
      <div className="w-12 h-12 border-4 border-accent-light border-t-transparent rounded-full animate-spin"></div>
      <p className="text-lg text-gray-600 dark:text-gray-300">Crafting your story...</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">This can take a moment.</p>
    </div>
);

const PromptInput: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
}> = ({ value, onChange, onSubmit, isLoading }) => (
  <div className="w-full space-y-4">
    <textarea
      value={value}
      onChange={onChange}
      placeholder="Paste 10-30 of your story prompts here... The more detail, the better the result."
      className="w-full h-48 p-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark focus:border-transparent transition-shadow duration-200 shadow-sm"
      disabled={isLoading}
    />
    <button
      onClick={onSubmit}
      disabled={isLoading || value.trim().length === 0}
      className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
    >
      {isLoading ? (
        <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
            <span>Analyzing...</span>
        </>
      ) : (
        <>
            <Icon name="sparkles" className="w-5 h-5 mr-2" />
            <span>Analyze & Generate New Prompts</span>
        </>
      )}
    </button>
  </div>
);

const PromptOutput: React.FC<{ story: GeneratedStory }> = ({ story }) => {
    const [isAllCopied, setIsAllCopied] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopyAll = useCallback(() => {
        const fullStory = `Hook:\n${story.hook}\n\nStory Prompts:\n${story.storyPrompts.join('\n')}`;
        navigator.clipboard.writeText(fullStory).then(() => {
            setIsAllCopied(true);
            setTimeout(() => setIsAllCopied(false), 2000);
        });
    }, [story]);

    const handleCopySingle = useCallback((prompt: string, index: number) => {
        navigator.clipboard.writeText(prompt).then(() => {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        });
    }, []);


    return (
        <div className="w-full space-y-6 p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300 dark:border-gray-700 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Your New Story</h2>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-accent-light dark:text-accent-dark border-b-2 border-accent-light/30 dark:border-accent-dark/30 pb-2">Cinematic Hook</h3>
                <p className="p-4 bg-purple-50 dark:bg-gray-900 rounded-lg text-gray-700 dark:text-gray-300 italic">{story.hook}</p>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-accent-light dark:text-accent-dark border-b-2 border-accent-light/30 dark:border-accent-dark/30 pb-2">Story Prompts</h3>
                <ul className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
                    {story.storyPrompts.map((prompt, index) => (
                        <li key={index} className="flex items-start justify-between gap-4">
                           <span className="flex-grow pr-2">{prompt}</span>
                           <button
                                onClick={() => handleCopySingle(prompt, index)}
                                className="p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 flex-shrink-0"
                                aria-label={`Copy prompt ${index + 1}`}
                            >
                               {copiedIndex === index ? <Icon name="check" className="w-5 h-5 text-green-500" /> : <Icon name="copy" className="w-5 h-5" />}
                           </button>
                        </li>
                    ))}
                </ul>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-600 text-center space-y-4">
                <p className="text-md font-semibold text-green-600 dark:text-green-400">
                    Successfully generated {story.storyPrompts.length} prompts.
                </p>
                <button
                    onClick={handleCopyAll}
                    className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                    {isAllCopied ? (
                        <>
                            <Icon name="check" className="w-5 h-5 mr-2" />
                            <span>Copied to Clipboard!</span>
                        </>
                    ) : (
                        <>
                            <Icon name="copy" className="w-5 h-5 mr-2" />
                            <span>Copy All Prompts</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [userPrompts, setUserPrompts] = useState<string>('');
  const [generatedStory, setGeneratedStory] = useState<GeneratedStory | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    const initialTheme = isDark ? 'dark' : 'light';
    setTheme(initialTheme);
    root.classList.remove(initialTheme === 'dark' ? 'light' : 'dark');
    root.classList.add(initialTheme);
    localStorage.setItem('theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => {
        const newTheme = prevTheme === 'light' ? 'dark' : 'light';
        const root = window.document.documentElement;
        root.classList.remove(prevTheme);
        root.classList.add(newTheme);
        localStorage.setItem('theme', newTheme);
        return newTheme;
    });
  };

  const handleAnalyze = useCallback(async () => {
    if (!userPrompts.trim()) return;
    setIsLoading(true);
    setError(null);
    setGeneratedStory(null);
    try {
      const result = await generateStoryPrompts(userPrompts);
      setGeneratedStory(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [userPrompts]);

  return (
    <div className="min-h-screen bg-brand-light dark:bg-brand-dark text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="relative isolate min-h-screen">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 dark:opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'}}></div>
          </div>
        <div className="container mx-auto max-w-3xl px-4 py-8 md:py-16">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-500">
              Muhammad Aamir AI Story Prompt Generator
            </h1>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </header>

          <main className="space-y-8">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Transform your collection of ideas into a coherent, cinematic story. Paste your prompts, and let AI craft a new narrative complete with a powerful opening hook.
            </p>
            <PromptInput 
                value={userPrompts}
                onChange={(e) => setUserPrompts(e.target.value)}
                onSubmit={handleAnalyze}
                isLoading={isLoading}
            />
            
            <div className="mt-8 min-h-[10rem] flex items-center justify-center">
                {isLoading && <Loader />}
                {error && <div className="p-4 text-center text-red-500 bg-red-100 dark:bg-red-900/50 border border-red-400 rounded-lg">{error}</div>}
                {generatedStory && <PromptOutput story={generatedStory} />}
            </div>
          </main>
           <footer className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
                <p>Powered by Digicontent Hub</p>
            </footer>
        </div>
         <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
            <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 dark:opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style={{clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'}}></div>
        </div>
      </div>
    </div>
  );
};

export default App;
