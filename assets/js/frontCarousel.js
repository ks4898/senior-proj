// Populates the carousel from the frontpage with all colleges from database. Maybe limit to first 3 (or random) colleges on the list instead?

document.addEventListener("DOMContentLoaded", function () {
    const carouselInner = document.querySelector(".carousel-inner");
    const carouselIndicators = document.querySelector(".carousel-indicators");

    // PLACEHOLDER, GET FROM DATABASE
    const carouselData = [
        { id: 0, title: "Title 1", description: "Description for the first slide.", image: "college1.jpg" },
        { id: 1, title: "Title 2", description: "Description for the second slide.", image: "college2.jpg" },
        { id: 2, title: "Title 3", description: "Description for the third slide.", image: "college3.jpg" }
    ];

    carouselInner.innerHTML = "";
    carouselIndicators.innerHTML = "";

    carouselData.forEach((item, index) => {
        // Create carousel item
        const carouselItem = document.createElement("div");
        carouselItem.classList.add("carousel-item");
        if (index === 0) carouselItem.classList.add("active");
        carouselItem.setAttribute("style", `background-image: url('assets/media/img/${item.image}')`);
        // !!! Image Path is relative to the index.html location, not this js file !!!
        
        // Create caption
        const caption = document.createElement("div");
        caption.classList.add("carousel-caption", "d-none", "d-md-block");
        caption.innerHTML = `<a href="#"><h5>${item.title}</h5></a><p>${item.description}</p>`;
        // !!! Replace # with college info page link that also gets the proper ID to fetch from DB !!!

        carouselItem.appendChild(caption);
        carouselInner.appendChild(carouselItem);

        // Create indicator
        const indicator = document.createElement("button");
        indicator.type = "button";
        indicator.dataset.bsTarget = "#carousel";
        indicator.dataset.bsSlideTo = index;
        if (index === 0) indicator.classList.add("active");
        indicator.ariaLabel = `Slide ${index + 1}`;

        carouselIndicators.appendChild(indicator);
    });
});
