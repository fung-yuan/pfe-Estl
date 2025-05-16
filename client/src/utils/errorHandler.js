import { toast as shadToast } from "@/hooks/use-toast"; // Rename the import

/**
 * Utility functions for consistent error handling across the application
 */

/**
 * Processes API errors and returns a user-friendly error message
 * @param {Error} error - The error object from the API call
 * @param {Object} options - Additional options
 * @param {string} options.defaultMessage - Default message if no specific error is found
 * @param {Object} options.specificErrors - Map of error codes/messages to user-friendly messages
 * @returns {string} A user-friendly error message
 */
export const getErrorMessage = (error, options = {}) => {
    const {
        defaultMessage = 'An unexpected error occurred. Please try again.',
        specificErrors = {}
    } = options;

    // Check if it's an axios error with a response
    if (error.response) {
        const { status, data } = error.response;

        // Check if we have a message in the response data
        if (data && data.message) {
            // Check if we have a specific override for this message
            const messageKey = Object.keys(specificErrors).find(key =>
                data.message.includes(key)
            );

            if (messageKey) {
                return specificErrors[messageKey];
            }

            // Return the API message directly if it's user-friendly enough
            return data.message;
        }

        // Handle common HTTP status codes
        switch (status) {
            case 400:
                return 'The request was invalid. Please check your input and try again.';
            case 401:
                return 'You need to log in to perform this action.';
            case 403:
                return 'You don\'t have permission to perform this action.';
            case 404:
                return 'The requested resource was not found.';
            case 409:
                return 'This operation couldn\'t be completed due to a conflict with the current state.';
            case 422:
                return 'The submitted data failed validation.';
            case 500:
                return 'Something went wrong on our servers. Please try again later.';
            default:
                return `Error ${status}: ${defaultMessage}`;
        }
    }

    // Handle network errors
    if (error.request && !error.response) {
        return 'Network error: Could not connect to the server. Please check your internet connection.';
    }

    // Handle other errors
    if (error.message) {
        // Check for specific error messages we want to handle
        if (error.message.includes('timeout')) {
            return 'The request timed out. Please try again.';
        }

        // Check if we have a specific override for this message
        const messageKey = Object.keys(specificErrors).find(key =>
            error.message.includes(key)
        );

        if (messageKey) {
            return specificErrors[messageKey];
        }

        return error.message;
    }

    return defaultMessage;
};

/**
 * A wrapper function to handle API errors consistently with toast notifications
 * @param {Error} error - The error object from the API call
 * @param {string} defaultMessage - Default message if no specific error is found
 * @param {Function} toastFn - The toast function to display error notifications
 */
export const handleApiError = (error, defaultMessage = 'An API error occurred', toastFn) => { // Rename param to toastFn
    console.error('API Error:', error);

    let errorMessage = defaultMessage;
    let errorDetails = '';

    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('API Error Response Data:', error.response.data);
        console.error('API Error Response Status:', error.response.status);
        console.error('API Error Response Headers:', error.response.headers);
        errorMessage = error.response.data?.message || error.response.data?.error || defaultMessage;
        errorDetails = `Status: ${error.response.status}. ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
        // The request was made but no response was received
        console.error('API Error Request:', error.request);
        errorMessage = 'No response received from server. Check network connection.';
    } else {
        // Something happened in setting up the request that triggered an Error
        console.error('API Error Message:', error.message);
        errorMessage = error.message || 'Error setting up the request.';
    }

    // Use the passed toast function correctly
    if (typeof toastFn === 'function') {
        toastFn({ // Call the function directly
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
        });
    } else {
        // Fallback if toast function is not provided or invalid
        console.error("Toast function is not available in handleApiError");
        // Optionally, use a default alert or the imported shadToast
        shadToast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
        });
    }

    // Optionally re-throw or return error info
    // throw new Error(errorMessage);
};