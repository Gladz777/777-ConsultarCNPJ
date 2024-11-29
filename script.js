function consultarCNPJ() {
    let cnpj = document.getElementById("cnpj").value;
    const resultDiv = document.getElementById("result");
    const loadingDiv = document.getElementById("loading");
  
    // Limpar resultados anteriores
    resultDiv.style.display = "none";
    loadingDiv.style.display = "block";
    resultDiv.innerHTML = "";
  
    // Remover caracteres não numéricos do CNPJ
    cnpj = cnpj.replace(/[^\d]/g, "");
  
    // Validar o CNPJ (precisa ter exatamente 14 dígitos após limpeza)
    if (cnpj.length !== 14) {
      alert("Por favor, insira um CNPJ válido com 14 dígitos após a remoção de pontos e barras.");
      loadingDiv.style.display = "none";
      return;
    }
  
    const fetchWithTimeout = (url, options, timeout = 7000) => {
      return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Tempo limite excedido")), timeout)
        ),
      ]);
    };
  
    fetchWithTimeout(`https://publica.cnpj.ws/cnpj/${cnpj}`)
      .then(response => {
        if (!response.ok) {
          throw new Error("CNPJ não encontrado ou erro na API.");
        }
        return response.json();
      })
      .then(data => {
        loadingDiv.style.display = "none";
        resultDiv.style.display = "block";
  
        // Função para gerar tabelas
        const createTable = (title, obj) => {
          let html = `<h2>${title}</h2><table>`;
          for (const key in obj) {
            html += `
              <tr>
                <th>${key}</th>
                <td>${obj[key] || "Não informado"}</td>
              </tr>
            `;
          }
          html += "</table>";
          return html;
        };
  
        // Separando informações importantes
        const generalInfo = {
          "Nome Empresarial": data.razao_social,
          "CNPJ": data.estabelecimento.cnpj,
          "Situação Cadastral": data.estabelecimento.situacao_cadastral,
          "Data da Situação Cadastral": data.estabelecimento.data_situacao_cadastral,
        };
  
        const addressInfo = {
          "Logradouro": `${data.estabelecimento.tipo_logradouro} ${data.estabelecimento.logradouro}`,
          "Número": data.estabelecimento.numero,
          "Complemento": data.estabelecimento.complemento,
          "Bairro": data.estabelecimento.bairro,
          "Cidade": data.estabelecimento.cidade.nome,
          "Estado": data.estabelecimento.estado.sigla,
          "CEP": data.estabelecimento.cep,
        };
  
        const contactInfo = {
          "Telefone 1": `${data.estabelecimento.ddd1 || ""} ${data.estabelecimento.telefone1 || "Não informado"}`,
          "Telefone 2": `${data.estabelecimento.ddd2 || ""} ${data.estabelecimento.telefone2 || "Não informado"}`,
          "Email": data.estabelecimento.email || "Não informado",
        };
  
        const additionalInfo = {
          "Natureza Jurídica": data.natureza_juridica?.descricao || "Não informado",
          "Data de Abertura": data.estabelecimento.data_inicio_atividade || "Não informado",
          "Capital Social": data.capital_social || "Não informado",
        };
  
        // Gerar tabelas no HTML
        resultDiv.innerHTML = `
          <div class="info-limit">
            <p>O sistema possui um limite de 5 pesquisas por minuto para garantir que todos possam utilizar de forma gratuita. Agradecemos a compreensão!</p>
          </div>
          ${createTable("Informações Gerais", generalInfo)}
          ${createTable("Endereço", addressInfo)}
          ${createTable("Contato", contactInfo)}
          ${createTable("Informações Adicionais", additionalInfo)}
          <div class="mei-info">
            <p>Para consultar o nome e CPF do proprietário deste MEI, clique no link abaixo e faça login com sua conta gov.br para emitir o CCMEI:</p>
            <a href="https://mei.receita.economia.gov.br/certificado/login?nextRoute=%2F" target="_blank">
              Consulte aqui o Nome e CPF do Proprietário Caso seja um MEI
            </a>
          </div>
          <div class="sintegra-info">
            <p>Para consultar a Inscrição Estadual deste CNPJ, acesse o Sintegra clicando no link abaixo:</p>
            <a href="https://www.sintegra.gov.br/" target="_blank">
              Consulte a Inscrição Estadual no Sintegra
            </a>
          </div>
          <button id="newSearchBtn" onclick="novaPesquisa()">Nova Pesquisa</button>
        `;
      })
      .catch(error => {
        loadingDiv.style.display = "none";
        resultDiv.style.display = "block";
        resultDiv.innerHTML = `
          <p>Erro: ${error.message}</p>
          <button id="newSearchBtn" onclick="novaPesquisa()">Nova Pesquisa</button>
        `;
      });
  }
  
  // Função para iniciar uma nova pesquisa
  function novaPesquisa() {
    document.getElementById("cnpj").value = ""; // Limpar o campo de entrada
    document.getElementById("result").style.display = "none"; // Ocultar os resultados
  }
  