import {
  Page,
  Card,
  MediaCard,
  Button,
  Collapsible,
} from '@shopify/polaris';
import React, { useState, useEffect } from 'react';
import PropTypes from "prop-types";

import { useAppBridge } from '@shopify/app-bridge-react';
import { getSessionToken } from "@shopify/app-bridge-utils";

type Options = {
  key: number,
  label: string,
  value: string
}

interface IProps {
  appName: string,
  hostEnv: string,
}

export const InstallationGuide = ({ appName, hostEnv }: IProps) => {
  const [showSteps, setShowSteps] = useState(false)

  const shopifyApp = useAppBridge();

  useEffect(() => {
    const getThemes = async () => {
      const sessionToken = await getSessionToken(shopifyApp);
      try {
        const ret = await (await fetch(`${hostEnv}/get-themes`, {
          method: 'GET',
          mode: 'cors',
          credentials: "include",
          headers: {
            'Authorization': sessionToken
          },
        })).json()
        console.log(ret)
      } catch (err) {
        console.log(err)
      }
    }

    getThemes()
  }, [])

  return (
    <>
      <Page
        title={`${appName} Installation Instructions`}
      >
        <Card
          title="Testing Dev"
          sectioned
        >
          <p>Test!</p>
        </Card>
        <MediaCard
          portrait
          title="Installation Video"
          description="Have a question? Email us at: support@giftitnow.io"
        >
          <div className="giftit-youtube-container">
            <iframe
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
              }}
              src="https://www.youtube.com/embed/HC15FrmnBXE"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Embedded GiftIt Installation Youtube"
            />
          </div>
        </MediaCard>
        <Card
          title="Installation Steps"
          sectioned
          secondaryFooterActions={[{
            content: showSteps ? "Hide" : "Show",
            accessibilityLabel: showSteps ? "Hide" : "Show",
            onAction: () => setShowSteps(state => !state)
          }]}
        >
          <p>Don't like video? Check out the steps instead!</p>
        </Card>
        <Collapsible
          open={showSteps}
          id="steps-collapsible"
          transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
          expandOnPrint
        >
          <MediaCard
            title="1. Go to your online store and customize the theme"
            description=""
            portrait
          >
            <img
              alt="GiftIt Installation Step 1"
              width="100%"
              height="100%"
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              src="https://giftit-assets.s3.us-west-2.amazonaws.com/embedded-app/Step1.gif"
            />
          </MediaCard>
          <MediaCard
            title="2. Head to your product page within the theme builder"
            description=""
            portrait
          >
            <img
              alt="GiftIt Installation Step 2"
              width="100%"
              height="100%"
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              src="https://giftit-assets.s3.us-west-2.amazonaws.com/embedded-app/Step2.gif"
            />
          </MediaCard>
          <MediaCard
            title='3. Add block "Gift Button" and choose where you want it displayed'
            description=""
            portrait
          >
            <img
              alt="GiftIt Installation Step 3"
              width="100%"
              height="100%"
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              src="https://giftit-assets.s3.us-west-2.amazonaws.com/embedded-app/Step3.gif"
            />
          </MediaCard>
          <MediaCard
            title="4. Click Save and you're done!"
            description=""
            portrait
          >
            <img
              alt="GiftIt Installation Step 4"
              width="100%"
              height="100%"
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              src="https://giftit-assets.s3.us-west-2.amazonaws.com/embedded-app/Step4.gif"
            />
          </MediaCard>
          <Card
            title="Happy Selling!"
            sectioned
          >
            <p>Have a question? Email us at: support@giftitnow.io</p>
          </Card>
        </Collapsible>
      </Page>
    </>
  )
}

InstallationGuide.propTypes = {
  appName: PropTypes.string.isRequired,
  hostEnv: PropTypes.string.isRequired
}

export default InstallationGuide;