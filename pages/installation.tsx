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
          size="small"
        >
          <img
            alt=""
            width="100%"
            height="100%"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            src="https://giftit-assets.s3.us-west-2.amazonaws.com/embedded-app/Step1_Trim.gif"
          />
        </MediaCard>
        <Card
          title={`Install  Steps`}
          sectioned
        >
          <p> <br />
            2. Head to your product page within the customize theme builder <br />
            3. Add block "Gift Button" and choose where you want it displayed <br />
            4. Click Save and you're done! <br /> <br />
            <b>Happy Selling!</b><br /><br />
          </p>
          <Caption>Have a question? Please send an email to: support@giftitnow.io</Caption>
        </Card>
      </Page>
    </>
  )
}

InstallationGuide.propTypes = {
  appName: PropTypes.string.isRequired
}

export default InstallationGuide;