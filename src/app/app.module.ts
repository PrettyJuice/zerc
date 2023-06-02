import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AppComponent } from './app.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { GroupListComponent } from './group/group-list/group-list.component';
import { GroupCrudComponent } from './group/group-crud/group-crud.component';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ResultComponent } from './group/result/result.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { GroupMainPageComponent } from './group/group-main-page/group-main-page.component';
import { TagMainPageComponent } from './tag/tag-main-page/tag-main-page.component';
import { TagListComponent } from './tag/tag-list/tag-list.component';

@NgModule({
  declarations: [AppComponent, GroupMainPageComponent, GroupListComponent, GroupCrudComponent, ResultComponent, TagMainPageComponent, TagListComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatListModule,
    MatChipsModule,
    MatSnackBarModule,
    ClipboardModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
