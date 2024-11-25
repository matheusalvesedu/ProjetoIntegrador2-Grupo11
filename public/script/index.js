// index.js

// Função para obter o token de autenticação
function getToken() {
    return localStorage.getItem("authToken");
}

// Função para carregar saldo
async function getWallet() {
    const token = getToken();
    if (!token) {
        alert("Você precisa estar logado!");
        window.location.href = "/login";
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
            document.getElementById("wallet").textContent = "Erro ao carregar.";
        }
    } catch (error) {
        console.error(error);
        document.getElementById("wallet").textContent = "Erro ao carregar.";
    }
}

// Função para buscar eventos
async function getEvents() {
    try {
        const response = await fetch("http://localhost:3001/getEvents", { method: "GET" });
        return response.ok ? await response.json() : [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Função para renderizar eventos
async function renderEvents() {
    const container = document.getElementById("events-container");
    container.innerHTML = "";
    const events = await getEvents();

    if (events.length === 0) {
        container.innerHTML = "<p class='text-center'>Nenhum evento disponível.</p>";
        return;
    }

    events.forEach((event) => {
        const eventCard = document.createElement("div");
        eventCard.className = "col-md-4";
        eventCard.innerHTML = `
            <div class="event-card">
                <h3>${event.EVENT_TITLE}</h3>
                <p>${event.EVENT_DESCRIPTION}</p>
                <p><strong>Data:</strong> ${event.EVENT_DATE}</p>
                <button class="btn btn-warning" data-id="${event.EVENT_ID}">Apostar</button>
            </div>`;
        container.appendChild(eventCard);

        // Botão para abrir modal
        eventCard.querySelector("button").addEventListener("click", () => {
            const modal = new bootstrap.Modal(document.getElementById("evaluationModal"));
            document.getElementById("confirmBetButton").onclick = () => handleBet(event.EVENT_ID);
            modal.show();
        });
    });
}

// Função para realizar aposta
async function handleBet(eventId) {
    const token = getToken();
    const betAmount = document.getElementById("betAmount").value;

    if (!betAmount || betAmount <= 0) {
        alert("Digite um valor válido.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3001/betEvent/${eventId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ betAmount }),
        });

        if (response.ok) {
            alert("Aposta realizada com sucesso!");
            renderEvents();
        } else {
            alert("Erro ao realizar a aposta.");
        }
    } catch (error) {
        console.error(error);
        alert("Erro ao realizar a aposta.");
    }
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    getWallet();
    renderEvents();
});
