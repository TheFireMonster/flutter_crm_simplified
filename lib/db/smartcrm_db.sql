CREATE TABLE usuarios (    
	id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    tipo_usuario TEXT NOT NULL CHECK (tipo_usuario IN ('usuario', 'adm')),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clientes ()
	id SERIAL PRIMARY KEY,
	cpf CHAR(11) NOT NULL,
	telefone CHAR(20) NOT NULL,
	email TEXT,
	tipo_cliente SMALLINT,
	origem_cliente SMALLINT,
):

CREATE TABLE agendamentos;
	id SERIAL PRIMARY KEY,
	
	
	
CREATE TABLE relatorios 
	id SERIAL PRIMARY KEY,
	