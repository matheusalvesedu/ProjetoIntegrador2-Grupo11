function updateWithdrawFields() {
    const method = document.getElementById('withdrawMethod').value;
    const amountBox = document.getElementById('amountBox');


    // Referências aos contêineres dos campos
    const pixFields = document.getElementById('pixFields');
    const bankFields = document.getElementById('bankFields');
    const amountField = document.getElementById('amountField');
    // Esconde todos os campos por padrão
    [pixFields, bankFields].forEach(field => field.classList.add('d-none'));
    
    // Exibe os campos com base no método selecionado

    amountField.classList.remove('d-none');

    if (method === 'pix') {
        pixFields.classList.remove('d-none');
        amountBox.style.display = "block";
        
    } else if (method === 'bank') {
        bankFields.classList.remove('d-none');
    }

    else{
        amountField.classList.add('d-none');
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

    const token = localStorage.getItem('authToken');
    const method = document.getElementById('withdrawMethod').value;
    const amount = document.getElementById('amount').value.trim();

    // Validações gerais
    if (!validateAmount(amount)) return;
    if (method === 'pix' && !validatePixFields()) return;
    if (method === 'bank' && !validateBankFields()) return;
    
    try {
        // Configura os cabeçalhos com email e senha
        const reqtHeaders = new Headers();
        reqtHeaders.append("Authorization", `Bearer ${token}`);
        reqtHeaders.append("saque", amount);

        // Faz a requisição para o backend
        const response = await fetch("http://localhost:3001/withdrawFunds", {
            method: "POST",
            headers: reqtHeaders,
        });
  
        if (response.ok) {
            const data = await response.json();
            showMessage(data.message); // Exibe a mensagem de sucesso (opcional)
        } else if (response.status === 400) {
            const data = await response.json();
            showMessage(data.messa);
        }  else {
            showMessage("Erro interno no servidor. Tente novamente mais tarde.");
        }
    } catch (error) {
        console.error("Erro na autenticação:", error);
        showMessage("Erro de conexão. Verifique sua internet.");
    }
    
}


async function handleAddFunds(event) {
    event.preventDefault();

    const fundsInput = document.getElementById("fundsAmount");
    const amount = parseFloat(fundsInput.value);

    if (!isNaN(amount) && amount > 0) {
        // Simula a adição de créditos (você pode fazer uma chamada para o backend aqui)
        
        try{
            const h = new Headers();
            h.append('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
            h.append('funds', amount);
            const response = await fetch('http://localhost:3001/addFunds', {
                method: 'POST',
                headers: h
            }); 
            if(response.ok)
            {
                const data = await response.json();
                alert(data.message);
                
            }

            else{
                const errorData = await response.json();
                alert(errorData.message);
            }

            const modal = bootstrap.Modal.getInstance(document.getElementById("addFundsModal"));
            modal.hide();

        }
        catch(error){
            console.error('Erro:', error);
            alert('Ocorreu um erro ao adicionar fundos. Por favor, tente novamente.');
        }     
        // Limpa o campo de entrada
        fundsInput.value = "";
    } else {
        alert("Digite um valor válido!");
    }
}
