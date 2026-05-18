# Backend de Pedidos - Site de Flores

Este backend simples salva pedidos em `pedidos.json` e oferece uma rota de produtos para consumo via API.

## Como usar

1. Abra o terminal em `Site de flores/backend`
2. Execute:

```bash
node server.js
```

3. Acesse:
- `http://localhost:3001/api/produtos`
- `http://localhost:3001/api/pedidos`

## Integração com o site

No `script.js` e em `product.js`, ajuste `BACKEND_URL` para `http://localhost:3001` se quiser salvar pedidos automaticamente antes de abrir o WhatsApp.
