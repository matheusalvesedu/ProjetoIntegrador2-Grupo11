DROP TABLE ACCOUNTS;
DROP SEQUENCE SEQ_ACCOUNTS;

CREATE TABLE ACCOUNTS (
    id INT PRIMARY KEY,       -- Identificador único do usuário
    complete_name VARCHAR(100) NOT NULL,  -- Nome do usuário
    email VARCHAR(100) UNIQUE NOT NULL, -- Email, deve ser único
    password VARCHAR(255) NOT NULL, -- Senha do usuário
    birthday_date VARCHAR(10) NOT NULL, -- Data de anivesário
    user_type VARCHAR(9) -- Tipo de usuário
);


CREATE SEQUENCE SEQ_ACCOUNTS START WITH 1 INCREMENT BY 1;

INSERT INTO ACCOUNTS (ID, COMPLETE_NAME, EMAIL, PASSWORD, BIRTHDAY_DATE, USER_TYPE
) VALUES (
    SEQ_ACCOUNTS.NEXTVAL,
    'Felipe Corso Pretoni',
    'felipepretoni@gmail.com',
    '123felipe',
    '05/01/2006',
    'ADMIN'
);

commit;

CREATE TABLE EVENTS(
    id_events INT PRIMARY KEY,
    titulo VARCHAR2(50),
    descricao VARCHAR2(150),
    data_inicio VARCHAR2(10),
    data_fim VARCHAR2(10)
);