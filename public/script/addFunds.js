async function addFunds(event) {
    event.preventDefault(); // Evita o recarregamento da página ao enviar o formulário

    const email = document.getElementById("fieldEmail").value.trim();
    const funds = document.getElementById("fieldFunds").value.trim();

    if (!isValid(email, funds)) {
        return;
    }

    try {
        // Configura os cabeçalhos com email e valor do depósito
        const reqtHeaders = new Headers();
        reqtHeaders.append("Content-Type", "application/json");
        reqtHeaders.append("email", email);
        reqtHeaders.append("funds", funds);
        // Faz a requisição para o backend
        const response = await fetch("http://localhost:3001/addFunds", {
            method: "POST",
            headers: reqtHeaders,
        });

        if (response.ok) {
            const data = await response.text();
            showMessage(data);
        } else if (response.status === 400) {
            const data = await response.text();
            showMessage(data);
        } else {
            showMessage("Erro interno no servidor. Tente novamente mais tarde.");
        }
    } catch (error) {
        console.error("Erro ao adicionar créditos:", error);
        showMessage("Erro de conexão. Verifique sua internet.");
    }
}

function isValid(email, funds) {
    if (!email) {
        showMessage("O campo de email é obrigatório.");
        return false;
    }
    if (!funds || isNaN(funds) || Number(funds) <= 0) {
        showMessage("O campo de valor é obrigatório e deve ser um número positivo.");
        return false;
    }
    cleanError();
    return true;
}

function showMessage(messageContent) {
    const messageBox = document.getElementById("messageBox");
    const message = document.getElementById("message");

    if (!messageBox || !message) {
        console.error("Elementos de mensagem não encontrados.");
        return;
    }

    message.textContent = messageContent;
    messageBox.style.display = "block";
}

function cleanError() {
    const messageBox = document.getElementById("messageBox");
    if (messageBox) {
        messageBox.style.display = "none";
        messageBox.style.backgroundColor = "red";
    }
}