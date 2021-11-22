import {
  Modal,
  TextContainer,
} from '@shopify/polaris';

import React from 'react';
import PropTypes from "prop-types";
import { useRouter } from "next/router";

interface IProps {
  active: boolean,
  setActive: React.Dispatch<React.SetStateAction<boolean>>,
}
// TODO: Review on fresh installation
//TODO: update when finish landing page
const LearnMore = (props: IProps) => {
  const router = useRouter();

  return (
    <>
      <Modal
        open={props.active}
        onClose={() => props.setActive(!props.active)}
        title={`About GiftIt`}
      >
        <Modal.Section>
          <TextContainer spacing="tight">
            <p>Let your customers send anyone a gift even when they don’t know the address!</p>
            <p>
              GiftIt offers your shoppers an opportunity to surprise their giftees with a personalized gift even when they don’t know the shipping address. With GiftIt, your gifters will be able to select any item in your catalog and purchase it as a gift. All they need is the giftee’s email address or phone number. GiftIt is a better choice than gift cards as it is more personal and increases the likelihood that your shoppers will choose a bigger ticket amount compared to standard gift card denominations. You’ll also be able to reduce shopping cart abandonment, as there is no longer the hesitation in buying something for someone as a surprise but not knowing how to get the gift to them.
            </p>
            <p>
              <strong>Check out your store's product page to see how GiftIt is added to your store!</strong>
            </p>
          </TextContainer>
        </Modal.Section>
      </Modal>
    </>
  )
}

LearnMore.propTypes = {
  active: PropTypes.bool.isRequired,
  setActive: PropTypes.func.isRequired,
}

export default LearnMore;