import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tag } from '../../model/tag';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss'],
})
export class TagListComponent {
  @Input() tags!: Tag[];
  @Output() edit = new EventEmitter<number>();

  editTag(): void {

  }
}
