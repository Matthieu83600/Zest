// Chemin vers le fichier JSON
const jsonPath = "./data/posts.json";

// Conteneur où afficher les posts
const postsContainer = document.getElementById("posts-container");

// Fonction pour créer un post
function createPost(post) {
    const postElement = document.createElement("article");
    postElement.classList.add("post");

    const { user, content, type, timestamp } = post;

    // Création de la structure du post
    postElement.innerHTML = `
        <div class="post-header">
            <div class="user-info">
              ${
                user
                  ? `
                  <img src="${user.avatar}" alt="${user.firstName} ${user.lastName}" class="avatar">
                  <span class="username">${user.firstName} ${user.lastName}</span>
              `
                  : `<span class="post-type">${type === "ad" ? "Publicité" : "Information"}</span>`
              }
            </div>
            <span class="timestamp">${new Date(timestamp).toLocaleString()}</span>
        </div>
        <div class="post-content">
            <p>${content.text}</p>
            ${content.image ? `<img src="${content.image}" alt="Post image" class="post-image">` : ""}
        </div>
    `;

    return postElement;
}

// Fonction pour charger les posts depuis le JSON
async function loadPosts() {
    try {
      const response = await fetch(jsonPath);
      const posts = await response.json();

      // Trier les posts par date (du plus récent au plus ancien)
      posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Ajouter chaque post au conteneur
      posts.forEach((post) => {
        const postElement = createPost(post);
        postsContainer.appendChild(postElement);
      });
    } catch (error) {
        console.error("Erreur lors du chargement des posts :", error);
        postsContainer.innerHTML = "<p>Impossible de charger les posts.</p>";
    }
}

// Charger les posts au chargement de la page
document.addEventListener("DOMContentLoaded", loadPosts);
