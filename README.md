# Atividade 2 de Laboratório de Engenharia de Software

# 1) Pré-requisitos
- Python 3.10+ (WSL2 normalmente tem)
- Git
- Node LTS (22.x) para o Prisma Python funcionar direito

# 1.1) Instalar Node 22 LTS com nvm (recomendado)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

source ~/.bashrc

nvm install 22

nvm use 22

node -v   # deve mostrar v22.x
```

# 2) Clonar o repositório e entrar na pasta
```bash
git clone https://github.com/Solano-Nascimento/LabSoftAtv2.git

cd backend
```

# 3) Criar e ativar o ambiente virtual Python

```bash
python3 -m venv .venv # ou python (sem o 3), dependendo da sua versão instalada

source .venv/bin/activate # .\venv\scripts\activate se for Windows
```


# 4) Instalar dependências Python
Após ativar o ambiente python, você deve instalar todas as dependências necessárias para o projeto:

```bash
pip install -r requirements.txt
```


# 5) Variáveis de ambiente (.env)
Se não existir, crie um arquivo .env na raiz com:

```bash
cp .env.example .env
```

Coloque as credenciais do banco de dados utilizado, que, para esse projeto, já foi disponilizado no .env. **Não compartilhe essas credenciais**

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require"
```
# 6) (Apenas se for a 1ª vez) Inicializar Prisma/schemas
Se o projeto já tem a pasta prisma/ e schema.prisma, pule para o passo 7.

```bash
python3 -m prisma init # isso cria prisma/schema.prisma
```

# 7) Gerar o cliente Prisma e aplicar migrações 

Garanta que o Node 22 está ativo neste shell

```bash
python3 -m prisma db pull

python3 -m prisma generate
```


# 7.1) Caso tenha usado Node 23 anteriormente e esteja com erro estranho,

Limpe o cache do Prisma Python e gere de novo:

```bash
rm -rf ~/.cache/prisma-python

python -m prisma generate
```

# 8) Executar a API

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Acesse:
- http://localhost:8000
- http://localhost:8000/docs

# 9) Faça requisições

No link `http://localhost:8000/docs` citado acima é possível realizar as requisições de listar livros, criar livros, obter um livro, atualizar um livro por inteiro, ataulizar uma parte de um livro e deletar um livro.

 É possível visualizar abaixo os inputs e outputs que são esperados pela aplicação. Para testar um método HTTP, basta clicar em `try it out` em um dos métodos, preencher as informações conforme o schema esperado e clicar em `execute`.

# Dicas:
- Sempre rode comandos do Prisma via "python -m prisma ..." para garantir que está usando o CLI do Prisma Python do seu venv.
- Se trocar de terminal, rode "nvm use 22" antes de "python -m prisma ..."
- Se aparecer erro "(0 , gEe.isError) is not a function", você provavelmente está com Node 23 ativo. Use "nvm use 22" e repita "python -m prisma generate".
