import {
  Layout,
  Page,
  EmptyState,
  Card,
  Stack,
  DisplayText,
} from '@shopify/polaris';
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from "prop-types";
import { useRouter } from "next/router";
const frappe = require("../node_modules/frappe-charts/dist/frappe-charts.min.esm")
const { Chart } = frappe
import LearnMore from '../components/LearnMore'

import { useAppBridge } from '@shopify/app-bridge-react';
import { getSessionToken } from "@shopify/app-bridge-utils";

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

interface IProps {
  appName: string;
  orders: {
    id: string,
    name: string,
    createdAt: string,
    status: string
    price: string,
    email: string,
    url: string
  }[]
}

const Index = (props: IProps) => {
  const router = useRouter();
  const [outstandingOrders, setOutstandingOrders] = useState<number>(0)
  const [completedOrders, setCompletedOrders] = useState<number>(0)
  const [totalOrderPrice, setTotalOrderPrice] = useState<string>('')
  const [averageOrderPrice, setAverageOrderPrice] = useState<string>('')
  const [modalActive, setModalActive] = useState(false)

  const monthlyGiftOrders = useRef(null);
  const monthlyGiftOrdersAmount = useRef(null);
  const shopifyApp = useAppBridge();

  useEffect(() => {
    const getOrderPrices = async (totalPrice: number) => {
      const sessionToken = await getSessionToken(shopifyApp);
      const currencyCode = await (await fetch(`https://giftit-app.herokuapp.com/graphql`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Authorization': sessionToken
        },
        body: `
              query GetCurrency {
                shop {
                  currencyCode
                }
              }
            `
      })).text()
      setTotalOrderPrice(`${currencyCode} ${totalPrice.toFixed(2)}`);
      setAverageOrderPrice(`${currencyCode} ${(totalPrice / props.orders.length).toFixed(2)}`);
    }
    if (props.orders.length) {
      let outstanding = 0
      let completed = 0
      let totalPrice = 0
      const today = new Date()
      const referenceDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const minDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
      const monthlyCount = [0, 0, 0]
      const monthlyAmountTotal = [0, 0, 0]

      for (let i = 0; i < props.orders.length; i++) {
        props.orders[i].status === 'Complete' ? completed++ : outstanding++;
        totalPrice += +props.orders[i].price
        const orderDate = new Date(props.orders[i].createdAt)
        if (orderDate >= minDate && orderDate <= referenceDate) {
          const index = (minDate.getFullYear() - orderDate.getFullYear()) * 12 + orderDate.getMonth() - minDate.getMonth();
          monthlyCount[index] += 1
          monthlyAmountTotal[index] += +props.orders[i].price
        }
      }

      setOutstandingOrders(outstanding);
      setCompletedOrders(completed);
      getOrderPrices(totalPrice)
      // display data for past 3 months
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const labels = [
        `${months[(referenceDate.getMonth() - 2 + 12) % 12]} ${referenceDate.getFullYear() - 1 + Math.floor((referenceDate.getMonth() - 2 + 12) / 12)}`,
        `${months[(referenceDate.getMonth() - 1 + 12) % 12]} ${referenceDate.getFullYear() - 1 + Math.floor((referenceDate.getMonth() - 1 + 12) / 12)}`,
        `${months[referenceDate.getMonth()]} ${referenceDate.getFullYear()}`
      ]
      new Chart(monthlyGiftOrders.current, {
        data: {
          labels: labels,
          datasets: [{ values: monthlyCount }]
        },
        type: 'bar',
        axisOptions: { xAxisMode: 'tick' },
        height: 250,
        colors: ['blue']
      })
      new Chart(monthlyGiftOrdersAmount.current, {
        data: {
          labels: labels,
          datasets: [{ values: monthlyAmountTotal }]
        },
        type: 'bar',
        axisOptions: { xAxisMode: 'tick' },
        height: 250,
        colors: ['#743ee2']
      })
    }
  }, [props.orders])

  return (
    <Page
      title="Dashboard"
    >
      <Layout>
        {props.orders.length ? (
          <>
            <div style={{ textAlign: "center", width: "100%", margin: "1.6rem" }}>
              <Stack distribution="fill">
                <Card title="Outstanding Orders" sectioned>
                  <p className="Dashboard-Text">{outstandingOrders}</p>
                </Card>
                <Card title="Completed Orders" sectioned>
                  <p className="Dashboard-Text">{completedOrders}</p>
                </Card>
                <Card title="Total Order Amount" sectioned>
                  <p className="Dashboard-Text">{totalOrderPrice}</p>
                </Card>
                <Card title="Average Order Amount" sectioned>
                  <p className="Dashboard-Text">{averageOrderPrice}</p>
                </Card>
              </Stack>
            </div>
            <div style={{ display: 'flex', textAlign: "center", width: "100%" }}>
              <div style={{ width: '50%' }}>
                <DisplayText size="small">Monthly Gift Orders</DisplayText>
                {React.createElement("div", { ref: monthlyGiftOrders })}
              </div>
              <div style={{ width: '50%' }}>
                <DisplayText size="small">Monthly Gift Orders Amount</DisplayText>
                {React.createElement("div", { ref: monthlyGiftOrdersAmount })}
              </div>
            </div>
          </>
        ) : (
          <>
              <EmptyState
                heading="It seems like you have no gift orders yet"
                secondaryAction={{
                  content: 'Learn more',
                  accessibilityLabel: 'Learn more',
                  onAction: () => setModalActive(!modalActive),
                }}
                image={img}
              >
              </EmptyState>
              <LearnMore
                active={modalActive}
                setActive={setModalActive}
              />
          </>
        )}
      </Layout>
    </Page >
  )
}

Index.propTypes = {
  appName: PropTypes.string.isRequired,
  orders: PropTypes.array.isRequired,
}

export default Index;