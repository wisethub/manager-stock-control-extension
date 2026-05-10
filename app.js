/*
==================================================
MANAGER.IO API4 DIAGNOSTIC
==================================================
*/

const status =
    document.getElementById("status");

const message =
    document.getElementById("message");

const customerSelect =
    document.getElementById("customerSelect");

const itemSelect =
    document.getElementById("itemSelect");


/*
==================================================
START
==================================================
*/

initialize();


/*
==================================================
INITIALIZE
==================================================
*/

async function initialize() {

    status.innerHTML =
        "Testing API4 connection...";

    try {

        /*
        ==========================================
        TEST API4 BUSINESSES
        ==========================================
        */

        const response =
            await fetch(
                "/api4/businesses",
                {
                    credentials: "include",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

        console.log(response);

        /*
        ==========================================
        RESPONSE CHECK
        ==========================================
        */

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const data =
            await response.json();

        console.log(data);

        status.innerHTML =
            "API4 Connected";

        message.innerHTML =
            JSON.stringify(
                data,
                null,
                2
            );

        /*
        ==========================================
        LOAD BUSINESSES
        ==========================================
        */

        customerSelect.innerHTML =
            `<option>
                API4 Working
            </option>`;

        itemSelect.innerHTML =
            `<option>
                Businesses Loaded
            </option>`;

    } catch(error) {

        console.error(error);

        status.innerHTML =
            "API4 Connection Failed";

        message.innerHTML =
            error.message;
    }
}
