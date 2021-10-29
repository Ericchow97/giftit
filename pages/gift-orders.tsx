import {
    Card,
    Page,
    EmptyState,
    IndexTable,
    TextStyle,
    useIndexResourceState,
    Filters,
    ChoiceList,
    Select,
    Button,
    Modal,
    Layout,
    Heading,
    TextContainer,
    Frame,
    Toast,
    Badge,
  } from '@shopify/polaris';
  
  import {
    MobileHorizontalDotsMajor
  } from '@shopify/polaris-icons';
  
  import React, { useCallback, useState } from 'react'
  import { useRouter } from "next/router";
  import PropTypes from "prop-types";
  import LearnMore from '../components/LearnMore';
  
  import { useAppBridge } from '@shopify/app-bridge-react';
  import { getSessionToken } from "@shopify/app-bridge-utils";
  
  interface IProps {
    shopOrigin: string,
    orders: {
      id: string,
      name: string,
      createdAt: string,
      status: string
      price: string,
      purchaserName: string,
      purchaserEmail: string,
      recipientName: string,
      recipientEmail: string,
      recipientPhone: string,
      lastEmailSentPurchaser: string,
      lastEmailSentRecipient: string,
      tag: string,
      url: string
    }[]
  }
  
  interface Order {
    id: string,
    name: string,
    createdAt: string,
    status: string
    price: string,
    purchaserName: string,
    purchaserEmail: string,
    recipientName: string,
    recipientEmail: string,
    recipientPhone: string,
    lastEmailSentPurchaser: string,
    lastEmailSentRecipient: string,
    tag: string,
    url: string,
    [key: string]: string
  }
  
  interface ActiveOrder {
    order: Order,
    index: number
  }
  
  const GiftOrders = ({ shopOrigin, orders }: IProps) => {
    const [activeOrders, setActiveOrders] = useState<Order[]>(orders)
    const [activeOrder, setActiveOrder] = useState<ActiveOrder>({ order: orders[0], index: 0 });
  
    // Filter states
    const [statusSelect, setStatusSelect] = useState<string[]>([]);
    const [tagSelect, setTagSelect] = useState<string[]>([]);
    const [queryValue, setQueryValue] = useState('');
    const [sortValue, setSortValue] = useState('createdAt Ascending');
  
    // Modals
    const [active, setActive] = useState(false);
    const [confirmActive, setConfirmActive] = useState(false);
    const [activeLearnMoreModal, setActiveLearnMoreModal] = useState(false);
    const [activeBulkDeleteModal, setActiveBulkDeleteModal] = useState(false);
    const [removeList, setRemoveList] = useState<Order[]>([])
  
    // UI states
    const [toastActiveDelete, setToastActiveDelete] = useState(false);
    const [toastActiveEmail, setToastActiveEmail] = useState(false);
    const [toastActiveFail, setToastActiveFail] = useState(false);
  
    const router = useRouter();
    const today = new Date();
    const app = useAppBridge();
  
    /********************* FILTERS *********************/
    const filters = [
      {
        key: 'status',
        label: 'Status',
        filter: (
          <ChoiceList
            title="Status"
            titleHidden
            choices={[
              { label: 'Open', value: 'Open' },
              { label: 'Pending Payment', value: 'Pending Payment' },
              { label: 'Complete', value: 'Complete' },
            ]}
            selected={statusSelect}
            onChange={(values: string[]) => setStatusSelect(values)}
            allowMultiple
          />
        ),
        shortcut: true,
        hideClearButton: true,
      },
      {
        key: 'tag',
        label: 'Tag',
        filter: (
          <ChoiceList
            title="Tag"
            titleHidden
            choices={[
              { label: 'Recipient reminder', value: 'Recipient reminder' },
              { label: 'Payment reminder', value: 'Payment reminder' },
            ]}
            selected={tagSelect}
            onChange={(values: string[]) => setTagSelect(values)}
            allowMultiple
          />
        ),
        shortcut: true,
        hideClearButton: true,
      },
    ];
  
    // Tags for filters
    const appliedFilters = [];
    for (let i = 0; i < statusSelect.length; i++) {
      appliedFilters.push({
        key: statusSelect[i],
        label: statusSelect[i],
        onRemove: (value: string) => setStatusSelect(val => val.filter(e => e !== value)),
      });
    }
    for (let i = 0; i < tagSelect.length; i++) {
      appliedFilters.push({
        key: tagSelect[i],
        label: tagSelect[i],
        onRemove: (value: string) => setTagSelect(val => val.filter(e => e !== value)),
      });
    }
  
    /********************* SORTING *********************/
    const sortOptions = [
      { label: 'Date Descending', value: 'createdAt Descending' },
      { label: 'Date Ascending', value: 'createdAt Ascending' },
      { label: 'Order Number Descending', value: 'name Descending' },
      { label: 'Order Number Ascending', value: 'name Ascending' },
      { label: 'Total Descending', value: 'price Descending' },
      { label: 'Total Ascending', value: 'price Ascending' },
    ];
  
    const handleSort = (value: string) => {
      setSortValue(value);
      const sortInfo: string[] = value.split(' ');
      const sortMultiplier = sortInfo[1] === 'Ascending' ? 1 : -1;
      activeOrders.sort((a: Order, b: Order) => {
        if (a[sortInfo[0]] > b[sortInfo[0]]) {
          return 1 * sortMultiplier
        } else if (a[sortInfo[0]] < b[sortInfo[0]]) {
          return -1 * sortMultiplier
        } else {
          return 1
        }
      })
    }
  
    /********************* MODAL *********************/
    const toggleModal = (type?: string) => {
      if (type === 'confirm') {
        setConfirmActive(!confirmActive)
        return
      }
      setActive(!active)
    }
  
    const handleOpen = (index: number) => {
      setActiveOrder({ order: activeOrders[index], index: index })
      toggleModal();
    }
  
    /********************* Bulk Actions *********************/
    const promotedBulkActions = [
      {
        content: 'Delete orders',
        onAction: () => {
          const selected = [];
          for (let i = 0; i < activeOrders.length; i++) {
            if (selectedResources.includes(activeOrders[i].id)) {
              selected.push(activeOrders[i])
            }
            if (selected.length === selectedResources.length) {
              break
            }
          }
          setRemoveList(selected)
          setActiveBulkDeleteModal(true)
        }
      },
      {
        content: 'Send reminder emails',
        onAction: () => handleReminderEmail()
      },
    ];
  
    const handleDelete = async (type?: string) => {
      const toRemove: Order[] = [];
      if (type === 'single') {
        toRemove.push(activeOrder.order)
      } else {
        toRemove.push(...removeList)
      }
  
      const sessionToken = await getSessionToken(app);
  
      const ret = await (await fetch(`https://3a5b-2607-fea8-a380-852-bd63-e991-7e80-f43f.ngrok.io/delete-orders`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionToken
        },
        body: JSON.stringify({ toRemove: toRemove })
      }
      )).json()
  
      const idList = toRemove.map(e => e.id)
  
      if (ret.success) {
        const tmp = activeOrders.filter(order => !idList.includes(order.id))
        setActiveOrder({ order: tmp[0], index: 0 })
        setActiveOrders(tmp)
        selectedResources.length = 0
        setToastActiveDelete(true)
      } else {
        console.log(ret)
      }
    }
  
    const handleReminderEmail = async (singleOrder?: ActiveOrder) => {
      const emailList: Order[] = []
      const activeOrdersCopy = [...activeOrders]
      const currTime = new Date()
      // single reminder email
      if (singleOrder) {
        if (activeOrdersCopy[singleOrder.index].status === 'Open' && currTime.getTime() > new Date(activeOrdersCopy[singleOrder.index].lastEmailSentRecipient).getTime() + 60 * 60 * 1000) {
          activeOrdersCopy[singleOrder.index].lastEmailSentRecipient = currTime.toISOString()
          activeOrdersCopy[singleOrder.index].tag = ''
          emailList.push(singleOrder.order)
        } else if (activeOrdersCopy[singleOrder.index].status === 'Pending Payment' && currTime.getTime() > new Date(activeOrdersCopy[singleOrder.index].lastEmailSentPurchaser).getTime() + 60 * 60 * 1000) {
          activeOrdersCopy[singleOrder.index].lastEmailSentPurchaser = currTime.toISOString()
          activeOrdersCopy[singleOrder.index].tag = ''
          emailList.push(singleOrder.order)
        }
      } else {
        // group reminder email
        let matchCount = 0;
        for (let i = 0; i < activeOrdersCopy.length; i++) {
          if (selectedResources.includes(activeOrdersCopy[i].id)) {
            matchCount++;
            if (activeOrdersCopy[i].status === 'Open' && currTime.getTime() > new Date(activeOrdersCopy[i].lastEmailSentRecipient).getTime() + 60 * 60 * 1000) {
              activeOrdersCopy[i].lastEmailSentRecipient = currTime.toISOString()
              emailList.push(activeOrdersCopy[i])
            } else if (activeOrdersCopy[i].status === 'Pending Payment' && currTime.getTime() > new Date(activeOrdersCopy[i].lastEmailSentPurchaser).getTime() + 60 * 60 * 1000) {
              activeOrdersCopy[i].lastEmailSentPurchaser = currTime.toISOString()
              emailList.push(activeOrdersCopy[i])
            }
            activeOrdersCopy[i].tag = ''
          }
          if (matchCount === selectedResources.length) {
            break
          }
        }
      }
      if (emailList.length) {
        const sessionToken = await getSessionToken(app);
  
        const ret = await (await fetch(`https://3a5b-2607-fea8-a380-852-bd63-e991-7e80-f43f.ngrok.io/send-reminders`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': sessionToken
          },
          body: JSON.stringify({ emailList: emailList })
        }
        )).json()
  
        if (ret.success) {
          setActiveOrders(activeOrdersCopy)
          setToastActiveEmail(true)
        }
      } else {
        setToastActiveFail(true)
      }
    }
  
    /********************* TABLE ROWS *********************/
    const displayOrders = activeOrders.filter(
      (order) => {
        if (order.status === "Open" && today.getTime() > (new Date(order.lastEmailSentRecipient).getTime() + 22 * 60 * 60 * 1000)) {
          order.tag = "Recipient reminder"
        } else if (order.status === "Pending Payment" && today.getTime() > (new Date(order.lastEmailSentPurchaser).getTime() + 22 * 60 * 60 * 1000)) {
          order.tag = "Payment reminder"
        }
        const querySearch = (
          order.purchaserName.toLowerCase().indexOf(queryValue.toLowerCase()) > -1 ||
          order.recipientName.toLowerCase().indexOf(queryValue.toLowerCase()) > -1 ||
          order.status.toLowerCase().indexOf(queryValue.toLowerCase()) > -1 ||
          order.purchaserEmail.toLowerCase().indexOf(queryValue.toLowerCase()) > -1 ||
          order.recipientEmail.toLowerCase().indexOf(queryValue.toLowerCase()) > -1 ||
          order.recipientPhone.toLowerCase().indexOf(queryValue.toLowerCase()) > -1
        )
        const statusFilter = (!statusSelect.length || statusSelect.includes(order.status))
        const tagFilter = (!tagSelect.length || tagSelect.includes(order.tag))
        if (querySearch && statusFilter && tagFilter) {
          return order
        } return
      }
    );
  
    const {
      selectedResources,
      allResourcesSelected,
      handleSelectionChange,
    } = useIndexResourceState(displayOrders);
  
    const rowMarkup = displayOrders.map(
      ({ id, purchaserName, recipientName, createdAt, status, price, tag }, index) => {
        return (
          <IndexTable.Row
            id={id}
            key={id}
            selected={selectedResources.includes(id)}
            position={index}
          >
            <IndexTable.Cell>{createdAt.substr(0, createdAt.indexOf('T'))}</IndexTable.Cell>
            <IndexTable.Cell>
              <TextStyle variation="strong">{recipientName.length <= 20 ? recipientName : recipientName.substring(0, 20) + '...'}</TextStyle>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <TextStyle variation="strong">{purchaserName.length <= 20 ? purchaserName : purchaserName.substring(0, 20) + '...'}</TextStyle>
            </IndexTable.Cell>
            <IndexTable.Cell>{status}</IndexTable.Cell>
            <IndexTable.Cell>{price}</IndexTable.Cell>
            <IndexTable.Cell>
              {tag === 'Recipient reminder' &&
                <Badge status="attention">Recipient reminder</Badge>
              }
              {tag === 'Payment reminder' &&
                <Badge status="attention">Payment reminder</Badge>
              }
            </IndexTable.Cell>
            <IndexTable.Cell >{
              <Button
                onClick={() => handleOpen(index)}
                icon={MobileHorizontalDotsMajor}
                size="slim"
              ></Button>
            }
            </IndexTable.Cell>
          </IndexTable.Row>
        )
      }
    );
  
    // TODO: Test pagination
    return (
      <>
        <Frame>
          <Page
            title="Orders"
          >
            <Card sectioned>
              {activeOrders.length ? (
                <>
                  <div style={{ padding: '16px', display: 'flex' }}>
                    <div style={{ flex: 1 }}>
                      <Filters
                        queryValue={queryValue}
                        filters={filters}
                        appliedFilters={appliedFilters}
                        onQueryChange={setQueryValue}
                        onQueryClear={() => setQueryValue('')}
                        onClearAll={useCallback(() => {
                          setStatusSelect([]);
                          setTagSelect([]);
                        }, [
                          setStatusSelect,
                          setTagSelect,
                        ])}
                      />
                    </div>
                    <div style={{ paddingLeft: '0.4rem' }}></div>
                    <Select
                      labelInline
                      label="Sort by"
                      options={sortOptions}
                      value={sortValue}
                      onChange={handleSort}
                    />
                  </div>
                  <IndexTable
                    resourceName={{
                      singular: 'Gift Order',
                      plural: 'Gift Orders'
                    }}
                    itemCount={activeOrders.length}
                    selectedItemsCount={
                      allResourcesSelected ? 'All' : selectedResources.length
                    }
                    onSelectionChange={(selectionType, isSelecting, selection) => handleSelectionChange(
                      selectionType,
                      selectionType === 'page' && displayOrders.length === selectedResources.length ? false : isSelecting,
                      selection
                    )}
                    promotedBulkActions={promotedBulkActions}
                    headings={[
                      { title: 'Date' },
                      { title: 'To' },
                      { title: 'From' },
                      { title: 'Status' },
                      { title: 'Total' },
                      { title: 'Tags' },
                      { title: '' },
                    ]}
                    hasMoreItems
                  >
                    {rowMarkup}
                  </IndexTable>
                  {activeOrder.order &&
                    <>
                      <Modal
                        open={active}
                        onClose={toggleModal}
                        title="Order Details"
                        primaryAction={{
                          content: 'Edit Order',
                          accessibilityLabel: "Edit Order",
                          external: true,
                          url: `https://${shopOrigin}/admin/draft_orders/${activeOrder.order.id.substring(activeOrder.order.id.lastIndexOf('/') + 1)}`
                        }}
                        secondaryActions={[
                          {
                            content: 'Send Reminder Email',
                            accessibilityLabel: 'Send Reminder Email',
                            outline: true,
                            onAction: () => handleReminderEmail(activeOrder),
                          },
                          {
                            content: 'Delete',
                            accessibilityLabel: 'Delete',
                            destructive: true,
                            onAction: () => { toggleModal(); toggleModal('confirm') },
                          },
                        ]}
                      >
                        <Modal.Section>
                          <TextContainer spacing="tight">
                            <p><TextStyle variation="strong">Draft Order:</TextStyle> {activeOrder.order.name}</p>
                            <p><TextStyle variation="strong">Order Date:</TextStyle> {activeOrder.order.createdAt.substr(0, activeOrder.order.createdAt.indexOf('T'))}</p>
                            <p><TextStyle variation="strong">Status:</TextStyle> {activeOrder.order.status}</p>
                            <p><TextStyle variation="strong">Price:</TextStyle>: {activeOrder.order.price}</p>
                            <Layout>
                              <Layout.Section oneHalf>
                                <Heading>Purchaser Information</Heading>
                                <p><TextStyle variation="strong">Name:</TextStyle> {activeOrder.order.purchaserName}</p>
                                <p><TextStyle variation="strong">Contact:</TextStyle> {activeOrder.order.purchaserEmail}</p>
                                <p><TextStyle variation="strong">Email Last Sent:</TextStyle> {new Date(activeOrder.order.lastEmailSentPurchaser).toLocaleString()}</p>
                              </Layout.Section>
                              <Layout.Section oneHalf>
                                <Heading>Recipient Information</Heading>
                                <p><TextStyle variation="strong">Name:</TextStyle> {activeOrder.order.recipientName}</p>
                                <p><TextStyle variation="strong">Contact:</TextStyle> {activeOrder.order.recipientEmail || `${activeOrder.order.recipientPhone}`}</p>
                                <p><TextStyle variation="strong">Email Last Sent:</TextStyle> {new Date(activeOrder.order.lastEmailSentRecipient).toLocaleString()}</p>
                              </Layout.Section>
                            </Layout>
                          </TextContainer>
                        </Modal.Section>
                      </Modal>
                      <Modal
                        open={confirmActive}
                        onClose={() => { toggleModal(); toggleModal('confirm') }}
                        title="Confirm Delete"
                        primaryAction={{
                          content: 'Yes',
                          accessibilityLabel: "Yes",
                          onAction: () => { handleDelete('single'); toggleModal('confirm') },
                        }}
                        secondaryActions={[
                          {
                            content: 'No',
                            accessibilityLabel: 'No',
                            destructive: true,
                            onAction: () => { toggleModal(); toggleModal('confirm') },
                          },
                        ]}
                      >
                        <Modal.Section>
                          {`Are you sure you would like to delete order ${activeOrder.order.name}?`}
                        </Modal.Section>
                      </Modal>
                    </>
                  }
                  <Modal
                    open={activeBulkDeleteModal}
                    onClose={() => setActiveBulkDeleteModal(false)}
                    title="Confirm Bulk Delete"
                    primaryAction={{
                      content: 'Yes',
                      accessibilityLabel: "Yes",
                      onAction: () => { handleDelete('bulk'); setActiveBulkDeleteModal(false) },
                    }}
                    secondaryActions={[
                      {
                        content: 'No',
                        accessibilityLabel: 'No',
                        destructive: true,
                        onAction: () => setActiveBulkDeleteModal(false),
                      },
                    ]}
                  >
                    <Modal.Section>
                      {`Are you sure you would like to delete orders: ${removeList.map(e => e.name).join(', ')}?`}
                    </Modal.Section>
                  </Modal>
                  {toastActiveDelete && <Toast content="Successfully Deleted" onDismiss={() => setToastActiveDelete(false)} duration={2500} />}
                  {toastActiveEmail && <Toast content="Successfully Sent Emails" onDismiss={() => setToastActiveEmail(false)} duration={2500} />}
                  {toastActiveFail && <Toast content="Please Wait 1 Hour Before Sending Again" onDismiss={() => setToastActiveFail(false)} duration={2500} />}
  
                </>
              ) : (
                <>
                  <EmptyState
                    heading="Manage your Gift Orders"
                    secondaryAction={{
                      content: 'Learn more',
                      accessibilityLabel: 'Learn more',
                      onAction: () => setActiveLearnMoreModal(!activeLearnMoreModal)
                    }}
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  >
                    <p>Track the progress of all your gift orders.</p>
                  </EmptyState>
                  <LearnMore
                    active={activeLearnMoreModal}
                    setActive={setActiveLearnMoreModal}
                  />
                </>
              )}
            </Card>
          </Page>
        </Frame>
      </>
    );
  }
  
  GiftOrders.propTypes = {
    shopOrigin: PropTypes.string.isRequired,
    orders: PropTypes.array.isRequired
  }
  
  export default GiftOrders;