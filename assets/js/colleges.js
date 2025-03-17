document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector(".search-bar input");
    const searchButton = document.querySelector(".search-bar button");
    const containerParent = document.getElementById("college-collection");
    const collegesList = document.getElementById("colleges-list");

    if (!searchInput || !searchButton || !collegesList) {
        console.error("Required elements not found!");
        return;
    }

    // session check
    fetch("/check-session")
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                document.getElementsByClassName("nav-link")[3].innerHTML = "Log Out";
                document.getElementsByClassName("nav-link")[3].setAttribute("href", "/logout");
            }
        });

    // no colleges found message
    let noResultsMessage = document.createElement("p");
    noResultsMessage.textContent = `No colleges found matching your search.\nPlease check for any typing errors and try again.`;
    noResultsMessage.classList.add("no-results-message");
    noResultsMessage.style.display = "none"; // hide by default
    noResultsMessage.style.textAlign = "center";
    noResultsMessage.style.fontSize = "3em";
    noResultsMessage.style.marginTop = "3em";
    noResultsMessage.style.color = "#003f4f";
    containerParent.appendChild(noResultsMessage); // add message to the page

    searchButton.addEventListener("click", filterColleges);
    searchInput.addEventListener("keyup", filterColleges);

    console.log("Search event listeners attached.");

    // fetch and load colleges dynamically, then apply styles
    fetchColleges();
});

// function to fetch colleges and apply alternating styles
function fetchColleges() {
    fetch("/universities")
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("colleges-list");
            container.innerHTML = ""; // clear any existing content

            data.forEach((college, index) => {
                let descriptionText = college.Description || 
                    `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa...`;

                let collegeHTML = `
                    <div class="college-container">
                        <img src="${college.Emblem || 'default.png'}" alt="${college.Name} Logo">
                        <div class="college-info">
                            <h2>${college.Name.toUpperCase()}</h2>
                            <hr>
                            <p>${descriptionText}</p>
                            <a href="/details.html?name=${college.Name}" class="btn-link">View Details</a>
                        </div>
                    </div>
                `;

                container.innerHTML += collegeHTML;
            });

            // apply Alternating Styles After Loading
            applyAlternatingStyles(document.querySelectorAll(".college-container"));
        })
        .catch(error => console.error("Error fetching colleges:", error));
}

function applyAlternatingStyles(collegeList) {
    collegeList.forEach((college, index) => {
        const img = college.querySelector("img");
        const info = college.querySelector(".college-info");
        const button = college.querySelector(".btn-link");

        if (!img || !info || !button) {
            console.warn("Missing image, info, or button for:", college);
            return;
        }

        // reset all previous styles to prevent conflicts
        college.style.removeProperty("background-color");
        college.style.removeProperty("color");
        img.style.removeProperty("order");
        info.style.removeProperty("order");
        button.style.removeProperty("background-color");
        button.style.removeProperty("color");
        button.style.removeProperty("border");

        // force apply correct styling using `setProperty()`
        if (index % 2 === 0) {
            
            college.style.setProperty("background-color", "#F1FDFF", "important");
            college.style.setProperty("color", "#13505b", "important");
            img.style.setProperty("order", "1", "important");
            info.style.setProperty("order", "2", "important");

            
            button.style.setProperty("background-color", "#13505b", "important");
            button.style.setProperty("color", "#F1FDFF", "important");
            button.style.setProperty("border", "2px solid #13505b", "important");
        } else {
            
            college.style.setProperty("background-color", "#275861", "important");
            college.style.setProperty("color", "#F1FDFF", "important");
            img.style.setProperty("order", "2", "important");
            info.style.setProperty("order", "1", "important");

            
            button.style.setProperty("background-color", "#F1FDFF", "important");
            button.style.setProperty("color", "#275861", "important");
            button.style.setProperty("border", "2px solid #275861", "important");
        }

        console.log(
            `Styled college ${index + 1}: Background ${college.style.backgroundColor}, ` +
            `Button ${button.style.backgroundColor}, Button Text ${button.style.color}`
        );
    });
}


function filterColleges() {
    const searchInput = document.querySelector(".search-bar input");
    const query = searchInput.value.toLowerCase().trim();
    const collegeContainers = document.querySelectorAll(".college-container");
    const noResultsMessage = document.querySelector(".no-results-message");

    let visibleColleges = [];

    console.log("Search query:", query);

    // if query is empty, show all colleges and reset their order
    if (query === "") {
        console.log("Empty search query detected. Showing all colleges.");
        
        collegeContainers.forEach(college => {
            college.style.display = "flex"; // show all colleges
        });

        // hide "No results found" message
        noResultsMessage.style.display = "none";

        // re-apply correct alternating styling after reset
        applyAlternatingStyles(collegeContainers);
        
        console.log("Colleges restored in original order.");
        return;
    }

    // filter colleges based on query
    collegeContainers.forEach(college => {
        const collegeNameElement = college.querySelector("h2");
        if (!collegeNameElement) {
            console.warn("Missing college name in:", college);
            return;
        }
        const collegeName = collegeNameElement.textContent.toLowerCase();

        if (collegeName.includes(query)) {
            college.style.display = "flex";
            visibleColleges.push(college);
        } else {
            college.style.display = "none";
        }
    });

    console.log("Visible colleges count:", visibleColleges.length);

    // show or hide no colleges found message
    if (visibleColleges.length === 0) {
        noResultsMessage.style.display = "block";
    } else {
        noResultsMessage.style.display = "none";
    }

    // force correct alternating order
    applyAlternatingStyles(visibleColleges);
}
