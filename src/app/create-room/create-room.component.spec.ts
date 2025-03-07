import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { CreateRoomComponent } from './create-room.component';
import { RoomService } from '../services/room.service';

describe('CreateRoomComponent', () => {
  let component: CreateRoomComponent;
  let fixture: ComponentFixture<CreateRoomComponent>;
  let roomServiceSpy: jasmine.SpyObj<RoomService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const roomServiceMock = jasmine.createSpyObj('RoomService', ['createRoom']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CreateRoomComponent],
      providers: [
        { provide: RoomService, useValue: roomServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateRoomComponent);
    component = fixture.componentInstance;
    roomServiceSpy = TestBed.inject(RoomService) as jasmine.SpyObj<RoomService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Prueba para verificar si onNameChanged actualiza playerName
  it('should update playerName on onNameChanged', () => {
    const name = 'Test Player';
    component.onNameChanged(name);
    expect(component.playerName).toBe(name);
  });

  // Prueba para verificar si onPlayersSelected actualiza numPlayers
  it('should update numPlayers on onPlayersSelected', () => {
    const numPlayers = 3;
    component.onPlayersSelected(numPlayers);
    expect(component.numPlayers).toBe(numPlayers);
  });

  // Prueba para verificar si onAvatarSelected actualiza avatar
  it('should update avatar on onAvatarSelected', () => {
    const avatar = 'avatar.png';
    component.onAvatarSelected(avatar);
    expect(component.avatar).toBe(avatar);
  });

});
