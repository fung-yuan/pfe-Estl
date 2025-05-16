import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Loader2 } from "lucide-react";
import SearchService from "@/services/SearchService";

/**
 * Natural Language Search component for querying student absences using everyday language
 */
const NaturalLanguageSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState('fr-FR'); // Default to French
  const [recentSearches, setRecentSearches] = useState([]);
  
  // Check if speech recognition is supported and load recent searches
  useEffect(() => {
    setSpeechSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (e) {
        console.error('Error loading recent searches:', e);
      }
    }
  }, []);

  // Example queries to help users get started
  const exampleQueries = SearchService.getExampleQueries();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      // Save to recent searches
      const trimmedQuery = query.trim();
      const updatedSearches = [trimmedQuery, ...recentSearches.filter(s => s !== trimmedQuery)].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      
      // Call the API through the search service
      const searchResults = await SearchService.naturalLanguageSearch(trimmedQuery);
      
      // Check if we got valid results
      if (searchResults) {
        setResults(searchResults);
        
        // Show a friendly message if no students were found
        if (searchResults.students && searchResults.students.length === 0) {
          if (searchResults.summary && searchResults.summary.includes('Error')) {
            setError('We couldn\'t understand your query. Please try rephrasing it or use one of the examples below.');
          }
        }
      }
    } catch (err) {
      // Handle different types of errors
      if (err.response) {
        // The request was made and the server responded with an error status
        if (err.response.status === 400) {
          setError('We couldn\'t process your query. Please try rephrasing it or use one of the examples below.');
          
          // Still show the response data if available
          if (err.response.data) {
            setResults(err.response.data);
          }
        } else {
          setError('An error occurred while searching. Please try again later.');
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('Could not connect to the server. Please check your internet connection and try again.');
      } else {
        // Something happened in setting up the request
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example) => {
    setQuery(example);
  };

  // Handle voice input
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (!speechSupported) return;

    setIsListening(true);
    setError(null);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Configure speech recognition
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = voiceLanguage; // Use selected language
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };
  
  const stopListening = () => {
    setIsListening(false);
    // The SpeechRecognition API will automatically stop when we set isListening to false
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      <Card className="shadow-xl dark:border-gray-700 dark:bg-gray-900 overflow-hidden min-h-[80vh]">
        <CardHeader className="pb-8 border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Natural Language Search</CardTitle>
          <CardDescription className="mt-2 text-base text-gray-600 dark:text-gray-300">
            Search for student absence information using everyday language
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Input
                className="w-full pr-12 py-7 text-lg shadow-sm border-2 dark:border-gray-700 focus:border-primary dark:focus:border-primary rounded-xl"
                placeholder="e.g., Show me students who missed more than 3 classes this month (English or French)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                // Preserve special characters for proper handling of accented French characters
                spellCheck={false}
                lang={voiceLanguage} // Set language attribute based on selected voice language
              />
              {speechSupported && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={toggleListening}
                  disabled={loading}
                >
                  {isListening ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : (
                    <Mic className={`h-6 w-6 ${isListening ? 'text-primary' : 'text-muted-foreground'}`} />
                  )}
                </Button>
              )}
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={loading} 
              className="relative py-7 px-10 text-lg font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              {loading ? (
                <>
                  <span className="opacity-0">Search</span>
                  <Loader2 className="h-6 w-6 animate-spin absolute" />
                </>
              ) : 'Search'}
            </Button>
          </div>
          
          {/* Voice language toggle */}
          {speechSupported && (
            <div className="mb-4 flex items-center">
              <span className="text-sm text-gray-500 mr-3">Voice input language:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setVoiceLanguage('fr-FR')}
                  className={`text-xs px-3 py-1 rounded-md transition-colors ${voiceLanguage === 'fr-FR' ? 'bg-white shadow text-primary-600' : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  Français
                </button>
                <button
                  onClick={() => setVoiceLanguage('en-US')}
                  className={`text-xs px-3 py-1 rounded-md transition-colors ${voiceLanguage === 'en-US' ? 'bg-white shadow text-primary-600' : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  English
                </button>
              </div>
            </div>
          )}
          
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Recent searches:</p>
                <button 
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem('recentSearches');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Clear history
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(search)}
                    className="text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 rounded-full px-3 py-1 text-blue-700 dark:text-blue-300 transition-colors flex items-center"
                  >
                    <span>{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Example queries */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full px-3 py-1 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Loading skeleton */}
          {loading && !results && (
            <div className="mt-8 animate-fadeIn">
              <h3 className="text-lg font-semibold mb-4">Loading results...</h3>
              
              {/* Skeleton for summary */}
              <div className="bg-gray-100 dark:bg-gray-800 animate-pulse p-4 rounded-lg mb-6 border-l-4 border-gray-300 dark:border-gray-700 shadow-sm">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              
              {/* Skeleton for table */}
              <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-md">
                <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4">
                  <div className="flex">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6 mr-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6 mr-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6 mr-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6 mr-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                  </div>
                </div>
                
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`px-6 py-5 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} animate-pulse`}>
                    <div className="flex">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6 mr-4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6 mr-4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6 mr-4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6 mr-4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/12"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Results */}
          {results && !loading && (
            <div className="mt-8 animate-fadeIn">
              <h3 className="text-lg font-semibold mb-4">Results</h3>
              
              {/* Summary */}
              {results.summary && (
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-6 border-l-4 border-blue-500 shadow-sm">
                  <p className="text-blue-800 dark:text-blue-300">{results.summary}</p>
                </div>
              )}
              
              {/* Student list */}
              {results.students && results.students.length > 0 ? (
                <div className="border-2 dark:border-gray-700 rounded-xl overflow-hidden shadow-md">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Absence Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {results.students.map((student, index) => (
                        <tr 
                          key={student.id || index} 
                          className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-5 whitespace-nowrap text-base font-medium text-gray-900 dark:text-white">{student.fullName || 'N/A'}</td>
                          <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700 dark:text-gray-300">{student.studentId || 'N/A'}</td>
                          <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700 dark:text-gray-300">{student.email || 'N/A'}</td>
                          <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700 dark:text-gray-300">{student.department?.name || 'N/A'}</td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${student.absenceCount > 5 ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300' : student.absenceCount > 2 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'}`}>
                              {student.absenceCount || 0} hours
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">No students found matching your query.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Try modifying your search terms or using one of the examples.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NaturalLanguageSearch;
