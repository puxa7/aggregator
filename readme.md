"login", handlerLogin;
"register", handlerRegister;
"reset", handlerReset);
"users", handlerUsers);

"addfeed", handlerAddfeed); - dodaj kanał RSS
"feeds", handlerFeeds);  - wyświetl kanały RSS
"follow", handlerFollow); - łączy zalogowanego  użytkownika z Kanałem RSS (dodaje rekord do feed_folows)
"following", handlerFollowing); - wyświetl wszsytkie nazwy kanałó RSS które śledzi użytkownik

"agg", handlerAgg); - wyświetla zawartość linku https://www.wagslane.dev/index.xml

SQL
sudo -u postgres  psql
\c gator

\l        -- lista baz danych
\dt       -- tabele

gator=# SELECT * FROM feeds;
 id | created_at | updated_at | name | url | user_id 
----+------------+------------+------+-----+---------
(0 rows)

gator=# SELECT * FROM users;
                  id                  |         created_at         |         updated_at         |  name   
--------------------------------------+----------------------------+----------------------------+---------
 8fad3554-f002-48c9-a8a8-5240271e0833 | 2026-02-24 17:33:24.596977 | 2026-02-24 17:33:24.596977 | kahya
 fefce84f-b26d-4aa8-b2ca-60c8e6b863bc | 2026-02-24 17:33:26.663144 | 2026-02-24 17:33:26.663144 | holgith
 60537ab1-96a0-4486-a6ce-acd391654f0e | 2026-02-24 17:33:28.818868 | 2026-02-24 17:33:28.818868 | ballan
(3 rows)

