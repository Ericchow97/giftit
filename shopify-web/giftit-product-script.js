
// get CSS
const head = document.querySelector('head');
const giftit_css = document.createElement('link');
giftit_css.rel = 'stylesheet';
giftit_css.type = 'text/css';
giftit_css.href = 'https://giftit-app.herokuapp.com/giftit-css';
giftit_css.media = 'all';

head.appendChild(giftit_css);

let giftitRef;
// get product form
for (const e of document.querySelectorAll('form[action="/cart/add"]')) {
    const button = e.querySelector('button')
    if (button) { giftitRef = e; break }
}

if (giftitRef) {
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
    head.appendChild(telephone_css);
    head.appendChild(telephone_script);

    // insert html into product form
    giftitRef.insertAdjacentHTML('afterend', `
    <div class='giftit-container'>
    <form class='form'>
        <button type='button' id='giftit' name='Gift_Item'>Give as a gift</button>
    </form>
</div>
<form action="https://giftit-app.herokuapp.com/gift-checkout" method="POST" autocomplete="on" class="giftit-form">
    <div id="giftit-modal" class="giftit-order-modal hide">
        <div class="giftit-modal-content">
            <div class='giftit-close-top'>
                <span class="giftit-steps-item-icon giftit-close-button">
                    <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
                        <path
                            d="M11.414 10l6.293-6.293a1 1 0 1 0-1.414-1.414L10 8.586 3.707 2.293a1 1 0 0 0-1.414 1.414L8.586 10l-6.293 6.293a1 1 0 1 0 1.414 1.414L10 11.414l6.293 6.293A.998.998 0 0 0 18 17a.999.999 0 0 0-.293-.707L11.414 10z">
                        </path>
                    </svg>
                </span>
            </div>
            <div id='giftit-nav-bar' class="giftit-steps">
                <div class="giftit-steps-item giftit-steps-item-active">
                    <div class="giftit-steps-container">
                        <span id='giftit-step1' class="giftit-steps-item-icon">
                            <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
                                <path fill-rule="evenodd"
                                    d="M10 20c5.514 0 10-4.486 10-10S15.514 0 10 0 0 4.486 0 10s4.486 10 10 10zm1-6a1 1 0 1 1-2 0v-4a1 1 0 1 1 2 0v4zm-1-9a1 1 0 1 0 0 2 1 1 0 0 0 0-2z">
                                </path>
                            </svg>
                        </span>
                        <span class="giftit-steps-item-icon giftit-steps-item-icon-complete hide">
                            <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
                                <path
                                    d="M10 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm0-14c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm-1 9a.997.997 0 0 1-.707-.293l-2-2a1 1 0 1 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4A.996.996 0 0 1 9 13z">
                                </path>
                            </svg>
                        </span>
                        <div class="giftit-steps-item-content">
                            <div class="giftit-item-title">How it works</div>
                        </div>
                    </div>
                </div>
                <div class="giftit-steps-item">
                    <div class="giftit-steps-container">
                        <span id='giftit-step2' class="giftit-steps-item-icon">
                            <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
                                <path
                                    d="M0 5.324V15.5A1.5 1.5 0 0 0 1.5 17h17a1.5 1.5 0 0 0 1.5-1.5V5.324l-9.496 5.54a1 1 0 0 1-1.008 0L0 5.324z">
                                </path>
                                <path
                                    d="M19.443 3.334A1.494 1.494 0 0 0 18.5 3h-17a1.49 1.49 0 0 0-.943.334L10 8.842l9.443-5.508z">
                                </path>
                            </svg>
                        </span>
                        <span class="giftit-steps-item-icon giftit-steps-item-icon-complete hide">
                            <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
                                <path
                                    d="M10 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm0-14c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm-1 9a.997.997 0 0 1-.707-.293l-2-2a1 1 0 1 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4A.996.996 0 0 1 9 13z">
                                </path>
                            </svg>
                        </span>
                        <div class="giftit-steps-item-content">
                            <div class="giftit-item-title">Contact Info</div>
                        </div>
                    </div>
                </div>
                <div class="giftit-steps-item">
                    <div class="giftit-steps-container">
                        <span id='giftit-step3' class="giftit-steps-item-icon">
                            <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
                                <path fill-rule="evenodd"
                                    d="M5 4.5C5 3.763 5.69 3 6.77 3 7.818 3 9 3.87 9 5.333V6h-.846c-.805 0-1.656-.011-2.306-.25-.302-.112-.498-.253-.621-.413C5.112 5.187 5 4.94 5 4.5zM11.846 6H11v-.667C11 3.87 12.181 3 13.23 3 14.31 3 15 3.763 15 4.5c0 .44-.112.686-.227.837-.123.16-.319.3-.621.412-.65.24-1.5.251-2.306.251zM17 4.5c0 .558-.103 1.06-.306 1.5H18.5A1.5 1.5 0 0 1 20 7.5V10H0V7.5A1.5 1.5 0 0 1 1.5 6h1.806A3.547 3.547 0 0 1 3 4.5C3 2.47 4.783 1 6.77 1c1.165 0 2.398.546 3.23 1.529C10.832 1.546 12.065 1 13.23 1 15.218 1 17 2.47 17 4.5zM9 20v-8H1v6.5c0 .83.67 1.5 1.5 1.5H9zm2 0v-8h8v6.5c0 .83-.67 1.5-1.5 1.5H11z">
                                </path>
                            </svg>
                        </span>
                        <span class="giftit-steps-item-icon giftit-steps-item-icon-complete hide">
                            <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
                                <path
                                    d="M10 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm0-14c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm-1 9a.997.997 0 0 1-.707-.293l-2-2a1 1 0 1 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4A.996.996 0 0 1 9 13z">
                                </path>
                            </svg>
                        </span>
                        <div class="giftit-steps-item-content">
                            <div class="giftit-item-title">Review</div>
                        </div>
                    </div>
                </div>
                <div class="giftit-steps-item">
                    <div class="giftit-steps-container">
                        <span id='giftit-step4' class="giftit-steps-item-icon">
                            <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
                                <path
                                    d="M12.384 8.92a1.01 1.01 0 0 1-.363.08 1.01 1.01 0 0 1-.553-.17.914.914 0 0 1-.373-.452.93.93 0 0 1-.08-.572.991.991 0 0 1 .271-.522l1.007-1.004a1.01 1.01 0 0 1 1.54.17 1.001 1.001 0 0 1-.12 1.255L12.706 8.71a1.158 1.158 0 0 1-.322.21zM8.03 3.757a1 1 0 0 0 1.94.486l-1.94-.486zm2.44-1.514a1 1 0 1 0-1.94-.486l1.94.486zm-.5 2l.5-2-1.94-.486-.5 2 1.94.486zm5.755 5.796a1 1 0 1 0 .55 1.922l-.55-1.922zm2.532 1.355a1 1 0 1 0-.55-1.922l.55 1.922zm-1.982.567l1.982-.567-.55-1.922-1.982.567.55 1.922zM4.515 7.518L.182 16.877a2.238 2.238 0 0 0 2.942 2.94l9.367-4.338a.921.921 0 0 0 .465-1.102.918.918 0 0 0-.226-.369L5.987 7.27a.92.92 0 0 0-.8-.258.92.92 0 0 0-.672.506zM1.801 3.98c.109.022.197.11.219.219a1 1 0 0 0 1.96 0 .283.283 0 0 1 .22-.219 1 1 0 0 0 0-1.96.283.283 0 0 1-.219-.219 1 1 0 0 0-1.96 0 .283.283 0 0 1-.219.219 1 1 0 0 0 0 1.96zm14 0c.109.022.197.11.219.219a1 1 0 0 0 1.96 0 .283.283 0 0 1 .219-.219 1 1 0 0 0 0-1.96.283.283 0 0 1-.219-.219 1 1 0 0 0-1.96 0 .283.283 0 0 1-.219.219 1 1 0 0 0 0 1.96zm0 14c.109.022.197.11.219.219a1 1 0 0 0 1.96 0 .283.283 0 0 1 .219-.219 1 1 0 0 0 0-1.96.283.283 0 0 1-.219-.219 1 1 0 0 0-1.96 0 .283.283 0 0 1-.219.219 1 1 0 0 0 0 1.96z">
                                </path>
                            </svg>
                        </span>
                        <div class="giftit-steps-item-content">
                            <div class="giftit-item-title">Confirmation</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class='giftit-modal-display-content giftit-modal-content-active'>
                <div class="giftit-steps giftit-steps-vertical">
                    <div class="giftit-steps-item">
                        <div class="giftit-text-container">
                            <div class="giftit-steps-item-tail"></div>
                            <div class="giftit-steps-item-icon">1</div>
                            <div class="giftit-text-content">
                                <div class="giftit-item-title">Fill in your information</div>
                                <div class="giftit-steps-item-description">Enter your contact information and the
                                    recipient's contact information.</div>
                            </div>
                        </div>
                    </div>
                    <div class="giftit-steps-item giftit-steps-item-process giftit-steps-item-active">
                        <div class="giftit-text-container">
                            <div class="giftit-steps-item-tail"></div>
                            <div class="giftit-steps-item-icon"><span class="giftit-steps-icon">2</span></div>
                            <div class="giftit-text-content">
                                <div class="giftit-item-title">Send the gift</div>
                                <div class="giftit-steps-item-description">The item will be placed on hold while the
                                    recipient will be contacted to provide their address.</div>
                            </div>
                        </div>
                    </div>
                    <div class="giftit-steps-item giftit-steps-item-wait">
                        <div class="giftit-text-container">
                            <div class="giftit-steps-item-tail"></div>
                            <div class="giftit-steps-item-icon"><span class="giftit-steps-icon">3</span></div>
                            <div class="giftit-text-content">
                                <div class="giftit-item-title">Complete the purchase</div>
                                <div class="giftit-steps-item-description">When the recipient provides their address,
                                    you
                                    will receive an email to complete the rest of the purchase with their shipping
                                    address.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id='giftit-form-input' class='giftit-modal-display-content hide'>
                <div class="giftit-gift-information">
                    <div class="giftit-item-title">From:</div>
                    <div class='giftit-container'>
                        <div class="giftit-input-item">
                            <div class="giftit-error-container">
                                <input type="text" name="purchaserName" required placeholder="Full Name">
                                <p id="giftit-purchaserName-error" class="giftit-error hide"> Error: Please enter your
                                    name </p>
                            </div>
                        </div>
                        <div class="giftit-input-item">
                            <div class="giftit-error-container">
                                <input type="email" id="giftit-gift-email" name="purchaserEmail" required
                                    placeholder="YourEmail@address.com">
                                <p id="giftit-purchaserEmail-error" class="giftit-error hide"> Error: Please enter your
                                    contact information </p>
                            </div>
                        </div>
                    </div>
                    <div class="giftit-item-title">To:</div>
                    <div class='giftit-container'>
                        <div class="giftit-input-item">
                            <div class="giftit-error-container">
                                <input type="text" name="recipientName" required placeholder="Recipient Name">
                                <p id="giftit-recipientName-error" class="giftit-error hide"> Error: Please enter the
                                    recipients name </p>
                            </div>
                        </div>
                        <div class="giftit-input-item">
                            <div class="giftit-error-container">
                                <div class="giftit-input-item" style="margin-right:0;">
                                    <select id="giftit-recipient-contact-dropdown" name="method" value="Email">
                                        <option value="Email">Email</option>
                                        <option value="Phone">Phone</option>
                                    </select>
                                    <input type="email" id="giftit-recipient-email" name="recipientEmail" required
                                        placeholder="RecipientEmail@address.com">
                                    <div class="giftit-recipient-phone-number hide">
                                        <input class="giftit-tel" inputmode="tel" type="tel" pattern="^[0-9]{3,45}$"
                                            id="giftit-recipient-phone-number" placeholder="123456789" name="phone"
                                            title='123456789'>
                                    </div>
                                </div>
                                <p id="giftit-recipient-contact-error" class="giftit-error hide"> Error: Please enter
                                    contact information for the recipient </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="giftit-message">
                    <label for="giftit-gift-message"> Custom Message (optional) </label>
                    <textarea maxlength=140 id="giftit-gift-message" class='giftit-gift-message'
                        placeholder="Write a custom message" rows=5 name="message"></textarea>
                    <p class='giftit-gift-fine-print'> Character
                        Count:
                        <span id="giftit-charCount">0</span> /140
                    </p>
                </div>
            </div>
            <div class='giftit-modal-display-content hide'>
                <div class="giftit-gift-information">
                    <div class='giftit-container'>
                        <div class='giftit-full-description'>
                            <div>
                                <div class="giftit-item-title">To: <span id='giftit-recipientName'></span></div>
                            </div>
                            <div>
                                <div class="giftit-item-title"> Contact: <span id='giftit-recipientContact'></span>
                                </div>
                            </div>
                        </div>
                        <div class='giftit-full-description'>
                            <div>
                                <div class="giftit-item-title">From: <span id='giftit-purchaserName'></span></div>
                            </div>
                            <div>
                                <div class="giftit-item-title"> Contact: <span id='giftit-purchaserEmail'></span></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="giftit-message">
                    <div class="giftit-item-title">Message:</div>
                    <p id='giftit-message'></p>
                </div>
            </div>
            <div class='giftit-modal-display-content hide'>
                <div class="giftit-loader"> </div>
                <svg class="giftit-fill-circle giftit-fill-circle-success hide" xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 52 52">
                    <circle class="giftit-circle-outline giftit-circle-outline-success" cx="26" cy="26" r="25"
                        fill="none" />
                    <path class="giftit-checkmark" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>

                <svg class="giftit-fill-circle giftit-fill-circle-fail hide" xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 52 52">
                    <circle class="giftit-circle-outline giftit-circle-outline-fail" cx="26" cy="26" r="25"
                        fill="none" />
                    <path class="giftit-checkmark" fill="none" d="M14.1 14.1l23.8 23.8 m0,-23.8 l-23.8,23.8" />
                </svg>
                <div style="width: 100%;">
                    <p class="giftit-loading-text giftit-item-title">Checking available inventory</p>
                    <!-- TODO: See what information you can pass back for order confirmation display -->

                    <p class="giftit-text-success giftit-item-title hide">Congratulations, your order has been
                        successfully placed! Please check your inbox shortly for a confirmation of your order. We will
                        notify you when the recipient has confirmed their shipping address. </p>
                    <p class="giftit-text-fail giftit-item-title hide">Your order cannot be placed at this time. Please
                        try again. If you've experienced this error multiple times please contact the store for more
                        details.
                    </p>
                    <p class="giftit-text-fail-orders giftit-item-title hide">Your order cannot be placed at this time.
                        You have placed too many orders. Please try again later.
                    </p>
                </div>
            </div>

            <div class="giftit-modal-footer">
                <button type="button" id='giftit-back-button' class="giftit-btn hide"> Back </button>
                <button type="button" id='giftit-next-button' class="giftit-btn giftit-btn-primary"> Next </button>
                <button id='giftit-submit-button' class="giftit-btn giftit-btn-primary hide"> Submit </button>
                <button type="button" id='giftit-close-button' class="giftit-btn giftit-close-button hide"> Close
                </button>
            </div>
        </div>
    </div>
</form>
    `)

    const getStyles = (computedStyles) => {
        const ret = {}
        for (const style of computedStyles) {
            ret[style] = computedStyles[style]
        }
        return ret
    }
    // update button to match type
    let currentStyle = getStyles(getComputedStyle(document.querySelector('#giftit')))
    const btnStyleData = giftitRef.querySelector('button').classList
    for (const cssClass of btnStyleData) {
        document.querySelector('#giftit').classList.add(cssClass)
        const newStyle = getStyles(getComputedStyle(document.querySelector('#giftit')))
        let same = true
        for (const style in currentStyle) {
            if (currentStyle[style] !== newStyle[style]) {
                same = false
                currentStyle = newStyle
                break
            }
        }
        if (same) {
            document.querySelector('#giftit').classList.remove(cssClass)
        }
    }

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
        const res = await fetch('https://giftit-app.herokuapp.com/gift-checkout', {
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
}