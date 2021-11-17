import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import Shopify, { ApiVersion } from "@shopify/shopify-api";
import Koa from "koa";
import next from "next";
import Router from "koa-router";

import koaBody from 'koa-body';
import cors from '@koa/cors';
import axios from 'axios';
import atob from 'atob';
import btoa from 'btoa';
import isVerified from 'shopify-jwt-auth-verify'

import { ShopCollection, Order, CustomError } from '../types';
import { createClient, getSubscriptionUrl, giftitFunctions } from './handlers/index'

import fs from 'fs'
import path from 'path'

// Database Imports 
import { MongoClient } from 'mongodb';

dotenv.config();
const port = parseInt(process.env.PORT!, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();

const uri = process.env.DATABASE_URI!;

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY!,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET!,
  SCOPES: process.env.SCOPES!.split(","),
  HOST_NAME: process.env.HOST!.replace(/https:\/\//, ""),
  API_VERSION: ApiVersion.October20,
  IS_EMBEDDED_APP: true,
});

const parseJwt = (token: string): string => {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c: string) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload).dest.replace(/https:\/\//, "");
};

// TODO: Test if the workflow works with a new domain

// TODO: validate all input from the front end
// TODO: encode key for database?

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS: any = {};

app.prepare().then(async () => {
  const server = new Koa();
  const router = new Router();
  // TODO: update mongodb IP access list to wherever code is stored 
  // TODO: update database to actual database on launch
  // TODO: Look into logging and monitoring https://docs.mongodb.com/drivers/node/fundamentals/indexes

  const client = new MongoClient(uri);
  try {
    await client.connect();
  }
  catch (err) {
    console.log(err)
  }
  const db = client.db(process.env.DB_NAME).collection<ShopCollection>('shopData');

  server.use(cors());
  server.keys = [Shopify.Context.API_SECRET_KEY];
  server.use(
    createShopifyAuth({
      accessMode: 'offline',
      async afterAuth(ctx: Koa.Context) {
        // Access token and shop available in ctx.state.shopify
        const { shop, accessToken, scope } = ctx.state.shopify;
        ACTIVE_SHOPIFY_SHOPS[shop] = { scope: scope };

        try {
          // Get shop name 
          const { data } = await axios.get(`https://${shop}/admin/api/2021-07/shop.json`, {
            headers: {
              "X-Shopify-Access-Token": accessToken
            },
          });
          // create/update database entry
          db.updateOne({ shop: shop }, [{
            $set: {
              shop: shop,
              active: true,
              subscribed: { $cond: [{ $not: ["$subscribed"] }, {}, "$subscribed"] },
              accessToken: accessToken,
              orders: { $cond: [{ $not: ["$orders"] }, [], "$orders"] },
              storeName: data.shop.name,
              storeEmail: data.shop.email,
              origin: { $cond: [{ $not: ["$origin"] }, '', "$origin"] },
              configuration: {
                $cond: [{ $not: ["$configuration"] },
                {
                  purchaserCustomMessage: `Congratulations, your gift order has successfully been placed! Please remind the recipient to update their address within 72 hours or the order will be cancelled.`,
                  deleteCustomMessage: 'Your order has been cancelled by the merchant please contact the store for more details.',
                  recipientReminderMessage: 'Seems like you still have to update your address! Please click on the link below to update your address:',
                }
                  , "$configuration"]
              }
            }
          }], {
            upsert: true
          });
          giftitFunctions.handleInstallation(shop, accessToken)
        } catch (err: any) {
          console.log(err.response.data);
        }

        //TODO: Look into webhooks getting deleted on server restart
        // register webhook for when orders are completed
        const registration_orders = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: '/webhooks',
          topic: 'DRAFT_ORDERS_UPDATE',
          webhookHandler: (_topic: any, shop: any, _body: any) => {
            // on order update, update DB
            const orderInformation = JSON.parse(_body)
            if (orderInformation.status === 'completed') {
              // write to DB 
              db.updateOne({ shop: shop, "orders.id": orderInformation.admin_graphql_api_id }, {
                $set: { "orders.$.status": "Complete" }
              });
            }
            return Promise.resolve()
          },
        });

        // register webhook for when store name/email changes
        const registration_name = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: '/webhooks',
          topic: 'SHOP_UPDATE',
          webhookHandler: (_topic: any, shop: any, _body: any) => {
            // on order update, update DB
            const shopChange = JSON.parse(_body)
            // write to DB 
            db.updateOne({ shop: shop }, {
              $set: {
                "storeName": shopChange.name,
                "storeEmail": shopChange.email
              }
            });
            return Promise.resolve()
          },
        });

        const registration_uninstall = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: '/webhooks',
          topic: 'APP_UNINSTALLED',
          webhookHandler: (_topic: any, shop: any, _body: any) => {
            delete ACTIVE_SHOPIFY_SHOPS[shop]
            // write to DB 
            db.updateOne({ shop: shop }, {
              $set: {
                "active": false,
                "subscribed.subscriptionStatus": false
              }
            });
            return Promise.resolve()
          },
        });

        //TODO: test whether this removes
        const registration_charge_status = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: '/webhooks',
          topic: 'APP_SUBSCRIPTIONS_UPDATE',
          webhookHandler: (_topic: any, shop: any, _body: any) => {
            const chargeInformation = JSON.parse(_body).app_subscription
            // write to DB 
            if (chargeInformation.status === 'ACTIVE') {
              db.updateOne({ shop: shop }, {
                $set: {
                  "subscribed": {
                    subscriptionId: chargeInformation.admin_graphql_api_id,
                    subscriptionStatus: true
                  }
                }
              });
            } else {
              db.updateOne({ shop: shop, "subscribed.subscriptionId": chargeInformation.admin_graphql_api_id }, {
                $set: {
                  "subscribed.subscriptionStatus": false
                }
              });
            }
            return Promise.resolve()
          },
        });

        if (registration_orders.success && registration_name.success && registration_uninstall.success && registration_charge_status.success) {
          console.log('Successfully registered webhook!');
        } else {
          console.log('Failed to register webhook', registration_orders.result, registration_name.result, registration_uninstall.result, registration_charge_status.result);
          return
        }
        // Redirect to app with shop parameter upon auth
        //TODO: TEST if delete, will be able to access data again?
        //TODO: test, can follow same charge cycle?
        ctx.client = createClient(shop, accessToken)
        ctx.redirect(await getSubscriptionUrl(ctx, ctx.state.shopify.shop, ctx.query.host))
      },
    })
  );

  /******* VENDOR ENDPOINTS *******/
  //#Vendor endpoints for store owners

  // router.get("/", async (ctx: Koa.Context) => {
  //   const req = ctx.query;

  //   const data = await db.findOne({ shop: req.shop });
  //   console.log(data)
  //   // If this shop hasn't been seen yet, go through OAuth to create a session
  //   if (data === null || !data.active) {
  //     ctx.redirect(`https://${Shopify.Context.HOST_NAME}/auth?shop=${req.shop}`);
  //   } else {
  //     await handleRequest(ctx);
  //   }
  // });

  router.post("/graphql", koaBody(), async (ctx: Koa.Context) => {
    if (ctx.request.headers.authorization) {
      const valid = isVerified(ctx.request.headers.authorization, Shopify.Context.API_SECRET_KEY, Shopify.Context.API_KEY)
      if (!valid) {
        ctx.status = 500;
        ctx.body = {
          type: 'Invalid Connection',
          error: 'Invalid Connection',
          message: 'You either do not have access or the token is expired, please try again'
        };
      }
      const dest = parseJwt(ctx.request.headers.authorization)
      try {
        const { shop, accessToken } = await db.findOne({ shop: dest }) || {};
        const { data: { data: { shop: { currencyCode } } } } = await axios.post(`https://${shop}/admin/api/2021-01/graphql.json`, {
          query: ctx.request.body
        }, {
          headers: {
            "X-Shopify-Access-Token": accessToken
          }
        })
        ctx.body = currencyCode
      }
      catch (error) {
        console.log(error)
        ctx.body = {
          error,
        }
      }
    }
  });

  /**
   * Gets all shop data 
   */
  router.get('/get-shop-data', async (ctx: Koa.Context) => {
    try {
      const shopOrigin = ctx.request.header.shop
      // retrieve store information from database
      const { orders, configuration, subscribed, accessToken } = await db.findOne({ shop: shopOrigin }) || {};
      let redirect = ''
      console.log(subscribed)
      if (!subscribed!.subscriptionStatus) {
        ctx.client = createClient(shopOrigin, accessToken)
        redirect = await getSubscriptionUrl(ctx, shopOrigin, btoa(`${shopOrigin}/admin`).replace('=', ''))
      }

      ctx.body = {
        shopOrigin: shopOrigin,
        orders,
        configuration,
        subscribed,
        redirect
      }
    }
    catch (error) {
      ctx.body = {
        error,
      }
    }
  });

  /**
   * Updates user shop configuration settings 
   */
  router.post('/update-configuration', koaBody(), async (ctx: Koa.Context) => {
    if (ctx.request.headers.authorization) {
      const valid = isVerified(ctx.request.headers.authorization, Shopify.Context.API_SECRET_KEY, Shopify.Context.API_KEY)
      if (!valid) {
        ctx.status = 500;
        ctx.body = {
          type: 'Invalid Connection',
          error: 'Invalid Connection',
          message: 'You either do not have access or the token is expired, please try again'
        };
      }
      const dest = parseJwt(ctx.request.headers.authorization)
      try {
        // update configuration on database
        await db.updateOne({ shop: dest }, {
          $set: {
            configuration: ctx.request.body
          }
        });
        ctx.body = {
          success: true,
        }
      }
      catch (error) {
        ctx.body = {
          error,
        }
      }
    }
  });

  /**
   * Deletes a draft order from a store 
   */
  router.post('/delete-orders', koaBody(), async (ctx: Koa.Context) => {
    if (ctx.request.headers.authorization) {
      const valid = isVerified(ctx.request.headers.authorization, Shopify.Context.API_SECRET_KEY, Shopify.Context.API_KEY)
      if (!valid) {
        ctx.status = 500;
        ctx.body = {
          type: 'Invalid Connection',
          error: 'Invalid Connection',
          message: 'You either do not have access or the token is expired, please try again'
        };
      }
      const dest = parseJwt(ctx.request.headers.authorization)
      try {
        const { toRemove }: { toRemove: Order[] } = ctx.request.body;
        const idList = toRemove.map(e => e.id)
        //TODO1: Review all of the findoneandUpdate undefinds
        // TODO: see if inventory item was released from hold for all deleteOrders calls
        // remove orders in database
        const { value } = await db.findOneAndUpdate({ shop: dest }, {
          $pull: { "orders": { "id": { '$in': idList } } }
        });
        const { accessToken, configuration } = value || {}

        if (accessToken && configuration) {
          for (let i = 0; i < toRemove.length; i++) {
            // remove draft orders from shopify
            giftitFunctions.deleteOrders(accessToken, dest, toRemove[i], "Your order has been closed due to inactivity", configuration.deleteCustomMessage)
          }
        } else {
          throw {
            type: 'database',
            message: 'Unable to connect to database'
          }
        }

        ctx.body = {
          success: true,
        }
      }
      catch (error) {
        console.log(error)
        ctx.body = {
          error,
        }
      }
    }
  });

  /**
   * Sends reminder email to desired party 
   */
  router.post('/send-reminders', koaBody(), async (ctx: Koa.Context) => {
    if (ctx.request.headers.authorization) {
      const valid = isVerified(ctx.request.headers.authorization, Shopify.Context.API_SECRET_KEY, Shopify.Context.API_KEY)
      if (!valid) {
        ctx.status = 500;
        ctx.body = {
          type: 'Invalid Connection',
          error: 'Invalid Connection',
          message: 'You either do not have access or the token is expired, please try again'
        };
      }

      const dest = parseJwt(ctx.request.headers.authorization)

      try {
        const { emailList }: { emailList: Order[] } = ctx.request.body;
        const { shop, accessToken, storeName, origin } = await db.findOne({ shop: dest }) || {};

        if (!shop || !accessToken || !storeName || !origin) {
          throw {
            type: 'database',
            message: 'Unable to connect to database'
          }
        }

        // send out reminder emails
        for (let i = 0; i < emailList.length; i++) {
          if (emailList[i].status !== 'Complete') {
            giftitFunctions.sendReminderEmail(emailList[i], origin, shop, accessToken, storeName)
          }
        }
        const purchaserIdList = []
        const recipientIdList = []
        for (let i = 0; i < emailList.length; i++) {
          if (emailList[i].status === 'Open') {
            recipientIdList.push(emailList[i].id)
          } else if (emailList[i].status === 'Pending Payment') {
            purchaserIdList.push(emailList[i].id)
          }
        }
        // write to DB purchaser list
        db.updateOne(
          { shop: dest },
          { $set: { "orders.$[order].lastEmailSentPurchaser": new Date().toISOString() } },
          { arrayFilters: [{ "order.id": { '$in': purchaserIdList } }] }
        );

        // write to DB recipient list
        db.updateOne(
          { shop: dest },
          { $set: { "orders.$[order].lastEmailSentRecipient": new Date().toISOString() } },
          { arrayFilters: [{ "order.id": { '$in': recipientIdList } }] }
        );

        ctx.body = {
          success: true,
        }
      }
      catch (error) {
        ctx.body = {
          error,
        }
      }
    }
  });

  /**** USER ENDPOINTS ****/
  /**
   * Endpoint for user to place a gift order
   */
  router.post('/gift-checkout', koaBody(), async (ctx: Koa.Context) => {
    const orderInformation = ctx.request.body;
    const shop = orderInformation.shop;
    const origin = <string>ctx.request.header.origin;
    console.log(shop)
    // generate random token
    orderInformation.token = Math.random().toString(36).substr(2, 10);
    orderInformation.purchaserName = orderInformation.purchaserName.toLowerCase().split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.substring(1)).join(' ');
    orderInformation.recipientName = orderInformation.recipientName.toLowerCase().split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.substring(1)).join(' ');

    //TODO: update returns based on error handling
    try {
      // retrieve accessToken from database
      const { accessToken, configuration, storeName } = await db.findOne({ shop: shop }) || {};

      if (!accessToken || !configuration || !storeName) {
        throw {
          type: 'database',
          message: 'Unable to connect to database'
        }
      }

      orderInformation.storeName = storeName;
      // gets item global IDs
      const itemList = await giftitFunctions.getItemIds(accessToken, shop, [`gid://shopify/ProductVariant/${orderInformation.id}`]);
      if (itemList) {
        // put gift items on hold & create draft invoice & send out to recipient
        const draftInv = await giftitFunctions.createDraftInvoice(accessToken, shop, itemList, [1], orderInformation.purchaserEmail);
        if (draftInv) {
          // write order to DB
          db.updateOne({ shop: shop }, {
            $set: {
              origin: origin
            },
            $push: {
              orders: {
                id: draftInv.id,
                token: orderInformation.token,
                name: draftInv.name,
                status: 'Open',
                createdAt: draftInv.createdAt,
                price: draftInv.subtotalPrice,
                purchaserName: orderInformation.purchaserName,
                purchaserEmail: orderInformation.purchaserEmail,
                recipientName: orderInformation.recipientName,
                recipientEmail: orderInformation.recipientEmail,
                recipientPhone: orderInformation.phone,
                customMessage: orderInformation.message,
                lastEmailSentPurchaser: draftInv.createdAt,
                lastEmailSentRecipient: draftInv.createdAt,
                addedInventoryBack: false,
                url: draftInv.invoiceUrl
              }
            }
          }, {
            upsert: true
          });
          // send confirmation emails
          const sentEmail = await giftitFunctions.sendEmailOrMessage(orderInformation, origin, draftInv, configuration);
          //TODO: these errors build into client displays
          if (sentEmail.type === 'error') {
            throw {
              type: 'twilio',
              error: sentEmail.message,
              message: 'Unable to send emails, please refresh and try again'
            }
          }
        } else {
          throw {
            type: 'shopifyGraphQL',
            error: 'createOrder',
            message: 'Unable to create order, please refresh and try again'
          }
        }
      } else {
        throw {
          type: 'shopifyGraphQL',
          error: 'retrieveItems',
          message: 'Unable to retrieve items, please refresh and try again'
        }
      }
      ctx.body = { message: "success" }
    } catch (error) {
      if ((error as CustomError).type) {
        const err = error as CustomError
        ctx.status = 500;
        ctx.body = {
          type: err.type,
          error: err.error,
          message: err.message
        };
      }
    }
  });

  /**
   * Endpoint to update recipient address
   */

  //TODO: test interantional addresses
  router.post('/update-address', koaBody(), async (ctx: Koa.Context) => {
    try {
      const updateInformation = ctx.request.body;
      const url = ctx.header['origin'] as string

      // retrieve accessToken from database
      const { accessToken, orders } = await db.findOne(
        {
          shop: updateInformation.shop,
          "orders.id": updateInformation.orderId,
        }, {
        projection: { accessToken: 1, 'orders.$': 1 }
      }) || {};

      if (!accessToken || !orders) {
        throw {
          type: 'database',
          message: 'Unable to connect to database'
        }
      }

      if (orders[0].token !== updateInformation.token) {
        throw {
          type: 'invalidToken',
          message: 'Invalid Token, please try the link from your email again.'
        }
      }

      if (orders[0].status === 'Complete') {
        throw {
          type: 'orderComplete',
          message: 'This order has already been completed, you can no longer update your address.'
        }
      }
      if (!url) {
        throw {
          type: 'InvalidUrl',
          message: 'Server issue, please try again.'
        }
      }
      const updateAddress = await giftitFunctions.updateCustomerAddress(accessToken, updateInformation, url);
      if (updateAddress.type === 'error') {
        //TODO: handle other error messages & display on user side for incorrect province and country
        throw {
          type: 'shopifyGraphQL',
          message: 'Unable to update address, please refresh and try again'
        }
      }

      // write to DB 
      db.updateOne({ shop: updateInformation.shop, "orders.id": updateInformation.orderId }, {
        $set: { "orders.$.status": "Pending Payment", "orders.$.lastEmailSentPurchaser": new Date().toISOString() }
      });

      ctx.body = { message: "success" }
    } catch (error) {
      if ((error as CustomError).type) {
        const err = error as CustomError
        ctx.status = 500;
        ctx.body = {
          type: err.type,
          message: err.message
        };
      }
    }
  })

  /**
   * Endpoint to confirm order
   */
  router.post('/confirm-purchase', koaBody(), async (ctx: Koa.Context) => {
    try {
      const orderInformation = ctx.request.body;
      // retrieve accessToken from database
      const { accessToken, orders } = await db.findOne(
        {
          shop: orderInformation.shop,
          "orders.id": `gid://shopify/DraftOrder/${orderInformation.draftOrder}`
        }, {
        "projection": {
          "accessToken": 1,
          "orders.$": 1
        }
      }) || {}
        ;
      if (!accessToken || !orders) {
        throw {
          type: 'database',
          message: 'Unable to connect to database'
        }
      }
      if (!orders[0].addedInventoryBack) {
        const draftURL = await giftitFunctions.addBackInventory(accessToken, orderInformation);
        if (!draftURL) {
          throw {
            type: 'shopGraphQl',
            message: 'Unable to connect to shopify'
          }
        }
        db.updateOne({ shop: orderInformation.shop, "orders.id": `gid://shopify/DraftOrder/${orderInformation.draftOrder}` }, {
          $set: { "orders.$.addedInventoryBack": true }
        });
        ctx.body = { url: draftURL };
      } else {
        ctx.body = { url: orders[0].url };
      }
    } catch (error) {
      if ((error as CustomError).type) {
        const err = error as CustomError
        ctx.status = 500;
        ctx.body = {
          type: err.type,
          message: err.message
        };
      }
    }
  })

  /**** STATIC FILES ****/
  /**
   * Endpoint to serve script
   */
  // router.get('/giftit-script', koaBody(), async (ctx: Koa.Context) => {
  //   try {
  //     ctx.body = fs.readFileSync(__dirname + '../shopify-web/giftit-product-script.js', "utf8");
  //   } catch (error) {
  //     if ((error as CustomError).type) {
  //       const err = error as CustomError
  //       console.log(error)
  //       ctx.status = 500;
  //       ctx.body = {
  //         type: err.type,
  //         message: err.message
  //       };
  //     }
  //   }
  // })

  /**
   * Endpoint to serve css
   */
  router.get('/giftit-css', koaBody(), async (ctx: Koa.Context) => {
    try {
      ctx.body = fs.readFileSync(path.join(__dirname, '..', 'shopify-web', 'giftit-styles.css'), "utf8");
      ctx.type = "text/css";
    } catch (error) {
      if ((error as CustomError).type) {
        const err = error as CustomError
        console.log(error)
        ctx.status = 500;
        ctx.body = {
          type: err.type,
          message: err.message
        };
      }
    }
  })

  /**
   * Endpoint to serve privacy policy
   */
  router.get('/privacy-policy', koaBody(), async (ctx: Koa.Context) => {
    try {
      ctx.body = fs.readFileSync(path.join(__dirname, '..', 'shopify-web', 'giftit-privacy-policy.html'), "utf8");
    } catch (error) {
      if ((error as CustomError).type) {
        const err = error as CustomError
        console.log(error)
        ctx.status = 500;
        ctx.body = {
          type: err.type,
          message: err.message
        };
      }
    }
  })

  /**** WEBHOOKS ****/
  router.post("/webhooks", async (ctx: Koa.Context) => {
    console.log('use webhook')
    try {
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log('errors')
      console.log(error)
      console.log(`Failed to process webhook: ${error}`);
    }
  });

  /**** SENDGRID/TWILLIO WEBHOOKS ****/

  //TODO: Update Sendgird/Twillio site with new webhook address
  router.post('/sendgrid/bounce', koaBody(), async (ctx: Koa.Context) => {
    const data = ctx.request.body
    console.log(data)

    try {
      for (let i = 0; i < data.length; i++) {
        // Delete from DB
        const { value: info } = await db.findOneAndUpdate({ shop: data[i].shop, "orders.id": data[i].id }, {
          $pull: { "orders": { "id": data[i].id } }
        }, {
          projection: { accessToken: 1, origin: 1, 'orders.$': 1 }
        });

        if (!info) {
          throw {
            type: 'database',
            message: 'Unable to connect to database'
          }
        }

        if (data[i].email === info.orders[0].recipientEmail) {
          // Delete from shopify & send email to recipient
          const ret = await giftitFunctions.deleteOrders(info.accessToken, data[i].shop, info.orders[0], "Incorrect mailing address",
            `Oops, seems like you entered an incorrect email address for the recipient. Please try to place your order again ${info.origin}`)
          if (ret.type === 'error') {
            throw ret
          }
        }
      }
      ctx.status = 200;
      ctx.body = 'successfully deleted order'
      console.log(`Webhook processed with status code 200`);
    } catch (error) {
      if ((error as CustomError).type) {
        const err = error as CustomError
        ctx.status = 500;
        ctx.body = {
          type: err.type,
          message: err.message
        };
      }
    }
  });


  /**** GDPR WEBHOOKS ****/

  /**
   * Endpoint for customer deletion
   */
  router.post('/customers/redact', koaBody(), async (ctx: Koa.Context) => {
    const data = ctx.request.body
    try {
      await db.findOneAndUpdate({ shop: data.shop_domain }, {
        $pull: { "orders": { "purchaserEmail": data.customer.email } }
      });
      ctx.status = 200;
      ctx.body = 'successfully deleted customer data'
      console.log(`Webhook processed with status code 200`);
    } catch (error) {
      if ((error as CustomError).type) {
        const err = error as CustomError
        ctx.status = 500;
        ctx.body = {
          type: err.type,
          message: err.message
        };
      }
    }
  });

  /**
   * Endpoint for customer information
   */
  router.post('/customers/data_request', koaBody(), async (ctx: Koa.Context) => {
    const data = ctx.request.body
    try {
      const storeInfo = await db.findOne({ shop: data.shop_domain }, {
        "projection": {
          storeEmail: 1, storeName: 1
        }
      })
      const customerInfo = db.aggregate([
        { $match: { shop: data.shop_domain, 'orders.purchaserEmail': data.customer.email } },
        { $unwind: '$orders' },
        { $match: { shop: data.shop_domain, 'orders.purchaserEmail': data.customer.email } },
        { $project: { orders: 1 } }
      ])

      // create CSV
      let csv = 'Draft Order, PurchaserName, PurchaserEmail, Price, Status'
      await customerInfo.forEach((customer: any) => {
        csv += `\r\n ${customer.orders.name}, ${customer.orders.purchaserName}, ${customer.orders.purchaserEmail}, ${customer.orders.price}, ${customer.orders.status}`
      })

      await giftitFunctions.sendCustomerInfoEmail(data.customer.id, csv, storeInfo)
      ctx.status = 200;
      ctx.body = 'successfully deleted store data'
      console.log(`Webhook processed with status code 200`);
    } catch (error) {
      if ((error as CustomError).type) {
        const err = error as CustomError
        ctx.status = 500;
        ctx.body = {
          type: err.type,
          message: err.message
        };
      }
    }
  });

  /**
   * Endpoint for app deletion
   */
  router.post('/shop/redact', koaBody(), async (ctx: Koa.Context) => {
    try {
      db.deleteOne({ shop: ctx.request.body.shop_domain });
      ctx.status = 200;
      ctx.body = 'successfully deleted store data'
      console.log(`Webhook processed with status code 200`);
    } catch (error) {
      if ((error as CustomError).type) {
        const err = error as CustomError
        ctx.status = 500;
        ctx.body = {
          type: err.type,
          message: err.message
        };
      }
    }
  });

  const handleRequest = async (ctx: Koa.Context) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  };

  router.post(
    "/graphql",
    verifyRequest({ returnHeader: true }),
    async (ctx: Koa.Context) => {
      await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
    }
  );

  router.get("(/_next/static/.*)", handleRequest); // Static content is clear
  router.get("/_next/webpack-hmr", handleRequest); // Webpack content is clear
  router.get("(.*)", async (ctx: Koa.Context) => {
    const shop = ctx.query.shop as string;

    // This shop hasn't been seen yet, go through OAuth to create a session
    if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
      ctx.redirect(`/auth?shop=${shop}`);
    } else {
      await handleRequest(ctx);
    }
  });

  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
