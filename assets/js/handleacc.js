document.addEventListener("DOMContentLoaded", function () {
    var isAdmin = false;

    fetch('/check-session') // check if user is logged in
        .then(response => response.json())
        .then(data => {
            const navbar = document.getElementsByClassName("navbar-links")[0];
            const navLink = document.getElementsByClassName('nav-link')[4];
            const navLinks = document.getElementsByClassName('nav-link');

            if (data.loggedIn) {
                if (data.role === "Admin" || data.role === "SuperAdmin") { // include Management tab for admins
                    isAdmin = true;
                    navLink.innerHTML = "Management";
                    navLink.setAttribute("href", "account.html");

                    const logOutLink = document.createElement("a");
                    logOutLink.setAttribute("class", "nav-link");
                    logOutLink.setAttribute("href", "/logout");
                    logOutLink.setAttribute("id", "logoutButton");
                    logOutLink.innerHTML = "Log Out";

                    navbar.appendChild(logOutLink);
                } else {
                    navLink.innerHTML = "Log Out";
                    navLink.setAttribute("href", "/logout");
                    navLink.setAttribute("id", "logoutButton");
                }
            } else {
                navLink.innerHTML = "Account";
                navLink.setAttribute("href", "/signup");
                navLink.classList.add("account-style");
            }
        });

    // handle logout
    document.addEventListener("click", async function logoutHandler(event) {
        if (event.target && event.target.id === "logoutButton") {
            event.preventDefault();

            try {
                const response = await fetch("/logout");
                if (!response.ok) {
                    throw new Error("Logout request failed");
                }
                const data = await response.json();

                if (data.success) {
                    console.log("Logout successful:", data.message);

                    sessionStorage.clear();
                    document.removeEventListener("click", logoutHandler);


                    if (isAdmin) { // if user has admin privileges, we need to remove Role Management from navbar as well
                        const roleManagementLink = document.getElementsByClassName("nav-link")[4];
                        const logOutLink = document.getElementsByClassName("nav-link")[5];

                        roleManagementLink.innerHTML = "Account";
                        roleManagementLink.setAttribute("href", "signup.html");

                        logOutLink.remove();
                    } else {
                        const navLink = document.getElementsByClassName("nav-link")[4];
                        navLink.innerHTML = "Account";
                        navLink.setAttribute("href", "signup.html");
                    }

                    if (!isAdmin) {
                        window.location.reload();
                    } else {
                        window.location.href = "/";
                    }
                }
                //window.location.href = "/";
            } catch (error) {
                console.error("Error logging out:", error);
            }
        }
    });
});
    /*document.getElementById('passwordToggle').addEventListener('click', function () {
        const passwordInput = document.getElementById('password');
        const eyeIcon = document.getElementById('eyeIcon');

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            eyeIcon.classList.remove('fa-eye');
            eyeIcon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = "password";
            eyeIcon.classList.remove('fa-eye-slash');
            eyeIcon.classList.add('fa-eye');
        }
    });*/


