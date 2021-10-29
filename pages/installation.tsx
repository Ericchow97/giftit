import {
  Page,
  Card,
  Caption,
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
  // TODO: update email when have domain
  return (
    <>
      <Page
        title="Installation Instructions"
      >
        <Card
          title={`Install ${appName} Steps`}
          sectioned
        >
          <p>1. Go to your online store and customize the theme <br />
            2. Head to your product page within the customize theme builder <br />
            3. Add block "Gift Button" and choose where you want it displayed <br />
            4. Click Save and you're done! <br /> <br />
            <b>Happy Selling!</b><br /><br />
          </p>
          <Caption>Have a question? Please send an email to: eric.chow803@gmail.com</Caption>
        </Card>
      </Page>
    </>
  )
}

InstallationGuide.propTypes = {
  appName: PropTypes.string.isRequired
}

export default InstallationGuide;