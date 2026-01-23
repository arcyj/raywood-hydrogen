export const processUrl = (itemUrl: string): string => {
    // If it's already a relative path, return as-is
    if (itemUrl.startsWith('/')) {
      return itemUrl;
    }

    // If it's an absolute URL, extract the pathname
    if (itemUrl.startsWith('http://') || itemUrl.startsWith('https://')) {
      try {
        return new URL(itemUrl).pathname;
      } catch {
        // If URL parsing fails, return as-is
        return itemUrl;
      }
    }

    // For any other format, return as-is
    return itemUrl;
  };
