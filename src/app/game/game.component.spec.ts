import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RoomService } from '../services/room.service';
import { ScoreService } from '../services/score.service';
import { GameComponent } from './game.component';
import { Player } from '../models/player.model';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let roomServiceStub: Partial<RoomService>;
  let scoreServiceStub: Partial<ScoreService>;

  beforeEach(async () => {
    // Crear stubs para los servicios
    roomServiceStub = {
      onPlayersUpdate: jasmine.createSpy('onPlayersUpdate').and.callFake((cb: (players: Player[]) => void) => {
        cb([{ name: 'Player1' }, { name: 'Player2' }] as Player[]);
      }),
      scores$: of({ Player1: { history: [10], total: 10 } }),
      updateScore: jasmine.createSpy('updateScore'),
      nextGame: jasmine.createSpy('nextGame'),
      endGame: jasmine.createSpy('endGame'),
      onChangeGame: jasmine.createSpy('onChangeGame').and.callFake((cb: () => void) => {
        cb();
      })
    };

    scoreServiceStub = {
      saveScores: jasmine.createSpy('saveScores').and.returnValue(of({ success: true }))
    };

    await TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParams: of({ roomId: '123', playerName: 'Player1', avatar: 'avatar1', isCreator: 'true' }) } },
        { provide: RoomService, useValue: roomServiceStub },
        { provide: ScoreService, useValue: scoreServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  
  it('debería suscribirse a las actualizaciones de jugadores', () => {
    expect(component.players.length).toBe(2);
    expect(component.players[0].name).toBe('Player1');
  });

  it('debería suscribirse a las actualizaciones de puntajes', () => {
    expect(component.scores['Player1'].total).toBe(10);
  });

  
  it('debería enviar el puntaje correctamente', () => {
    component.currentScore = 20;
    component.submitScore();
    expect(scoreServiceStub.saveScores).toHaveBeenCalled();
    expect(component.displayPointsInput).toBeFalse();
  });
  
  // it('debería verificar si todos los jugadores han enviado sus puntajes', () => {
    //   expect(component.allPlayersSubmitted()).toBeTrue();
    // });
    // it('debería avanzar a la siguiente etapa del juego', () => {
    //   component.nextStage();
    //   expect(component.gameStage).toBe('2/3');
    //   expect(component.displayPointsInput).toBeTrue();
    // });
  });
  