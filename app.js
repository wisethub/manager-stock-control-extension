/*
========================================================
MANAGER.IO STOCK CONTROL EXTENSION
API4 VERSION
========================================================
*/

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
MESSAGE DISPLAY
========================================================
*/

function showMessage(text, type = "success") {

    message.innerHTML = text;

    message.className = type;
}


/*
========================================================
API REQUEST HELPER
========================================================
*/

function managerApi(endpoint) {

    return fetch(endpoint, {
        credentials: "include",
        headers: {
            "Accept": "application/json"
        }
    }).then(r => {

        if (!r.ok) {
            throw new Error(
                `API Error ${r.status}`
            );
        }

        return r.json();
    });
}


/*
========================================================
PAGE CONTEXT
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

        /*
        ================================================
        TRY API2
        ================================================
        */

        const customers =
            await managerApi(
                "/api2/customers"
            );

        customerSelect.innerHTML =
            `<option value="">
                Select customer
            </option>`;

        customers.forEach(customer => {

            const option =
                document.createElement("option");

            option.value =
                customer.Key || customer.key;

            option.textContent =
                customer.Name || customer.name;

            customerSelect.appendChild(option);
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
LOAD INVENTORY ITEMS
========================================================
*/

async function loadItems() {

    try {

        /*
        ================================================
        TRY API2
        ================================================
        */

        const items =
            await managerApi(
                "/api2/inventory-items"
            );

        itemSelect.innerHTML =
            `<option value="">
                Select item
            </option>`;

        items.forEach(item => {

            const option =
                document.createElement("option");

            option.value =
                item.Key || item.key;

            option.textContent =
                item.Name || item.name;

            itemSelect.appendChild(option);
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
            ================================================
            ITEM DETAILS
            ================================================
            */

            const item =
                await managerApi(
                    `/api2/inventory-item-form/${itemKey}`
                );

            /*
            ================================================
            STOCK
            ================================================
            */

            const stock =
                await managerApi(
                    `/api2/inventory-item-quantity-on-hand/${itemKey}`
                );

            const balance =
                parseFloat(
                    stock.Quantity ||
                    stock.quantity ||
                    0
                );

            /*
            ================================================
            DISPLAY STOCK
            ================================================
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
            ================================================
            SALES PRICE
            ================================================
            */

            salesPrice.value =
                item.SalesPrice ||
                item.salesPrice ||
                0;

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

        const balanceText =
            stockDisplay.innerText;

        const qty =
            parseFloat(
                quantity.value || 0
            );

        if (
            balanceText ===
            "OUT OF STOCK"
        ) {

            showMessage(
                "Invoice blocked. Item out of stock.",
                "error"
            );

            return;
        }

        const available =
            parseFloat(
                balanceText.replace(
                    "Available Stock: ",
                    ""
                )
            );

        if (qty > available) {

            showMessage(
                `Quantity exceeds available stock (${available})`,
                "error"
            );

            return;
        }

        showMessage(
            "Invoice validation passed"
        );
    }
);
