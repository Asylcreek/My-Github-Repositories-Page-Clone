//Get all necessary elements from DOM
const username = document.querySelector(".sidebar__username");
const navUsername = document.querySelector(".sticky-nav__user");
const repos = document.querySelector(".repos");

//This returns true if the element is in the viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

//Add a scroll event listener to the document that check if the username is in the viewport
document.addEventListener(
    "scroll",
    () => {
        if (!isInViewport(username)) {
            navUsername.classList.add("sticky-nav__user--visible");
        } else {
            navUsername.classList.remove("sticky-nav__user--visible");
        }
    }, { passive: true }
);

//Define all necessary axios data
const githubUrl = "https://api.github.com/graphql";
const token = "4387c03f1ae701689fa8f6c308bf025a0943ca78";
const oAuth = { Authorization: `bearer ${token}` };
const query =
    "{viewer {repositories(ownerAffiliations: OWNER last: 20 orderBy: { field: UPDATED_AT, direction: ASC }) {edges {node {id,name,isPrivate,forkCount,primaryLanguage {name},updatedAt}}}}}";

//This functions returns a color based on the value given
const getLanguageColor = (language) => {
    switch (language) {
        case "JavaScript":
            return "yellow";
        case "CSS":
            return "purple";
        case "HTML":
            return "red";
        case "Python":
            return "blue";
        default:
            break;
    }
};

//This function checks the diff between the current date and the date passed in to show the appropriate message
const showUpdatedAt = (date) => {
    const dateDiff = (Date.now() - new Date(date)) / (1000 * 3600 * 24);

    const updatedAt = new Date(date).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
    });

    if (dateDiff < 30) {
        return `Updated ${Math.floor(dateDiff)} days ago`;
    } else {
        return `Updated on ${updatedAt}`;
    }
};

//This function renders a predefined markup to the DOM
const render = (
        name,
        description,
        isPrivate,
        forkCount,
        primaryLanguage,
        updatedAt
    ) => {
        const markup = `<div class="repo">
        <div class="repo__info__container u-flex-y-center">
            <div class="repo__info u-flex-y-center">
                <p class="repo__name">${name}</p>
                ${isPrivate ? "<span class='repo__type'>Private</span>" : ""}
            </div>

            <div class="repo__star u-flex-x-y-center">
                <svg class="icon icon--nav">
                    <use xlink:href="./sprite.svg#icon-star-outline"></use>
                </svg>

                <span>Star</span>
            </div>
        </div>

        ${description ? `<p class="repo__desc">${description}</p>` : ""}

        <div class="repo__bottom u-flex-y-center">
            <div class="repo__tags">
                <div class="repo__tag u-flex-y-center">
                    <span class="repo__tag__language repo__tag__language--${getLanguageColor(
                      primaryLanguage
                    )}">
                    </span>
                    
                    <span>${primaryLanguage}</span>
                </div>
            </div>
                    
            ${
              forkCount
                ? `<div class="repo__forked u-flex-y-center">
                        <svg class="icon icon--grey">
                            <use xlink:href="./sprite.svg#icon-repo-forked"></use>
                        </svg>
                        
                        <span>${forkCount}</span>
                    </div>`
                : ""
            }

            <span class="repo__updated">${showUpdatedAt(updatedAt)}</span>
                    
        </div>
    </div>`;

  repos.insertAdjacentHTML("beforeend", markup);
};

//This function gets the first 20 repos from my account and renders them appropriately
const getData = async () => {
  let response;

  try {
    response = await axios.post(githubUrl, { query }, { headers: oAuth });
  } catch (err) {
    console.log(err);
  }

  const repos = response.data.data.viewer.repositories.edges;

  //Reverse the list because the latest repo is the last
  repos.reverse();

  repos.forEach((repo) => {
    //Destructure off necessary fields
    const {
      name,
      description,
      forkCount,
      isPrivate,
      primaryLanguage,
      updatedAt,
    } = repo.node;

    //Call the render function
    render(
      name,
      description,
      isPrivate,
      forkCount,
      primaryLanguage.name,
      updatedAt
    );
  });
};

//Call getData()
getData();
