import {
    Frame,
    Button,
    Card,
    Form,
    FormLayout,
    Layout,
    Page,
    Stack,
    TextField,
    Modal,
    TextContainer,
    Heading,
    List,
  } from '@shopify/polaris';
  
  import React, { useState } from 'react'
  import PropTypes from "prop-types";
  import Banner from '../components/MyBanner'
  import { useAppBridge } from '@shopify/app-bridge-react';
  import { getSessionToken } from "@shopify/app-bridge-utils";
  
  interface IProps {
    configuration: {
      purchaserCustomMessage: string,
      deleteCustomMessage: string,
      recipientReminderMessage: string,
    },
    hostEnv: string
  }
  
  const Configuration = ({ configuration, hostEnv }: IProps) => {
    // custom messages
    const [purchaserCustomMessage, setPurchaserCustomMessage] = useState(configuration.purchaserCustomMessage)
    const [deleteCustomMessage, setDeleteCustomMessage] = useState(configuration.deleteCustomMessage)
    const [recipientReminderMessage, setRecipientReminderMessage] = useState(configuration.recipientReminderMessage)
  
    // user feedback
    const [showSuccessBanner, toggleSuccessBanner] = useState(false)
    const [showFailBanner, toggleFailBanner] = useState(false)
    const [errors, setErrors] = useState([false, false, false])
    // Modal
    const [activeLearnMoreModal, setActiveLearnMoreModal] = useState(false)
  
    const app = useAppBridge();
  
    //Update supported handlebars with storeName
    const validHandlebars = [
      "{{purchaserName}}",
      "{{purchaserEmail}}",
      "{{recipientName}}",
      "{{recipientEmail}}",
      "{{storeName}}",
    ]
  
    const validHandlebarsJSX = validHandlebars.map((e, index) => <List.Item key={index}>{e}</List.Item>)
  
    const handleSubmit = async () => {
      // validate handlebar submissions
      const messages = [purchaserCustomMessage, deleteCustomMessage, recipientReminderMessage]
      const errorChecks = [false, false, false]
      for (let i = 0; i < messages.length; i++) {
        messages[i] = messages[i].replace(/{{.*?}}/g, (match) => {
          const key = `{{${match.replace(/[^a-zA-Z ]/g, "").trim()}}}`
          if (!validHandlebars.includes(key)) {
            errorChecks[i] = true
            return match
          }
          return key
        })
      }
      setPurchaserCustomMessage(messages[0])
      setDeleteCustomMessage(messages[1])
      setRecipientReminderMessage(messages[2])
  
      setErrors(errorChecks)
      if (errorChecks.some(e => e)) {
        return
      }
      const sessionToken = await getSessionToken(app);
      // update site configuration
      const ret = await (await fetch(`${hostEnv}/update-configuration`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionToken
        },
        body: JSON.stringify({
          purchaserCustomMessage: purchaserCustomMessage,
          deleteCustomMessage: deleteCustomMessage,
          recipientReminderMessage: recipientReminderMessage
        })
      }
      )).json()
      ret.success ? toggleSuccessBanner(true) : toggleFailBanner(true);
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  
    return (
      <>
        <Frame>
          {showSuccessBanner &&
            <Banner
              title="Email configuration has successfully been updated"
              status="success"
              toggleBanner={toggleSuccessBanner}
              disableHelp={true}
            />
          }
          {showFailBanner &&
            <Banner
              title="Error in configuration update. Please try again."
              status="critical"
              toggleBanner={toggleFailBanner}
            />
          }
          <Page
            title="Configuration"
            primaryAction={{
              content: 'Learn More About Customization',
              accessibilityLabel: 'Learn More About Customization',
              onAction: () => setActiveLearnMoreModal(true)
            }}
          >
            <Layout>
              <Form onSubmit={handleSubmit} >
                <FormLayout>
                  <Layout.AnnotatedSection
                    title="Purchaser Gift Order Confirmation Email"
                    description="Change the custom message of the purchaser gift order confirmation email."
                  >
                    <Card sectioned>
                      <TextField
                        value={purchaserCustomMessage}
                        onChange={(val) => setPurchaserCustomMessage(val)}
                        inputMode="text"
                        multiline={true}
                        spellCheck={true}
                        label="Purchaser Gift Order Confirmation Email"
                        type="text"
                        error={errors[0] && 'Invalid handlebar used'}
                      />
                    </Card>
                  </Layout.AnnotatedSection>
                  <Layout.AnnotatedSection
                    title="Gift Order Delete Confirmation Email"
                    description="Change the custom message of the gift order delete confirmation email."
                  >
                    <Card sectioned>
                      <TextField
                        value={deleteCustomMessage}
                        onChange={(val) => setDeleteCustomMessage(val)}
                        inputMode="text"
                        multiline={true}
                        spellCheck={true}
                        label="Gift Order Delete Confirmation Email"
                        type="text"
                        error={errors[1] && 'Invalid handlebar used'}
                      />
                    </Card>
                  </Layout.AnnotatedSection>
                  <Layout.AnnotatedSection
                    title="Gift Order Recipient Reminder Email"
                    description="Change the custom message of the recipient reminder email."
                  >
                    <Card sectioned>
                      <TextField
                        value={recipientReminderMessage}
                        onChange={(val) => setRecipientReminderMessage(val)}
                        inputMode="text"
                        multiline={true}
                        spellCheck={true}
                        label="Gift Order Recipient Reminder Email"
                        type="text"
                        error={errors[2] && 'Invalid handlebar used'}
                      />
                    </Card>
                  </Layout.AnnotatedSection>
                  <Stack distribution="trailing">
                    <Button primary submit>
                      Save
                </Button>
                  </Stack>
                </FormLayout>
              </Form>
              <Modal
                open={activeLearnMoreModal}
                onClose={() => setActiveLearnMoreModal(false)}
                title="Customize your emails"
                large
              >
                <Modal.Section>
                  <TextContainer>
                    <Heading>Handlebars</Heading>
                    <p>
                      Handlebars provide you with the opportunity to customize and tailor your emails
                      to each recipient, based on the information provided at checkout.
                      The following handlebars are currently supported:
                  </p>
                    <List type="bullet">
                      {validHandlebarsJSX}
                    </List>
                  </TextContainer>
                </Modal.Section>
              </Modal>
            </Layout>
          </Page>
        </Frame>
      </>
    );
  }
  
  Configuration.propTypes = {
    configuration: PropTypes.object.isRequired,
    hostEnv: PropTypes.string.isRequired
  }
  
  export default Configuration;