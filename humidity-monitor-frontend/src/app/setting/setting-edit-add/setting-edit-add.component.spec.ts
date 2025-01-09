import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingEditAddComponent } from './setting-edit-add.component';

describe('SettingEditAddComponent', () => {
  let component: SettingEditAddComponent;
  let fixture: ComponentFixture<SettingEditAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingEditAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingEditAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
