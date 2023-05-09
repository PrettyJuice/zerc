import { Component, NgZone, OnInit } from '@angular/core';
import { Group } from './model/group';
import { Result } from './model/result';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  state: 'list' | 'crud' = 'list';
  groups: Group[] = [];
  groupIndexToEdit?: number;
  result?: Result;

  constructor (private ngZone:NgZone) {
  }

  ngOnInit(): void {
    chrome.storage.sync.get('data', ({ data }) => {
      if(data) {
        this.ngZone.run(() => {
          this.groups = JSON.parse(data) as Group[];
        })
      }
    });
  }

  editGroup(groupIndex: number) {
    this.groupIndexToEdit = groupIndex;
    this.state = 'crud'
  }

  saveGroup(group: Group | null): void {
    if (this.groupIndexToEdit !== undefined) {
      if(group) {
        this.groups[this.groupIndexToEdit] = group;
      } else {
        this.groups.splice(this.groupIndexToEdit,1);
      }
    } else if(group){
      this.groups.push(group);
    }

    delete this.groupIndexToEdit;
    this.state = 'list';

    chrome.storage.sync.set({data:JSON.stringify(this.groups)});
  }

  checkEmails(group: Group): void {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id! },
        args: [group.emails],
        func: (emailsNeeded: string[]) => {
          // Affiche tout les emails
          const seeMore = document.getElementsByClassName('zimbra-client_address-list_addressToggle').item(0);

          // TODO : Ouvrir tout
          if(seeMore && seeMore.innerHTML !== 'Montre moins') {
            let clickEvent = new Event('click');
            seeMore.dispatchEvent(clickEvent);
          }

          // Vérifie les emails présents dans la liste
          setTimeout(() => {
            const missingEmails: string[] = [];

            const emailElements: HTMLElement[] = [];
            const elements = document.querySelectorAll<HTMLElement>('.zimbra-client_viewer_responsive-viewer_toAddressList .zimbra-client_address-list_addressName');
            elements.forEach(element => {
              emailElements.push(element);
            });

            emailsNeeded.forEach(email => {
              const emailElement = emailElements.find(element => element.title.toLowerCase() === email.toLowerCase());
              if(emailElement) {
                emailElement.style.color = 'white';
                emailElement.style.fontWeight = 'bold';
                emailElement.style.background = 'green';
                emailElement.style.borderRadius = '3px';
              } else {
                missingEmails.push(email);
              }
            })

            const emailViewer = document.getElementsByClassName('zimbra-client_html-viewer_inner').item(0);

            if(missingEmails.length > 0) {
              const statusElement = document.createElement('div');
              statusElement.style.color = 'white';
              statusElement.style.background = 'red';
              statusElement.style.fontWeight = 'bold';
              statusElement.style.position = 'absolute';
              statusElement.style.fontSize = '18px';
              statusElement.style.top = '0px';
              statusElement.style.left = '0';
              statusElement.style.zIndex = '100';
              statusElement.style.padding = '5px 10px';
              statusElement.style.borderRadius = '5px';
              statusElement.innerHTML = missingEmails.join(', ');
              emailViewer?.appendChild(statusElement);
            }

            this.ngZone.run(() => {
              this.result =
                {group, missing:missingEmails}
              console.log('WESHH')
            })
          })
        }
      });
    });
  }
}
