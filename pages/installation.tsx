import {
  Page,
  Card,
  Caption,
  MediaCard,
  DisplayText,
  Icon,
  TextContainer,
  TextStyle,
  TextField,
  Toast,
} from '@shopify/polaris';
import {
  CircleTickMajor,
  CircleCancelMajor,
  ClipboardMinor,
} from '@shopify/polaris-icons';
import React, { useState } from 'react';
import PropTypes from "prop-types";
import Banner from '../components/MyBanner'

type Options = {
  key: number,
  label: string,
  value: string
}

interface IProps {
  appName: string;
  themes: Options[]
}

export const InstallationGuide = ({ appName }: IProps) => {
  return (
    <>
      <Page
        title={`${appName} Installation Instructions`}
      >
        <MediaCard
          title="1. Go to your online store and customize the theme"
          description=""
          portrait={true}
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
          portrait={true}
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
          portrait={true}
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
          portrait={true}
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
        <Card
          title="Happy Selling!"
          sectioned
        >
          <Caption>Have a question? Email us at: support@giftitnow.io</Caption>
        </Card>
      </Page>
    </>
  )
}

InstallationGuide.propTypes = {
  appName: PropTypes.string.isRequired
}

export default InstallationGuide;