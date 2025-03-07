import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { PlayerNameComponent } from './player-name.component';

describe('PlayerNameComponent', () => {
  let component: PlayerNameComponent;
  let fixture: ComponentFixture<PlayerNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, PlayerNameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Prueba para verificar que el nombre del jugador se inicializa vacío
  it('should initialize playerName as empty string', () => {
    expect(component.playerName).toBe('');
  });

  // Prueba para verificar que el evento nameChanged se emite con el nombre correcto
  it('should emit nameChanged event with correct playerName', () => {
    spyOn(component.nameChanged, 'emit');

    const testName = 'John Doe';
    component.playerName = testName;
    component.onNameChange();

    expect(component.nameChanged.emit).toHaveBeenCalledWith(testName);
  });

  // Prueba para verificar que el nombre del jugador se actualiza correctamente en el template
  it('should update playerName in the template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector('input') as HTMLInputElement;

    input.value = 'Jane Doe';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.playerName).toBe('Jane Doe');
  });
});
