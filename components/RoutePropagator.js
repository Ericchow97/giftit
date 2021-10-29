import React, { useEffect, useContext } from 'react';
import { useRouter } from "next/router";
import { Context as AppBridgeContext } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { RoutePropagator as ShopifyRoutePropagator } from "@shopify/app-bridge-react";

const RoutePropagator = () => {
  const router = useRouter();
  const { route } = router;
  const appBridge = React.useContext(AppBridgeContext);

  // Subscribe to appBridge changes - captures appBridge urls 
  // and sends them to Next.js router. Use useEffect hook to 
  // load once when component mounted
  useEffect(() => {
    appBridge.subscribe(Redirect.Action.APP, ({ path }) => {
      router.push(path);
    });
  }, []);

  return appBridge && route ? (
    <ShopifyRoutePropagator location={route} app={appBridge} />
  ) : null;
}

export default RoutePropagator;