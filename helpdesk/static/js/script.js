let filteredTicketsGlobal = [];
function createTicketContent(
  statusFilter = null,
  containerId = "ticketListAll"
) {
  const dynamicContent = document.getElementById(containerId);

  if (!dynamicContent) {
    return;
  }

  fetch("/auth/api/tickets/")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((ticketList) => {
      dynamicContent.innerHTML = ""; // Limpar conteúdo existente
      const name_loginSplit = loggedInUserId.split(" ")[0];
      const userTickets = ticketList.filter(
        (ticket) => ticket.user === name_loginSplit
      );
      const filteredTickets = statusFilter
        ? userTickets
            .reverse()
            .filter((ticket) => ticket.status === statusFilter)
        : userTickets;
      filteredTicketsGlobal = filteredTickets.reverse();
      if(filteredTickets.length > 0){
        filteredTickets.forEach((ticket) => {
          const container = document.createElement("div");
          container.className = "container-options";
  
          // Definindo a cor do status dinamicamente
          let statusClass = "";
          if (ticket.status === "encerrado") {
            statusClass = "status-vermelho";
          } else if (ticket.status === "atendendo") {
            statusClass = "status-verde";
          } else if (ticket.status === "pendente") {
            statusClass = "status-branco";
          }
  
          container.innerHTML = `
                      <div onclick="urlTicket(${ticket.id})" class="container-options-box">
                          <div class="info-column">
                              <i class='text-capitalize fw-bold'>${ticket.protocol} | ${ticket.created_at}</i>
                              <h4>${ticket.title.length > 20 ? ticket.title.slice(0, 20) + '...' : ticket.title}</h4>
                          </div>
                          <div class="circle-options">
                              <h3>Status</h3>
                              <div class="circle-status ${statusClass}"></div>
                          </div>
                          <div class="name-column">
                              <h3>Analista</h3>
                              <h2 class='text-capitalize'>${
                                ticket.name_analyst__username.split(" ")[0] ||
                                "Não atribuído"
                              }</h2>
                          </div>
                          ${ticket.status === 'atendendo' ? 
                                  `
                                  <button title="CHAT" class="btn btn-outline-info button-chat d-flex justify-content-center align-items-center" onclick="event.stopPropagation(); toggleChat(${ticket.id})"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-text-fill" viewBox="0 0 16 16">
                                      <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M4.5 5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1z"/>
                                      </svg>
                                  </button>
                                  ` : ticket.status === 'encerrado' ?
                                  `
                                  <button title="CHAT" class="btn btn-outline-danger button-chat d-flex justify-content-center align-items-center" onclick="event.stopPropagation(); toggleChat(${ticket.id})"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-text-fill" viewBox="0 0 16 16">
                                      <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M4.5 5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1z"/>
                                      </svg>
                                  </button>
                                  `
                                  :
                                  `
                                  <button title="CHAT" class="btn btn-outline-secondary button-chat d-flex justify-content-center align-items-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-text-fill" viewBox="0 0 16 16">
                                      <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M4.5 5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1z"/>
                                      </svg>
                                  </button>
                                  `
                              }
                      </div>
                  `;
  
          dynamicContent.appendChild(container);
        });
      }else{
        const container = document.createElement('div');
        container.className = 'container-options';
        container.innerHTML = `<h2>nao tem nenhum ticket</h2>`
        dynamicContent.appendChild(container);
      }
      
    })
    .catch((error) => console.error("Erro ao buscar tickets:", error));
}

// Chamar a função ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  // Renderiza os tickets ao carregar a página
  createTicketContent(null, "ticketListAll"); // Use os tickets globais ou um estado inicial
  addImageClickEvent();
});



const tabsContainer = document.querySelector(".tabs");
const messagesContainer = document.getElementById("messages");

// Função para gerar o protocolo do ticket (sequencial + data no formato DDMMYYYY)
function generateTicketProtocol() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0"); // Formata o dia com 2 dígitos
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Formata o mês com 2 dígitos (0-based)
  const year = date.getFullYear(); // Obtém o ano completo (ex: 2024)

  const protocolNumber = tickets.length + 1; // Número sequencial baseado na quantidade de tickets

  return `${protocolNumber}${day}${month}${year}`; // Ex: 12312024 (1 + 31/12/2024)
}
3000;

function urlTicket(id) {
  const ticket = filteredTicketsGlobal.find((item) => item.id === id);
  const ticketDetails = document.getElementById("ticketDetails");
  ticketDetails.innerHTML = `
    <div>
      <h2 class= title>${ticket.title}</h2>
    </div>
    <div class="info-ticket">
    <div class=conf-info>
      <span>Departamento:</span>
      <p>${ticket.department}</p>
    </div> 
    <div class=conf-info>
      <span>Status:</span>
      <p>${ticket.status}</p>
    </div>
    <div class=conf-info>
      <span>Analista:</span>
      <p>${ticket.name_analyst__username || "Não atribuído"}</p>
    </div>
    </div>
    <div class="description">
       <span>Descrição:</span> 
      <p> ${ticket.description || "Sem descrição"}</p>
    </div>
  `;

  // Use o Bootstrap para exibir o modal
  const modal = new bootstrap.Modal(document.getElementById("ticketModal"));
  modal.show();
  const newUrl = `${window.location.origin}${window.location.pathname}?protocolo=${ticket[0].protocol}`;
  history.pushState({ path: newUrl }, "", newUrl);
}

function close_modal() {
  const modalElement = document.getElementById("ticketModal");
  const modal = new bootstrap.Modal(document.getElementById("ticketModal"));
  modal.hide();
}

// Criar um novo ticket
function createNewTicket() {
  const newTicketProtocol = generateTicketProtocol(); // Gera o protocolo com número sequencial e data
  const newTicketId = tickets.length + 1; // Criação de um novo ticket com ID incremental
  const newTicket = {
    id: newTicketId,
    title: `Ticket #${newTicketProtocol}`,
    messages: [],
  };
  tickets.push(newTicket);
  renderTabs(); // Re-renderizar as abas dos tickets
  openTicket(newTicketId); // Abrir o novo ticket criado
  window.location.href = "/auth/openticket/";
}

// Abrir um ticket e exibir as mensagens
function openTicket(id) {
  activeTicketId = id;
  const ticket = tickets.find((ticket) => ticket.id === id);

  document
    .querySelectorAll(".tab")
    .forEach((tab) => tab.classList.remove("active"));
  event.target.classList.add("active");

  renderMessages(ticket.messages);
}

// Renderizar as mensagens no chat
function renderMessages(messages) {
  messagesContainer.innerHTML = ""; // Limpa a área de mensagens
  messages.forEach((message) => {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${message.sender}`; // Adiciona a classe de quem enviou a mensagem

    // Cria a estrutura de exibição da mensagem com o nome do remetente
    const nameDiv = document.createElement("div");
    nameDiv.className = "sender-name";
    nameDiv.textContent = message.name; // Exibe o nome do remetente

    const textDiv = document.createElement("div");
    textDiv.className = "message-text";
    textDiv.textContent = message.text; // Exibe o conteúdo da mensagem

    msgDiv.appendChild(nameDiv); // Adiciona o nome do remetente
    msgDiv.appendChild(textDiv); // Adiciona a mensagem de texto

    messagesContainer.appendChild(msgDiv); // Adiciona a mensagem na área de mensagens
  });
  messagesContainer.scrollTop = messagesContainer.scrollHeight; // Garante que a área de mensagens desça até o final
}
// Enviar mensagem do usuário e simular resposta do administrador


// Fechar uma aba de ticket


// Inicializar o sistema de tickets



// JavaScript para alternar entre as seções da esquerda
function showSection(sectionNumber) {
  // Esconder todas as seções
  const chatContainer = document.querySelector(".ticket-container");
  const sectionContainer = document.querySelector(".section");
  document.querySelectorAll(".section").forEach((section) => {
    section.style.display = "none";
  });

  // Exibir a seção selecionada
  document.getElementById(`section${sectionNumber}`).style.display = "block";
  if (chatContainer.style.width == "49%") {
    document.getElementById(`section${sectionNumber}`).style.marginTop = "11%";
  }
  // Atualizar os tickets exibidos com base na seção
  if (sectionNumber === 1) {
    createTicketContent(null, "ticketListAll"); // Exibe todos os tickets
  }
  if (sectionNumber === 2) {
    createTicketContent("atendendo", "ticketListOngo"); // Exibe tickets em aberto
  }
  if (sectionNumber === 3) {
    createTicketContent("pendente", "ticketListOpen"); // Exibe tickets em aberto
  }
  if (sectionNumber === 4) {
    createTicketContent("encerrado", "ticketListClosed"); // Exibe tickets encerrados
  }
}

function handleFileSelection() {
  const fileInput = document.getElementById("fileInput");
  const selectedFile = fileInput.files[0]; // Obtém o primeiro arquivo selecionado
}

// ################## AQUI QUE ESTA O RENDER DE IMAGENS DO CHAT ##################

// Atualizar renderMessages para suportar mensagens de imagem
function renderMessages(messages) {
  messagesContainer.innerHTML = ""; // Limpa a área de mensagens
  messages.forEach((message) => {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${message.sender}`; // Adiciona a classe de quem enviou a mensagem

    // Cria a estrutura de exibição da mensagem com o nome do remetente
    const nameDiv = document.createElement("div");
    nameDiv.className = "sender-name";
    nameDiv.textContent = message.name; // Exibe o nome do remetente
    msgDiv.appendChild(nameDiv);

    if (message.text) {
      // Renderiza mensagens de texto
      const textDiv = document.createElement("div");
      textDiv.className = "message-text";
      textDiv.textContent = message.text; // Exibe o conteúdo da mensagem
      msgDiv.appendChild(textDiv);
    } else if (message.image) {
      // Renderiza mensagens de imagem
      const imgElement = document.createElement("img");
      imgElement.className = "message-image";
      imgElement.src = message.image; // Define a URL/Base64 da imagem
      imgElement.alt = "Imagem enviada";
      imgElement.style.maxWidth = "200px";
      msgDiv.appendChild(imgElement);
    }

    messagesContainer.appendChild(msgDiv); // Adiciona a mensagem na área de mensagens
  });
  messagesContainer.scrollTop = messagesContainer.scrollHeight; // Garante que a área de mensagens desça até o final
}


// Elemento de foto e nome do colaborador

function toggleMenu() {
  const menu = document.getElementById("userMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}


// FUNCTION FOR SHOW PASSWORD IN LOGIN.HTML

function togglePasswordVisibility() {
  const passwordField = document.getElementById("password");
  const currentType = passwordField.type;

  // Alternar entre os tipos "password" e "text"
  if (currentType === "password") {
    passwordField.type = "text"; // Exibe a senha
  } else {
    passwordField.type = "password"; // Oculta a senha
  }
}

// FUNCTION OPEN TICKET

function formatText(command) {
  const descriptionField = document.getElementById("description");

  // Aplica o comando de formatação ao texto selecionado
  if (command === "bold") {
    descriptionField.style.fontWeight =
      descriptionField.style.fontWeight === "bold" ? "normal" : "bold";
  } else if (command === "italic") {
    descriptionField.style.fontStyle =
      descriptionField.style.fontStyle === "italic" ? "normal" : "italic";
  } else if (command === "increaseFont") {
    let currentSize = parseFloat(
      window.getComputedStyle(descriptionField).fontSize
    );
    descriptionField.style.fontSize = currentSize + 2 + "px";
  } else if (command === "decreaseFont") {
    let currentSize = parseFloat(
      window.getComputedStyle(descriptionField).fontSize
    );
    descriptionField.style.fontSize = currentSize - 2 + "px";
  }
}

function updateCharCount() {
  const descricao = document.getElementById("descricao");
  const charCount = document.getElementById("charCount");
  const maxLength = descricao.getAttribute("maxlength");
  const currentLength = descricao.value.length;

  charCount.textContent = `${maxLength - currentLength} caracteres restantes`;
}

function cancelForm() {
  document.getElementById("problemForm").reset();
  document.getElementById("description").style.fontWeight = "normal";
  document.getElementById("description").style.fontStyle = "normal";
  document.getElementById("description").style.fontSize = "14px";

  window.location.href = "/";
}
let chatSocket = null;
function toggleChat(ticketId) {
  const ticketfiltro = filteredTicketsGlobal.filter(
    (item) => item.id === ticketId
  );

  const leftContainer = document.querySelector(".left-container");
  const chatContainer = document.querySelector(".ticket-container");
  const sectionContainer = document.querySelector(".section");

  // Reduz a largura dos tickets e exibe o bate-papo
  sectionContainer.classList.add("reduced");
  leftContainer.classList.add("reduced");
  chatContainer.style.width = "49%";
  chatContainer.style.display = "block";

  // // Faz o fetch para obter o template de chat
  fetch(`/chat/?chatroom_name=${ticketfiltro[0].protocol}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao carregar o chat");
      }
      return response.text();
    })
    .then((html) => {
      // Atualiza o conteúdo do chat com o HTML do servidor
      chatContainer.innerHTML = `
        <div class="d-flex flex-row-reverse justify-content-between">
            <button class="btn btn-danger h-100 m-1 p-auto close-chat-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                </svg>
            </button>
            <div class="content pt-4 ps-4 w-100">
                <div class="ticket-info ">
                    <img src="${ticketfiltro[0].profile_picture}" alt="Foto do Usuário" class="user-photo">
                    <div class="ticket-details">
                        <p><strong>Usuário:</strong> ${ticketfiltro[0].user}</p>
                        <p><strong>Protocolo:</strong> #${ticketfiltro[0].protocol}</p>
                        <p><strong>Motivo:</strong> ${ticketfiltro[0].title}</p>
                    </div>
                </div>
                ${html}
            </div>
        </div>
      `;
      htmx.process(chatContainer); // Processar os elementos HTMX
      scrollToBottom(); // Rolar para o final do chat
      const chatForm = chatContainer.querySelector("#chat_message_form");
      if (chatForm) {
        chatForm.onsubmit = handleFormSubmit;
      }

      // Adicionar evento para fechar o bate-papo
      const closeBtn = chatContainer.querySelector(".close-chat-btn");
      closeBtn.addEventListener("click", closeChat);
    })
    .catch((error) => {
      console.error("Erro ao carregar o chat:", error);
    });
}

function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  scrollToBottom();
  const formData = new FormData(form);
  fetch(form.action, {
    method: form.method,
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao enviar o formulário");
      }
      form.reset();
      return response.json();
    })
    .then((data) => {
      console.log("Formulário enviado com sucesso:", data);
    })
    .catch((error) => {
      form.reset();
      console.log("formulário: alguma coisa deu certo");
    });
}

function scrollToBottom() {
  const chatContainer = document.getElementById("chat_container");
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function closeChat() {
  const leftContainer = document.querySelector(".left-container");
  const chatContainer = document.querySelector(".ticket-container");
  const sectionContainer = document.querySelector(".section");
  // Restaurar largura do container dos tickets
  sectionContainer.classList.remove("reduced");
  leftContainer.classList.remove("reduced");
  chatContainer.style.width = "0";
  chatContainer.style.display = "none";

  // Remover evento de clique fora
  document.removeEventListener("click");
}

function enlargeImage(imgSrc) {
  // Cria um overlay para a imagem ampliada
  const overlay = document.createElement("div");
  overlay.id = "image-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "1000";

  // Cria a imagem ampliada
  const img = document.createElement("img");
  img.src = imgSrc;
  img.style.maxWidth = "70%";
  img.style.maxHeight = "70%";
  img.style.border = "2px solid white";
  img.style.borderRadius = "10px";

  // Cria o botão de fechar
  const closeButton = document.createElement("button");
  closeButton.innerText = "Fechar";
  closeButton.style.position = "absolute";
  closeButton.style.top = "20px";
  closeButton.style.right = "20px";
  closeButton.style.padding = "10px 20px";
  closeButton.style.backgroundColor = "red";
  closeButton.style.color = "white";
  closeButton.style.border = "none";
  closeButton.style.borderRadius = "5px";
  closeButton.style.cursor = "pointer";

  // Adiciona evento de clique ao botão de fechar
  closeButton.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });

  // Adiciona a imagem e o botão de fechar ao overlay
  overlay.appendChild(img);
  overlay.appendChild(closeButton);

  // Adiciona o overlay ao body
  document.body.appendChild(overlay);
}

function addImageClickEvent() {
  const chatImages = document.querySelectorAll(".chat-image");
  chatImages.forEach((img) => {
    img.addEventListener("click", () => {
      enlargeImage(img.src);
    });
  });
}

  // Função para mostrar a miniatura da imagem
  function previewImage() {
    const fileInput = document.getElementById('inputGroupFile02');
    const file = fileInput.files[0];
    const imagePreview = document.getElementById('imagePreview');
    const imageThumbnail = document.getElementById('imageThumbnail');

    if (file) {
        // Exibe o nome do arquivo
        

        // Exibe a miniatura da imagem
        const reader = new FileReader();
        reader.onload = function(e) {
            imageThumbnail.src = e.target.result;
        };
        reader.readAsDataURL(file);

        // Torna a área da miniatura visível
        imagePreview.classList.remove('d-none');
    }
}

function clearPreview() {
  const imagePreview = document.getElementById('imagePreview');
  const imageName = document.getElementById('imageName');
  const imageThumbnail = document.getElementById('imageThumbnail');
  const fileInput = document.getElementById('inputGroupFile02');

  // Limpa a miniatura e o nome
  imageName.textContent = '';
  imageThumbnail.src = '';

  // Esconde a área de pré-visualização
  imagePreview.classList.add('d-none');

  // Limpa o valor do input de arquivo
  fileInput.value = '';
}

// Reset após o envio do formulário (garante a limpeza após htmx)
document.addEventListener('htmx:afterSwap', function() {
  clearPreview();  // Limpa a pré-visualização após o envio e a troca de conteúdo
});
