import dotenv from 'dotenv';
// loads environment variables into process.env
dotenv.config({ path: '../../.env' });

import axios from 'axios';
import countries from "i18n-iso-countries";
import { queryNodes, inventoryLevels, lineItems, Order, emailConfiguration, ThemeData } from '../../types';

import sgMail from '@sendgrid/mail';
import fs from 'fs';
import path from 'path';

const {
    SENDGRID_API_KEY,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    HOST,
} = process.env;

sgMail.setApiKey(SENDGRID_API_KEY!)

const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN!);

interface returnStatus {
    type: string,
    message?: string,
    content?: any,
}

const states = [
    ['Alabama', 'AL'],
    ['Alaska', 'AK'],
    ['American Samoa', 'AS'],
    ['Arizona', 'AZ'],
    ['Arkansas', 'AR'],
    ['Armed Forces Americas', 'AA'],
    ['Armed Forces Europe', 'AE'],
    ['Armed Forces Pacific', 'AP'],
    ['California', 'CA'],
    ['Colorado', 'CO'],
    ['Connecticut', 'CT'],
    ['Delaware', 'DE'],
    ['District Of Columbia', 'DC'],
    ['Florida', 'FL'],
    ['Georgia', 'GA'],
    ['Guam', 'GU'],
    ['Hawaii', 'HI'],
    ['Idaho', 'ID'],
    ['Illinois', 'IL'],
    ['Indiana', 'IN'],
    ['Iowa', 'IA'],
    ['Kansas', 'KS'],
    ['Kentucky', 'KY'],
    ['Louisiana', 'LA'],
    ['Maine', 'ME'],
    ['Marshall Islands', 'MH'],
    ['Maryland', 'MD'],
    ['Massachusetts', 'MA'],
    ['Michigan', 'MI'],
    ['Minnesota', 'MN'],
    ['Mississippi', 'MS'],
    ['Missouri', 'MO'],
    ['Montana', 'MT'],
    ['Nebraska', 'NE'],
    ['Nevada', 'NV'],
    ['New Hampshire', 'NH'],
    ['New Jersey', 'NJ'],
    ['New Mexico', 'NM'],
    ['New York', 'NY'],
    ['North Carolina', 'NC'],
    ['North Dakota', 'ND'],
    ['Northern Mariana Islands', 'NP'],
    ['Ohio', 'OH'],
    ['Oklahoma', 'OK'],
    ['Oregon', 'OR'],
    ['Pennsylvania', 'PA'],
    ['Puerto Rico', 'PR'],
    ['Rhode Island', 'RI'],
    ['South Carolina', 'SC'],
    ['South Dakota', 'SD'],
    ['Tennessee', 'TN'],
    ['Texas', 'TX'],
    ['US Virgin Islands', 'VI'],
    ['Utah', 'UT'],
    ['Vermont', 'VT'],
    ['Virginia', 'VA'],
    ['Washington', 'WA'],
    ['West Virginia', 'WV'],
    ['Wisconsin', 'WI'],
    ['Wyoming', 'WY'],
  ];

  const provinces = [
    ['Alberta', 'AB'],
    ['British Columbia', 'BC'],
    ['Manitoba', 'MB'],
    ['New Brunswick', 'NB'],
    ['Newfoundland', 'NF'],
    ['Northwest Territory', 'NT'],
    ['Nova Scotia', 'NS'],
    ['Nunavut', 'NU'],
    ['Ontario', 'ON'],
    ['Prince Edward Island', 'PE'],
    ['Quebec', 'QC'],
    ['Saskatchewan', 'SK'],
    ['Yukon', 'YT'],
  ];

//TODO1: Update all to gql query
/**
 * Installs application
 * 
 * @param shop Name of the shopify store
 * @param accessToken Shopify accessToken for specific store
 * @return 
 */
export const handleInstallation = async (shop: string, accessToken: string): Promise<void> => {
    try {
        // get all pages 
        const { data: { pages } } = await axios.get(`https://${shop}/admin/api/2021-01/pages.json`, {
            headers: {
                "X-Shopify-Access-Token": accessToken
            },
        });

        // update pages
        let giftOrdersPageExist = false;
        let completePurchasePageExist = false;
        for (let i = 0; i < pages.length; i++) {
            if (pages[i].title === "Gift Orders") {
                await axios.put(`https://${shop}/admin/api/2021-01/pages/${pages[i].id}.json`, {
                    "page": {
                        "body_html": fs.readFileSync(path.join(__dirname, '..', '../shopify-web/gift-orders-page.liquid'), "utf8"),
                    }
                }, {
                    headers: {
                        "X-Shopify-Access-Token": accessToken
                    },
                });
                giftOrdersPageExist = true
            }
            if (pages[i].title === "Complete Purchase") {
                await axios.put(`https://${shop}/admin/api/2021-01/pages/${pages[i].id}.json`, {
                    "page": {
                        "body_html": fs.readFileSync(path.join(__dirname, '..', '../shopify-web/giftit-order-confirm.liquid'), "utf8"),
                    }
                }, {
                    headers: {
                        "X-Shopify-Access-Token": accessToken
                    },
                });
                completePurchasePageExist = true
            }
        }

        // create gift orders page 
        if (!giftOrdersPageExist) {
            await axios.post(`https://${shop}/admin/api/2021-01/pages.json`, {
                "page": {
                    "title": "Gift Orders",
                    "body_html": fs.readFileSync(path.join(__dirname, '..', '../shopify-web/gift-orders-page.liquid'), "utf8"),
                }
            }, {
                headers: {
                    "X-Shopify-Access-Token": accessToken
                },
            });
        }

        // create complete purchase page 
        if (!completePurchasePageExist) {
            await axios.post(`https://${shop}/admin/api/2021-01/pages.json`, {
                "page": {
                    "title": "Complete Purchase",
                    "body_html": fs.readFileSync(path.join(__dirname, '..', '../shopify-web/giftit-order-confirm.liquid'), "utf8"),
                }
            }, {
                headers: {
                    "X-Shopify-Access-Token": accessToken
                },
            });
        }
    } catch (err) {
        console.log(err)
    }
}


/**
 * Identifies the type of theme merchant currently has installed (Online Store 2.0 or Vintage Theme)
 * 
 * @param shop Name of the shopify store
 * @param accessToken Shopify accessToken for specific store
 * @return 
 */
export const getThemes = async (shop: string, accessToken: string): Promise<ThemeData | void> => {
    try {
        const ret: ThemeData = {
            theme: '',
            supportedTemplates: [],
            nonSupportedTemplates: []
        }
        // Get list of themes to find the main theme
        const { data: { themes } } = await axios.get(`https://${shop}/admin/api/2021-10/themes.json`, {
            headers: {
                "X-Shopify-Access-Token": accessToken
            }
        })
        const publishedTheme = themes.find((theme: any) => theme.role === 'main')
        ret.theme = publishedTheme.name

        // Get list of product assets in theme
        const { data: { assets } } = await axios.get(`https://${shop}/admin/api/2021-10/themes/${publishedTheme.id}/assets.json`, {
            headers: {
                "X-Shopify-Access-Token": accessToken
            }
        })
        const productTemplates = assets.filter((asset: any) => asset.key.startsWith("templates/product"))
        if (!productTemplates.length) {
            return ret
        }

        // Determine if product blocks are supported for each Product Template
        const templatesWithMainSections = (await Promise.all(productTemplates.map(async (file: any) => {
            const { data: { asset } } = await axios.get(`https://${shop}/admin/api/2021-10/themes/${publishedTheme.id}/assets.json?asset[key]=${file.key}`, {
                headers: {
                    "X-Shopify-Access-Token": accessToken
                }
            })
            try {
                const json = JSON.parse(asset.value)
                const main: any = Object.values(json.sections).find((section: any) => section.type)
                if (main) {
                    const ret = assets.find((file: any) => file.key === `sections/${main.type}.liquid`)
                    ret.template = file.key
                    return ret;
                }
            } catch {
                ret.nonSupportedTemplates.push(file.key)
            }
        }))).filter((value) => value)

        // only perform query on unique sections
        const uniqueSections = [...new Set(templatesWithMainSections)];
        //TODO: Test non json template
        if (!uniqueSections) {
            return ret
        }

        // Of the JSON files, if schema or @app in block exists, then app blocks are supported
        const sectionsWithAppBlock = (await Promise.all(uniqueSections.map(async (file: any) => {
            let acceptsAppBlock = false;
            const { data: { asset } } = await axios.get(`https://${shop}/admin/api/2021-10/themes/${publishedTheme.id}/assets.json?asset[key]=${file.key}`, {
                headers: {
                    "X-Shopify-Access-Token": accessToken
                }
            })

            const match = asset.value.match(/\{\%\s+schema\s+\%\}([\s\S]*?)\{\%\s+endschema\s+\%\}/m)
            const schema = JSON.parse(match[1]);

            if (schema && schema.blocks) {
                acceptsAppBlock = schema.blocks.some(((b: any) => b.type === '@app'));
            }

            return acceptsAppBlock ? file.key : null
        }))).filter((value) => value)

        // sort the templates based on what is supported
        templatesWithMainSections.forEach((element: any) => {
            if (sectionsWithAppBlock.some((val: string) => element.key === val)) {
                ret.supportedTemplates.push(element.template)
            } else {
                ret.nonSupportedTemplates.push(element.template)
            }
        })
        return ret
    } catch (error) {
        console.log(error)
    }
}

/**
 * Installs Script Tag on Older Themes
 * 
 * @param shop Name of the shopify store
 * @param accessToken Shopify accessToken for specific store
 * @return 
 */
export const installScriptTag = async (shop: string, accessToken: string): Promise<string | void> => {
    try {
        const { data: { data: { scriptTagCreate: { scriptTag } } } } = await axios.post(`https://${shop}/admin/api/2021-01/graphql.json`, {
            query: `mutation scriptTagCreate($input: ScriptTagInput!) {
                scriptTagCreate(input: $input) {
                    userErrors {
                        field
                        message
                    }
                    scriptTag {
                        id
                    }
                }
            }`,
            variables: {
                input: {
                    displayScope: 'ONLINE_STORE',
                    src: `${HOST}/giftit-script`
                }
            }
        }, {
            headers: {
                "X-Shopify-Access-Token": accessToken
            }
        })

        return scriptTag.id
    } catch (err) {
        console.log(err)
    }
}

/**
 * Uninstalls Script Tag on Older Themes
 * 
 * @param shop Name of the shopify store
 * @param accessToken Shopify accessToken for specific store
 * @return 
 */
export const uninstallScriptTag = async (shop: string, accessToken: string, scriptId: string): Promise<string | void> => {
    try {
        const { data: { data: { scriptTagDelete } } } = await axios.post(`https://${shop}/admin/api/2021-01/graphql.json`, {
            query: `mutation scriptTagDelete($id: ID!) {
                scriptTagDelete(id: $id) {
                    userErrors {
                        field
                        message
                    }
                    deletedScriptTagId
                }
            }`,
            variables: {
                id: scriptId
            }
        }, {
            headers: {
                "X-Shopify-Access-Token": accessToken
            }
        })
        return scriptTagDelete
    } catch (err) {
        console.log(err)
    }
}

//TODO: see how creating the cart interacts with sales/discounts (query price and compare at price)
/**
 * Returns global item IDs to be used for putting inventory items on hold
 * 
 * @param adminAccessToken AccessToken to make query to graphQL endpoint
 * @param shop Name of the shopify store
 * @param items List of all item IDs to query
 * @return List of inventory items and their levels
 */
export const getItemIds = async (adminAccessToken: string, shop: string, items: string[]): Promise<queryNodes[] | void> => {
    try {
        const { data: { data: { nodes } } }: { data: { data: { nodes: queryNodes[] } } } = await axios.post(`https://${shop}/admin/api/2021-01/graphql.json`, {
            query: `query retrieveIds($ids: [ID!]!) {
            nodes(ids: $ids) {
                ... on ProductVariant {
                    id
                    inventoryItem {
                        id
                        inventoryLevels(first: 8) {
                            edges {
                                node {
                                    id
                                    available
                                    incoming
                                }
                            }
                        }
                    }
                    inventoryPolicy
                    inventoryQuantity
                }
            }
        }`,
            variables: {
                ids: items
            }
        }, {
            headers: {
                "X-Shopify-Access-Token": adminAccessToken
            }
        })
        if (nodes[0]) {
            return nodes
        }
    } catch (err) {
        console.log(err)
        return
    }
}

/**
 * Returns an update to the graphQL query
 * - increment query increases quantity back when cancelled or when to be completed
 * - decrement query decreases quantity on initial order
 * 
 * @param queryId Unique ID for the query
 * @param inventoryLevelId location where inventory is to be adjusted
 * @param quantity amount to adjust inventory by
 * @return concatenated graphQL query
 */
export const generateQuery = (queryId: string, inventoryLevelId: string, quantity: number): string[] => {
    interface queryInput {
        inventoryLevelId: string;
        availableDelta: number;
    }
    const input: queryInput = {
        inventoryLevelId: inventoryLevelId,
        availableDelta: quantity
    }

    return ([
        `orderUpdate${queryId}: inventoryAdjustQuantity(
            input: {
                inventoryLevelId: "${input.inventoryLevelId}",
                availableDelta: ${input.availableDelta}
            }
        ) 
        {
            inventoryLevel {
                id
                available
            }
            userErrors {
                field
                message
            }
        }`,
        `orderUpdate${queryId}: inventoryAdjustQuantity(
            input: {
                inventoryLevelId: "${input.inventoryLevelId}",
                availableDelta: -${input.availableDelta}
            }
        ) 
        {
            inventoryLevel {
                id
                available
            }
            userErrors {
                field
                message
            }
        }`,
    ])
}

/**
 * Creates the Draft Invoice in the shopify store
 * 
 * @param adminAccessToken AccessToken to make query to graphQL endpoint
 * @param shop Name of the shopify store
 * @param origin URL of the shopify store that made request
 * @param itemList List of item global IDs
 * @param quantity Quantity of items order
 * @param orderInformation All special information entered by purchaser
 * @return New draft invoice ID
 */
export const createDraftInvoice = async (adminAccessToken: string, shop: string, itemList: queryNodes[], quantity: number[], email: string): Promise<any | void> => {
    let decrementInventoryQuery = '';
    // incrementInventoryQuery used later to add back inventory on hold
    let incrementInventoryQuery = '';

    const orderItems: lineItems[] = [];
    for (let i = 0; i < itemList.length; i++) {
        // draft order line items
        orderItems.push({
            variantId: itemList[i].id,
            quantity: quantity[i]
        });
        const inventoryLevels: inventoryLevels = itemList[i].inventoryItem.inventoryLevels

        // if allowed to order with insufficient inventory, push order through at any location
        if (itemList[i].inventoryPolicy === 'CONTINUE') {
            const [incrementInventory, decrementInventory] = generateQuery(String(i), inventoryLevels.edges[0].node.id, quantity[i]);
            incrementInventoryQuery += incrementInventory;
            decrementInventoryQuery += decrementInventory;
        }
        // else loop through each location to reserve items 
        else {
            let remainingOrder = quantity[i]
            let locationNum = 0
            while (remainingOrder > 0) {
                //TODO: must link back an error response to user
                if (locationNum >= inventoryLevels.edges.length) return
                const orderQuantity = Math.min(remainingOrder, inventoryLevels.edges[locationNum].node.available + inventoryLevels.edges[locationNum].node.incoming);
                const [incrementInventory, decrementInventory] = generateQuery(i + String.fromCharCode(65 + locationNum), inventoryLevels.edges[locationNum].node.id, orderQuantity);
                incrementInventoryQuery += incrementInventory;
                decrementInventoryQuery += decrementInventory;
                locationNum++;
                remainingOrder -= orderQuantity;
            }
        }
    }
    try {
        // put inventory items on hold
        await axios.post(`https://${shop}/admin/api/2021-01/graphql.json`, {
            query: `mutation {
                ${decrementInventoryQuery}
            }`
        }, {
            headers: {
                "X-Shopify-Access-Token": adminAccessToken
            }
        })
        //creates draft order
        const { data: { data: { draftOrderCreate: { draftOrder } } } } = await axios.post(`https://${shop}/admin/api/2021-01/graphql.json`, {
            query: `mutation draftOrderCreate($input: DraftOrderInput!) {
                draftOrderCreate(input: $input) {
                    draftOrder {
                        id
                        name
                        subtotalPrice
                        createdAt
                        email
                        invoiceUrl
                        lineItems(first:15) {
                            pageInfo {
                                hasNextPage
                            }
                            edges {
                                cursor
                                node {
                                    id
                                    image {
                                        originalSrc
                                        transformedSrc
                                    }
                                    name
                                    quantity
                                    discountedUnitPrice
                                    discountedTotal
                                }
                            }
                        }
                        privateMetafields(namespace: "__giftit", first: 1){
                            edges {
                                node {
                                    namespace
                                    value
                                }
                            }
                        }
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }`,
            variables: {
                input: {
                    email: email,
                    lineItems: orderItems,
                    tags: ['GiftIt Gift Order'],
                    privateMetafields: [
                        {
                            key: '__incrementQuery',
                            namespace: '__giftit',
                            valueInput: {
                                value: incrementInventoryQuery,
                                valueType: 'STRING'
                            }
                        }
                    ]
                }
            }
        }, {
            headers: {
                "X-Shopify-Access-Token": adminAccessToken
            }
        })
        return draftOrder;
    } catch (err) {
        return
    }
}

/**
 * Create custom email/text message
 * 
 * @param orderInformation 
 * @param message
 * @return new message with custom variables entered
 */
export const createMessage = (orderInformation: Order, message: string): string => {
    const newMessage = message.replace(/{{[^ ]+}}/g, (match) => {
        const key = match.replace(/[^a-zA-Z ]/g, "").trim()
        return orderInformation[key] as string
    })
    return newMessage
}

/**
 * Sendgrid send email
 * 
 * @param orderInformation 
 * @param message
 * @return new message with custom variables entered
 */
export const sendEmail = async (to: string, templateId: string, dynamicTemplateData: any, customArgs?: any): Promise<returnStatus> => {
    try {
        await sgMail.send({
            to: to,
            from: 'admin@giftitnow.io',
            templateId: templateId,
            dynamicTemplateData: dynamicTemplateData,
            ...(customArgs && {
                customArgs: customArgs
            })
        })
        return { type: 'success' }
    } catch (err: any) {
        if (err.response) {
            console.error(err.response.body)
        }
        return { type: 'error', message: 'purchaser email address' };
    }
}

/**
 * Send email confirmation to purchase & order update information to recipient
 * 
 * @param orderInformation 
 * @param url 
 * @param draftOrderId 
 * @return confirmation of emails being sent
 */
export const sendEmailOrMessage = async (orderInformation: any, url: string, draftOrder: any, configuration: emailConfiguration): Promise<returnStatus> => {
    // updates the custom message with custom items
    const purchaserCustomMessage = createMessage(orderInformation, configuration.purchaserCustomMessage)

    //TODO: update from email to actual email
    // send email to purchaser confirming order has been placed
    let ret = await sendEmail(orderInformation.purchaserEmail, 'd-ea22e637a8a34f99ba10de39d8a946ab', {
        subject: 'You sent a gift!',
        title: `Thank you, ${orderInformation.purchaserName}! Your gift order has been placed!`,
        items: draftOrder.lineItems.edges,
        subtotalPrice: draftOrder.subtotalPrice,
        customMessage: `<table class="module" role="module" data-type="text"
        border="0" cellpadding="0" cellspacing="0" width="100%"
        style="table-layout: fixed;">
        <tr>
            <td style="padding:25px 20px 25px 20px;line-height:20px;text-align:inherit;"
                height="100%" valign="top" bgcolor="">
                ${purchaserCustomMessage}
            </td>
        </tr>
    </table>`
    }, {
        id: draftOrder.id,
        shop: orderInformation.shop
    })

    if (ret.type === 'error') {
        return ret
    }
    // TODO: test sending out text messages international
    // send out a email/text to the recipient to accept & change the address of the order
    if (orderInformation.method === 'Email') {
        ret = await sendEmail(orderInformation.recipientEmail, 'd-9014cdfc25ce454e9ca5610bce3fd688', {
            subject: `GiftIt: ${orderInformation.purchaserName} has a gift for you from ${orderInformation.storeName}!`,
            url: `<a style="color: white; text-decoration: none;" href=${url}/pages/gift-orders?orderId=${encodeURIComponent(draftOrder.id)}&token=${orderInformation.token}>UPDATE YOUR ADDRESS</a>`,
            purchaserName: orderInformation.purchaserName,
            purchaserMessage: orderInformation.message.trim().replace(/</g, '&lt;'),
            purchaserMessageName: orderInformation.message && `- ${orderInformation.purchaserName}`,
        }, {
            id: draftOrder.id,
            shop: orderInformation.shop
        })
    } else {
        // TODO: shorten URL
        // send text message
        await client.messages
            .create({
                body: `${orderInformation.purchaserName} sent you a gift! \n${(orderInformation.message.trim() || '')} \nClick here ${url}/pages/gift-orders?orderId=${encodeURIComponent(draftOrder.id)}&token=${orderInformation.token} to confirm the shipping address`,
                from: '+16473715520',
                to: `${orderInformation.phone}`
            })
            .then((message: any) => console.log(message))
            .catch((err: any) => {
                console.log(err)
                ret.type = 'error'
                ret.message = 'recipient phone number'
            });
    }
    return ret;
}

const find_province = (arr: any, key: string): number => {
    let start = 0;
    let end = arr.length - 1;
    while (start <= end) {
        let middle = Math.floor((start + end) / 2);
        if (arr[middle][0] === key) {
            // found the key
            return middle;
        } else if (arr[middle][0] < key) {
            // continue searching to the right
            start = middle + 1;
        } else {
            // search searching to the left
            end = middle - 1;
        }
    }
    return -1;
}

// TODO: address validation
//update shipping address for draft order
export const updateCustomerAddress = async (accessToken: string, updateInformation: any, url: string): Promise<returnStatus> => {
    if (updateInformation.country.toLowerCase() === 'united states') updateInformation.country += ' of America'
    const country_code = countries.getAlpha2Code(updateInformation.country, "en");
    let province = '';
    //TODO: must link back an error response to user
    if (!country_code) {
        return { type: 'error', message: 'invalid country' }
    }

    try {
        // shopify get only supports CA/US
        if (country_code === 'CA' || country_code === 'US') {

            // proper case the province
            const splitProv = updateInformation.province.toLowerCase().split(' ');
            for (let i = 0; i < splitProv.length; i++) {
                // Assign it back to the array
                splitProv[i] = splitProv[i].charAt(0).toUpperCase() + splitProv[i].substring(1);     
            }
            updateInformation.province = splitProv.join(' '); 

            // return province/state based on country (only support CAN & US)
            let tempProvince: any;
            if (country_code === 'CA') {
                tempProvince = provinces[find_province(provinces, updateInformation.province)]
            } else {
                tempProvince = states[find_province(states, updateInformation.province)]
            }

            if (tempProvince) {
                province = tempProvince[1]
            } else {
                //TODO: must link back an error response to user
                return { type: 'error', message: 'invalid province' }
            }
        }
        // update the draft invoice shipping information
        const { data: { data: { draftOrderUpdate: { draftOrder } } } } = await axios.post(`https://${updateInformation.shop}/admin/api/2021-01/graphql.json`, {
            query: `mutation draftOrderUpdate($id: ID!, $input: DraftOrderInput!) {
                draftOrderUpdate(id: $id, input: $input) {
                    draftOrder {
                        legacyResourceId
                        id
                        name
                        lineItems(first: 1) {
                            edges {
                                node {
                                  quantity
                                  image {
                                    originalSrc
                                  }
                                  name
                                  discountedTotal
                                  discountedUnitPrice
                                }
                              }
                        }
                        email
                        shippingAddress {
                            address1
                            city
                            province
                            provinceCode
                            country
                            countryCodeV2
                        }
                        subtotalPrice 
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }`,
            variables: {
                id: updateInformation.orderId,
                input: {
                    shippingAddress: {
                        address1: updateInformation.ship_address,
                        address2: updateInformation.address2,
                        city: updateInformation.city,
                        country: country_code,
                        firstName: updateInformation.first_name,
                        lastName: updateInformation.last_name,
                        province: province,
                        zip: updateInformation.zip
                    }
                }
            }
        }, {
            headers: {
                "X-Shopify-Access-Token": accessToken
            }
        })
        //TODO: Allow custom message
        const ret = await sendEmail(draftOrder.email, 'd-a79538a838cf4026b327163c5e01adf4', {
            subject: 'Complete your purchase',
            title: `${updateInformation.first_name.charAt(0).toUpperCase() + updateInformation.first_name.slice(1)} has updated their address!`,
            items: draftOrder.lineItems.edges,
            subtotalPrice: draftOrder.subtotalPrice,
            shopCta: `<div align="center">
            <div style="text-decoration: none;display: inline-block;color: #ffffff; background-color: #00d2b9; border-radius: 0px; width: auto; border-top: 0px solid #a5cea3; border-right: 0px solid #a5cea3; border-bottom: 0px solid #a5cea3; border-left: 0px solid #a5cea3; padding-top: 10px; padding-bottom: 10px; font-family: Arial,Helvetica Neue,Helvetica,sans-serif; text-align: center; word-break: keep-all; margin: 20px auto;">
                <span style="padding-left: 20px;padding-right: 20px;font-size: 16px;display: inline-block;">
                    <a style="color: white; text-decoration: none;" href=${url}/pages/complete-purchase?draftOrder=${draftOrder.legacyResourceId}>Complete your order</a>
                </span>
            </div>
        </div>`
        })
        if (ret.type === 'error') {
            return ret
        }

        return { type: 'success', content: draftOrder }
    } catch (err) {
        console.log(err)
        return { type: 'error', content: err }
    }
}

// add back inventory from the initial purchase
export const addBackInventory = async (accessToken: string, orderInformation: any): Promise<string | void> => {
    try {
        // get the draftOrder information
        const { data: { data: { draftOrder } } } = await axios.post(`https://${orderInformation.shop}/admin/api/2021-01/graphql.json`, {
            query: `query draftOrder($id: ID!) {
                draftOrder(id: $id) {
                    id
                    privateMetafield(namespace: "__giftit", key: "__incrementQuery") {
                        value
                    }
                    invoiceUrl
                }
            }`,
            variables: {
                id: `gid://shopify/DraftOrder/${orderInformation.draftOrder}`
            }
        }, {
            headers: {
                "X-Shopify-Access-Token": accessToken
            }
        })
        // mutate original draft order to add back inventory
        await axios.post(`https://${orderInformation.shop}/admin/api/2021-01/graphql.json`, {
            query: `mutation {
                ${draftOrder.privateMetafield.value}
            }`
        }, {
            headers: {
                "X-Shopify-Access-Token": accessToken
            }
        })
        // return the draft order invoice url
        return draftOrder.invoiceUrl
    } catch (err) {
        console.log(err)
    }
}

/**
 * Delete draft orders on Shopify
 * 
 * @param accessToken 
 * @param origin 
 * @param order
 * @param subject
 * @param deleteMessage
 * @return completion status
 */
export const deleteOrders = async (accessToken: string, origin: any, order: Order, subject: string, deleteMessage: string): Promise<returnStatus> => {
    let ret: returnStatus = { type: 'success' }
    try {
        // delete the draft invoice
        const { data: { data: { draftOrderDelete: { deletedId } } } } = await axios.post(`https://${origin}/admin/api/2021-01/graphql.json`, {
            query: `mutation draftOrderDelete($input: DraftOrderDeleteInput!) {
                draftOrderDelete(input: $input) {
                    deletedId
                    userErrors {
                      field
                      message
                    }
                }
            }`,
            variables: {
                input: {
                    id: order.id,
                }
            }
        }, {
            headers: {
                "X-Shopify-Access-Token": accessToken
            }
        })
    } catch (err) {
        console.log(err)
        ret.type = 'error'
        ret.message = 'Unable to delete'
        return ret
    }
    // send deleted email to purchaser
    ret = await sendEmail(order.purchaserEmail, 'd-6b3fb774c0cf492c8822ce96a58d6115', {
        subject: subject,
        title: "The merchant has cancelled your order.",
        customMessage: deleteMessage
    })
    return ret;
}

/**
 * Send email confirmation to purchase & order update information to recipient
 * 
 * @param order 
 * @param origin 
 * @param shop 
 * @param accessToken 
 * @param storeName 
 * @return confirmation of emails being sent
 */
export const sendReminderEmail = async (order: Order, origin: string, shop: string, accessToken: string, storeName: string): Promise<returnStatus> => {
    let ret: returnStatus = { type: 'success' }
    const url = `${origin}/pages/gift-orders?orderId=${encodeURIComponent(order.id)}&token=${order.token}`
    // if status is open, send reminder to recipient to update address
    if (order.status === 'Open') {
        if (order.recipientEmail) {
            // send email
            ret = await sendEmail(order.recipientEmail, 'd-9014cdfc25ce454e9ca5610bce3fd688', {
                subject: `GiftIt: ${order.purchaserName} has a gift for you from ${storeName}!`,
                url: `<a style="color: white; text-decoration: none;" href=${url}>UPDATE YOUR ADDRESS</a>`,
                reminderMessage: 'Seems like you forgot to update your address...',
                purchaserName: order.purchaserName,
                purchaserMessage: order.customMessage.trim().replace(/</g, '&lt;'),
                purchaserMessageName: order.customMessage && `- ${order.purchaserName}`,
            })
        } else {
            // send text message
            await client.messages
                .create({
                    body: `Seems like you forgot to update your address... \nClick here ${url} to confirm the shipping address`,
                    from: '+16473715520',
                    to: `${order.recipientPhone}`
                })
                .then((message: any) => console.log(message))
                .catch(() => {
                    ret.type = 'error'
                    ret.message = 'recipient phone number'
                });
        }
    }
    // Reminder to purchaser to make payment
    else if (order.status === 'Pending Payment') {
        try {
            // send invoice to purchaser to complete transaction
            await axios.post(`https://${shop}/admin/api/2021-01/graphql.json`, {
                query: `mutation draftOrderInvoiceSend($id: ID!, $email:EmailInput) {
                    draftOrderInvoiceSend(id: $id, email: $email) {
                        draftOrder {
                            id
                        }
                        userErrors {
                            field
                            message
                        }
                    }
                }`,
                variables: {
                    id: order.id,
                    email: {
                        to: order.purchaserEmail,
                        subject: 'Confirm your order'
                    }
                }
            }, {
                headers: {
                    "X-Shopify-Access-Token": accessToken
                }
            })
        }
        catch (err) {
            ret.type = 'error'
            ret.message = 'shopifyError'
        }
    }
    return ret;
}

/**
 * Send email confirmation to purchase & order update information to recipient
 * 
 * @param customerOrders 
 * @param shopEmail
 * @return confirmation of emails being sent
 */
export const sendCustomerInfoEmail = async (customerId: string, csv: string, shopInfo: any): Promise<returnStatus> => {
    const ret: returnStatus = { type: 'success' }
    const customerExist = csv.length > 57
    // send email
    try {
        await sgMail.send({
            to: shopInfo.storeEmail,
            from: 'admin@giftitnow.io',
            subject: `GiftIt Customer Information on Customer ${customerId}`,
            text: `Hello ${shopInfo.storeName},

${customerExist ? `Please see the attached csv file for customer ${customerId}` : `No information is being stored for customer ${customerId}`}.

Best regards,
Team GiftIt`,
            ...(customerExist && {
                attachments: [
                    {
                        content: Buffer.from(csv).toString('base64'),
                        filename: "customerInfo.csv",
                        type: "application/csv",
                        disposition: "attachment"
                    }
                ]
            })
        })
    } catch (error: any) {
        console.error(error);
        if (error.response) {
            console.error(error.response.body)
        }
        ret.type = 'error'
        ret.message = 'recipient email address'
    }
    return ret;
}