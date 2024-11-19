// Chemin vers le fichier JSON
const jsonPath = "./data/posts.json";
// Conteneur où afficher les posts
const postsContainer = document.getElementById("posts-container");

// Fonction pour créer un post
function createPost(post) {
  const postElement = document.createElement("article");
  postElement.classList.add("post");
  const { user, content, type, timestamp, comments } = post;
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
        ${
          content.image
            ? `<img src="${content.image}" alt="Post image" class="post-image" onclick="openModal('${content.image}')">`
            : ""
        }
    </div>
    <div class="post-actions">
        <label class="reaction">
          <input type="checkbox" class="reaction-checkbox" onchange="handleReaction(this, 'like')">
          <span class="reaction-icon like">👍</span>
        </label>
        <label class="reaction">
          <input type="checkbox" class="reaction-checkbox" onchange="handleReaction(this, 'dislike')">
          <span class="reaction-icon dislike">👎</span>
        </label>
        <label class="reaction">
          <input type="checkbox" class="reaction-checkbox" onchange="handleReaction(this, 'love')">
          <span class="reaction-icon love">❤️</span>
        </label>
        <button class="toggle-comments">
            Voir les commentaires
        </button>
    </div>
    <div class="comments-section hidden">
        <h3>Commentaires</h3>
        <div class="comments-container"></div>
        <div class="add-comment">
            <textarea placeholder="Ajouter un commentaire..."></textarea>
            <button class="submit-comment">Publier</button>
        </div>
    </div>
  `;

  // Ajouter des écouteurs pour les boutons de réaction
  const reactionButtons = postElement.querySelectorAll(".reaction");
  reactionButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const reactionType = event.currentTarget.dataset.reaction;
      triggerParticleAnimation(event.currentTarget, reactionType); // Animation de particules
    });
  });

  // Gérer les commentaires
  const commentsSection = postElement.querySelector(".comments-section");
  const commentsContainer = commentsSection.querySelector(".comments-container");
  const toggleCommentsButton = postElement.querySelector(".toggle-comments");

  // Ajouter les commentaires si existants
  if (comments && comments.length > 0) {
    comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    comments.forEach((comment) => {
      const commentElement = createComment(comment);
      commentsContainer.appendChild(commentElement);
    });
  }

  // Gérer le clic pour afficher/masquer les commentaires
  toggleCommentsButton.addEventListener("click", () => {
    commentsSection.classList.toggle("hidden");
    const isHidden = commentsSection.classList.contains("hidden");
    toggleCommentsButton.textContent = isHidden ? `Voir les commentaires` : `Masquer les commentaires`;
  });

  // Gérer l'ajout d'un nouveau commentaire
  const submitCommentButton = postElement.querySelector(".submit-comment");
  submitCommentButton.addEventListener("click", () => {
    const textarea = postElement.querySelector(".add-comment textarea");
    if (textarea.value.trim()) {
      const newComment = {
        id: Date.now(),
        user: {
          firstName: "Vous",
          lastName: "",
          avatar: "./assets/avatars/user_avatar.png",
        },
        content: textarea.value.trim(),
        timestamp: new Date().toISOString(),
        comments: [],
      };
      const newCommentElement = createComment(newComment);
      commentsContainer.insertBefore(newCommentElement, commentsContainer.firstChild);
      textarea.value = "";
    }
  });
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

/* Fonction pour créer les commentaires */
function createComment(comment) {
  const commentElement = document.createElement("div");
  commentElement.classList.add("comment");
  const { user, content, timestamp, comments } = comment;
  // Création de la structure du commentaire
  commentElement.innerHTML = `
    <div class="comment-header">
      <div class="user-info">
        <img src="${user.avatar}" alt="${user.firstName} ${user.lastName}" class="avatar">
        <span class="username">${user.firstName} ${user.lastName}</span>
      </div>
      <span class="timestamp">${new Date(timestamp).toLocaleString()}</span>
    </div>
    <div class="comment-content">
        <p>${content}</p>
    </div>
    <div class="comment-actions">
        <button class="reply-button">Répondre</button>
    </div>
    <div class="reply-form hidden reply-form-container">
      <textarea placeholder="Votre réponse..."></textarea>
      <button class="submit-reply">Publier</button>
    </div>
  `;

  // Ajouter les commentaires imbriqués
  const repliesContainer = document.createElement("div");
  repliesContainer.classList.add("replies");

  // Vérification : Ajouter uniquement si des commentaires imbriqués existent
  if (comments && comments.length > 0) {
    // Trier les commentaires par date (du plus récent au plus ancien)
    comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    comments.forEach((reply) => {
      const replyElement = createComment(reply); // Appel récursif
      repliesContainer.appendChild(replyElement);
    });
  }

  commentElement.appendChild(repliesContainer);

  // Gérer le bouton "Répondre"
  const replyButton = commentElement.querySelector(".reply-button");
  const replyForm = commentElement.querySelector(".reply-form");
  replyButton.addEventListener("click", () => {
    replyForm.classList.toggle("hidden");
  });

  // Gérer la publication d'une réponse
  const submitReplyButton = commentElement.querySelector(".submit-reply");
  submitReplyButton.addEventListener("click", () => {
    const textarea = replyForm.querySelector("textarea");
    if (textarea.value.trim()) {
      const newReply = {
        id: Date.now(),
        user: {
          firstName: "Vous",
          lastName: "",
          avatar: "./assets/avatars/user_avatar.png",
        },
        content: textarea.value.trim(),
        timestamp: new Date().toISOString(),
        comments: [],
      };
      const newReplyElement = createComment(newReply);
      repliesContainer.insertBefore(newReplyElement, repliesContainer.firstChild);
      textarea.value = "";
      replyForm.classList.add("hidden");
    }
  });

  return commentElement; // Retourne le commentaire créé
}

/* Fonction pour ouvrir l'image en plein écran */
function openModal(imageSrc) {
  const modal = document.getElementById("image-modal");
  const modalImage = document.getElementById("modal-image");
  modal.style.display = "flex";
  modalImage.src = imageSrc;
  modalImage.style.width = "auto"; 
  modalImage.style.height = "auto";
}

// Fermer la modale en cliquant sur le bouton "close"
document.querySelector(".close").onclick = function () {
  document.getElementById("image-modal").style.display = "none";
};

// Fermer la modale en cliquant en dehors de l'image
window.onclick = function (event) {
  const modal = document.getElementById("image-modal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

/* Evènement pour les input like / dislike / love */
function handleReaction(checkbox, reactionType) {
  const postElement = checkbox.closest(".post"); // Trouver le conteneur du post
  const allCheckboxes = postElement.querySelectorAll(".reaction-checkbox"); // Toutes les cases à cocher du post
  const reactionLabels = postElement.querySelectorAll(".reaction"); // Tous les labels .reaction

  if (checkbox.checked) {
    // L'utilisateur vient de cocher la case
    triggerParticleAnimation(checkbox.closest(".reaction"), reactionType);
  } else {
    // L'utilisateur a décoché la case
    console.log(`${reactionType} désactivé`);
  }

  // Désactiver les autres cases si une est cochée
  allCheckboxes.forEach((otherCheckbox, index) => {
    const reactionLabel = reactionLabels[index]; // Obtenir le label correspondant
    if (otherCheckbox !== checkbox) {
      otherCheckbox.disabled = checkbox.checked; // Désactive les autres cases si celle-ci est cochée
      if (checkbox.checked) {
        // Appliquer un style "disabled" au label correspondant
        reactionLabel.classList.add("disabled-reaction");
      } else {
        // Retirer le style "disabled" du label lorsque toutes les cases sont décochées
        reactionLabel.classList.remove("disabled-reaction");
      }
    }
  });

  // Si la case est décochée, réactiver toutes les cases et retirer les styles "disabled"
  if (!checkbox.checked) {
    allCheckboxes.forEach((otherCheckbox, index) => {
      const reactionLabel = reactionLabels[index]; // Obtenir le label correspondant
      otherCheckbox.disabled = false; // Réactive les autres cases
      reactionLabel.classList.remove("disabled-reaction"); // Retirer le style "disabled"
    });
  }
};

/* Fonction d'animation particules */
function triggerParticleAnimation(reactionElement, reactionType) {
  const colors = {
    like: "#4CAF50",
    dislike: "#F44336",
    love: "#FF69B4",
  };

  // Créer un conteneur de particules pour cette réaction
  const particleContainer = document.createElement("div");
  particleContainer.classList.add("particle-container");
  reactionElement.appendChild(particleContainer);

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement("span");
    particle.classList.add("particle");
    particle.style.backgroundColor = colors[reactionType];

    const x = Math.random() * 200 - 100;
    const y = Math.random() * 200 - 100;

    particle.style.transform = `translate(${x}px, ${y}px) scale(0)`;
    particleContainer.appendChild(particle);

    // Déclencher l'animation après un léger délai
    setTimeout(() => {
      particle.style.transform = `translate(${x}px, ${y}px) scale(1.9)`;
      particle.style.opacity = 0;
    }, 50);

    // Supprimer les particules après leur animation
    setTimeout(() => {
      particle.remove();
    }, 1500);
  }

  // Nettoyer le conteneur après les particules
  setTimeout(() => {
    particleContainer.remove();
  }, 1600);
}

// Charger les posts au chargement de la page
document.addEventListener("DOMContentLoaded", loadPosts);