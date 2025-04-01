let filteredTicketsGlobal = []
let pessoa = null
let protocolFilter = null
// Função para popular o dropdown dinamicamente
function populateUserDropdown(ticketList) {
    const dropdown = document.getElementById('userDropdown');
    // Obtendo lista única de usuários
    const users = [...new Set(ticketList.map(ticket => ticket.user))];

        // Adiciona a opção "Todos" manualmente
        const allOption = document.createElement('li');
        allOption.value = 'all';
        allOption.textContent = 'Todos';
        allOption.onclick = function () {
            filterByUser('all', 'all'); // Chama a função com o valor 'all'
        };
        dropdown.appendChild(allOption);
    
    // Adicionando usuários ao dropdown
    users.forEach(user => {
        const option = document.createElement('li');
        option.value = user;
        option.textContent = user;
        option.onclick = function() {
            filterByUser(user); // Chama a função com o usuário correspondente
        };
        dropdown.appendChild(option);
    });
}

function populateProtocolDropdown(ticketList) {
    const dropdown = document.getElementById('userDropdown');
    const searchInput = document.querySelector('.dropdown-search');
    const filter = searchInput.value.toLowerCase();
    const protocols = [...new Set(ticketList.map(ticket => ticket.protocol))];
   
    protocols.forEach(protocol => {
        const option = document.createElement('li');
        const text = option.textContent.toLowerCase();
        option.style.display = filter ? 'block' : 'none';
        option.value = protocol;
        option.textContent = protocol;
        option.onclick = function() {
            const ticket = ticketList.find(ticket => ticket.protocol === protocol);
            filterByUser(ticket.user, protocol);
        };
        dropdown.appendChild(option);
    });
}

// Atualizar função de criação de tickets para incluir a funcionalidade do filtro
function createTicketContent(statusFilter = null, containerId = 'ticketListAll') {
    const dynamicContent = document.getElementById(containerId);

    if (!dynamicContent) {
        return;
    }

    fetch('/auth/api/tickets/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(ticketList => {

            dynamicContent.innerHTML = ''; // Limpar conteúdo existente

            // Popular dropdown com usuários (executa apenas na primeira vez)
            if (!document.getElementById('userDropdown').dataset.populated) {
                populateUserDropdown(ticketList);
                populateProtocolDropdown(ticketList);
                document.getElementById('userDropdown').dataset.populated = 'true';
            }

            // Filtrar tickets por status e usuário
            if (statusFilter) {
                ticketList = ticketList.filter(ticket => ticket.status === statusFilter);
            }
            if (pessoa && pessoa !== 'all') {
                ticketList = ticketList.filter(ticket => ticket.user === pessoa);
            }

            if (protocolFilter && protocolFilter !== 'all') {
                ticketList = ticketList.filter(ticket => ticket.protocol === protocolFilter);
            }
            
            
            let filteredTickets = statusFilter
                ? ticketList.reverse().filter(ticket => ticket.status === statusFilter)
                : ticketList;
            filteredTicketsGlobal = filteredTickets.reverse()

            filteredTicketsGlobal = filteredTickets;

            // Renderizar tickets
            if(filteredTickets.length > 0){
                filteredTickets.forEach(ticket => {
                    const container = document.createElement('div');
                    container.className = 'container-options';
    
                    let statusClass = '';
                    if (ticket.status === 'encerrado') {
                        statusClass = 'status-vermelho';
                        
                    } else if (ticket.status === 'atendendo') {
                        statusClass = 'status-verde';
                        
                    } else if (ticket.status === 'pendente') {
                        statusClass = 'status-branco';
                    }
                    if (statusClass) {
                        container.classList.add(statusClass);
                    }
                    if (filteredTickets.length === 0) {
                        dynamicContent.innerHTML = '<h2>Não tem nenhum ticket por enquanto</h2>';
                        return;
                    }
    
                    container.innerHTML = `
                        <div onclick="urlTicket(${ticket.id})" class="container-options-box">
                            <div class="circle-foto">
                                <img src="${ticket.profile_picture}" alt="Imagem do colaborador">
                            </div>
                            <div class="info-column">
                                <i class='text-capitalize fw-bold'>${ticket.user} | ${ticket.department}</i>
                                <h4 class='text-capitalize'>${ticket.title.length > 30 ? ticket.title.slice(0, 20) + '...' : ticket.title}</h4>
                            </div>
                            <div class='description'>
                                <p class=''>${ticket.title}</p>
                                <p class=''>${ticket.description}</p>
                            </div> 
                            
                            <div class="circle-options">
                                <p>Status : ${ticket.status}</p>
                                <p>Protocolo: #${ticket.protocol}</p>
                                <p>Criado em: ${ticket.created_at}</p>
                            </div>
                            <div class="name-column">
                                <h3>Analista Sugerido</h3>
                                <h2 class='text-capitalize'>${ticket.name_analyst__username.split(' ')[0] || 'Não Atribuído'}</h2>
                            </div>
                            <button title="TRANSFERIR CHAMADA" class=' btn btn-outline-warning fs-6 button_acessar d-flex justify-content-center align-items-center' style="text-align: center;" data-ticket-id="${ticket.id}">
                           
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
                                    <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                                </svg>
                                
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                                </svg>
                                                        
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
                                    <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                                </svg>
                            </button>
                            <div class='button_div'>
                                ${ticket.status === 'atendendo' ? 
                                    `
                                    <button title="CHAT" class="btn btn-outline-info button-chat d-flex justify-content-center align-items-center" onclick="toggleChat(${ticket.id})"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-text-fill" viewBox="0 0 16 16">
                                        <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M4.5 5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1z"/>
                                        </svg>
                                    </button>
                                    ` : ticket.status === 'encerrado' ?
                                    `
                                    <button title="CHAT" class="btn btn-outline-danger button-chat d-flex justify-content-center align-items-center" onclick="toggleChat(${ticket.id})"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-text-fill" viewBox="0 0 16 16">
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
                                
                                <form action="/api/tickets/atender_ticket/${ticket.id}/" method="POST">
                                    <button  class="btn btn-outline-success button_atender d-flex justify-content-center align-items-center" title="ATENDER CHAMADO" type="submit" ><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-headset" viewBox="0 0 16 16">
                                        <path d="M8 1a5 5 0 0 0-5 5v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a6 6 0 1 1 12 0v6a2.5 2.5 0 0 1-2.5 2.5H9.366a1 1 0 0 1-.866.5h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 .866.5H11.5A1.5 1.5 0 0 0 13 12h-1a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h1V6a5 5 0 0 0-5-5"/>
                                        </svg>
                                    </button>
                                </form>
                                <form action="/api/tickets/close_ticket/${ticket.id}/" method="POST">
                                    <button class="btn btn-outline-danger button_fechar d-flex justify-content-center align-items-center" title="FECHAR CHAMADA" type="submit" ><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
                                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"/>
                                        </svg>
                                    </button>
                                </form>
                            </div>
                            <p style="height: 34px;" class='button-v btn btn-outline-secondary d-flex justify-content-center align-items-center' id='button-v'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-down-square-fill" viewBox="0 0 16 16">
                            <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm4 4a.5.5 0 0 0-.374.832l4 4.5a.5.5 0 0 0 .748 0l4-4.5A.5.5 0 0 0 12 6z"/>
                            </svg></p>
                        </div>
                    `;
    
                    dynamicContent.appendChild(container);
                });
            }
            else{
                const container = document.createElement('div');
                container.className = 'container-options';
                container.innerHTML = `<h2>nao tem nenhum ticket</h2>`
                dynamicContent.appendChild(container);
            }
            

            rebindButtons(); // Reatribuir eventos aos botões
        })
        .catch(error => console.error('Erro ao buscar tickets:', error));
}

function toggleClassOnClick() {
    const buttons = document.querySelectorAll('.button-v');
    buttons.forEach(button => {
        const container = button.closest('.container-options-box');
        
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            if (container.classList.contains('active-class')) {
                container.classList.remove('active-class');
            } else {
                container.classList.add('active-class');
            }
        });

        document.addEventListener('click', (event) => {
            if (!button.contains(event.target)) {
                container.classList.remove('active-class');
            }
        });
    });
}

function urlTicket(id){
    const ticket = filteredTicketsGlobal.filter((item) => item.id === id);
    const newUrl = `${window.location.origin}${window.location.pathname}?protocolo=${ticket[0].protocol}`
    history.pushState({ path: newUrl }, '', newUrl);
}

// Manipulação do filtro pelo dropdown
function filterByUser(user, protocol) {
     // Atualiza o filtro global
    if(user === 'all' || protocol === 'all'){
        pessoa = 'all'
        protocolFilter = 'all'
    }else{
        pessoa = user
        protocolFilter = protocol
    }
    
    // Re-renderiza os tickets com base no filtro atualizado
    createTicketContent();
}

// Filtra as opções no dropdown
function filterOptions() {
    const searchInput = document.querySelector('.dropdown-search');
    const filter = searchInput.value.toLowerCase();
    const options = document.querySelectorAll('.dropdown-options li');
    
    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        if (text.includes(filter)) {
            option.style.display = ''; // Mostra a opção
        } else {
            option.style.display = 'none'; // Esconde a opção
        }
    });
}

// Chamar a função ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  // Renderiza os tickets ao carregar a página
  createTicketContent(null ,"ticketListAll"); // Use os tickets globais ou um estado inicial
  toggleClassOnClick();
});

// Simulação de dados de cinco tickets
let tickets = [
    { id: 1, title: "Ticket #12342024", messages: [] },
    { id: 2, title: "Ticket #23452024", messages: [] },
    { id: 3, title: "Ticket #34562024", messages: [] }
];

let activeTicketId = null;

const tabsContainer = document.querySelector('.tabs');
const messagesContainer = document.getElementById('messages');

// Função para gerar o protocolo do ticket (sequencial + data no formato DDMMYYYY)
function generateTicketProtocol() {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0'); // Formata o dia com 2 dígitos
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Formata o mês com 2 dígitos (0-based)
    const year = date.getFullYear(); // Obtém o ano completo (ex: 2024)

    const protocolNumber = tickets.length + 1; // Número sequencial baseado na quantidade de tickets

    return `${protocolNumber}${day}${month}${year}`; // Ex: 12312024 (1 + 31/12/2024)
}
  3000


// Criar um novo ticket
function createNewTicket() {
    const newTicketProtocol = generateTicketProtocol(); // Gera o protocolo com número sequencial e data
    const newTicketId = tickets.length + 1; // Criação de um novo ticket com ID incremental
    const newTicket = { id: newTicketId, title: `Ticket #${newTicketProtocol}`, messages: [] };
    tickets.push(newTicket);
    renderTabs(); // Re-renderizar as abas dos tickets
    openTicket(newTicketId); // Abrir o novo ticket criado
    window.location.href = "/auth/openticket/";
}


let currentTicketId = null;
// Event delegation para abrir o modal
document.addEventListener('click', function (event) {
    // Verifica se o clique foi em um botão com a classe "button_acessar"
    if (event.target && event.target.classList.contains('button_acessar')) {
        const ticketId = event.target.getAttribute('data-ticket-id'); // Pega o ID do ticket
        
    }
});

function rebindButtons() {
    const buttons = document.querySelectorAll('.button_acessar');
    toggleClassOnClick()
    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const ticketId = button.getAttribute('data-ticket-id');
            openModal(ticketId);
        });
    });
}

// Função para abrir o modal
function openModal(ticketId) {
    const modal = document.getElementById('modalAssignAnalyst');
    const select = document.getElementById('selectAnalyst');

    // Limpar opções existentes (exceto a primeira)
    select.innerHTML = '<option value="">--------------------------</option>';

    // Buscar usuários com is_staff = True
    fetch('/auth/api/staff_users/') // Endpoint que retorna os usuários com is_staff = True
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar analistas.');
            }
            
            return response.json();

        })
        .then(staffUsers => {
            staffUsers.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id; // ID do usuário para enviar no POST
                option.textContent = user.username; // Nome do usuário para exibir no dropdown
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Erro ao carregar analistas:', error));

    // Abrir o modal
    modal.classList.add('visible');

    // Definir ticketId no formulário (se necessário)
    const form = document.getElementById('assignAnalystForm');
    form.action = `/api/tickets/assign_analyst/${ticketId}/`; // Ajuste o endpoint conforme necessário
}

// Fecha o modal
function closeModal() {
    const modal = document.getElementById('modalAssignAnalyst');
    modal.classList.remove('visible');
}


document.addEventListener('click', (event) => {
    const modal = document.getElementById('modalAssignAnalyst');
    if (event.target === modal) {
      closeModal();
    }
  });



// Abrir um ticket e exibir as mensagens
function openTicket(id) {
    activeTicketId = id;
    const ticket = tickets.find(ticket => ticket.id === id);

    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');

    renderMessages(ticket.messages);
}



// Renderizar as mensagens no chat
function renderMessages(messages) {
    messagesContainer.innerHTML = ''; // Limpa a área de mensagens
    messages.forEach(message => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${message.sender}`; // Adiciona a classe de quem enviou a mensagem

        // Cria a estrutura de exibição da mensagem com o nome do remetente
        const nameDiv = document.createElement('div');
        nameDiv.className = 'sender-name';
        nameDiv.textContent = message.name; // Exibe o nome do remetente

        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.textContent = message.text; // Exibe o conteúdo da mensagem

        msgDiv.appendChild(nameDiv); // Adiciona o nome do remetente
        msgDiv.appendChild(textDiv); // Adiciona a mensagem de texto

        messagesContainer.appendChild(msgDiv); // Adiciona a mensagem na área de mensagens
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Garante que a área de mensagens desça até o final
}
// Enviar mensagem do usuário e simular resposta do administrador
function sendMessage() {
    const input = document.getElementById('userInput');
    const userMessage = input.value.trim();
    if (!userMessage || activeTicketId === null) return;

    const ticket = tickets.find(ticket => ticket.id === activeTicketId);
    
    // Adiciona a mensagem do usuário
    ticket.messages.push({ 
        sender: 'user', 
        name: 'João da Silva',  // Nome do usuário
        text: userMessage 
    });

    
    renderMessages(ticket.messages); // Atualiza as mensagens
    input.value = ''; // Limpa o campo de input

    // Simular resposta do administrador após 1 segundo
    setTimeout(() => {
        const adminMessage = { 
            sender: 'admin', 
            name: 'Administrador',  // Nome do administrador
            text: "Não tem banana." 
        };
        ticket.messages.push(adminMessage); // Adiciona a mensagem do administrador
        renderMessages(ticket.messages); // Atualiza as mensagens
    }, 1000);
}


// JavaScript para alternar entre as seções da esquerda
function showSection(sectionNumber) {
    // Esconder todas as seções
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });

    // Exibir a seção selecionada
    document.getElementById(`section${sectionNumber}`).style.display = 'block';

    // Atualizar os tickets exibidos com base na seção
    if (sectionNumber === 1) {
        createTicketContent(null, 'ticketListAll'); // Exibe todos os tickets
        
    }
    if(sectionNumber === 2) {
        createTicketContent('atendendo', 'ticketListOngo'); // Exibe tickets em aberto
        
    }
    if(sectionNumber === 3) {
        createTicketContent('pendente', 'ticketListOpen'); // Exibe tickets em aberto
        
    }
    if(sectionNumber === 4) {
        createTicketContent('encerrado', 'ticketListClosed'); // Exibe tickets encerrados
        
    }
        
    
}

function handleFilter(pessoafilter){
    pessoa = pessoafilter
}

function handleFileSelection() {
    const fileInput = document.getElementById("fileInput");
    const selectedFile = fileInput.files[0]; // Obtém o primeiro arquivo selecionado

  }

            // ################## AQUI QUE ESTA O RENDER DE IMAGENS DO CHAT ##################

  // Atualizar renderMessages para suportar mensagens de imagem
function renderMessages(messages) {
    messagesContainer.innerHTML = ''; // Limpa a área de mensagens
    messages.forEach(message => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${message.sender}`; // Adiciona a classe de quem enviou a mensagem

        // Cria a estrutura de exibição da mensagem com o nome do remetente
        const nameDiv = document.createElement('div');
        nameDiv.className = 'sender-name';
        nameDiv.textContent = message.name; // Exibe o nome do remetente
        msgDiv.appendChild(nameDiv);

        if (message.text) {
            // Renderiza mensagens de texto
            const textDiv = document.createElement('div');
            textDiv.className = 'message-text';
            textDiv.textContent = message.text; // Exibe o conteúdo da mensagem
            msgDiv.appendChild(textDiv);
        } else if (message.image) {
            // Renderiza mensagens de imagem
            const imgElement = document.createElement('img');
            imgElement.className = 'message-image';
            imgElement.src = message.image; // Define a URL/Base64 da imagem
            imgElement.alt = 'Imagem enviada';
            imgElement.style.maxWidth = '200px';
            msgDiv.appendChild(imgElement);
        }

        messagesContainer.appendChild(msgDiv); // Adiciona a mensagem na área de mensagens
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Garante que a área de mensagens desça até o final
}


// Elemento de foto e nome do colaborador

function toggleMenu() {
    const menu = document.getElementById('userMenu');
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

// FUNCTION FOR SHOW PASSWORD IN LOGIN.HTML 

function togglePasswordVisibility() {
    const passwordField = document.getElementById('password');
    const currentType = passwordField.type;
  
    // Alternar entre os tipos "password" e "text"
    if (currentType === 'password') {
      passwordField.type = 'text';  // Exibe a senha
    } else {
      passwordField.type = 'password';  // Oculta a senha
    }
}

// FUNCTION OPEN TICKET

function formatText(command) {
    const descriptionField = document.getElementById("description");

    // Aplica o comando de formatação ao texto selecionado
    if (command === 'bold') {
      descriptionField.style.fontWeight = 
        descriptionField.style.fontWeight === 'bold' ? 'normal' : 'bold';
    } else if (command === 'italic') {
      descriptionField.style.fontStyle = 
        descriptionField.style.fontStyle === 'italic' ? 'normal' : 'italic';
    } else if (command === 'increaseFont') {
      let currentSize = parseFloat(window.getComputedStyle(descriptionField).fontSize);
      descriptionField.style.fontSize = (currentSize + 2) + "px";
    } else if (command === 'decreaseFont') {
      let currentSize = parseFloat(window.getComputedStyle(descriptionField).fontSize);
      descriptionField.style.fontSize = (currentSize - 2) + "px";
    }
  }

  function cancelForm() {
    document.getElementById("problemForm").reset();
    document.getElementById("description").style.fontWeight = "normal";
    document.getElementById("description").style.fontStyle = "normal";
    document.getElementById("description").style.fontSize = "14px";
    alert("Formulário cancelado.");
    window.location.href = "/auth/index/";
  }

  function toggleChat(ticketId) {
    const ticketfiltro = filteredTicketsGlobal.filter((item) => item.id === ticketId)
    const leftContainer = document.querySelector('.left-container');
    const chatContainer = document.querySelector('.ticket-container');
    // Reduz a largura dos tickets e exibe o bate-papo
    chatContainer.style.display = 'block';
    const username = document.body.getAttribute('data-username');
    // Atualiza o conteúdo do bate-papo
    // Faz o fetch para obter o template de chat
    fetch(`/chat/?chatroom_name=${ticketfiltro[0].protocol}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao carregar o chat');
      }
      return response.text();
    })
    .then(html => {
      // Atualiza o conteúdo do chat com o HTML do servidor
      addImageClickEvent();
      chatContainer.innerHTML = `
      <div class="d-flex flex-row-reverse justify-content-between">
            <button class="btn btn-outline-danger h-100 m-1 p-auto close-chat-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                </svg>
            </button>
            <div class="">
                <div class="ticket-info">
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
      const chatForm = chatContainer.querySelector('#chat_message_form');
      if (chatForm) {
        chatForm.onsubmit = handleFormSubmit;
        
      }

      // Adicionar evento para fechar o bate-papo
      const closeBtn = chatContainer.querySelector('.close-chat-btn');
      closeBtn.addEventListener('click', closeChat);
    })
    .catch(error => {
      console.error('Erro ao carregar o chat:', error);
    });

    // Adicionar evento para fechar o bate-papo
    const closeBtn = chatContainer.querySelector('.close-chat-btn');
    
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
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao enviar o formulário');
        }
        return response.json();
      })
      .then(data => {
        console.log('Formulário enviado com sucesso:', data);
        
      })
      .catch(error => {
        form.reset();
        console.log('formulário: alguma coisa deu certo');
      });
}

function scrollToBottom() {
    const chatContainer = document.getElementById('chat_container');
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function closeChat() {
    
    const chatContainer = document.querySelector('.ticket-container');

    // Restaurar largura do container dos tickets
    
    chatContainer.style.width = '0';
    chatContainer.style.display = 'none';

    // Remover evento de clique fora
}

function enlargeImage(imgSrc) {
    // Cria um overlay para a imagem ampliada
    const overlay = document.createElement('div');
    overlay.id = 'image-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    // Cria a imagem ampliada
    const img = document.createElement('img');
    img.src = imgSrc;
    img.style.maxWidth = '70%';
    img.style.maxHeight = '70%';
    img.style.border = '2px solid white';
    img.style.borderRadius = '10px';

    // Cria o botão de fechar
    const closeButton = document.createElement('button');
    closeButton.innerText = 'Fechar';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '20px';
    closeButton.style.right = '20px';
    closeButton.style.padding = '10px 20px';
    closeButton.style.backgroundColor = 'red';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';

    // Adiciona evento de clique ao botão de fechar
    closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    // Adiciona a imagem e o botão de fechar ao overlay
    overlay.appendChild(img);
    overlay.appendChild(closeButton);

    // Adiciona o overlay ao body
    document.body.appendChild(overlay);
}

function addImageClickEvent() {
    const chatImages = document.querySelectorAll('.chat-image');
    chatImages.forEach(img => {
        img.addEventListener('click', () => {
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

  