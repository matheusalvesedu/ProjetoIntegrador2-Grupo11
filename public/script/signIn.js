//exibir a div com o erro.
function showErrorMessage(messageContent) {
    //atribuir o texto da mensagem no paragrafo
    document.getElementById("message").innerHTML = messageContent;
    var divMb = document.getElementById("messageBox");
    divMb.style.display = "block";
}

//funcao que oculta a div
function cleanError() {
    var divMb = document.getElementById("messageBox");
    divMb.style.display = "none";
}

//verifica se o formulario esta válido(preenchido corretamente)
// se estiver retorna true, senao, false
function isValid(email, password) {
    var valid = false;
    if (email.length > 0 && password.length > 0) {
        valid = true;
    } else if (email.length == 0 && password.length == 0) {
        showErrorMessage("Please type your email and password");
    } else if (email.length == 0) {
        showErrorMessage("Please fill your email field.");
    } else {
        showErrorMessage("Please fill your password field.");
    }   
    return valid;
}

async function performSignIn() {

    var email = document.getElementById("fieldEmail").value;
    var password = document.getElementById("fieldPassword").value;
    //remover eventuais espaços em brancos do email e da senha(antes e depois).

    email = email.trim();
    password = password.trim();

    if (isValid(email, password)) {

        const reqtHeaders = new Headers();

        reqtHeaders.append("Content-Type", "text/plain"); // Corrigido para "Content-Type"
        reqtHeaders.append("email", email);
        reqtHeaders.append("password", password);

        //prosseguir com a chamada do backend
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: reqtHeaders
        });

        // Tratamento da resposta
        if (response.ok) {
            
        }
    }
}