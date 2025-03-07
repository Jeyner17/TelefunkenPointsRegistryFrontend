import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RoomService } from '../services/room.service';
import { JoinRoomComponent } from './join-room.component';

describe('JoinRoomComponent', () => {
  let component: JoinRoomComponent;
  let fixture: ComponentFixture<JoinRoomComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRoomService: jasmine.SpyObj<RoomService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockRoomService = jasmine.createSpyObj('RoomService', ['joinRoom', 'onRoomJoined', 'onPlayersUpdate']);

    await TestBed.configureTestingModule({
      imports: [JoinRoomComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: RoomService, useValue: mockRoomService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Prueba para verificar que el nombre del jugador se actualiza correctamente
  it('should update playerName when onNameChanged is called', () => {
    const name = 'Player1';
    component.onNameChanged(name);
    expect(component.playerName).toBe(name);
  });

  // Prueba para verificar que el avatar se actualiza correctamente
  it('should update avatar when onAvatarSelected is called', () => {
    const avatar = 'avatar.png';
    component.onAvatarSelected(avatar);
    expect(component.avatar).toBe(avatar);
  });
  

});
