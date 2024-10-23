DROP TABLE ACCOUNTS;
DROP SEQUENCE SEQ_ACCOUNTS;

CREATE TABLE ACCOUNTS (
    id INT PRIMARY KEY,       -- Identificador único do usuário
    complete_name VARCHAR(100) NOT NULL,  -- Nome do usuário
    email VARCHAR(100) UNIQUE NOT NULL, -- Email, deve ser único
    password VARCHAR(255) NOT NULL, -- Senha do usuário
    birthday_date VARCHAR(10) NOT NULL, -- Data de anivesário
    user_type VARCHAR(9), -- Tipo de usuário
    balance DECIMAL
);


CREATE SEQUENCE SEQ_ACCOUNTS START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE SEQ_EVENTS START WITH 1 INCREMENT BY 1;

INSERT INTO ACCOUNTS (ID, COMPLETE_NAME, EMAIL, PASSWORD, BIRTHDAY_DATE, USER_TYPE, BALANCE
) VALUES (
    SEQ_ACCOUNTS.NEXTVAL,
    'Felipe Corso Pretoni',
    'felipepretoni@gmail.com',
    '123felipe',
    '05/01/2006',
    'ADMIN',
    0
);

commit;

DROP TABLE EVENTS;
DROP SEQUENCE SEQ_EVENTS;

CREATE TABLE EVENTS(
    event_id INT PRIMARY KEY,
    event_title VARCHAR(50),
    event_description VARCHAR(150),
    eventStartDate VARCHAR(10),
    eventFinalDate VARCHAR(10),
    event_status VARCHAR(20),
    FK_ACCOUNT_ID INT,
    FOREIGN KEY (FK_ACCOUNT_ID) REFERENCES ACCOUNTS(ID)
);

CREATE SEQUENCE SEQ_EVENTS START WITH 1 INCREMENT BY 1;

INSERT INTO EVENTS(
    event_id,
    event_title,
    event_description,
    eventStartDate,
    eventFinalDate,
    event_status,
    FK_ACCOUNT_ID
) VALUES (
    SEQ_EVENTS.NEXTVAL,
    'Evento de Teste',
    'Evento de teste para a aplicação',
    '01/01/2021',
    '01/01/2021',
    'Pendente',
    '1'
)

