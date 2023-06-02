import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Result } from '../../model/result';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
})
export class ResultComponent {
  @Input() result!: Result;
  @Output() close = new EventEmitter<void>();

  constructor(private clipboard: Clipboard, private snackBar: MatSnackBar) {}

  copy() {
    this.clipboard.copy(this.result.missing.join(', '));
    this.snackBar.open('Copié !', '', {
      duration: 2000,
    });
  }
}
