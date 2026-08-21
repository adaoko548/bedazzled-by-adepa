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

    console.log("Checking admin session...");

    const {
        data,
        error
    } = await supabaseClient.auth.getSession();

    if (error) {

        console.error("SESSION ERROR:", error);

        return false;
    }

    console.log("SESSION DATA:", data);

    if (!data.session) {

        console.log("No session found.");

        return false;
    }

    console.log(
        "Admin logged in:",
        data.session.user.email
    );

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


function displayBookings(bookings) {

    const bookingList =
        document.querySelector("#bookingList");

    if (!bookingList) {
        return;
    }

    if (!bookings || bookings.length === 0) {

        bookingList.innerHTML = `
            <div class="empty-bookings">
                <p>No bookings yet.</p>
            </div>
        `;

        return;
    }

    bookingList.innerHTML = "";

    bookings.forEach(function (booking) {

        const bookingCard =
            document.createElement("div");

        bookingCard.className = "booking-card";

        let actionButtons = "";

        if (booking.status === "pending") {

            actionButtons = `
                <button
                    class="booking-action confirm"
                    onclick="updateBookingStatus('${booking.id}', 'confirmed')"
                >
                    Confirm
                </button>

                <button
                    class="booking-action cancel"
                    onclick="updateBookingStatus('${booking.id}', 'cancelled')"
                >
                    Cancel
                </button>
            `;

        } else if (booking.status === "confirmed") {

            actionButtons = `
                <button
                    class="booking-action complete"
                    onclick="updateBookingStatus('${booking.id}', 'completed')"
                >
                    Mark Completed
                </button>

                <button
                    class="booking-action cancel"
                    onclick="updateBookingStatus('${booking.id}', 'cancelled')"
                >
                    Cancel
                </button>
            `;

        } else if (booking.status === "completed") {

            actionButtons = `
                <span class="booking-finished">
                    Appointment Completed
                </span>
            `;

        } else if (booking.status === "cancelled") {

            actionButtons = `
                <span class="booking-finished">
                    Booking Cancelled
                </span>
            `;
        }


        bookingCard.innerHTML = `

            <div class="booking-main-info">

                <div class="booking-customer">

                    <h3>
                        ${booking.name}
                    </h3>

                    <p>
                        ${booking.phone}
                    </p>

                    <p>
                        ${booking.email}
                    </p>

                </div>


                <span
                    class="booking-status status-${booking.status}"
                >
                    ${booking.status}
                </span>

            </div>


            <div class="booking-details">

                <div class="booking-detail">

                    <span>SERVICE</span>

                    <strong>
                        ${booking.service}
                    </strong>

                </div>


                <div class="booking-detail">

                    <span>DATE</span>

                    <strong>
                        ${booking.date}
                    </strong>

                </div>


                <div class="booking-detail">

                    <span>TIME</span>

                    <strong>
                        ${booking.time}
                    </strong>

                </div>

            </div>


            ${
                booking.message
                    ? `
                        <div class="booking-message">

                            <span>MESSAGE</span>

                            <p>
                                ${booking.message}
                            </p>

                        </div>
                    `
                    : ""
            }


            <div class="booking-actions">

                ${actionButtons}

            </div>

        `;


        bookingList.appendChild(bookingCard);

    });

}

async function updateBookingStatus(
    bookingId,
    newStatus
) {

    console.log(
        "Updating booking:",
        bookingId,
        newStatus
    );


    const {
        data,
        error
    } = await supabaseClient
        .from("booking")
        .update({
            status: newStatus
        })
        .eq("id", bookingId)
        .select();


    if (error) {

        console.error(
            "BOOKING STATUS ERROR:",
            error
        );

        alert(
            "Unable to update booking: " +
            error.message
        );

        return;
    }


    console.log(
        "BOOKING UPDATED:",
        data
    );


    alert(
        "Booking marked as " +
        newStatus +
        "."
    );


    // Reload bookings
    loadBookings();

}


// ===============================
// START DASHBOARD
// ===============================

async function startDashboard() {

    const isLoggedIn = await checkAdmin();

    if (!isLoggedIn) {

        window.location.href = "admin-login.html";

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

// ===============================
// GALLERY UPLOAD
// ===============================

const galleryUploadForm =
    document.querySelector("#galleryUploadForm");


if (galleryUploadForm) {

    galleryUploadForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const imageInput =
                document.querySelector("#galleryImage");


            const titleInput =
                document.querySelector("#galleryTitle");


            const message =
                document.querySelector("#galleryUploadMessage");


            const file =
                imageInput.files[0];


            const title =
                titleInput.value.trim();


            if (!file) {

                message.textContent =
                    "Please choose an image.";

                return;
            }


            if (!title) {

                message.textContent =
                    "Please enter a photo title.";

                return;
            }


            message.textContent =
                "Uploading photo...";


            // Create a unique filename

            const fileExtension =
                file.name.split(".").pop();


            const fileName =
                `${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2)}.${fileExtension}`;


            // Upload image to Supabase Storage

            const {
                data: uploadData,
                error: uploadError
            } = await supabaseClient.storage
                .from("gallery")
                .upload(fileName, file);


            if (uploadError) {

                console.error(
                    "Image upload error:",
                    uploadError
                );


                message.textContent =
                    "Image upload failed.";

                return;
            }


            console.log(
                "Image uploaded:",
                uploadData
            );


            // Get public image URL

            const {
                data: publicUrlData
            } = supabaseClient.storage
                .from("gallery")
                .getPublicUrl(fileName);


            const imageUrl =
                publicUrlData.publicUrl;


           // Save photo information to the gallery table

const {
    data: galleryData,
    error: databaseError
} = await supabaseClient
    .from("gallery")
    .insert([
        {
            title: title,
            image_url: imageUrl
        }
    ])
    .select();

if (databaseError) {

    console.error(
        "GALLERY DATABASE ERROR:",
        databaseError
    );

    message.textContent =
        "Photo uploaded, but gallery information could not be saved.";

    return;
}

console.log(
    "GALLERY DATABASE SAVED:",
    galleryData
);


            if (databaseError) {

                console.error(
                    "Gallery database error:",
                    databaseError
                );


                message.textContent =
                    "Photo uploaded but could not be saved.";

                return;
            }


            message.textContent =
                "Photo uploaded successfully!";


            galleryUploadForm.reset();


            loadGallery();

        }
    );

}// ===============================
// LOAD GALLERY
// ===============================

async function loadGallery() {

    const galleryGrid =
        document.querySelector("#adminGalleryGrid");

    if (!galleryGrid) {
        return;
    }

    const { data, error } = await supabaseClient
        .from("gallery")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (error) {

        console.error(
            "Gallery loading error:",
            error
        );

        galleryGrid.innerHTML =
            "<p>Unable to load gallery.</p>";

        return;
    }

    console.log("GALLERY FROM SUPABASE:", data);

    if (!data || data.length === 0) {

        galleryGrid.innerHTML =
            "<p>No photos uploaded yet.</p>";

        return;
    }

    galleryGrid.innerHTML = "";

    data.forEach(function (photo) {

        const item =
            document.createElement("div");

        item.className =
            "admin-gallery-item";

        item.innerHTML = `
            <img
                src="${photo.image_url}"
                alt="${photo.title}"
            >

            <div class="admin-gallery-info">

                <h3>${photo.title}</h3>

               <button
    class="delete-gallery-button"
    data-id="${photo.id}"
    data-url="${photo.image_url}"
>
    Delete
</button>
            </div>
        `;

        galleryGrid.appendChild(item);

    });
}
document.addEventListener("click", function (event) {

    if (!event.target.classList.contains("delete-gallery-button")) {
        return;
    }

    const id = event.target.dataset.id;
    const imageUrl = event.target.dataset.url;

    console.log("DELETE BUTTON CLICKED");
    console.log("ID:", id);
    console.log("URL:", imageUrl);

    deleteGalleryPhoto(id, imageUrl);

});

loadGallery();


async function deleteGalleryPhoto(id, imageUrl) {

    console.log("DELETE STARTED");
    console.log("ID:", id);
    console.log("IMAGE URL:", imageUrl);

    try {

        const marker =
            "/storage/v1/object/public/gallery/";

        const markerIndex =
            imageUrl.indexOf(marker);

        if (markerIndex === -1) {

            console.error(
                "Could not find storage file path."
            );

            alert("Could not find the image file.");

            return;
        }

        const filePath =
            decodeURIComponent(
                imageUrl.substring(
                    markerIndex + marker.length
                )
            );

        console.log(
            "STORAGE FILE PATH:",
            filePath
        );


        // Delete from Storage
        const {
            data: storageData,
            error: storageError
        } = await supabaseClient
            .storage
            .from("gallery")
            .remove([filePath]);


        console.log(
            "STORAGE DELETE RESULT:",
            storageData
        );


        if (storageError) {

            console.error(
                "STORAGE DELETE ERROR:",
                storageError
            );

            alert(
                "Storage error: " +
                storageError.message
            );

            return;
        }


        // Delete from database
        const {
            data: databaseData,
            error: databaseError
        } = await supabaseClient
            .from("gallery")
            .delete()
            .eq("id", id)
            .select();


        console.log(
            "DATABASE DELETE RESULT:",
            databaseData
        );


        if (databaseError) {

            console.error(
                "DATABASE DELETE ERROR:",
                databaseError
            );

            alert(
                "Database error: " +
                databaseError.message
            );

            return;
        }


        console.log(
            "PHOTO DELETED SUCCESSFULLY"
        );

        alert(
            "Photo deleted successfully."
        );

        loadGallery();

    } catch (error) {

        console.error(
            "DELETE ERROR:",
            error
        );

        alert(
            "Something went wrong: " +
            error.message
        );

    }

}