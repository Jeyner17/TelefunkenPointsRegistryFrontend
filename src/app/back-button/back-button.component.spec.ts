import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { BackButtonComponent } from './back-button.component';

describe('BackButtonComponent', () => {
  let component: BackButtonComponent;
  let fixture: ComponentFixture<BackButtonComponent>;
  let locationSpy: jasmine.SpyObj<Location>;

  beforeEach(async () => {
    // Se crea un espía de Jasmine para la clase Location con el método 'back'
    locationSpy = jasmine.createSpyObj('Location', ['back']);

    await TestBed.configureTestingModule({
      // Se importa el componente a probar
      imports: [BackButtonComponent],
      // Se provee el espía en lugar del servicio real de Location
      providers: [{ provide: Location, useValue: locationSpy }]
    })
    .compileComponents();

    // Se crea la instancia del componente
    fixture = TestBed.createComponent(BackButtonComponent);
    component = fixture.componentInstance;
    // Se detectan los cambios en la vista
    fixture.detectChanges();
  });

  // Prueba 1: Verifica que el componente se crea correctamente
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Prueba 2: Verifica que al llamar a goBack(), se ejecuta location.back()
  it('should call location.back when goBack is called', () => {
    component.goBack(); // Llama al método goBack del componente
    expect(locationSpy.back).toHaveBeenCalled(); // Verifica que location.back() fue llamado
  });

  // Prueba 3: Verifica que el botón de retroceso se renderiza con el texto correcto
  it('should render the back button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('button')?.textContent).toContain('Regresar');
  });
});
