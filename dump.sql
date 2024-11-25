DROP TABLE ACCOUNTS;
DROP SEQUENCE SEQ_ACCOUNTS;

CREATE TABLE ACCOUNTS
(
    id INT PRIMARY KEY,
    complete_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    birthday_date VARCHAR(10) NOT NULL,
    user_type VARCHAR(9),
    balance DECIMAL,
    token VARCHAR2(10)
);

CREATE SEQUENCE SEQ_ACCOUNTS START WITH 1 INCREMENT BY 1;

INSERT INTO ACCOUNTS
    (ID, COMPLETE_NAME, EMAIL, PASSWORD, BIRTHDAY_DATE, USER_TYPE, BALANCE
    )
VALUES
    (
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

CREATE TABLE EVENTS
(
    event_id INT PRIMARY KEY,
    event_title VARCHAR(50),
    event_description VARCHAR(150),
    eventStartDate VARCHAR(10),
    eventFinalDate VARCHAR(10),
    event_status VARCHAR(20),
    verdict VARCHAR(3),
    amount_wins DECIMAL,
    amount_loses DECIMAL,
    category VARCHAR(50),
    FK_ACCOUNT_ID INT,
    FOREIGN KEY (FK_ACCOUNT_ID) REFERENCES ACCOUNTS(ID)
);

CREATE SEQUENCE SEQ_EVENTS START WITH 1 INCREMENT BY 1;

INSERT INTO EVENTS
    (
    event_id,
    event_title,
    event_description,
    eventStartDate,
    eventFinalDate,
    event_status,
    category,
    FK_ACCOUNT_ID
    
    )
VALUES
    (
        SEQ_EVENTS.NEXTVAL,
        'Evento de Teste',
        'Evento de teste para a aplicação',
        '01/01/2021',
        '01/01/2021',
        'Pendente',
        'Categoria Teste',
        1
)
commit;

DROP TABLE BETS;
DROP SEQUENCE SEQ_BETS;

CREATE SEQUENCE SEQ_BETS START WITH 1 INCREMENT BY 1;

CREATE TABLE BETS
(
    bet_id INT PRIMARY KEY,
    bet_value DECIMAL ,
    bet_option VARCHAR(10) NOT NULL,
    FK_ACCOUNT_EMAIL VARCHAR2(100) NOT NULL,
    FK_EVENT_ID INT NOT NULL,
    user_proportion DECIMAL,
    FOREIGN KEY (FK_ACCOUNT_EMAIL) REFERENCES ACCOUNTS(email),
    FOREIGN KEY (FK_EVENT_ID) REFERENCES EVENTS(event_id)
);

INSERT INTO BETS
    (
    bet_id,
    bet_value,
    bet_option,
    FK_ACCOUNT_EMAIL,
    FK_EVENT_ID
    )
VALUES
    (
        SEQ_BETS.NEXTVAL,
        100,
        'SIM',
        'Mu0',
        1
);

commit;
    