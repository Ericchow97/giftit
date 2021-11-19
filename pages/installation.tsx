import {
  Page,
  Card,
  MediaCard,
  VideoThumbnail,
} from '@shopify/polaris';
import React, { useState } from 'react';
import PropTypes from "prop-types";

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
          portrait
          title="Installation Video"
          description="Have a question? Email us at: support@giftitnow.io"
        >
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/HC15FrmnBXE"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Embedded GiftIt Installation Youtube"
          />
        </MediaCard>
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
          <p>Have a question? Email us at: support@giftitnow.io</p>
        </Card>
      </Page>
    </>
  )
}

InstallationGuide.propTypes = {
  appName: PropTypes.string.isRequired
}

export default InstallationGuide;