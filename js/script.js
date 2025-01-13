const API_KEYS = {
    newsapi: "0b43b29770ff4805bb2cf7ae0c106967",
    currentsapi: "gda2sqMv6H2xCiJ_FMnmQM5siAym8M7JJ8a81oaxniq2Az80",
    themoviedb: "70b549b6a701a9ecee91b03187be7b39",
};

// Topic colors mapping
const topicColors = {
    soccer: "success",
    sports: "primary",
    celebrity: "warning",
    hollywood: "info",
    war: "danger",
    bangladesh: "dark",
    africa: "secondary",
    politics: "danger",
    tech: "primary",
    general: "light", // Default color for general topics
};

const newsContainer = document.getElementById("news-container");
const refreshButton = document.getElementById("refresh-btn");
const loadMoreButton = document.getElementById("load-more-btn");
const searchBar = document.getElementById("search-bar");

let selectedTopics = [];
let searchQuery = "";
let currentPage = 1;

// Get selected topics from the dropdown
function getSelectedTopics() {
    selectedTopics = Array.from(document.querySelectorAll(".form-check-input:checked")).map(
        (checkbox) => checkbox.value
    );
}

// Fetch news articles from the API for multiple topics
async function fetchNews(page = 1) {
    if (!selectedTopics.length) selectedTopics = ["general"]; // Default to "general" if no topics are selected
    const allArticles = [];

    // Fetch news for each selected topic
    for (const topic of selectedTopics) {
        const searchQueryParam = searchQuery ? `&q=${searchQuery}` : "";
        const url = `https://newsapi.org/v2/everything?q=${topic}${searchQueryParam}&apiKey=${API_KEYS.newsapi}&page=${page}&pageSize=5`; // Fetch 5 articles per topic
        try {
            const response = await fetch(url);
            const data = await response.json();
            allArticles.push(...data.articles.map((article) => ({ ...article, topic }))); // Attach the topic to each article
        } catch (error) {
            console.error(`Error fetching news for topic: ${topic}`, error);
        }
    }
    return allArticles;
}

// Render news cards
function renderNews(articles) {
    articles.forEach((article) => {
        const { title, description, urlToImage, url, source, topic } = article;
        if(title=="[Removed]"){
            return;
        }
        // Get the badge color for the topic
        const badgeColor = topicColors[topic] || "light";

        const card = document.createElement("div");
        card.className = "col-md-4 col-sm-12";
        card.innerHTML = `
            <div class="card h-100">
                <img src="${urlToImage || 'dummy-image.jpg'}" class="card-img-top card-thumbnail" alt="News Image">
                <div class="card-body">
                    <span class="badge bg-${badgeColor} mb-2">${topic.toUpperCase()}</span>
                    <h5 class="card-title">${title}</h5>
                    <p class="card-text card-short-desc">${description ? description.slice(0, 100) + "..." : "No description available."}</p>
                    <button class="btn btn-primary read-more-btn">Read More</button>
                    <a href="${url}" target="_blank" class="btn btn-secondary continue-reading-btn d-none">Continue Reading</a>
                </div>
                <div class="card-footer">
                    <small class="text-muted">Source: ${source ? source.name : "Unknown"}</small>
                </div>
            </div>
        `;

        newsContainer.appendChild(card);

        // Add event listener for "Read More" button
        card.querySelector(".read-more-btn").addEventListener("click", (event) => {
            const button = event.target;
            const cardBody = button.closest(".card-body");
            const img = card.querySelector(".card-thumbnail");
            const continueReadingBtn = cardBody.querySelector(".continue-reading-btn");

            if (button.textContent === "Read More") {
                // Expand card
                cardBody.querySelector(".card-text").textContent = description || "No description available.";
                img.style.height = "auto";
                button.textContent = "Collapse";
                continueReadingBtn.classList.remove("d-none");
            } else {
                // Collapse card
                cardBody.querySelector(".card-text").textContent = description
                    ? description.slice(0, 100) + "..."
                    : "No description available.";
                img.style.height = "150px";
                button.textContent = "Read More";
                continueReadingBtn.classList.add("d-none");
            }
        });
    });
}

// Load initial news
async function loadNews() {
    const news = await fetchNews(currentPage);
    renderNews(news);
    currentPage++;
}

// Refresh news on button click
refreshButton.addEventListener("click", async () => {
    getSelectedTopics();
    searchQuery = searchBar.value;
    currentPage = 1;
    newsContainer.innerHTML = "";
    await loadNews();
});

// Load more news on button click
loadMoreButton.addEventListener("click", loadNews);

// Initial load
window.addEventListener("DOMContentLoaded", () => {
    loadNews();
});
