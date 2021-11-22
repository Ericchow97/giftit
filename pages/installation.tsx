import {
  Page,
  Card,
  MediaCard,
  Collapsible,
  Layout,
  SkeletonPage,
  SkeletonBodyText,
  TextContainer,
  SkeletonDisplayText,
} from '@shopify/polaris';
import React, { useState, useEffect } from 'react';
import PropTypes from "prop-types";
import Banner from '../components/MyBanner'

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
  scriptId: string,
}

interface ThemeData {
  theme: string,
  supportedTemplates: string[],
  nonSupportedTemplates: string[]
}

export const InstallationGuide = ({ appName, hostEnv, scriptId }: IProps) => {
  const [allThemes, setAllThemes] = useState<ThemeData>({ theme: '', supportedTemplates: [], nonSupportedTemplates: [] })
  const [showSteps, setShowSteps] = useState(false)
  const [installedScriptId, setInstalledScriptId] = useState(scriptId)
  const [loading, setLoading] = useState(false)

  // user feedback
  const [showSuccessBanner, toggleSuccessBanner] = useState(false)
  const [showFailBanner, toggleFailBanner] = useState(false)

  const shopifyApp = useAppBridge();

  useEffect(() => {
    const getThemes = async () => {
      const sessionToken = await getSessionToken(shopifyApp);
      try {
        const ret: ThemeData = await (await fetch(`${hostEnv}/get-themes`, {
          method: 'GET',
          mode: 'cors',
          credentials: "include",
          headers: {
            'Authorization': sessionToken
          },
        })).json()
        console.log(ret)
        setAllThemes(ret)
      } catch (err) {
        console.log(err)
      }
    }
    getThemes()
  }, [])

  const handleScript = async () => {
    setLoading(true)
    const sessionToken = await getSessionToken(shopifyApp);
    try {
      const ret = await (await fetch(`${hostEnv}/install-script`, {
        method: 'POST',
        mode: 'cors',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionToken
        },
        body: JSON.stringify({ status: installedScriptId })
      })).json()
      setInstalledScriptId(ret.installedScriptId)
      setLoading(false)
      toggleSuccessBanner(true)
    } catch (err) {
      console.log(err)
      toggleFailBanner(true)
    }
  }
  console.log(installedScriptId)
  return (
    <>
      {showSuccessBanner &&
        <Banner
          title={`GiftIt has successfully been ${installedScriptId ? "installed" : "uninstalled"}!`}
          status="success"
          toggleBanner={toggleSuccessBanner}
          disableHelp={true}
        />
      }
      {showFailBanner &&
        <Banner
          title="Error in installation. Please try again."
          status="critical"
          toggleBanner={toggleFailBanner}
        />
      }
      {!allThemes.theme ? (
        <SkeletonPage title={`${appName} Installation Instructions`}>
          <Layout>
            <Layout.Section>
              <Card sectioned>
                <TextContainer>
                  <SkeletonDisplayText size="small" />
                  <SkeletonBodyText />
                </TextContainer>
              </Card>
              <Card sectioned>
                <TextContainer>
                  <SkeletonDisplayText size="small" />
                  <SkeletonBodyText lines={15} />
                </TextContainer>
              </Card>
            </Layout.Section>
          </Layout>
        </SkeletonPage>
      ) : (
        <Page
          title={`${appName} Installation Instructions`}
        >
          <Layout sectioned={true}>
            {(allThemes.nonSupportedTemplates.length > 0 || installedScriptId) &&
              <Layout.AnnotatedSection
                title="Vintage Themes"
                description="For older Shopify Themes"
              >
                <Card
                  title="Install Giftit Assets & Scripts"
                  sectioned
                  primaryFooterAction={{
                    content: installedScriptId ? "Uninstall" : "Install",
                    accessibilityLabel: installedScriptId ? "Uninstall" : "Install",
                    loading: loading,
                    onAction: () => handleScript()
                  }}
                >
                  <p>Looks like you're using an older template within your Shopify Theme. Click Install to download GiftIt's Assets & Scripts!</p>
                  <br />
                  <p>Once complete, you will see a "Give as a gift" Button on your product page.</p>
                </Card>
              </Layout.AnnotatedSection>
            }
            {allThemes.supportedTemplates.length > 0 &&
              <Layout.AnnotatedSection
                title="Online Store 2.0"
                description="For newer Shopify Themes"
              >
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
              </Layout.AnnotatedSection>
            }
          </Layout>
        </Page>
      )}
    </>
  )
}

InstallationGuide.propTypes = {
  appName: PropTypes.string.isRequired,
  hostEnv: PropTypes.string.isRequired,
  scriptId: PropTypes.string.isRequired,
}

export default InstallationGuide;