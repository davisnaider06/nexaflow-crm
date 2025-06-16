// POST /clientes
app.post('/clientes', async (req, res) => {
  const { nome, email, telefone } = req.body;
  if (!nome) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  try {
    const cliente = await prisma.cliente.create({
      data: { nome, email, telefone }
    });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});


// GET /clientes
app.get('/clientes', async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});


// GET /clientes/:id/historico
app.get('/clientes/:id/historico', async (req, res) => {
  const { id } = req.params;
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: parseInt(id) },
      include: {
        atendimentos: {
          include: {
            funcionario: true
          },
          orderBy: {
            criadoEm: 'desc'
          }
        }
      }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar histórico do cliente' });
  }
});
