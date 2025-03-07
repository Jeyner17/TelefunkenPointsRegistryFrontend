import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HomeComponent } from './home.component';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterTestingModule, HomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Prueba para verificar la navegación a una ruta específica
  it('should navigate to the specified path', () => {
    const navigateSpy = spyOn(router, 'navigate');
    const path = '/test-path';
    component.navigateTo(path);
    expect(navigateSpy).toHaveBeenCalledWith([path]);
  });

  // Prueba para verificar que el componente se inicializa correctamente
  it('should initialize the component', () => {
    expect(component).toBeDefined();
  });

  // Prueba para verificar que el método navigateTo está definido
  it('should have navigateTo method defined', () => {
    expect(component.navigateTo).toBeDefined();
  });
});
