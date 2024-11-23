async function performSignIn(event) {
    event.preventDefault(); // Evita o recarregamento da página ao enviar o formulário

    const email = document.getElementById("fieldEmail").value.trim();
    const password = document.getElementById("fieldPassword").value.trim();

    if (!isValid(email, password)) {
        return;
    }

    try {
        // Configura os cabeçalhos com email e senha
        const reqtHeaders = new Headers();
        reqtHeaders.append("email", email);
        reqtHeaders.append("password", password);

        // Faz a requisição para o backend
        const response = await fetch("http://localhost:3001/login", {
            method: "POST",
            headers: reqtHeaders,
        });

        
        if (response.ok) {
            const data = await response.json();
            const token = data.token;
            localStorage.setItem("authToken", token);
            window.location.href = "../index.html";

        } else if (response.status === 401) {
            const data = await response.json();
            showMessege(data.message);
        }  else {
            showMessege("Erro interno no servidor. Tente novamente mais tarde.");
        }
    } catch (error) {
        console.error("Erro na autenticação:", error);
        showMessege("Erro de conexão. Verifique sua internet.");
    }
}

function isValid(email, password) {
    if (!email) {
        showMessege("O campo de email é obrigatório.");
        return false;
    }
    if (!password) {
        showMessege("O campo de senha é obrigatório.");
        return false;
    }
    cleanError();
    return true;
}

function showMessege(messageContent) {
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
    }
}

