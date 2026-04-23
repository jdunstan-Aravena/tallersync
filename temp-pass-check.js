const bcrypt = require('bcryptjs')
const hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeCt1BbAh/LlGHqZe'

bcrypt.compare('Admin1234!', hash).then(r => console.log('Admin password ok?', r))
bcrypt.compare('Tecnico123!', hash).then(r => console.log('Tecnico password ok?', r))
