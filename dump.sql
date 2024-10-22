DROP TABLE ACCOUNTS;

CREATE TABLE ACCOUNTS (
    id INT PRIMARY KEY,       -- Identificador único do usuário
    complete_name VARCHAR(100) NOT NULL,  -- Nome do usuário
    email VARCHAR(100) UNIQUE NOT NULL, -- Email, deve ser único
    password VARCHAR(255) NOT NULL, -- Senha do usuário
    birthday_date VARCHAR(10) NOT NULL -- Data de anivesário
);

CREATE SEQUENCE SEQ_ACCOUNTS START WITH 1 INCREMENT BY 1;

INSERT INTO ACCOUNTS (ID, COMPLETE_NAME, EMAIL, PASSWORD, BIRTHDAY_DATE
) VALUES (
    SEQ_ACCOUNTS.NEXTVAL,
    'Felipe Corso Pretoni',
    'felipepretoni@gmail.com',
    '123felipe',
    '05/01/2006'
);

commit;