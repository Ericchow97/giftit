let giftitRef;
// get product form
Array.prototype.forEach.call(document.querySelectorAll('form[action="/cart/add"]'), (e) => {
    const button = e.querySelector('button')
    if (button) { giftitRef = e }
})

const telephone_css = document.createElement('link');
telephone_css.rel = 'stylesheet';
telephone_css.type = 'text/css';
telephone_css.href = 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/css/intlTelInput.css';
telephone_css.media = 'all';

let intlTel;
const telephone_script = document.createElement('script');
telephone_script.type = "text/javascript";
telephone_script.src = 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/intlTelInput.min.js'
telephone_script.onload = function () {
    const phoneInputField = document.querySelector("#giftit-recipient-phone-number");
    intlTel = window.intlTelInput(phoneInputField, {
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
    });
};
document.querySelector('head').appendChild(telephone_css);
document.querySelector('head').appendChild(telephone_script);

// update button to match type
document.querySelector('#giftit').classList = giftitRef.querySelector('button').classList
document.querySelector('#giftit').parentElement.parentElement.classList = giftitRef.querySelector('button').parentElement.parentElement.parentElement.classList

const modalRef = document.querySelector('.giftit-order-modal')

// Open gift modal
document.querySelector('#giftit').addEventListener('click', async (event) => {
    event.preventDefault();
    window.scroll({
        top: window.pageYOffset - Math.abs(modalRef.getBoundingClientRect().top),
        left: 0,
        behavior: 'smooth'
    });
    document.querySelector('.giftit-order-modal').classList.remove('hide')
});

// Close modal & reset status
document.querySelectorAll('.giftit-close-button').forEach(e => {
    e.addEventListener('click', () => {
        // close modal
        document.querySelector('.giftit-order-modal').classList.add('hide')
        // reset icons
        document.querySelector('.giftit-steps-item-active').classList.remove('giftit-steps-item-active')
        if (document.querySelector('.giftit-steps-item-prev-active')) {
            document.querySelector('.giftit-steps-item-prev-active').classList.remove('giftit-steps-item-prev-active')
        }
        document.querySelector('#giftit-nav-bar').children[0].classList.add('giftit-steps-item-active')
        document.querySelectorAll('.giftit-steps-item-icon').forEach(node => {
            if (node.classList.contains('giftit-steps-item-icon-complete')) {
                node.classList.add('hide')
            } else {
                node.classList.remove('hide')
            }
        })

        // reset display content 
        document.querySelector('.giftit-modal-content-active').classList.add('hide')
        document.querySelector('.giftit-modal-content-active').classList.remove('giftit-modal-content-active')
        document.querySelector('.giftit-modal-display-content').classList.add('giftit-modal-content-active')
        document.querySelector('.giftit-modal-display-content').classList.remove('hide')
        // reset buttons
        document.querySelector('#giftit-next-button').classList.remove('hide')
        document.querySelector('#giftit-submit-button').classList.add('hide')
        document.querySelector('#giftit-back-button').classList.add('hide')

        //reset submit items 
        document.querySelector('.giftit-loader').classList.remove('hide')
        document.querySelector('.giftit-loading-text').classList.remove('hide')
        document.querySelector('.giftit-fill-circle-success').classList.add('hide')
        document.querySelector('.giftit-fill-circle-fail').classList.add('hide')
        document.querySelector('.giftit-text-success').classList.add('hide')
        document.querySelector('.giftit-text-fail').classList.add('hide')
        document.querySelector('.giftit-text-fail-orders').classList.add('hide')
        document.querySelector('#giftit-close-button').classList.add('hide')
    });
})

// Next button on modal
document.querySelectorAll('.giftit-btn-primary').forEach(e => {
    e.addEventListener('click', () => {
        window.scroll({
            top: window.pageYOffset - Math.abs(modalRef.getBoundingClientRect().top),
            left: 0,
            behavior: 'smooth'
        });
        modalRef.scrollTop = 0;
        // Select Active icon
        const ref = document.querySelector('.giftit-steps-item-active')
        // error checking
        if (ref.children[0].children[0].id === 'giftit-step2') {
            const inputs = document.querySelectorAll('#giftit-form-input input')
            const contactMethod = document.querySelector('#giftit-form-input select').value

            for (let i = 0; i < 3; i++) {
                if (!inputs[i].value) {
                    inputs[i].classList.add('giftit-input-error')
                    switch (i) {
                        case 0:
                            document.querySelector('#giftit-purchaserName-error').classList.remove('hide')
                            break;
                        case 1:
                            document.querySelector('#giftit-purchaserEmail-error').classList.remove('hide')
                            break;
                        case 2:
                            document.querySelector('#giftit-recipientName-error').classList.remove('hide')
                            break;
                    }
                }
            }
            if (contactMethod === 'Email') {
                if (!inputs[3].value) {
                    inputs[3].classList.add('giftit-input-error')
                    document.querySelector('#giftit-recipient-contact-error').classList.remove('hide')
                }
            } else {
                if (!inputs[4].value || !/\d{3,45}/.test(inputs[4].value)) {
                    inputs[4].classList.add('giftit-input-error')
                    document.querySelector('#giftit-recipient-contact-error').classList.remove('hide')
                }
            }
            if (!document.querySelector('form.giftit-form').checkValidity()) {
                document.querySelector('form.giftit-form').reportValidity()
                return
            }
        }

        // change displayed icon to checkmark
        ref.children[0].children[0].classList.add('hide')
        ref.children[0].children[1].classList.remove('hide')

        // change active icon
        ref.classList.remove('giftit-steps-item-active')
        ref.nextElementSibling.classList.add('giftit-steps-item-active')

        // set previous active icon for mobile display
        ref.classList.add('giftit-steps-item-prev-active')
        if (ref.previousElementSibling) {
            ref.previousElementSibling.classList.remove('giftit-steps-item-prev-active')
        }
        // change active icons
        if (!ref.nextElementSibling.nextElementSibling) {
            document.querySelector('#giftit-submit-button').classList.add('hide')
        }

        // change displayed modal content
        const activeContentRef = document.querySelector('.giftit-modal-content-active')
        activeContentRef.classList.remove('giftit-modal-content-active')
        activeContentRef.classList.add('hide')
        activeContentRef.nextElementSibling.classList.add('giftit-modal-content-active')
        activeContentRef.nextElementSibling.classList.remove('hide')
        // update display values & change button to submit
        if (ref.nextElementSibling.children[0].children[0].id === 'giftit-step3') {
            const inputs = document.querySelectorAll('#giftit-form-input input')
            const contactMethod = document.querySelector('#giftit-form-input select').value
            for (let i = 0; i < 3; i++) {
                document.querySelector(`#giftit-${inputs[i].name}`).innerHTML = inputs[i].value;
            }
            document.querySelector(`#giftit-recipientContact`).innerHTML = contactMethod === 'Email' ?
                document.querySelector('#giftit-recipient-email').value : document.querySelector('#giftit-recipient-phone-number').value
            document.querySelector(`#giftit-message`).innerHTML = document.querySelector('#giftit-form-input textarea').value
            document.querySelector('#giftit-next-button').classList.add('hide')
            document.querySelector('#giftit-submit-button').classList.remove('hide')
        }

        document.querySelector('#giftit-back-button').classList.remove('hide')
        if (ref.nextElementSibling.children[0].children[0].id === 'giftit-step4') {
            document.querySelector('#giftit-back-button').classList.add('hide')
        }
    });
})

// Back button on modal
document.querySelector('#giftit-back-button').addEventListener('click', (event) => {
    window.scroll({
        top: window.pageYOffset - Math.abs(modalRef.getBoundingClientRect().top),
        left: 0,
        behavior: 'smooth'
    });
    modalRef.scrollTop = 0;
    // Select Active icon
    const ref = document.querySelector('.giftit-steps-item-active')
    // change prev displayed checkmark to icon
    ref.previousElementSibling.children[0].children[0].classList.remove('hide')
    ref.previousElementSibling.children[0].children[1].classList.add('hide')

    // change active icon
    ref.classList.remove('giftit-steps-item-active')
    ref.previousElementSibling.classList.add('giftit-steps-item-active')

    // set previous active icon for mobile display
    ref.previousElementSibling.classList.remove('giftit-steps-item-prev-active')
    if (ref.previousElementSibling.previousElementSibling) {
        ref.previousElementSibling.previousElementSibling.classList.add('giftit-steps-item-prev-active')
    }
    // change active icons
    if (ref.nextElementSibling.nextElementSibling) {
        document.querySelector('#giftit-submit-button').classList.remove('hide')
    }

    // change displayed modal content
    const activeContentRef = document.querySelector('.giftit-modal-content-active')
    activeContentRef.classList.remove('giftit-modal-content-active')
    activeContentRef.classList.add('hide')
    activeContentRef.previousElementSibling.classList.add('giftit-modal-content-active')
    activeContentRef.previousElementSibling.classList.remove('hide')

    // set button displays
    document.querySelector('#giftit-next-button').classList.remove('hide')
    document.querySelector('#giftit-submit-button').classList.add('hide')
    if (ref.parentElement.firstElementChild === ref.previousElementSibling) {
        document.querySelector('#giftit-back-button').classList.add('hide')
    }
});

// change recipient contact method
document.querySelector('#giftit-recipient-contact-dropdown').addEventListener('input', event => {
    const recipientEmailRef = document.querySelector('#giftit-recipient-email')
    const recipientPhoneDisplayRef = document.querySelector('.giftit-recipient-phone-number')
    const recipientPhoneRef = document.querySelector('#giftit-recipient-phone-number')

    if (event.target.value == 'Email') {
        recipientEmailRef.classList.remove('hide')
        recipientEmailRef.required = true
        recipientPhoneDisplayRef.classList.add('hide')
        recipientPhoneRef.required = false
    } else {
        recipientEmailRef.classList.add('hide')
        recipientEmailRef.required = false
        recipientPhoneDisplayRef.classList.remove('hide')
        recipientPhoneRef.required = true
    }
});

// character limit count
document.querySelector('.giftit-gift-message').addEventListener('input', event => {
    const currentLength = event.currentTarget.value.length;
    document.querySelector('#giftit-charCount').textContent = currentLength;
});

// remove error codes
document.querySelectorAll('#giftit-form-input input').forEach(e => {
    e.addEventListener('input', () => {
        e.classList.remove('giftit-input-error')

        if (e.name === 'recipientEmail' || e.name === 'phone') {
            document.querySelector(`#giftit-recipient-contact-error`).classList.add('hide')
        } else {
            document.querySelector(`#giftit-${e.name}-error`).classList.add('hide')
        }
    })
})

const getCookieCount = () => {
    const cookies = document.cookie.split(';')
    let count = 0;
    for (let i = 0; i < cookies.length; i++) {
        let c = cookies[i]
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf('giftIt_order') == 0) count++;
    }
    return count;
}

document.querySelector('form.giftit-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    // get & update cookies to prevent users from wiping out inventory
    const giftitOrderCount = getCookieCount();
    if (giftitOrderCount >= 10) {
        document.querySelector('.giftit-text-fail-orders').classList.remove('hide')
        return
    }
    // gather all data
    const data = {}
    const productData = new FormData(document.querySelector('form[action="/cart/add"]'))
    // gets product information 
    for (const pair of productData.entries()) {
        data[pair[0]] = pair[1];
    }
    // gets giftit information
    const giftitData = new FormData(event.target)
    for (const pair of giftitData.entries()) {
        data[pair[0]] = pair[1];
    }
    data.shop = Shopify.shop
    try {
        data.phone = intlTel.getNumber()
    }
    catch {
        data.phone = document.querySelector('#giftit-recipient-phone-number').value
    }
    const res = await fetch('https://giftit-app-dev.herokuapp.com/gift-checkout', {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: new URLSearchParams(data)
    })
    const loadingMessages = [
        'Checking available inventory',
        'Reserving inventory',
        'Confirming gift order'
    ]
    for (let i = 0; i < loadingMessages.length; i++) {
        document.querySelector('.giftit-loading-text').innerHTML = loadingMessages[i];
        await new Promise(res => setTimeout(res, 1000));
    }
    // reset submission displays
    document.querySelector('.giftit-loader').classList.add('hide')
    document.querySelector('.giftit-loading-text').classList.add('hide')
    document.querySelector('.giftit-loading-text').innerHTML = loadingMessages[0];
    if (res.status === 200) {
        const successRef = document.querySelector('.giftit-fill-circle-success')
        successRef.classList.remove('hide')
        successRef.style.animationPlayState = 'running'
        successRef.children[0].style.animationPlayState = 'running'
        successRef.children[1].style.animationPlayState = 'running'
        document.querySelector('.giftit-text-success').classList.remove('hide')
        // update cookie on successful order
        // TODO: Include actual order number instead
        document.cookie = `giftIt_order_${giftitOrderCount}=1; expires=${new Date((new Date().getTime() + 60 * 60 * 1000)).toUTCString()}; path=/`;
    } else {
        //TODO: test all error messages (lack of inventory, twillio failure)
        // const resData = await res.json();
        // if (resData.type === 'twilio') {
        //     document.querySelector('.giftit-order-fail p').innerHTML = `Please update the ${resData.error} and try again.`
        // }
        const failRef = document.querySelector('.giftit-fill-circle-fail')
        failRef.classList.remove('hide')
        failRef.style.animationPlayState = 'running'
        failRef.children[0].style.animationPlayState = 'running'
        failRef.children[1].style.animationPlayState = 'running'
        document.querySelector('.giftit-text-fail').classList.remove('hide')
    }
    document.querySelector('#giftit-close-button').classList.remove('hide')
    // prevent submission for 15 seconds
    const submitButton = document.querySelector('#giftit-submit-button')
    submitButton.disabled = true
    submitButton.innerHTML = `Submit (15)`

    for (let i = 14; i >= 0; i--) {
        await new Promise(res => setTimeout(res, 1000));
        submitButton.innerHTML = `Submit (${i})`
        if (i === 0) {
            submitButton.innerHTML = `Submit`
            submitButton.disabled = false
        }
    }
})