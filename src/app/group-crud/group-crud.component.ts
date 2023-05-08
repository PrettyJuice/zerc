import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Group } from '../model/group';

@Component({
  selector: 'app-group-crud',
  templateUrl: './group-crud.component.html',
  styleUrls: ['./group-crud.component.scss']
})
export class GroupCrudComponent implements OnInit {
  @Input() group?: Group;
  @Output() saveGroup = new EventEmitter<Group>();
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  editingGroup!: Group;

  ngOnInit(): void {
    if(this.group) {
      this.editingGroup = this.group;
    } else {
      this.editingGroup =  {name: '', emails: []}
    }
  }

  add(event: MatChipInputEvent): void {
    const value = event.value.toLowerCase().trim();

    if (value.length === 0) {
      return;
    }

    if(this.editingGroup.emails.indexOf(value) === -1) {
      this.editingGroup.emails.push(value);
    }
    event.chipInput!.clear();
  }

  remove(email: string): void {
    const index = this.editingGroup.emails.indexOf(email);

    if (index >= 0) {
      this.editingGroup.emails.splice(index, 1);
    }
  }

  edit(email: string, event: MatChipEditedEvent): void {
    const value = event.value.trim();

    if (!value || value.length === 0) {
      this.remove(email);
      return;
    }

    const index = this.editingGroup.emails.indexOf(email);
    if (index >= 0) {
      this.editingGroup.emails[index] = value;
    }
  }

  save(): void {
    this.saveGroup.emit(this.editingGroup);
  }
}
