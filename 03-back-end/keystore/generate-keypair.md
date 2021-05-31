# Generate a pair of RSSA keys (private and public)

## OpenSSL
openssl req -newkey rsa:2048 -new -nodes -keyout name.private -out name.csr
openssl x509 -req -days 356 -in name.csr -signkey name.private -out name.public

openssl req -newkey rsa:2048 -new -nodes -keyout administrator-auth.private -out administrator-auth.csr
openssl x509 -req -days 356 -in administrator-auth.csr -signkey administrator-auth.private -out administrator-auth.public

openssl req -newkey rsa:2048 -new -nodes -keyout administrator-auth-refresh.private -out administrator-auth-refresh.csr
openssl x509 -req -days 356 -in administrator-auth-refresh.csr -signkey administrator-auth-refresh.private -out administrator-auth-refresh.public

openssl req -newkey rsa:2048 -new -nodes -keyout user-refresh.private -out user-refresh.csr
openssl x509 -req -days 356 -in user-refresh.csr -signkey user-refresh.private -out user-refresh.public

openssl req -newkey rsa:2048 -new -nodes -keyout user-auth.private -out user-auth.csr
openssl x509 -req -days 356 -in user-auth.csr -signkey user-auth.private -out user-auth.public
