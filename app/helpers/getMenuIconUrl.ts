// Helper function to extract icon URL from menu item resource
export function getMenuIconUrl(item: any): string | null {
  // Check if item has resource and is a collection type
  if (!item?.resource || item.type !== 'COLLECTION') {
    return null;
  }

  // Type guard to check if resource is a Collection with metafield
  const resource = item.resource as any;
  if (resource?.metafield) {
    const metafield = resource.metafield;

    // Check if metafield has a reference (MediaImage or File)
    if (metafield.reference) {
      // MediaImage reference
      if (metafield.reference.image?.url) {
        return metafield.reference.image.url;
      }
      // File reference
      if (metafield.reference.url) {
        return metafield.reference.url;
      }
    }

    // Fallback to value if it's a string URL
    if (metafield.value && typeof metafield.value === 'string') {
      return metafield.value;
    }
  }

  return null;
}
