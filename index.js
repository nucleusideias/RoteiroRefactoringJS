const { readFileSync } = require('fs');

class Repositorio {
  constructor() {
    this.pecas = JSON.parse(readFileSync('./pecas.json'));
  }

  getPeca(apre) {
    return this.pecas[apre.id];
  }
}

class ServicoCalculoFatura {

  constructor(repo) {
    this.repo = repo;
  }

  calcularTotalApresentacao(apre) {

    let total = 0;
  
    switch (this.repo.getPeca(apre).tipo) {
      case "tragedia":
        total = 40000;
        if (apre.audiencia > 30) {
          total += 1000 * (apre.audiencia - 30);
        }
        break;
      case "comedia":
        total = 30000;
        if (apre.audiencia > 20) {
            total += 10000 + 500 * (apre.audiencia - 20);
        }
        total += 300 * apre.audiencia;
        break;
      default:
          throw new Error(`Peça desconhecia: ${this.repo.getPeca(apre).tipo}`);
      }
  
      return total;
  
  }
  
  getPeca(pecas, apresentacao) {
    return pecas[apresentacao.id];
  }
  
  calcularCredito(apre) {
    let creditos = 0;
    creditos += Math.max(apre.audiencia - 30, 0);
    if (this.repo.getPeca(apre).tipo === "comedia") 
       creditos += Math.floor(apre.audiencia / 5);
    return creditos;   
  }
  
  formatarMoeda(valor) {
    return new Intl.NumberFormat("pt-BR",
      { style: "currency", currency: "BRL",
        minimumFractionDigits: 2 }).format(valor/100);
  }
  
  calcularTotalCreditos(apresentacoes) {  
    let creditos = 0  
    for (let apre of apresentacoes) {        
          
      creditos += this.calcularCredito(apre);   
  
    }
    return creditos;
  }    
  
  calcularTotalFatura(apresentacoes) {
      
    let total = 0;
  
    for (let apre of apresentacoes) {      
  
      total += this.calcularTotalApresentacao(apre);    
      
    }
    return total;
  }
}

function gerarFaturaStr (fatura, pecas, calc) {    
      let faturaStr = `Fatura ${fatura.cliente}\n`;     
      
      for (let apre of fatura.apresentacoes) {
        faturaStr += `  ${calc.getPeca(pecas, apre).nome}: ${calc.formatarMoeda(calc.calcularTotalApresentacao(apre))} (${apre.audiencia} assentos)\n`;
      }    
      faturaStr += `Valor total: ${calc.formatarMoeda(calc.calcularTotalFatura(fatura.apresentacoes))}\n`;
      faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(fatura.apresentacoes)} \n`;
      return faturaStr;
}   

function gerarFaturaHTML(fatura, pecas, calc) {

  let faturaHtml = '';
  let faturaItems = ''

  for (let apre of fatura.apresentacoes) {
    faturaItems += `<li>${calc.getPeca(pecas, apre).nome}: ${calc.formatarMoeda(calc.calcularTotalApresentacao(apre))} (${apre.audiencia} assentos)</li> \n`;
  }   
  
  faturaHtml = `<html>
                  <p> Fatura ${fatura.cliente} </p>
                  <ul>
                    ${faturaItems}                  
                  </ul>
                  <p> Valor total: ${calc.formatarMoeda(calc.calcularTotalFatura(fatura.apresentacoes))} </p>
                  <p> Créditos acumulados: ${calc.calcularTotalCreditos(fatura.apresentacoes)} </p>
                </html>`;
                  
  return faturaHtml;
}

const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const calc = new ServicoCalculoFatura(new Repositorio());
const faturaStr = gerarFaturaStr(faturas, pecas, calc);
const faturaHtml = gerarFaturaHTML(faturas, pecas, calc);
console.log(faturaStr);
console.log(faturaHtml);
