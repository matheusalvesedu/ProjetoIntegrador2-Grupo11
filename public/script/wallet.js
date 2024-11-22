function updateWithdrawFields() {
    const method = document.getElementById('withdrawMethod').value;
    const amountBox = document.getElementById('amountBox');

    // Referências aos contêineres dos campos
    const pixFields = document.getElementById('pixFields');
    const bankFields = document.getElementById('bankFields');

    // Esconde todos os campos por padrão
    [pixFields, bankFields].forEach(field => field.classList.add('d-none'));

    // Exibe os campos com base no método selecionado
    if (method === 'pix') {
        pixFields.classList.remove('d-none');
        amountBox.style.display = "block";
        
    } else if (method === 'bank') {
        bankFields.classList.remove('d-none');
    }
}

function showMessage(messageContent) {
    const messageBox = document.getElementById('messageBox');
    const message = document.getElementById('message');

    if (!messageBox || !message) {
        console.error("Elementos de mensagem não encontrados.");
        return;
    }

    // Exibe a mensagem
    message.textContent = messageContent;
    messageBox.style.display = "block";
}

function validateAmount(amount) {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        showMessage('O valor deve ser um número maior que zero.');
        return false;
    }
    return true;
}

function validatePixFields() {
    const pixKey = document.getElementById('pixKey').value;
    if (!pixKey) {
        showMessage('A chave PIX é obrigatória.');
        return false;
    }
    return true;
}

function validateBankFields() {
    const bank = document.getElementById('bank').value;
    const agency = document.getElementById('agency').value;
    const account = document.getElementById('account').value;

    if (!bank) {
        showMessage('O banco é obrigatório.');
        return false;
    }
    if (!agency) {
        showMessage('A agência é obrigatória.');
        return false;
    }
    if (!account) {
        showMessage('A conta é obrigatória.');
        return false;
    }
    return true;
}

async function withdrawHandle(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const method = document.getElementById('withdrawMethod').value;
    const amount = document.getElementById('amount').value.trim();

    // Validações gerais
    if (!validateAmount(amount)) return;
    if (method === 'pix' && !validatePixFields()) return;
    if (method === 'bank' && !validateBankFields()) return;
    
    try {
        // Configura os cabeçalhos com email e senha
        const reqtHeaders = new Headers();
        reqtHeaders.append("email", email);
        reqtHeaders.append("saque", amount);

        // Faz a requisição para o backend
        const response = await fetch("http://localhost:3001/withdrawFunds", {
            method: "POST",
            headers: reqtHeaders,
        });
  
        if (response.ok) {
            const data = await response.text();
            showMessage(data); // Exibe a mensagem de sucesso (opcional)
        } else if (response.status === 400) {
            const data = await response.text();
            showMessage(data);
        }  else {
            showMessage("Erro interno no servidor. Tente novamente mais tarde.");
        }
    } catch (error) {
        console.error("Erro na autenticação:", error);
        showMessage("Erro de conexão. Verifique sua internet.");
    }
}
