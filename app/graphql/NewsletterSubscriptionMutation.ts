/**
 * Admin API mutation to create a customer with email marketing consent.
 * No password required - creates a customer record for newsletter subscription.
 * Requires write_customers scope on the Admin API token.
 */
export const CUSTOMER_CREATE_MUTATION = `#graphql
  mutation customerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        emailMarketingConsent {
          marketingState
          marketingOptInLevel
        }
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;
