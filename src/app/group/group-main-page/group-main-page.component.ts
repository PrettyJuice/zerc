import { Component, NgZone, OnInit } from '@angular/core';
import { Group } from '../../model/group';
import { Result } from '../../model/result';

@Component({
  selector: 'app-group-main-page',
  templateUrl: './group-main-page.component.html',
  styleUrls: ['./group-main-page.component.scss'],
})
export class GroupMainPageComponent implements OnInit {
  state: 'list' | 'crud' = 'list';
  groups: Group[] = [];
  groupIndexToEdit?: number;
  result?: Result;

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    try {
      chrome.storage.sync.get('data', ({ data }) => {
        if (data) {
          this.ngZone.run(() => {
            this.groups = JSON.parse(data) as Group[];
          });
        }
      });
    } catch {
      console.error('Impossible de récupérer les données sauvegardées.')
    }
  }

  editGroup(groupIndex: number) {
    this.groupIndexToEdit = groupIndex;
    this.state = 'crud';
  }

  saveGroup(group: Group | null): void {
    if (this.groupIndexToEdit !== undefined) {
      if (group) {
        this.groups[this.groupIndexToEdit] = group;
      } else {
        this.groups.splice(this.groupIndexToEdit, 1);
      }
    } else if (group) {
      this.groups.push(group);
    }

    delete this.groupIndexToEdit;
    this.state = 'list';

    chrome.storage.sync.set({ data: JSON.stringify(this.groups) });
  }

  checkEmails(group: Group): void {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id! },
        func: () => {
          // Affiche tout les emails
          const seeMore = document.getElementsByClassName('zimbra-client_address-list_addressToggle');

          if (!seeMore) {
            return;
          }

          let clickEvent = new Event('click');
          for (let i = 0; i <= seeMore.length; i++) {
            if (seeMore.item(i)?.innerHTML !== 'Montre moins') {
              seeMore.item(i)?.dispatchEvent(clickEvent);
            }
          }
        },
      });
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id! },
          args: [group],
          func: (group: Group) => {
            // Vérifie les emails présents dans la liste
            const missingEmails: string[] = [];

            const emailElements: HTMLElement[] = [];
            const elements = document.querySelectorAll<HTMLElement>(
              '.zimbra-client_viewer_responsive-viewer_toAddressList .zimbra-client_address-list_addressName',
            );
            elements.forEach((element) => {
              emailElements.push(element);
            });

            group.emails.forEach((email) => {
              const emailElement = emailElements.find((element) => element.title.toLowerCase() === email.toLowerCase());
              if (emailElement) {
                emailElement.style.color = 'white';
                emailElement.style.fontWeight = 'bold';
                emailElement.style.background = 'green';
                emailElement.style.borderRadius = '3px';
              } else {
                missingEmails.push(email);
              }
            });

            return JSON.stringify({ group, missing: missingEmails });
          },
        },
        (result) => {
          this.ngZone.run(() => {
            this.result = JSON.parse(result[0].result) as Result;
          });
        },
      );
    });
  }
}
