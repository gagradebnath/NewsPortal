const API_KEYS = {
    newsapi: "7d0ac580c68349508f2a7c84918cc7ae",
    newsapi2: "0b43b29770ff4805bb2cf7ae0c106967",
    currentsapi: "gda2sqMv6H2xCiJ_FMnmQM5siAym8M7JJ8a81oaxniq2Az80",
    guardianapi: "851166fa-3136-4aae-9964-d51c6031886e",
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

// Fetch news articles from NewsAPI
async function fetchFromNewsAPI(topic, page, apiBackUp ="7d0ac580c68349508f2a7c84918cc7ae") {
    const searchQueryParam = searchQuery ? `&q=${searchQuery}` : "";
    const url = `https://newsapi.org/v2/everything?q=${topic}${searchQueryParam}&apiKey=${API_KEYS.newsapi}&page=${page}&pageSize=5`;
    const url1 = `https://newsapi.org/v2/everything?q=${topic}${searchQueryParam}&apiKey=${API_KEYS.newsapi2}&page=${page}&pageSize=5`;
    
    try {
        const response = await fetch(url);

        const data = await response.json();

        if (data.articles) {
            return data.articles.map((article) => ({
                title: article.title,
                description: article.description,
                url: article.url,
                source: { name: article.source.name || "Unknown" },
                image: article.urlToImage,
                topic,
            }));
        }
    }    
    catch (error) {

         console.error(`NewsAPI failed for topic 1: ${topic}`, error);
         try {
            const response = await fetch(url2);
    
            const data = await response.json();
    
            if (data.articles) {
                return data.articles.map((article) => ({
                    title: article.title,
                    description: article.description,
                    url: article.url,
                    source: { name: article.source.name || "Unknown" },
                    image: article.urlToImage,
                    topic,
                }));
            }
        }    
        catch (error) {
            console.error(`NewsAPI failed for topic 2: ${topic}`, error);
            
        }
        
    }
    return []; // Return an empty array if NewsAPI fails
}

// Fetch news articles from CurrentsAPI
async function fetchFromCurrentsAPI(topic) {
    const searchQueryParam = searchQuery ? `&keywords=${searchQuery}` : "";
    const url = `https://api.currentsapi.services/v1/search?category=${topic}${searchQueryParam}&apiKey=${API_KEYS.currentsapi}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.news) {
            return data.news.map((article) => ({
                title: article.title,
                description: article.description,
                url: article.url,
                source: { name: article.author || "Unknown" },
                image: article.image,
                topic,
            }));
        }
    } catch (error) {
        console.error(`CurrentsAPI failed for topic: ${topic}`, error);
    }
    return []; // Return an empty array if CurrentsAPI fails
}

// Fetch news articles from Guardian API
async function fetchFromGuardianAPI(topic, page) {
    if(topic=="soccer"||topic=="Soccer"){
        topic = "football"
    }
    const searchQueryParam = searchQuery ? `&q=${searchQuery}` : "";
    const sectionParam = topic !== "general" ? `&section=${topic}` : "";
    const url = `https://content.guardianapis.com/search?api-key=${API_KEYS.guardianapi}${sectionParam}${searchQueryParam}&page=${page}&page-size=5`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.response && data.response.results) {
            return data.response.results.map((article) => ({
                title: article.webTitle,
                description: "No description available.",
                url: article.webUrl,
                source: { name: "The Guardian" },
                image: null,
                topic: article.sectionName,
            }));
        }
    } catch (error) {
        console.error(`Guardian API failed for topic: ${topic}`, error);
    }

    return []; // Return an empty array if Guardian API fails
}

// Fetch combined news articles from all APIs
async function fetchNews(page = 2) {
    if (!selectedTopics.length) selectedTopics = ["general"]; // Default to "general" if no topics are selected
    const allArticles = [];

    for (const topic of selectedTopics) {
        // Ensure each API result is an array



        
        const [newsAPIArticles = [], currentsAPIArticles = [], guardianAPIArticles = []] = await Promise.all([
            fetchFromNewsAPI(topic, page),
            fetchFromCurrentsAPI(topic),
            fetchFromGuardianAPI(topic, page),
        ]);

        console.log(newsAPIArticles.length, currentsAPIArticles.length, guardianAPIArticles.length);
        if(newsAPIArticles.length==0 ){
            console.log("News API failed");
            allArticles.push(...newsAPIArticles, ...currentsAPIArticles, ...guardianAPIArticles);
        }
        else {
            console.log("News API success");
            allArticles.push(...newsAPIArticles);
        }
        // console.log(newsAPIArticles, currentsAPIArticles, guardianAPIArticles);
        // Combine articles from all APIs
    }

    if (!allArticles.length) {
        newsContainer.innerHTML = `<p class="text-center text-muted">No news articles found for the selected topics and search query.</p>`;
    }

    return allArticles;
}

// Render news cards
function renderNews(articles) {
    articles.forEach((article) => {
        const { title, description, url, source, topic, image } = article;
        
        // Use image if available, otherwise use a placeholder
        const imageUrl = (image&&image!="None")? image : "placeholder-image.jpg"; // Replace 'placeholder-image.jpg' with your default image path

        // Get the badge color for the topic
        const badgeColor = topicColors[topic] || "light";

        const card = document.createElement("div");
        card.className = "col-md-4 col-sm-12";
        card.innerHTML = `
            <div class="card h-100">
                <img src="${imageUrl}" class="card-img-top card-thumbnail" alt="News Image">
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

        if(title!="[Removed]"){
            
            newsContainer.appendChild(card);
        }

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
    searchQuery = searchBar.value.trim(); // Update search query
    currentPage = 1;
    newsContainer.innerHTML = ""; // Clear old results
    await loadNews();
});

// Update search query dynamically
searchBar.addEventListener("input", (event) => {
    searchQuery = event.target.value.trim();
});

// Load more news on button click
loadMoreButton.addEventListener("click", loadNews);

// Initial load
window.addEventListener("DOMContentLoaded", () => {
    loadNews();
});
