const SUPABASE_URL = "https://twimiovuogzyobxhbhqx.supabase.co";
const SUPABASE_KEY = "sb_publishable_JA-T5p98xPd1mekWWMYJgw_pls_oOVT";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


document.addEventListener("DOMContentLoaded", function () {

    const bookingForm = document.querySelector(".booking-form");
    const successModal = document.querySelector("#successModal");
const closeModal = document.querySelector("#closeModal");
const doneButton = document.querySelector("#doneButton");
const successMessage = document.querySelector("#successMessage");

    if (!bookingForm) {
        console.error("Booking form was not found.");
        return;
    }


    bookingForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.querySelector("#name").value.trim();
        const phone = document.querySelector("#phone").value.trim();
        const email = document.querySelector("#email").value.trim();
        const service = document.querySelector("#service").value;
        const date = document.querySelector("#date").value;
        const time = document.querySelector("#time").value;
        const message = document.querySelector("#message").value.trim();


        const { data, error } = await supabaseClient
            .from("booking")
            .insert([
                {
                    name: name,
                    phone: phone,
                    email: email,
                    service: service,
                    date: date,
                    time: time,
                    message: message,
                    status: "pending"
                }
            ]);


        if (error) {

            console.error("Booking error:", error);

            alert(
                "Something went wrong while submitting your booking."
            );

            return;
        }


       successMessage.textContent =
    "Thank you, " +
    name +
    ". Your booking request has been received. " +
    "Bedazzled by Adepa will contact you shortly to confirm your appointment.";

successModal.classList.add("active");
        bookingForm.reset();
        
closeModal.addEventListener("click", function () {
    successModal.classList.remove("active");
});

doneButton.addEventListener("click", function () {
    successModal.classList.remove("active");
});
    });

    

});
