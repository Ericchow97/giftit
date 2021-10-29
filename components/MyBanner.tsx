import {
    Banner,
    Toast,
} from '@shopify/polaris';

import React, { useState } from 'react';
import PropTypes from "prop-types";

interface IProps {
    title: string,
    status: "success" | "critical",
    toggleBanner: React.Dispatch<React.SetStateAction<boolean>>
    disableHelp?: boolean
}

export const MyBanner = ({ title, status, toggleBanner, disableHelp = false }: IProps) => {
    const [toastActive, setToastActive] = useState(false)
    return (
        <div style={{ margin: "2rem 0" }}>
            <Banner
                title={title}
                status={status}
                {...(!disableHelp && {
                    secondaryAction: {
                        accessibilityLabel: 'Contact us',
                        content: 'Contact us',
                        onAction: () => {
                            const contactEmail = document.querySelector('#contactAddress') as HTMLInputElement;
                            contactEmail.select()
                            document.execCommand("copy")
                            setToastActive(true)
                        }
                    }
                })}
                onDismiss={() => toggleBanner(false)}
            />
            <input readOnly style={{ display: 'none' }} type='text' id='contactAddress' value='eric.chow803@gmail.com' />
            {toastActive && <Toast content="Successfully Copied Email" onDismiss={() => setToastActive(false)} />}
        </div>
    )
}

MyBanner.propTypes = {
    title: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    toggleBanner: PropTypes.func.isRequired,
    disableHelp: PropTypes.bool
}

export default MyBanner;