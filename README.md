# API de Serviços

Esta é uma API baseada em NestJS para uma plataforma de agendamento de serviços. Inclui funcionalidades como autenticação de usuários (com papéis para clientes, prestadores de serviço e administradores), gerenciamento de serviços, agendamento de disponibilidade, reservas, pagamentos com Stripe, avaliações de usuários e integração com o Google Calendar. O projeto usa Prisma como ORM e é escrito em TypeScript.

## Funcionalidades

-   **Autenticação de Usuário**: Registro e login seguros de usuário com autenticação baseada em JWT.
-   **Controle de Acesso Baseado em Papel**: Diferentes papéis (Cliente, Prestador, Admin) com diferentes permissões.
-   **Gerenciamento de Serviços**: Prestadores de serviço podem criar, atualizar e gerenciar seus serviços.
-   **Agendamento de Disponibilidade**: Prestadores de serviço podem definir sua disponibilidade para agendamentos.
-   **Sistema de Agendamento**: Clientes podem agendar serviços de prestadores com base em sua disponibilidade.
-   **Integração de Pagamento**: Processamento seguro de pagamentos com Stripe.
-   **Sistema de Avaliação**: Clientes podem deixar avaliações para os serviços que agendaram.
-   **Integração com Google Calendar**: Crie e gerencie eventos do Google Calendar para agendamentos automaticamente.
-   **Notificações por Email**: Envio de notificações por email para eventos como confirmação de agendamento e redefinição de senha.

## Tecnologias Utilizadas

-   **Framework**: [NestJS](https://nestjs.com/)
-   **ORM de Banco de Dados**: [Prisma](https://www.prisma.io/)
-   **Banco de Dados**: [SQLite](https://www.sqlite.org/index.html) (pode ser alterado em `prisma/schema.prisma`)
-   **Autenticação**: [JWT](https://jwt.io/)
-   **Pagamento**: [Stripe](https://stripe.com/)
-   **Especificação da API**: [Swagger](https://swagger.io/)
-   **Validação**: [class-validator](https://github.com/typestack/class-validator), [class-transformer](https://github.com/typestack/class-transformer)
-   **Email**: [Nodemailer](https://nodemailer.com/), [BullMQ](https://bullmq.io/)
-   **Agenda**: [API do Google Calendar](https://developers.google.com/calendar)

## Começando

Para obter uma cópia local em execução, siga estes passos simples.

### Pré-requisitos

-   [Node.js](https://nodejs.org/en/) (v18 ou superior)
-   [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
-   Uma instância em execução do [Redis](https://redis.io/) para o BullMQ.

### Instalação

1.  Clone o repositório
    ```sh
    git clone https://github.com/seu_usuario/api-servicos.git
    ```
2.  Instale os pacotes NPM
    ```sh
    npm install
    ```
3.  Configure suas variáveis de ambiente criando um arquivo `.env` no diretório raiz. Você pode usar o arquivo `.env.example` como modelo.
    ```env
    DATABASE_URL="file:./dev.db"
    
    # JWT
    JWT_SECRET=seu_segredo_jwt
    JWT_EXPIRATION_TIME=3600
    
    # Google
    GOOGLE_CLIENT_ID=seu_id_cliente_google
    GOOGLE_CLIENT_SECRET=seu_segredo_cliente_google
    GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
    
    # Stripe
    STRIPE_SECRET_KEY=sua_chave_secreta_stripe
    STRIPE_WEBHOOK_SECRET=seu_segredo_webhook_stripe
    
    # Email
    MAIL_HOST=smtp.exemplo.com
    MAIL_USER=usuario@exemplo.com
    MAIL_PASS=sua_senha
    MAIL_FROM=usuario@exemplo.com
    
    # API
    PORT=3000
    ```
4.  Aplique as migrações do banco de dados
    ```sh
    npx prisma migrate dev
    ```

### Executando a Aplicação

```sh
# desenvolvimento
npm run start:dev

# modo de observação
npm run start:watch

# modo de produção
npm run start:prod
```

## Endpoints da API

A documentação da API é gerada automaticamente pelo Swagger e pode ser acessada em `http://localhost:{PORT}/docs`.

Aqui está um resumo dos endpoints disponíveis:

-   **Auth**: `/auth/register`, `/auth/login`, `/auth/refresh-token`, `/auth/google`
-   **Users**: `/users`
-   **Services**: `/services`
-   **Availability**: `/availability`
-   **Booking**: `/booking`
-   **Payment**: `/payment`
-   **Review**: `/review`
-   **Google Calendar**: `/google-calendar`
-   **Webhooks**: `/webhooks/stripe`

## Esquema do Banco de Dados

O esquema do banco de dados é definido no arquivo `prisma/schema.prisma`. Ele consiste nos seguintes modelos:

-   `User`
-   `Service`
-   `Availability`
-   `Booking`
-   `Payment`
-   `Review`

Para mais detalhes, consulte o arquivo `prisma/schema.prisma`.