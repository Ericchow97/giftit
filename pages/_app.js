
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import App from "next/app";
import Head from 'next/head';
import { AppProvider } from "@shopify/polaris";
import { Provider, useAppBridge } from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import "@shopify/polaris/dist/styles.css";
import translations from "@shopify/polaris/locales/en.json";
import React, { useState } from 'react';
import ClientRouter from '../components/ClientRouter';
import RoutePropagator from '../components/RoutePropagator';
import '@shopify/polaris/dist/styles.css';
import '../giftIt.css'

function userLoggedInFetch(app) {
  const fetchFunction = authenticatedFetch(app);

  return async (uri, options) => {
    const response = await fetchFunction(uri, options);

    if (
      response.headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1"
    ) {
      const authUrlHeader = response.headers.get(
        "X-Shopify-API-Request-Failure-Reauthorize-Url"
      );

      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth`);
      return null;
    }

    return response;
  };
}

function MyProvider(props) {
  const app = useAppBridge();
  if (props.redirect) {
    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.REMOTE, props.redirect);
  }

  const client = new ApolloClient({
    fetch: userLoggedInFetch(app),
    fetchOptions: {
      credentials: "include",
    },
  });

  const Component = props.Component;

  return (
    <ApolloProvider client={client}>
      <Component {...props} />
    </ApolloProvider>
  );
}

const MyApp = ({ Component, shopOrigin, pageProps, host, redirect }) => {
  const [props] = useState(pageProps)
  console.log(props)
  const config = { apiKey: API_KEY, shopOrigin, host, forceRedirect: true };
  return (
    <>
      <Head>
        <title>GiftIt</title>
        <meta charSet="utf-8" />
      </Head>
      <AppProvider i18n={translations}>
        <Provider config={config}>
          <ClientRouter />
          <RoutePropagator />
          <MyProvider Component={Component} {...props} {...config} redirect={redirect} />
        </Provider>
      </AppProvider>
    </>
  )
}

MyApp.getInitialProps = async ({ ctx }) => {
  let shopName = ctx.query.shop
  if (typeof window !== "undefined" && window.location) {
    shopName = new URLSearchParams(window.location.search).get(
      "shop"
    );
  }

  const { shopOrigin, orders, configuration, redirect } = await (await fetch(`https://giftit-app.herokuapp.com/get-shop-data`, {
    method: 'GET',
    credentials: "include",
    headers: {
      shop: shopName
    }
  })).json()
  console.log(app)
  console.log(shopOrigin)
  return {
    host: ctx.query.host,
    redirect,
    shopOrigin: shopOrigin ? shopOrigin : shopName,
    pageProps: {
      shopOrigin: shopOrigin ? shopOrigin : shopName,
      appName: 'GiftIt',
      orders: (orders ? orders : []),
      configuration
    }
  }
};

export default MyApp;
