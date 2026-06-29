async function loadPublications() {

    const response = await fetch("publications.json");
    const publications = await response.json();

    // ----------------------------
    // Render one publication
    // ----------------------------
    // function renderPublication(pub) {
    //     const title = pub.url
    //     ? `<a href="${pub.url}" target="_blank">${pub.title}</a>`
    //     : pub.title;

    //     return `
    //         <li>
    //             ${title}<br>
    //             ${Array.isArray(pub.authors) ? pub.authors.join(", ") : pub.authors}<br>
    //             <em>${pub.venue}</em>, ${pub.year}
    //         </li>
    //     `;
    // }
    function renderPublication(pub) {
        const query = encodeURIComponent(pub.title);
        const scholarUrl = `https://scholar.google.com/scholar?q=${query}`;

        return `
            <li>
                <a href="${scholarUrl}" target="_blank">
                    ${pub.title}
                </a><br>

                ${Array.isArray(pub.authors) ? pub.authors.join(", ") : pub.authors}<br>

                <em>${pub.venue}</em>, ${pub.year}
            </li>
        `;
    }
    // function renderPublication(pub) {
    //     return `
    //         <li>
    //             <a href="${pub.url}" target="_blank">
    //                 ${pub.title}
    //             </a><br>
    //             ${pub.authors}<br>
    //             <em>${pub.venue}</em>, ${pub.year}
    //         </li>
    //     `;
    // }

    // ----------------------------
    // Generic grouping renderer
    // ----------------------------

    function renderSection(containerId, field, sortFn = null) {

        const groups = {};

        // Build groups
        publications.forEach(pub => {

            let values = pub[field];

            // Allow arrays (topics) or single values (year, venue)
            if (!Array.isArray(values))
                values = [values];

            values.forEach(value => {

                if (!groups[value]) {
                    groups[value] = [];
                }

                groups[value].push(pub);

            });

        });

        // Sort group headings
        let keys = Object.keys(groups);

        if (sortFn) {
            keys.sort(sortFn);
        } else {
            keys.sort();
        }

        const container = document.getElementById(containerId);

        // Create each group
        keys.forEach(key => {

            const section = document.createElement("div");
            section.className = "group";

            section.innerHTML = `
                <h3>${key}</h3>
                <ol></ol>
            `;

            const list = section.querySelector("ol");

            groups[key].forEach(pub => {
                list.insertAdjacentHTML(
                    "beforeend",
                    renderPublication(pub)
                );
            });

            container.appendChild(section);

        });

    }

        // Years page
    if (document.getElementById("years")) {
        renderSection(
            "years",
            "year",
            (a, b) => Number(b) - Number(a)
        );
    }

    // Topics page
    if (document.getElementById("topics")) {
        renderSection(
            "topics",
            "topics"
        );
    }

    // Venues page
    if (document.getElementById("venues")) {
        renderSection(
            "venues",
            "venue"
        );
    }

}

loadPublications();