import {
  Select,
  Button,
  Card,
  Spinner,
  ProgressBar,
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

export const InstallationGuide = ({ appName, themes }: IProps) => {
  const [selected, setSelected] = useState(themes[0].value)
  // installation states
  const [showInstallation, toggleInstallation] = useState(false)
  const [showInstallDetails, toggleInstallDetails] = useState(true)
  const [installationProgress, setInstallationProgress] = useState([
    {
      complete: false,
      success: false,
    }
  ])
  const [progress, updateProgress] = useState(0)

  // feedback states
  const [toastActive, setToastActive] = useState(false)
  const [showSuccessBanner, toggleSuccessBanner] = useState(false)
  const [showFailBanner, toggleFailBanner] = useState(false)

  const handleSubmit = async () => {
    setInstallationProgress([
      {
        complete: false,
        success: false,
      }
    ])
    updateProgress(0)
    toggleInstallation(true)
    const updateList = [...installationProgress]

    // Add themes
    const ret = await (await fetch(`https://3a5b-2607-fea8-a380-852-bd63-e991-7e80-f43f.ngrok.io/add-themes`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ theme: selected })
    }
    )).json()
    if (ret.success) {
      updateList[0].complete = true
      updateList[0].success = true
      setInstallationProgress(updateList)
      updateProgress(100)
      toggleSuccessBanner(true)
    } else {
      updateList[0].complete = true
      updateList[0].success = false
      setInstallationProgress(updateList)
      toggleFailBanner(true)
    }
  }

  const handleChange = (val: string) => { setSelected(val) }

  const handleCopy = (id: string) => {
    const copyField = document.querySelector(`#${id}`)!.children[0].children[0].children[0].children[0].children[0] as HTMLInputElement
    /* Select the text field */
    copyField.select();
    copyField.setSelectionRange(0, 99999); /* For mobile devices */

    document.execCommand("copy");
    setToastActive(true)
  }

  const toggleActive = () => { setToastActive(false) }

  return (
    <>
      {showSuccessBanner &&
        <Banner
          title="App assets have been installed successfully"
          status="success"
          toggleBanner={toggleSuccessBanner}
        />
      }
      {showFailBanner &&
        <Banner
          title="Error in installation"
          status="critical"
          toggleBanner={toggleFailBanner}
        />
      }
      <Card
        title={`Install ${appName} Assets`}
        primaryFooterAction={{
          content: `Install Assets`,
          onAction: handleSubmit
        }}
        sectioned
        footerActionAlignment='left'
      >
        <TextContainer>
          <Select
            label={`Select theme to install ${appName} snippets`}
            options={themes}
            onChange={handleChange}
            value={selected}
          />
          {showInstallation && (
            <>
              <Button onClick={() => toggleInstallDetails(show => !show)}>{`${showInstallDetails ? "Hide" : "Show"} installation details`}</Button>
              {showInstallDetails &&
                <Card title="Installing GiftIt" sectioned>
                  <div className='loadingDiv'>
                    {!installationProgress[0].complete ?
                      <Spinner accessibilityLabel="Installation spinner" size="small" />
                      :
                      (installationProgress[0].success ?
                        <Icon source={CircleTickMajor} color="success" />
                        :
                        <Icon source={CircleCancelMajor} color="critical" />
                      )
                    }
                    <p className='loadingText'>Installing custom assets</p>
                  </div>
                  <ProgressBar progress={progress} />
                </Card>
              }
            </>
          )}
        </TextContainer>
      </Card>
      <Card
        title={`Add ${appName} to theme file`}
        sectioned
      >
        <TextContainer>
          Paste the following code before the <TextStyle variation="strong">{'<div class="cart__footer">'}</TextStyle> tag in <TextStyle variation="strong">cart-template.liquid</TextStyle>
          <div style={{ display: 'flex' }}>
            <div id='GiftIt-add' style={{ flexGrow: 1 }}>
              <TextField label='' value={"{% render 'giftit-gift' %}"} onChange={() => { return }} />
            </div>
            <Button
              outline
              icon={ClipboardMinor}
              onClick={() => handleCopy('GiftIt-add')}
            >
            </Button>
          </div>
        </TextContainer>
      </Card>
      {toastActive && <Toast content="Copied Text" duration={2500} onDismiss={toggleActive} />}
    </>
  )
}

InstallationGuide.propTypes = {
  appName: PropTypes.string.isRequired,
  themes: PropTypes.array.isRequired
}

export default InstallationGuide;