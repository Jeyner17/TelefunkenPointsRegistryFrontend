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
  
  // Hardcoded players para asegurar que todos aparezcan
  allPlayers: Player[] = [];
  
  // Flag para identificar si es el jugador 1 (j1)
  isPlayerOne: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private roomService: RoomService,
    private scoreService: ScoreService
  ) {}

  ngOnInit(): void {
    // Inicializar el objeto scores como un objeto vacío
    this.scores = {};
    
    this.route.queryParams.subscribe(params => {
      this.roomId = params['roomId'];
      this.playerName = params['playerName'];
      this.avatar = params['avatar'];
      this.isCreator = params['isCreator'] === 'true';
      
      console.log('Inicializando jugador:', this.playerName);
      
      // Detectar si es el jugador 1 (j1)
      this.isPlayerOne = this.playerName === 'j1';
      console.log('¿Es jugador 1?', this.isPlayerOne);
      
      // Inicializar hardcoded players para el jugador 1
      if (this.isPlayerOne) {
        this.initializeHardcodedPlayers();
      }
      
      // Agregar el jugador actual a allPlayers
      if (this.playerName && this.avatar) {
        const currentPlayer: Player = {
          name: this.playerName,
          avatar: this.avatar as string
        };
        
        // Si no es el jugador 1, inicializar con el jugador actual
        if (!this.isPlayerOne) {
          this.allPlayers = [currentPlayer];
        }
        
        // Inicializar los puntajes para el jugador actual
        this.scores[this.playerName] = {
          history: Array(this.currentStageIndex + 1).fill(0),
          total: 0
        };
      }
    });

    // Suscribirse a las actualizaciones de jugadores
    this.roomService.onPlayersUpdate((players) => {
      console.log('Players updated from socket:', players);
      if (players && players.length > 0) {
        this.players = players;
        
        if (!this.isPlayerOne) {
          this.updateAllPlayersList();
        }
        
        this.initializeScoresForAllPlayers();
      }
    });
    
    // Suscripción al observable de jugadores en el servicio
    this.playersSubscription = this.roomService.players$.subscribe(players => {
      console.log('Players updated from subject:', players);
      if (players && players.length > 0) {
        this.players = players;
        
        if (!this.isPlayerOne) {
          this.updateAllPlayersList();
        } else {
          // Para j1, actualizar scores pero mantener la lista hardcoded
          this.initializeScoresForAllPlayers();
        }
      }
    });

    // Suscribirse a las actualizaciones de puntajes
    this.scoresSubscription = this.roomService.scores$.subscribe(scores => {
      console.log('Scores received from server:', scores);
      
      // Guardar una copia de los puntajes actuales
      const currentScores = { ...this.scores };
      
      // Actualizar scores con los datos recibidos
      if (scores) {
        this.scores = { ...scores };
      }
      
      // Para el jugador 1, asegurar que haya puntajes para todos los hardcoded players
      if (this.isPlayerOne) {
        for (const player of this.allPlayers) {
          // Si no hay puntaje para este jugador o si existía antes pero no ahora
          if (!this.scores[player.name] && currentScores[player.name]) {
            this.scores[player.name] = currentScores[player.name];
          } else if (!this.scores[player.name]) {
            this.scores[player.name] = {
              history: Array(this.currentStageIndex + 1).fill(0),
              total: 0
            };
          }
        }
      }
      
      // Asegurar que todos los jugadores tengan puntajes
      this.initializeScoresForAllPlayers();
      
      console.log('Scores after processing:', this.scores);
    });

    // Obtener puntajes iniciales desde el servidor
    this.roomService.getRoomScores(this.roomId).subscribe(
      (scores) => {
        console.log('Initial scores from server:', scores);
        
        // Guardar una copia de los puntajes actuales
        const currentScores = { ...this.scores };
        
        // Actualizar scores con los datos recibidos
        if (scores) {
          this.scores = { ...scores };
        }
        
        // Para el jugador 1, asegurar que haya puntajes para todos los hardcoded players
        if (this.isPlayerOne) {
          for (const player of this.allPlayers) {
            // Si no hay puntaje para este jugador o si existía antes pero no ahora
            if (!this.scores[player.name] && currentScores[player.name]) {
              this.scores[player.name] = currentScores[player.name];
            } else if (!this.scores[player.name]) {
              this.scores[player.name] = {
                history: Array(this.currentStageIndex + 1).fill(0),
                total: 0
              };
            }
          }
        }
        
        // Asegurar que todos los jugadores tengan puntajes
        this.initializeScoresForAllPlayers();
        
        console.log('Scores after initial load:', this.scores);
      },
      (error) => {
        console.error('Error al obtener puntajes:', error);
      }
    );

    // Obtener la lista completa de jugadores desde el servidor
    this.roomService.getPlayers(this.roomId).subscribe(
      (players) => {
        console.log('Initial players from server:', players);
        if (players && players.length > 0) {
          this.players = players;
          
          if (!this.isPlayerOne) {
            this.updateAllPlayersList();
          } else {
            // Para j1, actualizar scores pero mantener la lista hardcoded
            this.initializeScoresForAllPlayers();
          }
        }
      },
      (error) => {
        console.error('Error al obtener jugadores:', error);
      }
    );

    this.roomService.onChangeGame(() => {
      this.nextStage();
    });
  }

  // Inicializar hardcoded players para el jugador 1
  initializeHardcodedPlayers(): void {
    this.allPlayers = [
      { name: 'j1', avatar: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAE...' },
      { name: 'j2', avatar: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAE...' },
      { name: 'j3', avatar: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAE...' }
    ];
    
    console.log('Hardcoded players inicializados para j1:', this.allPlayers);
    
    // Inicializar puntajes para estos jugadores
    for (const player of this.allPlayers) {
      if (!this.scores[player.name]) {
        this.scores[player.name] = {
          history: Array(this.currentStageIndex + 1).fill(0),
          total: 0
        };
      }
    }
  }

  ngOnDestroy(): void {
    if (this.scoresSubscription) {
      this.scoresSubscription.unsubscribe();
    }
    if (this.playersSubscription) {
      this.playersSubscription.unsubscribe();
    }
  }

  // Método para actualizar la lista completa de jugadores (solo para jugadores que no son j1)
  updateAllPlayersList(): void {
    // Si es el jugador 1, no cambiar la lista hardcoded
    if (this.isPlayerOne) {
      return;
    }
    
    // Comenzar con el jugador actual
    const updatedAllPlayers: Player[] = [];
    
    // Agregar el jugador actual primero si existe
    if (this.playerName && this.avatar) {
      let currentPlayerInList = false;
      
      // Verificar si el jugador actual ya está en la lista players
      for (const player of this.players) {
        if (player.name === this.playerName) {
          updatedAllPlayers.push(player);
          currentPlayerInList = true;
          break;
        }
      }
      
      // Si no está en la lista, agregarlo
      if (!currentPlayerInList) {
        updatedAllPlayers.push({
          name: this.playerName,
          avatar: this.avatar as string
        });
      }
    }
    
    // Agregar el resto de jugadores
    for (const player of this.players) {
      // Evitar duplicados
      if (player.name !== this.playerName) {
        updatedAllPlayers.push(player);
      }
    }
    
    this.allPlayers = updatedAllPlayers;
    console.log('Lista actualizada de jugadores:', this.allPlayers);
  }

  // Método para inicializar la estructura de puntajes para todos los jugadores
  initializeScoresForAllPlayers(): void {
    const updatedScores = { ...this.scores };
    
    // Para el jugador actual
    if (this.playerName) {
      if (!updatedScores[this.playerName]) {
        updatedScores[this.playerName] = {
          history: Array(this.currentStageIndex + 1).fill(0),
          total: 0
        };
      } else {
        // Asegurar que el historial tenga la longitud correcta
        while (updatedScores[this.playerName].history.length <= this.currentStageIndex) {
          updatedScores[this.playerName].history.push(0);
        }
      }
    }
    
    // Para todos los jugadores en allPlayers
    for (const player of this.allPlayers) {
      if (!updatedScores[player.name]) {
        updatedScores[player.name] = {
          history: Array(this.currentStageIndex + 1).fill(0),
          total: 0
        };
      } else {
        // Asegurar que el historial tenga la longitud correcta
        while (updatedScores[player.name].history.length <= this.currentStageIndex) {
          updatedScores[player.name].history.push(0);
        }
      }
    }
    
    // Si es el jugador 1, asegurar específicamente que j2 y j3 tengan puntajes
    if (this.isPlayerOne) {
      const otherPlayers = ['j2', 'j3'];
      
      for (const playerName of otherPlayers) {
        if (!updatedScores[playerName]) {
          updatedScores[playerName] = {
            history: Array(this.currentStageIndex + 1).fill(0),
            total: 0
          };
        } else {
          // Asegurar que el historial tenga la longitud correcta
          while (updatedScores[playerName].history.length <= this.currentStageIndex) {
            updatedScores[playerName].history.push(0);
          }
        }
      }
    }
    
    this.scores = updatedScores;
  }

  submitScore(): void {
    if (this.playerName && this.currentScore !== undefined) {
      // Actualizar el puntaje localmente antes de enviarlo
      if (!this.scores[this.playerName]) {
        this.scores[this.playerName] = {
          history: Array(this.currentStageIndex + 1).fill(0),
          total: 0
        };
      }
      
      // Asegurar que el historial tenga la longitud correcta
      while (this.scores[this.playerName].history.length <= this.currentStageIndex) {
        this.scores[this.playerName].history.push(0);
      }
      
      // Actualizar el puntaje
      this.scores[this.playerName].history[this.currentStageIndex] = this.currentScore;
      
      // Recalcular el total
      this.scores[this.playerName].total = this.scores[this.playerName].history.reduce((sum, score) => sum + (score || 0), 0);
      
      // Enviar la actualización al servidor
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
    // Si no hay datos para este jugador, devolver un array de ceros
    if (!this.scores[playerName] || !this.scores[playerName].history) {
      return Array(this.currentStageIndex + 1).fill(0);
    }
    
    // Obtener el historial
    const history = [...this.scores[playerName].history];
    
    // Asegurarse de que tenga la longitud correcta
    while (history.length <= this.currentStageIndex) {
      history.push(0);
    }
    
    return history;
  }

  getPlayerTotal(playerName: string): number {
    // Si no hay datos para este jugador, devolver 0
    if (!this.scores[playerName]) {
      return 0;
    }
    
    // Calcular el total basado en el historial
    return this.getPlayerScoreHistory(playerName).reduce((sum, score) => sum + (score || 0), 0);
  }

  allPlayersSubmitted(): boolean {
    return this.allPlayers.every(player => {
      const history = this.getPlayerScoreHistory(player.name);
      return history[this.currentStageIndex] !== undefined;
    });
  }

  nextStage(): void {
    if (this.currentStageIndex < this.gameStages.length - 1) {
      this.currentStageIndex++;
      this.gameStage = this.gameStages[this.currentStageIndex];
      this.displayPointsInput = true;
      
      // Actualizar el historial de puntajes para la nueva etapa
      this.initializeScoresForAllPlayers();
      
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