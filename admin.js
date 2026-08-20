const SUPABASE_URL = "https://twimiovuogzyobxhbhqx.supabase.co";
const SUPABASE_KEY = "sb_publishable_JA-T5p98xPd1mekWWMYJgw_pls_oOVT";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ===============================
// CHECK LOGIN
// ===============================

async function checkAdmin() {

    const {
        data: { session },
        error
    } = await supabaseClient.auth.getSession();


    if (error) {

        console.error("Session error:", error);

        window.location.href = "admin-login.html";

        return false;
    }


    if (!session) {

        console.log("No active admin session.");

        window.location.href = "admin-login.html";

        return false;
    }


    console.log("Admin session found:", session.user.email);

    return true;
}


// ===============================
// LOAD BOOKINGS
// ===============================

async function loadBookings() {

    const { data, error } = await supabaseClient
        .from("booking")
        .select("*")
        .order("date", { ascending: true });


    if (error) {

        console.error("Booking loading error:", error);

        document.querySelector("#bookingList").innerHTML =
            '<div class="empty-bookings"><p>Unable to load bookings.</p></div>';

        return;
    }


    console.log("BOOKINGS FROM SUPABASE:", data);


    updateStatistics(data);

    displayBookings(data);

}


// ===============================
// UPDATE STATISTICS
// ===============================

function updateStatistics(bookings) {

    const pending = bookings.filter(
        booking => booking.status === "pending"
    ).length;


    const confirmed = bookings.filter(
        booking => booking.status === "confirmed"
    ).length;


    const completed = bookings.filter(
        booking => booking.status === "completed"
    ).length;


    const cancelled = bookings.filter(
        booking => booking.status === "cancelled"
    ).length;


    document.querySelector("#pendingCount").textContent =
        pending;


    document.querySelector("#confirmedCount").textContent =
        confirmed;


    document.querySelector("#completedCount").textContent =
        completed;


    document.querySelector("#cancelledCount").textContent =
        cancelled;

}


// ===============================
// DISPLAY BOOKINGS
// ===============================

function displayBookings(bookings) {

    const bookingList =
        document.querySelector("#bookingList");


    if (bookings.length === 0) {

        bookingList.innerHTML =
            '<div class="empty-bookings"><p>No bookings yet.</p></div>';

        return;
    }


    bookingList.innerHTML = "";


    bookings.forEach(function (booking) {

        const bookingCard =
            document.createElement("div");


        bookingCard.className =
            "booking-card";


        bookingCard.innerHTML = `

            <div class="booking-info">

                <h3>${booking.name}</h3>

                <p>${booking.phone}</p>

            </div>


            <div class="booking-detail">

                <span>SERVICE</span>

                ${booking.service}

            </div>


            <div class="booking-detail">

                <span>DATE</span>

                ${booking.date}

            </div>


            <div class="booking-detail">

                <span>TIME</span>

                ${booking.time}

            </div>


            <div>

                <span class="booking-status status-${booking.status}">

                    ${booking.status}

                </span>

            </div>

        `;


        bookingList.appendChild(bookingCard);

    });

}


// ===============================
// START DASHBOARD
// ===============================

async function startDashboard() {

    const isLoggedIn =
        await checkAdmin();


    if (!isLoggedIn) {

        return;

    }


    await loadBookings();

}


// Start dashboard

startDashboard();


// ===============================
// LOGOUT
// ===============================

const logoutButton =
    document.querySelector("#logoutButton");


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            const { error } =
                await supabaseClient.auth.signOut();


            if (error) {

                console.error(
                    "Logout error:",
                    error
                );

                return;

            }


            window.location.href =
                "admin-login.html";

        }
    );

}