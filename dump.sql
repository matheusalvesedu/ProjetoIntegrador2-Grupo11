DROP TABLE users;

CREATE TABLE users (
    id INT PRIMARY KEY,       -- Identificador único do usuário
    name VARCHAR(100) NOT NULL,  -- Nome do usuário
    email VARCHAR(100) UNIQUE NOT NULL, -- Email, deve ser único
    password VARCHAR(255) NOT NULL,    -- Senha criptografada
    birthdate DATE NOT NULL           -- Data de nascimento
);

-- CREATE SEQUENCE SEQ_ACCOUNTS START WITH 1 INCREMENT BY 1;

-- INSERT INTO ACCOUNTS (ID, COMPLETE_NAME, EMAIL, PASSWORD
-- ) VALUES (
--     SEQ_ACCOUNTS.NEXTVAL,
--     'Felipe Pretoni',
--     'felipe@felipe.com',
--     '123felipe'
-- )

-- commit;