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

// Função para renderizar eventos
async function renderEvents() {
    const container = document.getElementById("events-container");
    container.innerHTML = ""; // Limpa o container

    const events = await getEvents(); // Busca os eventos aprovados

    if (events.length === 0) {
        container.innerHTML = "<p class='text-center'>Nenhum evento aprovado disponível.</p>";
        return;
    }

    events.forEach((event) => {
        const eventCard = document.createElement("div");
        eventCard.className = "col-md-4 mb-4";

        eventCard.innerHTML = `
            <div class="card p-3 shadow-sm">
                <h3>${event.EVENT_TITLE}</h3>
                <p><strong>Descrição:</strong> ${event.EVENT_DESCRIPTION}</p>
                <p><strong>Data de Início:</strong> ${event.EVENTSTARTDATE}</p>
                <p><strong>Data de Fim:</strong> ${event.EVENTFINALDATE}</p>
                <button class="btn btn-warning evaluate-btn" data-id="${event.EVENT_ID}" data-title="${event.EVENT_TITLE}">
                    Apostar
                </button>
            </div>
        `;

        container.appendChild(eventCard);
    });

    // Adiciona os eventos de clique para abrir o modal
    document.querySelectorAll(".evaluate-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
            const eventId = e.target.getAttribute("data-id");
            const eventTitle = e.target.getAttribute("data-title");

            // Atualiza o modal com os detalhes do evento
            document.getElementById("evaluationModalLabel").textContent = `Avaliação do Evento: ${eventTitle}`;
            document.getElementById("evaluationComment").value = "";

            // Mostra o modal
            const modal = new bootstrap.Modal(document.getElementById("evaluationModal"));
            modal.show();

            // Configura os botões do modal
            const approveButton = document.getElementById("approveButton");
            const rejectButton = document.getElementById("rejectButton");

            approveButton.onclick = () => handleEvaluation(eventId, "Aprovado", modal);
            rejectButton.onclick = () => handleEvaluation(eventId, "Rejeitado", modal);
        });
    });
}

// Função para avaliar eventos
async function handleEvaluation(eventId, status, modal) {
    const comment = document.getElementById("evaluationComment").value.trim();

    if (!comment) {
        alert("Por favor, adicione um comentário antes de enviar a avaliação.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3001/evaluateEvent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                event_id: eventId,
                event_status: status,
                message: comment,
            }),
        });

        if (!response.ok) {
            throw new Error("Erro ao enviar avaliação.");
        }

        alert(`Evento avaliado como '${status}' com sucesso!`);
        modal.hide();
        renderEvents(); // Atualiza os eventos
    } catch (error) {
        console.error("Erro ao avaliar o evento:", error);
        alert("Erro ao enviar a avaliação. Tente novamente.");
    }
}

// Inicializa a página
document.addEventListener("DOMContentLoaded", () => {
    renderEvents();
});
