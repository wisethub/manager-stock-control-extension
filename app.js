/*
========================================================
STOCK CONTROL EXTENSION
Manager.io API4 Extension
========================================================
*/

const customerSelect =
    document.getElementById(
        "customerSelect"
    );

const itemSelect =
    document.getElementById(
        "itemSelect"
    );

const stockDisplay =
    document.getElementById(
        "stockDisplay"
    );

const salesPrice =
    document.getElementById(
        "salesPrice"
    );

const quantity =
    document.getElementById(
        "quantity"
    );

const validateButton =
    document.getElementById(
        "validateButton"
    );

const message =
    document.getElementById(
        "message"
    );

const status =
    document.getElementById(
        "status"
    );


/*
========================================================
HELPER
========================================================
*/

function showMessage(text, type = "success") {

    message.innerHTML = text;

    message.className = type;
}


/*
========================================================
REQUEST PAGE CONTEXT
========================================================
*/

window.parent.postMessage(
    {
        type: "page-request"
    },
    "*"
);


/*
========================================================
LISTEN FOR MANAGER RESPONSE
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

        const response =
            await fetch(
                "/api4/customers"
            );

        const customers =
            await response.json();

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
                customer.key;

            option.textContent =
                customer.name;

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
LOAD INVENTORY ITEMS
========================================================
*/

async function loadItems() {

    try {

        const response =
            await fetch(
                "/api4/inventory-items"
            );

        const items =
            await response.json();

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
                item.key;

            option.textContent =
                item.name;

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
ITEM CHANGE
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

            const itemResponse =
                await fetch(
                    `/api4/inventory-items/${itemKey}`
                );

            const item =
                await itemResponse.json();


            /*
            ============================================
            STOCK BALANCE
            ============================================
            */

            const stockResponse =
                await fetch(
                    `/api4/inventory-item-quantity-on-hand/${itemKey}`
                );

            const stock =
                await stockResponse.json();


            const balance =
                parseFloat(
                    stock.quantity || 0
                );

            /*
            ============================================
            DISPLAY STOCK
            ============================================
            */

            if (balance <= 0) {

                stockDisplay.innerHTML =
                    `OUT OF STOCK`;

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
            SALES PRICE
            ============================================
            */

            salesPrice.value =
                item.salesPrice || 0;


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
            balanceText === "OUT OF STOCK"
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
