import "isomorphic-fetch";
import { gql } from "apollo-boost";

//TODO: Limit free trial period, cannot redo free trial
export function RECURRING_CREATE(url) {
  return gql`
    mutation {
      appSubscriptionCreate(
          name: "Basic Plan"
          returnUrl: "${url}"
          test: true
          trialDays: 30
          lineItems: [
            {
              plan: {
                appRecurringPricingDetails: {
                    price: { amount: 9.99, currencyCode: USD }
                }
              }
            }
          ]
        ) {
            userErrors {
              field
              message
            }
            confirmationUrl
            appSubscription {
              id
            }
        }
    }`;
}

export const getSubscriptionUrl = async (ctx, shop, host) => {
  const { client } = ctx;
  const confirmationUrl = await client
    .mutate({
      mutation: RECURRING_CREATE(`${process.env.HOST}/?shop=${shop}&host=${host}`)
    })
    .then(response => response.data.appSubscriptionCreate.confirmationUrl);
  return confirmationUrl;
};
