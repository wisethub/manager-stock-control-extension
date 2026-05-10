/*
========================================================
MANAGER.IO STOCK CONTROL EXTENSION
========================================================
*/

let businessKey = null;

const customerSelect =
    document.getElementById("customerSelect");

const itemSelect =
    document.getElementById("itemSelect");

const stockDisplay =
    document.getElementById("stockDisplay");

const salesPrice =
    document.getElementById("salesPrice");

const quantity =
    document.getElementById("quantity");

const validateButton =
    document.getElementById("validateButton");

const message =
    document.getElementById("message");

const status =
    document.getElementById("status");


/*
========================================================
MESSAGE
========================================================
*/

function showMessage(text, type="success") {

    message.innerHTML = text;

    message.className = type;
}


/*
========================================================
API HELPER
========================================================
*/

async function api(endpoint) {

    const response = await fetch(
        endpoint,
        {
            credentials: "include"
        }
    );

    if (!response.ok) {

        throw new Error(
            `API ERROR ${response.status}`
        );
    }

    return await response.json();
}


/*
========================================================
REQUEST PAGE INFO
========================================================
*/

window.parent.postMessage({
    type: "page-request"
}, "*");


/*
========================================================
LISTEN
========================================================
*/

window.addEventListener(
    "message",
    async function(event) {

        const data = event.data;

        console.log(data);

        if (
            data.type === "page-response"
        ) {

            status.innerHTML =
                "Connected to Manager.io";

            /*
            ============================================
            GET BUSINESS KEY
            ============================================
            */

            /*
============================================
GET BUSINESS KEY FROM PARENT URL
============================================
*/

try {

    const parentUrl =
        event.origin ||
        document.referrer;

    console.log(
        "Parent URL:",
        parentUrl
    );

    /*
    Example:
    https://subdomain.manager.io/businesses/xxxxxxx/sales-invoice-view
    */

    const match =
        parentUrl.match(
            /businesses\/([^\/]+)\//
        );

    if (match && match[1]) {

        businessKey = match[1];

        console.log(
            "Business Key:",
            businessKey
        );

    } else {

        throw new Error(
            "Business key not found"
        );
    }

} catch(error) {

    console.error(error);

    showMessage(
        "Unable to determine business key",
        "error"
    );

    return;
}

            console.log(
                "Business Key:",
                businessKey
            );

            if (!businessKey) {

                showMessage(
                    "Unable to determine business key",
                    "error"
                );

                return;
            }

            await loadCustomers();

            await loadItems();
        }
    }
);


/*
========================================================
LOAD CUSTOMERS
========================================================
*/

async function loadCustomers() {

    try {

        const customers =
            await api(
                `/api2/${businessKey}/customers`
            );

        customerSelect.innerHTML =
            `<option value="">
                Select customer
            </option>`;

        customers.forEach(customer => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                customer.Key;

            option.textContent =
                customer.Name;

            customerSelect.appendChild(
                option
            );
        });

    } catch(error) {

        console.error(error);

        showMessage(
            "Unable to load customers",
            "error"
        );
    }
}


/*
========================================================
LOAD ITEMS
========================================================
*/

async function loadItems() {

    try {

        const items =
            await api(
                `/api2/${businessKey}/inventory-items`
            );

        itemSelect.innerHTML =
            `<option value="">
                Select item
            </option>`;

        items.forEach(item => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                item.Key;

            option.textContent =
                item.Name;

            itemSelect.appendChild(
                option
            );
        });

    } catch(error) {

        console.error(error);

        showMessage(
            "Unable to load inventory items",
            "error"
        );
    }
}


/*
========================================================
ITEM SELECT
========================================================
*/

itemSelect.addEventListener(
    "change",
    async function() {

        const itemKey =
            itemSelect.value;

        if (!itemKey) return;

        try {

            /*
            ============================================
            ITEM DETAILS
            ============================================
            */

            const item =
                await api(
                    `/api2/${businessKey}/inventory-item-form/${itemKey}`
                );

            /*
            ============================================
            STOCK
            ============================================
            */

            const stock =
                await api(
                    `/api2/${businessKey}/inventory-item-quantity-on-hand/${itemKey}`
                );

            const balance =
                parseFloat(
                    stock.Quantity || 0
                );

            /*
            ============================================
            STOCK DISPLAY
            ============================================
            */

            if (balance <= 0) {

                stockDisplay.innerHTML =
                    "OUT OF STOCK";

                stockDisplay.className =
                    "error";

            } else {

                stockDisplay.innerHTML =
                    `Available Stock: ${balance}`;

                stockDisplay.className =
                    "success";
            }

            /*
            ============================================
            PRICE
            ============================================
            */

            salesPrice.value =
                item.SalesPrice || 0;

        } catch(error) {

            console.error(error);

            showMessage(
                "Unable to load item details",
                "error"
            );
        }
    }
);


/*
========================================================
VALIDATE
========================================================
*/

validateButton.addEventListener(
    "click",
    function() {

        const qty =
            parseFloat(
                quantity.value || 0
            );

        const stockText =
            stockDisplay.innerText;

        if (
            stockText === "OUT OF STOCK"
        ) {

            showMessage(
                "Invoice blocked. Out of stock.",
                "error"
            );

            return;
        }

        const available =
            parseFloat(
                stockText.replace(
                    "Available Stock: ",
                    ""
                )
            );

        if (qty > available) {

            showMessage(
                `Quantity exceeds stock (${available})`,
                "error"
            );

            return;
        }

        showMessage(
            "Invoice validation passed",
            "success"
        );
    }
);
