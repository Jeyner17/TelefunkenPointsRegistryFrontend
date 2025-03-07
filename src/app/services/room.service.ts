import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { io, Socket } from 'socket.io-client';
import { Player } from '../models/player.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private socket: Socket;
  private apiUrl = 'http://34.162.232.203:3000'; // URL del backend
  private scoresSubject = new BehaviorSubject<{[key: string]: { history: number[], total: number }}>({});
  private playersSubject = new BehaviorSubject<Player[]>([]);
  
  public scores$ = this.scoresSubject.asObservable();
  public players$ = this.playersSubject.asObservable();

  constructor(private http: HttpClient) {
    this.socket = io(this.apiUrl);
    
    // Escuchar actualizaciones de puntajes
    this.socket.on('scores-update', (scores) => {
      this.scoresSubject.next(scores || {});
      console.log('Socket scores-update received:', scores);
    });
    
    // Escuchar actualizaciones de jugadores
    this.socket.on('update-players', (players) => {
      this.playersSubject.next(players || []);
      console.log('Socket update-players received:', players);
    });
  }

  // Mantener los métodos existentes
  createRoom(roomData: any): Observable<{ roomId: string }> {
    return this.http.post<{ roomId: string }>(`${this.apiUrl}/api/rooms/create-room`, roomData);
  }

  joinRoom(roomId: string, playerName: string, avatar: string | ArrayBuffer | null): void {
    this.socket.emit('join-room', { roomId, playerName, avatar });
  }

  onPlayersUpdate(callback: (players: Player[]) => void): void {
    // Registrar el callback para las actualizaciones de socket
    this.socket.on('update-players', callback);
  }

  onRoomJoined(callback: (data: { success: boolean; room?: any; message?: string }) => void): void {
    this.socket.on('joined-room', callback);
  }

  updatePlayers(players: Player[]): void {
    this.playersSubject.next(players);
    this.socket.emit('update-players', players);
  }

  onShowPointsInput(callback: () => void): void {
    this.socket.on('show-points-input', callback);
  }

  onChangeGame(callback: () => void): void {
    this.socket.on('change-game', callback);
  }

  onShowBarChart(callback: () => void): void {
    this.socket.on('show-bar-chart', callback);
  }

  nextGame(roomId: string): void {
    this.socket.emit('next-game', roomId);
  }

  endGame(roomId: string): void {
    this.socket.emit('end-game', roomId);
  }

  getPlayers(roomId: string): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.apiUrl}/api/rooms/${roomId}/players`)
      .pipe(
        tap(players => {
          this.playersSubject.next(players);
        })
      );
  }

  updateScore(roomId: string, playerName: string, score: number, stage: number): void {
    // Normalizar nombre del jugador
    const normalizedName = playerName.trim();
    
    console.log(`Actualizando puntaje para ${normalizedName}: ${score} en etapa ${stage}`);
    
    // Actualizar localmente los puntajes
    const currentScores = { ...this.scoresSubject.value };
    
    if (!currentScores[normalizedName]) {
      console.log(`Creando nuevo registro para ${normalizedName}`);
      currentScores[normalizedName] = {
        history: [],
        total: 0
      };
    }
    
    // Asegurarse de que el historial tenga suficientes elementos
    while (currentScores[normalizedName].history.length <= stage) {
      currentScores[normalizedName].history.push(0);
    }
    
    // Actualizar el puntaje
    currentScores[normalizedName].history[stage] = score;
    
    // Recalcular el total
    currentScores[normalizedName].total = currentScores[normalizedName].history.reduce((sum, s) => sum + (s || 0), 0);
    
    console.log(`Nuevo estado de puntajes:`, currentScores);
    
    // Actualizar el BehaviorSubject local
    this.scoresSubject.next(currentScores);
    
    // Enviar actualización al servidor
    this.socket.emit('update-score', { roomId, playerName: normalizedName, score, stage });
  }

  getScores(): {[key: string]: { history: number[], total: number }} {
    return this.scoresSubject.value;
  }

  onScoreUpdate(callback: (scores: { [key: string]: { total: number; history: number[] } }) => void): void {
    this.socket.on('scores-updated', callback);
  }

  // Método para obtener puntuaciones actuales
  getRoomScores(roomId: string): Observable<{ [key: string]: { total: number; history: number[] } }> {
    return this.http.get<{ [key: string]: { total: number; history: number[] } }>(`${this.apiUrl}/api/rooms/${roomId}/scores`)
      .pipe(
        tap(scores => {
          this.scoresSubject.next(scores || {});
        }),
        catchError(error => {
          console.error('Error obteniendo puntajes:', error);
          return new Observable<{ [key: string]: { total: number; history: number[] } }>(observer => {
            observer.next({});
            observer.complete();
          });
        })
      );
  }
}