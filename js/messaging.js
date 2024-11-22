document.addEventListener("DOMContentLoaded", function () {
  // 1. Charger les données des conversations depuis le fichier JSON si ce n'est pas déjà fait
  if (!localStorage.getItem("conversations")) {
    fetch("../data/conversations.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des conversations.");
        }
        return response.json();
      })
      .then((data) => {
        // Stocker les conversations dans le localStorage si elles ne sont pas déjà présentes
        localStorage.setItem("conversations", JSON.stringify(data));
        console.log("Conversations initialisées avec succès.");
        renderConversations(); // Rendre les conversations après le chargement
      })
      .catch((error) => console.error("Erreur lors du chargement des conversations :", error));
  } else {
    renderConversations(); // Si les conversations sont déjà dans le localStorage, les afficher directement
  }

  // 2. Charger et afficher les conversations dans la liste
  function renderConversations() {
    const conversations = JSON.parse(localStorage.getItem("conversations"));
    const conversationList = document.getElementById("conversation-list");
    const emptyConversations = document.getElementById("empty-conversations");

    // Vider la liste des conversations
    conversationList.innerHTML = "";

    const conversationIds = Object.keys(conversations);

    // Filtrer et afficher uniquement les conversations qui ont des messages
    const conversationsWithMessages = conversationIds.filter((id) => conversations[id].messages.length > 0);

    if (conversationsWithMessages.length === 0) {
      emptyConversations.style.display = "block"; // Afficher "Aucune conversation" si aucune conversation avec des messages
    } else {
      emptyConversations.style.display = "none"; // Cacher le message si des conversations existent

      conversationsWithMessages.forEach((id) => {
        const conversation = conversations[id];
        const lastMessage = conversation.messages[conversation.messages.length - 1];
        // Créer l'élément de la liste
        const listItem = document.createElement("li");
        listItem.classList.add("conversation-item");
        listItem.dataset.id = id;

        listItem.innerHTML = `
        <div class="conversation-content">
          <div class="conversation-header">
            <span class="conversation-name">${conversation.name}</span>
          </div>
          <div class="conversation-last-message">
            <span class="last-message-text">${lastMessage.text}</span>
            <span class="last-message-timestamp">${lastMessage.timestamp}</span>
          </div>
        </div>
        `;
        // Ajouter un écouteur d'événements pour chaque conversation
        listItem.addEventListener("click", () => {
          localStorage.setItem("currentConversationId", id);
          loadConversation(id); // Charger la conversation
          setSelectedConversation(id); // Sélectionner la conversation
        });

        // Ajouter la classe "selected" à la conversation active
        if (id === localStorage.getItem("currentConversationId")) {
          listItem.classList.add("selected");
        }

        conversationList.appendChild(listItem);
      });
    }
  }

  // 3. Fonction pour charger une conversation spécifique
  // Fonction pour charger une conversation spécifique
  function loadConversation(id) {
    const conversations = JSON.parse(localStorage.getItem("conversations"));
    const conversation = conversations[id];
    const chatTitle = document.getElementById("chat-title");
    const chatMessages = document.getElementById("chat-messages");

    if (conversation) {
      // Mettre à jour le titre de la conversation
      chatTitle.textContent = `Conversation avec ${conversation.name}`;

      // Vider l'affichage précédent
      chatMessages.innerHTML = "";

      // Ajouter chaque message dans l'affichage
      conversation.messages.forEach((msg) => {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", msg.sender === "me" ? "sent" : "received");

        // Contenu du message
        messageElement.innerHTML = `
        <div class="message-info">
          ${
            msg.sender === "me"
              ? `<img src="../assets/avatars/user_avatar.png" alt="John Doe" class="message-avatar">`
              : `<img src="${conversation.avatar}" alt="${conversation.name}" class="message-avatar">`
          }
            <span class="message-sender">${msg.sender === "me" ? "John Doe" : conversation.name}</span>
            <span class="message-timestamp">${msg.timestamp}</span>
        </div>
        <div class="message-text">${msg.text}</div>
      `;

        chatMessages.appendChild(messageElement);
      });

      // Scroller en bas de la conversation
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } else {
      // Aucun message à afficher
      chatTitle.textContent = "Sélectionnez une conversation";
      chatMessages.innerHTML = `<p>Aucune conversation chargée.</p>`;
    }

    // Mettre en surbrillance l'élément sélectionné dans la liste des conversations
    const conversationItems = document.querySelectorAll(".conversation-item");
    conversationItems.forEach((item) => item.classList.remove("selected"));
    const selectedItem = document.querySelector(`.conversation-item[data-id='${id}']`);
    if (selectedItem) {
      selectedItem.classList.add("selected");
    }
  }

  // 4. Fonction pour gérer la sélection de conversation dans la liste
  function setSelectedConversation(id) {
    const allConversationItems = document.querySelectorAll(".conversation-item");
    allConversationItems.forEach((item) => item.classList.remove("selected"));

    const selectedItem = document.querySelector(`.conversation-item[data-id='${id}']`);
    if (selectedItem) {
      selectedItem.classList.add("selected");
    }
  }

  // 5. Fonction pour envoyer un message
  const messageForm = document.getElementById("message-form");
  const messageInput = document.getElementById("message-input");
  messageForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const messageText = messageInput.value.trim();
    if (messageText) {
      const currentConversationId = localStorage.getItem("currentConversationId");
      if (currentConversationId) {
        const conversations = JSON.parse(localStorage.getItem("conversations"));
        const conversation = conversations[currentConversationId];
        // Détails de l'utilisateur
        const user = {
          firstName: "John",
          lastName: "Doe",
          avatar: "../assets/avatars/user_avatar.png",
        };
        // Générer l'horodatage du message envoyé
        const timestamp = new Date().toLocaleString("fr-FR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
        // Créer le nouveau message
        const newMessage = {
          sender: "me",
          text: messageText,
          timestamp: timestamp,
          name: `${user.firstName} ${user.lastName}`,
          avatar: user.avatar,
        };
        // Ajouter le message à la conversation
        conversation.messages.push(newMessage);
        conversations[currentConversationId] = conversation;
        // Sauvegarder la conversation mise à jour dans le localStorage
        localStorage.setItem("conversations", JSON.stringify(conversations));
        // Afficher le message dans la fenêtre de discussion
        const chatMessages = document.getElementById("chat-messages");
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");
        // Ajouter le contenu du message
        messageElement.innerHTML = `
        <div class="message-info">
          <img class="message-avatar" src="${newMessage.avatar}" alt="${newMessage.name}">
          <span class="message-sender">${newMessage.name}</span>
          <span class="message-timestamp">${newMessage.timestamp}</span>
        </div>
        <div class="message-text">${newMessage.text}</div>
        `;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        // Mettre à jour la liste des conversations
        renderConversations(); // Actualiser la liste des conversations
        // Réinitialiser le champ de texte
        messageInput.value = "";
      }
    }
  });

  // 6. Vérifier si une conversation est active, sinon afficher "Sélectionnez une conversation"
  const currentConversationId = localStorage.getItem("currentConversationId");
  if (!currentConversationId) {
    document.getElementById("chat-title").textContent = "Sélectionnez une conversation";
  } else {
    loadConversation(currentConversationId); // Charger la conversation sélectionnée
  }

  // 7. Supprimer `currentConversationId` du localStorage quand l'utilisateur quitte ou actualise la page
  window.addEventListener("beforeunload", () => {
    localStorage.removeItem("currentConversationId");
  });
});
