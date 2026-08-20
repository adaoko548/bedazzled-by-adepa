const SUPABASE_URL = "https://twimiovuogzyobxhbhqx.supabase.co";
const SUPABASE_KEY = "sb_publishable_JA-T5p98xPd1mekWWMYJgw_pls_oOVT";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value;

    loginMessage.textContent = "Signing in...";

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {

        console.error("LOGIN ERROR:", error);

        loginMessage.textContent = error.message;

        return;
    }

    console.log("LOGIN SUCCESS:", data);

    const {
        data: sessionData,
        error: sessionError
    } = await supabaseClient.auth.getSession();

    console.log("SESSION AFTER LOGIN:", sessionData);

    if (sessionError || !sessionData.session) {

        loginMessage.textContent =
            "Login succeeded, but the session could not be found.";

        return;
    }

    loginMessage.textContent = "Login successful. Opening dashboard...";

    setTimeout(function () {
        window.location.href = "admin.html";
    }, 500);

});
