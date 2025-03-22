# Management System API

Sistema backend desenvolvido com NestJS e Prisma para gerenciamento de usuários, produtos e pedidos.

---

## 🚀 Tecnologias

- [NestJS](https://nestjs.com/) - framework Node.js
- [Prisma ORM](https://www.prisma.io/)
- PostgreSQL como banco de dados
- JWT para autenticação
- Testes com Jest
- Swagger para documentação da API
- Docker para ambiente conteinerizado

---

## 📚 Instruções de uso

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```

### 2. Configure o `.env`
Crie um arquivo `.env` com:

```env
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/management
JWT_SECRET=my-secret
```

### 3. Inicie com Docker

```bash
docker-compose up --build
```

- A API estará em: `http://localhost:3000`
- O Swagger: `http://localhost:3000/api`
- O PgAdmin: `http://localhost:8080`
  - Login: admin@admin.com / admin

### 4. Banco de dados
```bash
yarn prisma migrate dev
```

---

## 🔧 Comandos

```bash
# Instalar dependências
yarn install

# Dev
yarn start:dev

# Build
yarn build

# Start Prod
yarn start:prod

# Testes unitários
yarn test
```

---

## 🔐 Autenticação

- A autenticação é feita via JWT (Bearer Token)
- Após login, use o `access_token` no Swagger clicando em "Authorize"

---

## 🎓 Criando usuário para testes

### Criar conta USER (padrão):
```http
POST /auth/register
{
  "username": "user1",
  "password": "123456"
}
```

### Criar conta ADMIN:
```http
POST /auth/register
{
  "username": "admin",
  "password": "123456",
  "role": "ADMIN"
}
```

### Obter token:
```http
POST /auth/login
{
  "username": "admin",
  "password": "123456"
}
```

Resposta:
```json
{
  "access_token": "..."
}
```

---

## 📊 Rotas protegidas

| Rota | Metodo | Auth | Roles |
|------|--------|------|-------|
| /products | GET | ✅ | ADMIN, USER |
| /products/:id | DELETE | ✅ | ADMIN |
| /orders | POST | ✅ | USER |

Use o Swagger para testar:

```
http://localhost:3000/api
```

---

## 🔒 Princípios SOLID

- **S**: `ProductsService` tem apenas uma responsabilidade
- **O**: `ProductsRepository` pode ser substituído sem mudar o serviço
- **L**: Interfaces dos repositórios seguem contrato esperado
- **I**: Cada serviço/guard lida apenas com sua responsabilidade
- **D**: Inversão de dependência com DI do NestJS

---

## 🤦‍♂️ Problemas comuns

### "Cannot find module 'dist/main'"
> Solução:
- Confirme se o `RUN yarn build` está gerando `dist/`
- `CMD` no Dockerfile deve ser:
```Dockerfile
CMD ["node", "dist/main"]
```

### "OrderStatus/Product/User not found from @prisma/client"
> Solução:
- Rode: `yarn prisma generate`
- Certifique-se que está usando a versão gerada após `migrate`

---

## 🚀 Pronto!

Sistema funcional e preparado para testes, expansão e deploy.
Para dúvidas ou melhorias, sinta-se livre para colaborar ✨

