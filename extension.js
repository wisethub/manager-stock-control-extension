/*
========================================================
Manager.io Cloud Extension
Stock Control + Price Protection
========================================================

FEATURES
1. Prevent invoice save if stock is zero/negative
2. Prevent quantity greater than available stock
3. Auto display available stock on item selection
4. Lock default sales price
5. Validate manipulated prices before save

INSTALLATION
1. Create GitHub public repository
2. Save this file as: extension.js
3. Create manifest.json
4. Upload both files to GitHub
5. Use raw manifest URL inside Manager.io Extension

========================================================
*/

const EXTENSION_ID = "stock-control-extension";

/*
========================================================
UTILITY FUNCTIONS
========================================================
*/

async function fetchInventoryItem(itemKey) {

    const response = await fetch(
        `/api2/inventory-item-form/${itemKey}`
    );

    if (!response.ok) {
        throw new Error("Unable to fetch inventory item");
    }

    return await response.json();
}


async function fetchItemBalance(itemKey) {

    const response = await fetch(
        `/api2/inventory-item-quantity-on-hand/${itemKey}`
    );

    if (!response.ok) {
        throw new Error("Unable to fetch inventory balance");
    }

    return await response.json();
}


function createStockBadge(balance) {

    const badge = document.createElement("div");

    badge.style.marginTop = "4px";
    badge.style.fontSize = "12px";
    badge.style.fontWeight = "600";

    if (balance <= 0) {

        badge.style.color = "#d32f2f";
        badge.innerText = `OUT OF STOCK`;

    } else {

        badge.style.color = "#2e7d32";
        badge.innerText = `Available Stock: ${balance}`;
    }

    return badge;
}


/*
========================================================
MAIN EXTENSION
========================================================
*/

(function () {

    console.log("Stock Control Extension Loaded");


    /*
    ========================================================
    WATCH SALES INVOICE PAGE
    ========================================================
    */

    const observer = new MutationObserver(async () => {

        /*
        ====================================================
        DETECT SALES INVOICE TABLE
        ====================================================
        */

        const invoiceTable = document.querySelector("table");

        if (!invoiceTable) return;

        const rows = invoiceTable.querySelectorAll("tbody tr");

        rows.forEach((row) => {

            if (row.dataset.stockExtensionLoaded === "true") {
                return;
            }

            row.dataset.stockExtensionLoaded = "true";


            /*
            ====================================================
            INPUT FIELDS
            ====================================================
            */

            const itemField =
                row.querySelector(
                    'input[list]'
                );

            const qtyField =
                row.querySelectorAll("input")[1];

            const priceField =
                row.querySelectorAll("input")[2];

            if (!itemField) return;


            /*
            ====================================================
            STOCK DISPLAY AREA
            ====================================================
            */

            const stockArea = document.createElement("div");

            stockArea.style.marginTop = "4px";

            itemField.parentElement.appendChild(stockArea);


            /*
            ====================================================
            ITEM SELECTION EVENT
            ====================================================
            */

            itemField.addEventListener(
                "change",
                async function () {

                    try {

                        const itemKey =
                            itemField.getAttribute(
                                "data-key"
                            ) || itemField.value;

                        if (!itemKey) return;


                        /*
                        ============================================
                        FETCH ITEM DETAILS
                        ============================================
                        */

                        const item =
                            await fetchInventoryItem(itemKey);

                        const stock =
                            await fetchItemBalance(itemKey);


                        /*
                        ============================================
                        STOCK VALUE
                        ============================================
                        */

                        let balance = 0;

                        if (
                            stock &&
                            stock.Quantity
                        ) {

                            balance =
                                parseFloat(stock.Quantity);

                        } else if (
                            stock &&
                            stock.quantity
                        ) {

                            balance =
                                parseFloat(stock.quantity);
                        }


                        /*
                        ============================================
                        DISPLAY STOCK BADGE
                        ============================================
                        */

                        stockArea.innerHTML = "";

                        stockArea.appendChild(
                            createStockBadge(balance)
                        );


                        /*
                        ============================================
                        SET DEFAULT SALES PRICE
                        ============================================
                        */

                        let defaultPrice = 0;

                        if (
                            item &&
                            item.SalesPrice
                        ) {

                            defaultPrice =
                                parseFloat(
                                    item.SalesPrice
                                );
                        }

                        if (priceField) {

                            priceField.value =
                                defaultPrice.toFixed(2);

                            /*
                            ========================================
                            LOCK PRICE FIELD
                            ========================================
                            */

                            priceField.readOnly = true;

                            /*
                            ========================================
                            STORE ORIGINAL PRICE
                            ========================================
                            */

                            priceField.dataset.defaultPrice =
                                defaultPrice;
                        }


                        /*
                        ============================================
                        STORE BALANCE
                        ============================================
                        */

                        row.dataset.availableStock =
                            balance;


                    } catch (error) {

                        console.error(error);

                        alert(
                            "Error loading inventory item"
                        );
                    }
                }
            );
        });


        /*
        ====================================================
        SAVE BUTTON VALIDATION
        ====================================================
        */

        const saveButton =
            document.querySelector(
                'button[type="submit"]'
            );

        if (
            saveButton &&
            !saveButton.dataset.validationAttached
        ) {

            saveButton.dataset.validationAttached =
                "true";


            saveButton.addEventListener(
                "click",
                async function (event) {

                    try {

                        const invoiceRows =
                            document.querySelectorAll(
                                "tbody tr"
                            );

                        for (const row of invoiceRows) {

                            const inputs =
                                row.querySelectorAll(
                                    "input"
                                );

                            if (
                                !inputs ||
                                inputs.length < 3
                            ) {
                                continue;
                            }

                            const itemInput =
                                inputs[0];

                            const qtyInput =
                                inputs[1];

                            const priceInput =
                                inputs[2];

                            const itemName =
                                itemInput.value;

                            const qty =
                                parseFloat(
                                    qtyInput.value || 0
                                );

                            const enteredPrice =
                                parseFloat(
                                    priceInput.value || 0
                                );

                            const availableStock =
                                parseFloat(
                                    row.dataset.availableStock || 0
                                );

                            const defaultPrice =
                                parseFloat(
                                    priceInput.dataset.defaultPrice || 0
                                );


                            /*
                            ========================================
                            STOCK VALIDATION
                            ========================================
                            */

                            if (
                                availableStock <= 0
                            ) {

                                event.preventDefault();

                                alert(
                                    `${itemName} is OUT OF STOCK`
                                );

                                return false;
                            }


                            if (
                                qty > availableStock
                            ) {

                                event.preventDefault();

                                alert(
                                    `${itemName} available quantity is ${availableStock}`
                                );

                                return false;
                            }


                            /*
                            ========================================
                            PRICE VALIDATION
                            ========================================
                            */

                            if (
                                enteredPrice !== defaultPrice
                            ) {

                                event.preventDefault();

                                alert(
                                    `You cannot edit default sales price for ${itemName}`
                                );

                                return false;
                            }
                        }

                    } catch (error) {

                        console.error(error);

                        event.preventDefault();

                        alert(
                            "Validation failed"
                        );

                        return false;
                    }
                }
            );
        }

    });


    /*
    ========================================================
    START OBSERVER
    ========================================================
    */

    observer.observe(
        document.body,
        {
            childList: true,
            subtree: true
        }
    );

})();
