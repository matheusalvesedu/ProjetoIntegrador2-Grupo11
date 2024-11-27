// Função para buscar eventos com o status "Aprovado"
async function getEvents() {
    const eventStatus = "Aprovado";

    try {
        const response = await fetch("http://localhost:3001/getEvents", {
            method: "GET",
            headers: {
                "status_event": eventStatus,
            },
        });

        if (!response.ok) {
            throw new Error("Erro ao carregar eventos.");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro na busca dos eventos:", error);
        return [];
    }
}

async function renderEvents(action) {
     
    const container = document.getElementById("events-container");
    container.innerHTML = ""; 

    let events = [];
    try {
        // Decide a fonte dos eventos com base no parâmetro `action`
        if (action === "Aprovado") {
            events = await getEvents(); // Busca eventos aprovados
        } else if (action === "search") {
            const keyword = document.getElementById("searchInput").value.trim();
            if (!keyword) {
                alert("Digite uma palavra-chave para buscar.");
                return;
            }
            events = await searchEvents(keyword); // Busca eventos pelo termo
        } else {
            throw new Error("Ação inválida para renderização de eventos.");
        }

        // Verifica se há eventos retornados
        if (events.length === 0) {
            container.innerHTML = `<p class='text-center'>${action === "approved" ? "Nenhum evento aprovado disponível." : "Nenhum evento encontrado para a busca."}</p>`;
            return;
        }

        // Renderiza os cartões de eventos
        events.forEach((event) => {
            const eventCard = document.createElement("div");
            eventCard.className = "col-md-4 mb-4";

            eventCard.innerHTML = `
                <div class="card p-3 shadow-sm">
                    <h3>${event.EVENT_TITLE}</h3>
                    <p><strong>Descrição:</strong> ${event.EVENT_DESCRIPTION}</p>
                    <p><strong>Data de Início:</strong> ${event.EVENTSTARTDATE}</p>
                    <p><strong>Data de Fim:</strong> ${event.EVENTFINALDATE}</p>
                    <p><strong>Data do evento:</strong> ${event.EVENTDATE}</p>
                    <p><strong>Categoria:</strong> ${event.CATEGORY}</p>
                    <button class="btn-warning bet-btn" data-id="${event.EVENT_ID}" data-title="${event.EVENT_TITLE}">
                        Apostar
                    </button>
                    <p style="font-size: 10px;">Código do evento: ${event.EVENT_ID}</p>
                </div>
            `;
            container.appendChild(eventCard);
        });

        // Adiciona os eventos de clique para abrir o modal de aposta
        document.querySelectorAll(".bet-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                const eventId = e.target.getAttribute("data-id");
                const eventTitle = e.target.getAttribute("data-title");

                document.getElementById("eventName").value = eventTitle;
                document.getElementById("betForm").dataset.eventId = eventId;

                const modal = new bootstrap.Modal(document.getElementById("betModal"));
                modal.show();
            });
        });
    } catch (error) {
        console.error("Erro na renderização dos eventos:", error);
        container.innerHTML = `<p class='text-center'>Erro ao carregar eventos.</p>`;
    }
}


// Função para lidar com a submissão da aposta
async function handleBetSubmission(event) {
    event.preventDefault();

    const betForm = document.getElementById("betForm");
    const eventId = betForm.dataset.eventId;
    const betOption = document.querySelector("input[name='betOption']:checked")?.value;
    const betAmount = document.getElementById("betAmount").value;

    if (!betOption) {
        alert("Por favor, selecione uma opção de aposta.");
        return;
    }

    if (!betAmount || betAmount <= 0) {
        alert("Por favor, insira um valor válido para a aposta.");
        return;
    }

    const h = new Headers();
    h.append("Content-Type", "application/json");
    h.append("Authorization", `Bearer ${localStorage.getItem("authToken")}`);  
    h.append("event_id", eventId);
    h.append("bet_option", betOption);
    h.append("bet_value", betAmount);


    try {
        const response = await fetch("http://localhost:3001/betOnEvent", {
            method: "PUT",
            headers: h,
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(`Erro ao enviar a aposta: ${errorData.message}`);
            return;
        }

        alert("Aposta realizada com sucesso!");

        // Fecha o modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("betModal"));
        modal.hide();
    } catch (error) {
        console.error("Erro ao enviar a aposta:", error);
        alert("Erro ao realizar a aposta. Tente novamente.");
    }
}


document.addEventListener("DOMContentLoaded", () => {
    renderEvents("Aprovado");

    // Evento para submissão do formulário de aposta
    const betForm = document.getElementById("betForm");
    betForm.addEventListener("submit", handleBetSubmission);

    // Evento para o botão de pesquisa
    const searchButton = document.getElementById("searchButton");
    searchButton.addEventListener("click", () => renderEvents("search"));

    // Evento para os links de categorias
    const categoryLinks = document.querySelectorAll(".category-link");
    categoryLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault(); // Evita a navegação padrão do link
            const category = link.getAttribute("data-category");
            renderEventsByCategory(category);
        });
    });
});

async function searchEvents(category) {

    const eventStatus = "Aprovado";
    alert(category);
    h = new Headers();
    h.append("Authorization", `Bearer ${localStorage.getItem("authToken")}`);
    h.append("event_status", eventStatus);
    h.append("keyword", category);

    try {
        const response = await fetch("http://localhost:3001/searchEvents", {
            method: "GET",
            headers: h,
        });

        if (!response.ok) {
            throw new Error("Erro ao carregar eventos.");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro na busca dos eventos:", error);
        return [];
    }
}

async function renderEventsByCategory(category) {  
    const container = document.getElementById("events-container");
    container.innerHTML = ""; 

    let events = [];
    try {
       
        events = await searchEvents(category); // Busca eventos pelo termo

        // Verifica se há eventos retornados
        if (events.length === 0) {
            container.innerHTML = `<p class='text-center'>${action === "approved" ? "Nenhum evento aprovado disponível." : "Nenhum evento encontrado para a busca."}</p>`;
            return;
        }

        // Renderiza os cartões de eventos
        events.forEach((event) => {
            const eventCard = document.createElement("div");
            eventCard.className = "col-md-4 mb-4";

            eventCard.innerHTML = `
                <div class="card p-3 shadow-sm">
                    <h3>${event.EVENT_TITLE}</h3>
                    <p><strong>Descrição:</strong> ${event.EVENT_DESCRIPTION}</p>
                    <p><strong>Data de Início:</strong> ${event.EVENTSTARTDATE}</p>
                    <p><strong>Data de Fim:</strong> ${event.EVENTFINALDATE}</p>
                    <p><strong>Data do evento:</strong> ${event.EVENTDATE}</p>
                    <p><strong>Categoria:</strong> ${event.CATEGORY}</p>
                    <button class="btn-warning bet-btn" data-id="${event.EVENT_ID}" data-title="${event.EVENT_TITLE}">
                        Apostar
                    </button>
                    <p style="font-size: 10px;">Código do evento: ${event.EVENT_ID}</p>
                </div>
            `;
            container.appendChild(eventCard);
        });

        // Adiciona os eventos de clique para abrir o modal de aposta
        document.querySelectorAll(".bet-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                const eventId = e.target.getAttribute("data-id");
                const eventTitle = e.target.getAttribute("data-title");

                document.getElementById("eventName").value = eventTitle;
                document.getElementById("betForm").dataset.eventId = eventId;

                const modal = new bootstrap.Modal(document.getElementById("betModal"));
                modal.show();
            });
        });
    } catch (error) {
        console.error("Erro na renderização dos eventos:", error);
        container.innerHTML = `<p class='text-center'>Erro ao carregar eventos.</p>`;
    }
}

function getToken() {
    return localStorage.getItem("authToken"); // Supondo que o token é armazenado no localStorage
}

async function getWallet() {
    const token = getToken();
    if (!token) {
        alert("Você precisa estar logado!");
        window.location.href = "../pages/signIn.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:3001/getWallet", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
        });

        if (response.ok) {
            const saldo = await response.text();
            document.getElementById("wallet").textContent = saldo;
        } else {
            document.getElementById("wallet").textContent = "R$ 0.00";
        }
    } catch (error) {
        console.error(error);
        document.getElementById("wallet").textContent = "Erro ao carregar.";
    }
}

window.onload = () => {
    getWallet();
};

function verificarUsuario(token) {
    try {
        // Decodificar o token (exemplo: se for um JWT)
        const payloadBase64 = token.split('.')[1]; // Pega o payload do JWT
        const payloadDecoded = atob(payloadBase64); // Decodifica de Base64
        const userData = JSON.parse(payloadDecoded); // Converte para objeto JSON

        // Verificar se o usertype é newPlayer
        if (userData.usertype === 'NEWPLAYER') {
            const modal = new bootstrap.Modal(document.getElementById('buyCreditsModal'));
            modal.show();
        }
    } catch (error) {
        console.error("Erro ao verificar o token:", error);
    }
}

// Exemplo de uso:
// Substitua "seuTokenAqui" pelo token do usuário
const token = localStorage.getItem('token'); // Recupera o token armazenado (se existir)
if (token) {
    verificarUsuario(token);
}
