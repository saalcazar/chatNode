Chat desarrollado con NODE JS

POSTGRES
CREATE TABLE messages (
	id smallserial,
	content text,
	user_name varchar(250) NOT NULL,
	CONSTRAINT messages_pk PRIMARY KEY (id)
)

CREATE OR REPLACE FUNCTION create_chat (_content text, _user_name character varying)
RETURNS TABLE (id smallint)
AS $$ 
DECLARE
    new_id smallint;
BEGIN
    INSERT INTO messages (content, user_name)
    VALUES (_content, _user_name)
    RETURNING messages.id INTO new_id;

    RETURN QUERY SELECT new_id;
    
EXCEPTION
    WHEN others THEN
        RAISE EXCEPTION 'No fue posible mostrar el id';
END
$$
LANGUAGE plpgSQL;