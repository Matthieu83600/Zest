document.addEventListener("DOMContentLoaded", function () {
  // 1. Charger les données des conversations depuis le fichier JSON si ce n'est pas déjà fait
  if (!localStorage.getItem("conversations")) {
    fetch("../data/conversations.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des conversations JSON.");
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
        const listItem = document.createElement("li");
        listItem.classList.add("conversation-item");
        listItem.textContent = conversation.name;
        listItem.dataset.id = id;
        // Créer un conteneur pour afficher le nom de la conversation et le dernier message
        const conversationContent = document.createElement("div");
        conversationContent.classList.add("conversation-content");
        // Ajouter le dernier message
        const lastMessage = conversation.messages[conversation.messages.length - 1].text;
        const lastMessageElement = document.createElement("div");
        lastMessageElement.classList.add("conversation-last-message");
        lastMessageElement.textContent = lastMessage;
        // Ajouter le contenu de la conversation à l'élément de la liste
        conversationContent.appendChild(lastMessageElement);
        // Ajouter le contenu de la conversation à l'élément de la liste
        listItem.appendChild(conversationContent);
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
  function loadConversation(id) {
    const conversations = JSON.parse(localStorage.getItem("conversations"));
    const conversation = conversations[id];
    const chatTitle = document.getElementById("chat-title");
    const chatMessages = document.getElementById("chat-messages");

    if (conversation) {
      chatTitle.textContent = `Conversation avec ${conversation.name}`;
      chatMessages.innerHTML = "";
      conversation.messages.forEach((msg) => {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", msg.sender === "me" ? "sent" : "received");
        messageElement.textContent = msg.text;
        chatMessages.appendChild(messageElement);
      });
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } else {
      chatTitle.textContent = "Sélectionnez une conversation";
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
        const newMessage = {
          sender: "me",
          text: messageText,
        };

        // Ajouter le message à la conversation
        conversation.messages.push(newMessage);
        conversations[currentConversationId] = conversation;

        // Sauvegarder la conversation mise à jour dans le localStorage
        localStorage.setItem("conversations", JSON.stringify(conversations));

        // Afficher le message dans la fenêtre de discussion
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", "sent");
        messageElement.textContent = newMessage.text;
        document.getElementById("chat-messages").appendChild(messageElement);

        // Mettre à jour la liste des conversations
        renderConversations();  // Re-render la liste des conversations pour afficher le nouveau message
          
        // Mettre à jour le titre
        loadConversation(currentConversationId);
        messageInput.value = ""; // Réinitialiser le champ de texte
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
