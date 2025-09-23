import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { CurrentPageReference } from 'lightning/navigation';
import { logger } from 'c/logger';

export default class RecordMarkdown extends LightningElement {
    @api fieldApiName = 'Description'; // Default field, can be overridden
    @api objectApiName = 'Account'; // Default object, can be overridden
    
    markdownContent = '';

    @wire(CurrentPageReference)
    pageRef;

    get recordId() {
        return this.pageRef?.state?.c__recordId || this.pageRef?.attributes?.recordId;
    }

    get fullFieldApiName() {
        if (!this.fieldApiName || !this.objectApiName) {
            return null;
        }
        return `${this.objectApiName}.${this.fieldApiName}`;
    }

    @wire(getRecord, { recordId: '$recordId', fields: '$fields' })
    wiredRecord({ error, data }) {
        if (data) {
            logger.debug('RecordMarkdown: Record data loaded', { data });
            this.markdownContent = getFieldValue(data, this.fullFieldApiName) || '';
            logger.debug('RecordMarkdown: Markdown content extracted', { 
                fieldApiName: this.fieldApiName,
                objectApiName: this.objectApiName,
                fullFieldApiName: this.fullFieldApiName,
                contentLength: this.markdownContent.length,
                content: this.markdownContent
            });
        } else if (error) {
            logger.error('RecordMarkdown: Error loading record', { error });
            this.markdownContent = '';
        }
    }

    get fields() {
        if (!this.fullFieldApiName || !this.recordId) {
            return [];
        }
        return [this.fullFieldApiName];
    }

    get hasContent() {
        return this.markdownContent && this.markdownContent.trim().length > 0;
    }
}
