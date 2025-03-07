import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectPlayersComponent } from './select-players.component';

describe('SelectPlayersComponent', () => {
  let component: SelectPlayersComponent;
  let fixture: ComponentFixture<SelectPlayersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectPlayersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectPlayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Prueba para verificar el valor inicial de numPlayers
  it('should have initial numPlayers value as 2', () => {
    expect(component.numPlayers).toBe(2);
  });

  // Prueba para verificar que el EventEmitter emite el valor correcto
  it('should emit the correct number of players when onPlayersSelected is called', () => {
    spyOn(component.playersSelected, 'emit');
    component.onPlayersSelected();
    expect(component.playersSelected.emit).toHaveBeenCalledWith(2);
  });

  // Prueba para verificar que el valor de numPlayers se puede cambiar
  it('should change numPlayers value', () => {
    component.numPlayers = 4;
    expect(component.numPlayers).toBe(4);
  });

  // Prueba para verificar que el EventEmitter emite el nuevo valor de numPlayers
  it('should emit the new number of players when onPlayersSelected is called', () => {
    spyOn(component.playersSelected, 'emit');
    component.numPlayers = 4;
    component.onPlayersSelected();
    expect(component.playersSelected.emit).toHaveBeenCalledWith(4);
  });
});
