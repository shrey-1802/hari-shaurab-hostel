import { useEffect } from 'react';

const BASE_TITLE = 'Hari-Saurabh Hostel';

/**
 * Sets the browser tab title for a page.
 * Usage: usePageTitle('Student Directory') → "Student Directory | Hari-Saurabh Hostel"
 */
export const usePageTitle = (pageTitle) => {
  useEffect(() => {
    if (pageTitle) {
      document.title = `${pageTitle} | ${BASE_TITLE}`;
    } else {
      document.title = `${BASE_TITLE} | Smart Management System`;
    }
    return () => {
      document.title = `${BASE_TITLE} | Smart Management System`;
    };
  }, [pageTitle]);
};
