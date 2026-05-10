/*
========================================================
MANAGER.IO STOCK CONTROL EXTENSION
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
HELPER
========================================================
*/

function showMessage(text, type="success") {

    message.innerHTML = text;

    message.className = type;
}


/*
========================================================
SEND MESSAGE TO MANAGER
========================================================
*/

function requestManagerData(endpoint, requestId) {

    window.parent.postMessage({
        type: "api-request",
        endpoint: endpoint,
        requestId: requestId
    }, "*");
}


/*
========================================================
INITIALIZE
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

        /*
        ================================================
        PAGE CONNECTED
        ================================================
        */

        if (
            data.type === "page-response"
        ) {

            status.innerHTML =
                "Connected to Manager.io";

            requestManagerData(
                "/api2/customers",
                "customers"
            );

            requestManagerData(
                "/api2/inventory-items",
                "items"
            );
        }


        /*
        ================================================
        API RESPONSE
        ================================================
        */

        if (
            data.type === "api-response"
        ) {

            /*
            ============================================
            CUSTOMERS
            ============================================
            */

            if (
                data.requestId === "customers"
            ) {

                customerSelect.innerHTML =
                    `<option value="">
                        Select customer
                    </option>`;

                data.body.forEach(customer => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        customer.Key ||
                        customer.key;

                    option.textContent =
                        customer.Name ||
                        customer.name;

                    customerSelect.appendChild(
                        option
                    );
                });
            }


            /*
            ============================================
            ITEMS
            ============================================
            */

            if (
                data.requestId === "items"
            ) {

                itemSelect.innerHTML =
                    `<option value="">
                        Select item
                    </option>`;

                data.body.forEach(item => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        item.Key ||
                        item.key;

                    option.textContent =
                        item.Name ||
                        item.name;

                    itemSelect.appendChild(
                        option
                    );
                });
            }


            /*
            ============================================
            ITEM DETAILS
            ============================================
            */

            if (
                data.requestId === "item-details"
            ) {

                const item =
                    data.body;

                salesPrice.value =
                    item.SalesPrice ||
                    item.salesPrice ||
                    0;
            }


            /*
            ============================================
            STOCK
            ============================================
            */

            if (
                data.requestId === "stock"
            ) {

                const stock =
                    data.body;

                const balance =
                    parseFloat(
                        stock.Quantity ||
                        stock.quantity ||
                        0
                    );

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
            }
        }
    }
);


/*
========================================================
ITEM SELECT
========================================================
*/

itemSelect.addEventListener(
    "change",
    function() {

        const itemKey =
            itemSelect.value;

        if (!itemKey) return;

        requestManagerData(
            `/api2/inventory-item-form/${itemKey}`,
            "item-details"
        );

        requestManagerData(
            `/api2/inventory-item-quantity-on-hand/${itemKey}`,
            "stock"
        );
    }
);


/*
========================================================
VALIDATION
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
                "Invoice blocked. Item out of stock.",
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
