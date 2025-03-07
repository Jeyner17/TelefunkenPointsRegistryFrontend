import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '../services/room.service';
import { Player } from '../models/player.model';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScoreService } from '../services/score.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class GameComponent implements OnInit, OnDestroy {
  roomId: string = '';
  playerName: string = '';
  avatar: string | null = null;
  players: Player[] = [];
  gameStage: string = '1/3';
  currentScore: number = 0;
  isCreator: boolean = false;
  displayPointsInput: boolean = true;
  currentStageIndex: number = 0;
  gameStages: string[] = ['1/3', '2/3', '1/4', '2/4', '1/5', '2/5', 'Escalera'];
  
  private scoresSubscription?: Subscription;
  private playersSubscription?: Subscription;
  scores: {[key: string]: { history: number[], total: number }} = {};

  constructor(
    private route: ActivatedRoute,
    private roomService: RoomService,
    private scoreService: ScoreService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.roomId = params['roomId'];
      this.playerName = params['playerName'];
      this.avatar = params['avatar'];
      this.isCreator = params['isCreator'] === 'true';
    });

    // Suscribirse a las actualizaciones de jugadores
    this.roomService.onPlayersUpdate((players) => {
      this.players = players;
      console.log('Players updated:', players);
      
      // Inicializar estructura de puntajes para todos los jugadores
      this.initializeScoresForAllPlayers();
    });
    
    // Suscripción al observable de jugadores
    this.playersSubscription = this.roomService.players$.subscribe(players => {
      if (players && players.length > 0) {
        this.players = players;
        this.initializeScoresForAllPlayers();
      }
    });

    // Suscribirse a las actualizaciones de puntajes
    this.scoresSubscription = this.roomService.scores$.subscribe(scores => {
      this.scores = scores || {};
      console.log('Scores updated:', scores);
      
      // Asegurar que todos los jugadores tengan una entrada en scores
      this.ensureAllPlayersHaveScores();
    });

    // Obtener puntajes iniciales desde el servidor
    this.roomService.getRoomScores(this.roomId).subscribe(
      (scores) => {
        this.scores = scores || {};
        this.ensureAllPlayersHaveScores();
      },
      (error) => {
        console.error('Error al obtener puntajes:', error);
      }
    );

    this.roomService.onChangeGame(() => {
      this.nextStage();
    });
  }

  ngOnDestroy(): void {
    if (this.scoresSubscription) {
      this.scoresSubscription.unsubscribe();
    }
    if (this.playersSubscription) {
      this.playersSubscription.unsubscribe();
    }
  }

  // Método para inicializar la estructura de puntajes para todos los jugadores
  initializeScoresForAllPlayers(): void {
    if (this.players && this.players.length > 0) {
      const updatedScores = { ...this.scores };
      
      this.players.forEach(player => {
        if (!updatedScores[player.name]) {
          updatedScores[player.name] = {
            history: Array(this.currentStageIndex + 1).fill(0),
            total: 0
          };
        }
      });
      
      this.scores = updatedScores;
    }
  }

  // Método para asegurar que todos los jugadores tengan una entrada en scores
  ensureAllPlayersHaveScores(): void {
    if (this.players && this.players.length > 0) {
      const updatedScores = { ...this.scores };
      
      this.players.forEach(player => {
        if (!updatedScores[player.name]) {
          updatedScores[player.name] = {
            history: Array(this.currentStageIndex + 1).fill(0),
            total: 0
          };
        } else {
          // Asegúrate de que el historial tenga la longitud correcta
          while (updatedScores[player.name].history.length <= this.currentStageIndex) {
            updatedScores[player.name].history.push(0);
          }
        }
      });
      
      this.scores = updatedScores;
    }
  }

  submitScore(): void {
    if (this.playerName && this.currentScore !== undefined) {
      // Asegúrate de que el jugador actual tenga una entrada en scores
      if (!this.scores[this.playerName]) {
        this.scores[this.playerName] = {
          history: Array(this.currentStageIndex + 1).fill(0),
          total: 0
        };
      }
      
      // Actualizar el puntaje localmente antes de enviarlo
      const playerScore = this.scores[this.playerName];
      playerScore.history[this.currentStageIndex] = this.currentScore;
      playerScore.total = playerScore.history.reduce((sum, score) => sum + score, 0);
      
      // Enviar actualización al servidor
      this.roomService.updateScore(
        this.roomId,
        this.playerName,
        this.currentScore,
        this.currentStageIndex
      );
      
      this.displayPointsInput = false;

      // Guardar los puntajes en MongoDB Atlas
      this.scoreService.saveScores(this.roomId, this.scores).subscribe(
        (response) => {
          console.log('Scores guardados exitosamente:', response);
        },
        (error) => {
          console.error('Error al guardar los puntajes:', error);
        }
      );
    }
  }

  getPlayerScoreHistory(playerName: string): number[] {
    if (!this.scores[playerName] || !this.scores[playerName].history) {
      return Array(this.currentStageIndex + 1).fill(0);
    }
    
    const history = [...this.scores[playerName].history];
    // Asegúrate de que el historial tenga la longitud correcta
    while (history.length <= this.currentStageIndex) {
      history.push(0);
    }
    
    return history;
  }

  getPlayerTotal(playerName: string): number {
    if (!this.scores[playerName]) {
      return 0;
    }
    
    // Recalcular el total basado en el historial para asegurar consistencia
    const total = this.getPlayerScoreHistory(playerName).reduce((sum, score) => sum + (score || 0), 0);
    return total;
  }

  allPlayersSubmitted(): boolean {
    return this.players.every(player => {
      const history = this.getPlayerScoreHistory(player.name);
      return history[this.currentStageIndex] !== undefined && history[this.currentStageIndex] !== null;
    });
  }

  nextStage(): void {
    if (this.currentStageIndex < this.gameStages.length - 1) {
      this.currentStageIndex++;
      this.gameStage = this.gameStages[this.currentStageIndex];
      this.displayPointsInput = true;
      
      // Actualizar el historial de puntajes para la nueva etapa
      this.ensureAllPlayersHaveScores();
      
      if (this.isCreator) {
        this.roomService.nextGame(this.roomId);
      }
    }
  }

  endGame(): void {
    if (this.isCreator) {
      this.roomService.endGame(this.roomId);
    }
  }
}