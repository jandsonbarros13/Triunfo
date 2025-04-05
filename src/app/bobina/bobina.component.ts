import { Component, OnInit } from '@angular/core';
import { BobinaService } from 'src/services/bobina.service';

@Component({
  selector: 'app-bobina',
  templateUrl: './bobina.component.html',
  styleUrls: ['./bobina.component.scss'],
})
export class BobinaComponent implements OnInit {
  nomeBobina: string = '';
  pesoBobina: number | null = null;
  bobinas: any[] = []; // Array para armazenar as bobinas
  bobinaEditando: any | null = null; // Para armazenar a bobina que está sendo editada

  constructor(private bobinaService: BobinaService) {}

  ngOnInit() {
    this.listarBobinas(); // Carrega as bobinas ao iniciar
  }

  adicionarBobina() {
    if (!this.nomeBobina || this.pesoBobina === null) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    // Envia os dados da nova bobina para a API
    this.bobinaService.adicionarBobina({ nome: this.nomeBobina, peso: this.pesoBobina }).subscribe(
      () => {
        alert('Bobina adicionada com sucesso!');
        this.listarBobinas(); // Atualiza a lista de bobinas
        this.limparCampos(); // Limpa os campos
      },
      (error) => {
        console.error('Erro ao adicionar bobina', error);
        alert('Erro ao adicionar bobina. Tente novamente.');
      }
    );
  }

  listarBobinas() {
    this.bobinaService.listarBobinas().subscribe(
      (data) => {
        this.bobinas = data; // Armazena bobinas recebidas da API
      },
      (error) => {
        console.error('Erro ao listar bobinas', error);
        alert('Erro ao carregar as bobinas. Tente novamente mais tarde.');
      }
    );
  }

  excluirBobina(id: string) {
    this.bobinaService.excluirBobina(id).subscribe(
      () => {
        this.bobinas = this.bobinas.filter(bobina => bobina._id !== id); // Remove a bobina da lista
        alert('Bobina excluída com sucesso!');
      },
      (error) => {
        console.error('Erro ao excluir bobina', error);
        alert('Erro ao excluir bobina. Tente novamente.');
      }
    );
  }

  editarBobina(bobina: any) {
    this.bobinaEditando = bobina; // Armazena a bobina que está sendo editada
    this.nomeBobina = bobina.nome; // Preenche os campos com os dados da bobina
    this.pesoBobina = bobina.peso;
  }

  salvarEdicao() {
    if (!this.bobinaEditando) return;

    const updatedBobina = {
      nome: this.nomeBobina,
      peso: this.pesoBobina !== null ? this.pesoBobina : 0 // Define um valor padrão se peso for null
    };

    this.bobinaService.atualizarBobina(this.bobinaEditando._id, updatedBobina).subscribe(
      () => {
        alert('Bobina atualizada com sucesso!');
        this.listarBobinas(); // Atualiza a lista de bobinas
        this.limparCampos(); // Limpa os campos
        this.bobinaEditando = null; // Reseta o estado de edição
      },
      (error) => {
        console.error('Erro ao atualizar bobina', error);
        alert('Erro ao atualizar bobina. Tente novamente.');
      }
    );
  }

  limparCampos() {
    this.nomeBobina = '';
    this.pesoBobina = null;
    this.bobinaEditando = null; // Limpa o estado de edição
  }

  // Método para formatar o peso das bobinas para exibição
  formatarPeso(peso: number): string {
    return peso.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).replace('.', ',');
  }
}