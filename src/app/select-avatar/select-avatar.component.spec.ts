import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectAvatarComponent } from './select-avatar.component';

describe('SelectAvatarComponent', () => {
  let component: SelectAvatarComponent;
  let fixture: ComponentFixture<SelectAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectAvatarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Prueba para verificar que el avatar se inicializa como null
  it('should initialize avatar as null', () => {
    expect(component.avatar).toBeNull();
  });

  // Prueba para verificar que el método onFileSelected actualiza el avatar y emite el evento
  it('should update avatar and emit event on file selected', () => {
    spyOn(component.avatarSelected, 'emit');
    const file = new Blob(['avatar'], { type: 'image/png' });
    const event = { target: { files: [file] } } as unknown as Event;

    component.onFileSelected(event);

    const reader = new FileReader();
    reader.onload = () => {
      expect(component.avatar).toBe(reader.result);
      expect(component.avatarSelected.emit).toHaveBeenCalledWith(reader.result);
    };
    reader.readAsDataURL(file);
  });

  // Prueba para verificar que el método onFileSelected no hace nada si no hay archivo seleccionado
  it('should not update avatar if no file is selected', () => {
    spyOn(component.avatarSelected, 'emit');
    const event = { target: { files: [] } } as unknown as Event;

    component.onFileSelected(event);

    expect(component.avatar).toBeNull();
    expect(component.avatarSelected.emit).not.toHaveBeenCalled();
  });
});
