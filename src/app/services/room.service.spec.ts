import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';


import { RoomService } from './room.service';

describe('RoomService', () => {
  let service: RoomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomService);
  });beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RoomService]
    }).compileComponents();
  });
  

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
