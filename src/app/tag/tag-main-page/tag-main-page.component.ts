import { Component, NgZone, OnInit } from '@angular/core';
import { Tag } from '../../model/tag';
import { TaggedMessage } from '../../model/tagged-message';
import { Group } from '../../model/group';

@Component({
  selector: 'app-tag-main-page',
  templateUrl: './tag-main-page.component.html',
  styleUrls: ['./tag-main-page.component.scss'],
})
export class TagMainPageComponent implements OnInit {
  tags: Tag[] = [];
  taggedMessages: TaggedMessage[] = [];

  constructor(private ngZone: NgZone) {}

  ngOnInit (): void {
    this.getSavedTaggedMessages();

    // Ouverture de la liste des tags
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id! },
          func: () => {
            const groupElements = document.getElementsByClassName('zimbra-client_folder-list_groupToggle');

            let clickEvent = new Event('click');
            for (let i = 0; i <= groupElements.length; i++) {
              const innerHtml = groupElements.item(i)?.parentElement?.innerHTML;

              if(innerHtml?.includes('Mots clés') && !innerHtml?.includes('zimbra-client_collapsible-control_collapsibleControl zimbra-client_collapsible-control_open zimbra-client_folder-list_folderCollapsibleControl') ) {
                groupElements.item(i)?.dispatchEvent(clickEvent);
              }
            }
          },
        }
      );
    });

    // Récupération des tags
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id! },
          func: () => {
            // Récupération des tags
            const tagsElements = document.getElementsByClassName('zimbra-client_folder-list_itemTitle zimbra-client_folder-list_tagName');

            const tags: Tag[] = [];

            for (let i = 0; i <= tagsElements.length; i++) {
              const element = tagsElements.item(i);

              if(element) {
                const color = element.getAttribute('style')?.split('background-color:')[1].split(';')[0];

                tags.push({
                  name: element.innerHTML,
                  color: color ?? '#FFFFFF',
                })
              }
            }

            return JSON.stringify(tags);
          },
        },
        (tags) => {
          this.ngZone.run(() => {
            const rawTags = tags[0].result;
            this.tags = JSON.parse(rawTags) as Tag[];
          });
        },
      );
    });
  }

  applyTagToCurrentOpenedMessage(tag: Tag) {
    // Récupération de l'identifiant du message
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id! },
          func: () => {
            const messagesElements = document.getElementsByClassName('zimbra-client_mail-list-item_message zimbra-client_mail-list-item_narrow zimbra-client_mail-list-item_selected');

            const currentMessageId = messagesElements[0]?.getAttribute('navigatedId');

            if(currentMessageId) {
              return currentMessageId;
            }

            return '0';
          },
        },
        (messageId) => {
          this.ngZone.run(() => {
            // Application de la couleur du tag sur le message
            const message = {tag, messageId: messageId[0].result};
            this.applyTags([message])
            this.saveTaggedMessage(message)
          });
        },
      );
    });
  }

  applyTags(messages: TaggedMessage[]): void {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id! },
          args: [messages],
          func: (messages: TaggedMessage[]) => {
            for (let message of messages) {
              const messagePreviewElement = document.getElementById('mail_item_' + message.messageId);

              if (messagePreviewElement) {
                messagePreviewElement.style.backgroundColor = message.tag.color;
                messagePreviewElement.style.borderRight = 'solid 6px ' + message.tag.color;
              }
            }
          },
        },
      );
    });
  }

  private getSavedTaggedMessages(): void {
    try {
      chrome.storage.sync.get('taggedMessages', ({ taggedMessages }) => {
        if (taggedMessages) {
          this.ngZone.run(() => {
            this.taggedMessages = JSON.parse(taggedMessages) as TaggedMessage[];
            this.applyTags(this.taggedMessages);
          });
        }
      });
    } catch {
      console.error('Impossible de récupérer les données sauvegardées.')
    }
  }

  private saveTaggedMessage(message: TaggedMessage): void {
    const index = this.taggedMessages.findIndex(m => m.messageId === message.messageId);

    if (index !== -1) {
      this.taggedMessages[index].tag = message.tag;
    } else {
      this.taggedMessages.push(message);
    }

    console.log('SAVE', this.taggedMessages)
    chrome.storage.sync.set({ taggedMessages: JSON.stringify(this.taggedMessages) });
  }
}
