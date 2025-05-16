import apiClient from './apiClient';

/**
 * Service for handling search-related API calls
 */
class SearchService {
  /**
   * Perform a natural language search for students
   * @param {string} query - The natural language query
   * @returns {Promise} - Promise containing the search results
   */
  async naturalLanguageSearch(query) {
    try {
      const response = await apiClient.post('/api/search/natural', { query: query.trim() });
      
      if (response.data && response.data.students) {
        // Return the unmodified response from the API
        return response.data;
      }
      
      return {
        students: [],
        summary: 'No results found',
        originalQuery: query
      };
    } catch (error) {
      // Error logging for errors that should be handled by API client interceptors
      if (!error.isHandled) {
        console.error('Unhandled error in natural language search:', error);
      }
      throw error;
    }
  }
  
  /**
   * Get example search queries
   * @returns {Array} - Array of example queries
   */
  getExampleQueries() {
    return [
      // Practical, working examples
      "Show me all students with 0 absence hours",
      "Show me students who were absent between 2024-05-01 and 2024-05-31",
      "List students from GÉNIE INFORMATIQUE with more than 5 absences",
      // French examples
      "Montre-moi tous les étudiants avec 0 heures d'absence",
      "Liste les étudiants absents entre le 1er et le 31 mai 2024",
    ];
  }
}

export default new SearchService();
