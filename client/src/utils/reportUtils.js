import { format } from 'date-fns';
import { handleApiError } from './errorHandler';

/**
 * Validates and formats start and end dates for reports
 * @param {Date} startDate - The start date
 * @param {Date} endDate - The end date
 * @param {Function} toastFn - The toast function to show errors
 * @returns {Object|null} - Formatted dates or null if validation fails
 */
export const validateAndFormatDates = (startDate, endDate, toastFn) => {
    if (!startDate || !endDate) {
        toastFn({
            title: 'Error',
            description: 'Please select both start and end dates.',
            variant: 'destructive',
        });
        return null;
    }

    if (startDate > endDate) {
        toastFn({
            title: 'Error',
            description: 'Start date cannot be after end date.',
            variant: 'destructive',
        });
        return null;
    }

    return {
        formattedStartDate: format(startDate, 'yyyy-MM-dd'),
        formattedEndDate: format(endDate, 'yyyy-MM-dd')
    };
};

/**
 * Creates and triggers a download for a blob
 * @param {Blob} blob - The blob to download
 * @param {string} fileName - The filename for the download
 */
export const downloadBlob = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

/**
 * Fetches data for filters (departments, semesters, subjects, etc.)
 * @param {Function} fetchFn - The API function to call
 * @param {Function} setter - The state setter function
 * @param {string} errorMsg - The error message to display
 * @param {Function} toastFn - The toast function
 * @param {Array} dependencies - Optional dependencies for the API call
 */
export const fetchFilterData = async (fetchFn, setter, errorMsg, toastFn, dependencies = []) => {
    try {
        const response = await fetchFn(...dependencies);
        setter(response.data || []);
        return response.data || [];
    } catch (error) {
        handleApiError(error, errorMsg, toastFn);
        return [];
    }
};

/**
 * Handles showing appropriate toast notification for report generation
 * @param {Array} data - The report data
 * @param {Function} toastFn - The toast function
 * @param {boolean} isFiltered - Whether the data is filtered (e.g., exceeded only)
 */
export const handleReportGenerationResult = (data, toastFn, isFiltered = false) => {
    if (data.length === 0) {
        toastFn({
            title: 'Warning',
            description: `No data found${isFiltered ? ' matching your filters' : ''}`,
            variant: 'destructive',
        });
    } else {
        toastFn({
            title: 'Success',
            description: 'Report generated successfully',
            variant: 'default',
        });
    }
};