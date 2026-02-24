npm run start reset

npm run start register maciek

npm run start login maciek

npm run start users

npm run start agg

npm run start addfeed


SQL
sudo -u postgres  psql
\c gator

\l        -- lista baz danych
\dt       -- tabele

gator=# SELECT * FROM feeds;
 id | created_at | updated_at | name | url | user_id 
----+------------+------------+------+-----+---------
(0 rows)
