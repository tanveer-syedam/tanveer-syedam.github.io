let PUBLICATIONS = [];

/* -----------------------------
   LOAD DATA
------------------------------*/

fetch("publications.json")
  .then(res => res.json())
  .then(data => {
    PUBLICATIONS = data;
    initPage();
  })
  .catch(err => {
    console.error("Failed to load publications.json:", err);
  });

/* -----------------------------
   INIT PAGE ROUTER
------------------------------*/



function initPage() {

    const view = document.body.dataset.view;

    console.log("VIEW:", view);
    console.log("PUBLICATIONS:", PUBLICATIONS.length);

    if (view === "venue") {
        renderVenuePage();
        return;
    }

    const container = document.getElementById("content");

    if (!container) {
        console.error("Missing #content container");
        return;
    }

    if (view === "year") {
        renderGroupedScalar(container, "year", true);
    }
    else if (view === "topic") {
        const grouped = groupByTopics(PUBLICATIONS);
        renderGroupedObject(container, grouped);
    }
    else {
        renderFlat(container);
    }
}

/* -----------------------------
   GROUPING HELPERS
------------------------------*/

function groupBy(list, key) {
  return list.reduce((acc, item) => {
    const val = item[key] ?? "Uncategorized";

    if (!acc[val]) acc[val] = [];
    acc[val].push(item);

    return acc;
  }, {});
}

/* Flatten array-based fields like topics */
function groupByTopics(list) {
  const groups = {};

  list.forEach(pub => {
    const topics =
      pub.topics && pub.topics.length
        ? pub.topics
        : ["Uncategorized"];

    topics.forEach(t => {
      if (!groups[t]) groups[t] = [];
      groups[t].push(pub);
    });
  });

  return groups;
}

/* -----------------------------
   GENERIC RENDERERS
------------------------------*/

/* scalar field grouping (year, venue_group) */
function renderGroupedScalar(container, key, sortDesc = false) {
  const grouped = groupBy(PUBLICATIONS, key);

  let keys = Object.keys(grouped);

  if (sortDesc) {
    keys.sort((a, b) => b - a);
  } else {
    keys.sort();
  }

  container.innerHTML = "";

  keys.forEach(k => {
    const section = document.createElement("section");
    section.id = slug(k);

    section.innerHTML = `
      <h2>${k}</h2>
      <ol></ol>
    `;

    const ol = section.querySelector("ol");

    grouped[k]
      .sort((a, b) => b.year - a.year)
      .forEach(pub => {
        ol.insertAdjacentHTML("beforeend", renderPublication(pub));
      });

    container.appendChild(section);
  });
}

/* object-based grouping (topics) */
function renderGroupedObject(container, grouped) {
  const keys = Object.keys(grouped).sort();

  container.innerHTML = "";

  keys.forEach(k => {
    const section = document.createElement("section");
    section.id = slug(k);

    section.innerHTML = `
      <h2>${k}</h2>
      <ol></ol>
    `;

    const ol = section.querySelector("ol");

    grouped[k]
      .sort((a, b) => b.year - a.year)
      .forEach(pub => {
        ol.insertAdjacentHTML("beforeend", renderPublication(pub));
      });

    container.appendChild(section);
  });
}

/* -----------------------------
   VENUE PAGE (2-level grouping)
------------------------------*/

const CATEGORY_ORDER = {
  "Journal": 0,
  "Conference": 1,
  "Workshop": 2,
  "Book": 3,
  "Other": 99
};
const CONFERENCE_ORDER = {
  "CVPR": 1,
  "MICCAI": 2,
  "IPMI": 3,
  "ICCV": 4,
  "ECCV": 5,
  "NeurIPS": 6,
  "ICML": 7,
  "AAAI": 8,
  "ISBI": 9,
  "SPIE":10,
  "IJCAI": 11,
  "BMVC": 12,
  "MIDL": 13,
  "FIMH":14,
  "ACCV":15,
  "Computers in Cardiology":16
};
function renderVenuePage() {

    renderVenueGroup(
       // "Medical AI/Medical Imaging AI",
        "Healthcare AI (Bio-Medical Imaging/EHR/Informatics)",
        document.getElementById("medical-content")
    );

    renderVenueGroup(
       // "AI/ML/Computer Vision",
        "Multimodal AI (ML/NLP/Computer Vision)",
        document.getElementById("ai-content")
    );

    renderVenueGroup(
        "Other",
        document.getElementById("other-content")
    );

}

function renderVenueGroup(groupName, container) {

    container.innerHTML = "";

    const pubs = PUBLICATIONS.filter(
        p => p.venue_group === groupName
    );

    const byCategory = groupBy(pubs, "venue_category");

    Object.keys(byCategory)
        .sort((a, b) => (CATEGORY_ORDER[a] ?? 99) - (CATEGORY_ORDER[b] ?? 99))
        .forEach(category => {

            const categoryDiv = document.createElement("div");

            categoryDiv.innerHTML = `<h3>${category}</h3>`;

            const ol = document.createElement("ol");

            byCategory[category]
                .sort((a, b) => {

                    // For conferences, sort first by conference importance
                    if (category === "Conference") {
                        const oa = CONFERENCE_ORDER[a.venue] ?? 999;
                        const ob = CONFERENCE_ORDER[b.venue] ?? 999;

                        if (oa !== ob) {
                            return oa - ob;
                        }
                    }

                    // Then newest papers first
                    return b.year - a.year;
                })
                .forEach(pub => {
                    ol.insertAdjacentHTML(
                        "beforeend",
                        renderPublication(pub)
                    );
                });

            categoryDiv.appendChild(ol);
            container.appendChild(categoryDiv);

        });

}


// function renderVenuePage() {
//   const container = document.getElementById("content");
//   const nav = document.getElementById("venueNav");

//   if (!container || !nav) return;

//   const byGroup = groupBy(PUBLICATIONS, "venue_group");

//   container.innerHTML = "";
//   nav.innerHTML = "";

//   Object.keys(byGroup).forEach(group => {
//     const groupId = slug(group);

//     /* NAV */
//     nav.insertAdjacentHTML(
//       "beforeend",
//       `<a href="#${groupId}">${group}</a>`
//     );

//     /* SECTION */
//     const section = document.createElement("section");
//     section.id = groupId;

//     section.innerHTML = `<h2>${group}</h2>`;

//     const byCategory = groupBy(byGroup[group], "venue_category");

//     Object.keys(byCategory)
//       .sort((a, b) => (CATEGORY_ORDER[a] ?? 99) - (CATEGORY_ORDER[b] ?? 99))
//       .forEach(cat => {
//         const block = document.createElement("div");

//         block.innerHTML = `
//           <h3>${cat}</h3>
//           <ol></ol>
//         `;

//         const ol = block.querySelector("ol");

//         byCategory[cat]
//           .sort((a, b) => b.year - a.year)
//           .forEach(pub => {
//             ol.insertAdjacentHTML("beforeend", renderPublication(pub));
//           });

//         section.appendChild(block);
//       });

//     container.appendChild(section);
//   });
// }

/* -----------------------------
   PUBLICATION RENDERING
------------------------------*/

function renderPublication(pub) {

    const url = pub.url
        ? pub.url
        : `https://scholar.google.com/scholar?q=${encodeURIComponent(pub.title)}`;

    return `
        <li>
            <a href="${url}" target="_blank" rel="noopener noreferrer">
                ${pub.title}
            </a><br>
            ${pub.authors.join(", ")}<br>
            <em>${pub.venue}</em> (${pub.year})
        </li>
    `;
}

/* -----------------------------
   FALLBACK
------------------------------*/

function renderFlat(container) {
  container.innerHTML = "";

  PUBLICATIONS
    .sort((a, b) => b.year - a.year)
    .forEach(pub => {
      const div = document.createElement("div");
      div.innerHTML = renderPublication(pub);
      container.appendChild(div);
    });
}

/* -----------------------------
   UTIL
------------------------------*/

function slug(str) {
  return str.toLowerCase().replace(/\s+/g, "-");
}