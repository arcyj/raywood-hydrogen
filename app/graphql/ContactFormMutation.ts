/**
 * Mutation to create a contact form entry as a metaobject in Shopify
 * This requires Admin API access and a metaobject definition named 'contact_form'
 * 
 * Before using this, you need to:
 * 1. Create a metaobject definition in Shopify Admin called 'contact_form'
 * 2. Add fields: name (single_line_text), email (email), subject (single_line_text), message (multi_line_text), date (date_time)
 * 3. Set the metaobject definition to be accessible via Admin API
 * 4. Set PRIVATE_ADMIN_API_TOKEN and PUBLIC_STORE_DOMAIN environment variables
 */
export const CONTACT_FORM_MUTATION = `#graphql
  mutation metaobjectUpsert($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
    metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
      metaobject {
        id
        handle
        type
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;
