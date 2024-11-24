// Função para obter eventos
async function getEvents() {
    const event_status = "pendente";

    try {
        const response = await fetch("http://localhost:3001/getEvents", {
            method: "GET",
            headers: {
                "status_event": event_status
            }
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data;

    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
    }
}

// Função para renderizar eventos
async function renderEvents() {
    const container = document.getElementById("events-container");
    container.innerHTML = ""; // Limpa o container antes de renderizar os eventos
    const events = await getEvents();

    if (events) {
        events.forEach((event) => {
            // Cria o card de evento
            const eventCard = document.createElement("div");
            eventCard.className = "event-card";

            // Conteúdo do card
            eventCard.innerHTML = `
                <h3>${event.EVENT_TITLE}</h3>
                <p><strong>Descrição:</strong> ${event.EVENT_DESCRIPTION}</p>
                <p><strong>Data de Início:</strong> ${event.EVENTSTARTDATE}</p>
                <p><strong>Data de Fim:</strong> ${event.EVENTFINALDATE}</p>
                <p><strong>Status:</strong> ${event.EVENT_STATUS}</p>
                <p><strong>Veredito:</strong> ${event.VERDICT}</p>
                <p><strong>Ganhos:</strong> ${event.AMOUNT_WINS ? `R$ ${event.AMOUNT_WINS}` : "Nenhum"}</p>
                <p><strong>Perdas:</strong> ${event.AMOUNT_LOSES ? `R$ ${event.AMOUNT_LOSES}` : "Nenhuma"}</p>
                <button class="btn btn-warning evaluate-btn" data-id="${event.EVENT_ID}" data-title="${event.EVENT_TITLE}">
                Avaliar
                </button>`;

            // Adiciona o card ao container
            container.appendChild(eventCard);
        });

        // Sincroniza os botões "Avaliar" com a abertura do modal
        document.querySelectorAll(".evaluate-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const eventId = e.target.getAttribute("data-id");
                const eventTitle = e.target.getAttribute("data-title");

                // Atualiza o modal com informações do evento
                document.getElementById("evaluationModalLabel").textContent = `Avaliação do Evento: ${eventTitle}`;
                document.getElementById("evaluationComment").value = "";

                // Mostra o modal
                const modal = new bootstrap.Modal(document.getElementById("evaluationModal"));
                modal.show();

                // Remove event listeners anteriores dos botões do modal
                const approveButton = document.getElementById("approveButton");
                const rejectButton = document.getElementById("rejectButton");

                // Remove handlers existentes para evitar duplicidade
                approveButton.onclick = null;
                rejectButton.onclick = null;

                // Adiciona os novos event listeners com o ID do evento
                approveButton.onclick = () => handleEvaluation(eventId, "Aprovado", modal);
                rejectButton.onclick = () => handleEvaluation(eventId, "Rejeitado", modal);
            });
        });
    }
}

// Função para avaliar o evento
async function handleEvaluation(eventId, status, modal) {
    const comment = document.getElementById("evaluationComment").value;

    if (!comment.trim()) {
        alert("Por favor, adicione um comentário antes de avaliar.");
        return;
    }

    const h = new Headers();
    h.append("Content-Type", "application/json");
    h.append("event_id", eventId);
    h.append("event_status", status);
    h.append("message", comment);
3001
    try {
        const response = await fetch("http://localhost:3001/evaluateEvent", {
            method: "POST",
            headers: h
        });

        if (response.ok) {
            const result = await response.json();
            console.log(result.json);
            modal.hide();
            // Atualiza a interface
            alert(`Evento avaliado como '${status}' com sucesso.`);
            renderEvents(); // Recarrega a lista de eventos

        }

    } catch (error) {
        console.error("Erro ao avaliar o evento:", error);
        alert("Ocorreu um erro ao enviar a avaliação. Por favor, tente novamente.");
    }
}

// Executa a função ao carregar a página
window.onload = renderEvents;
