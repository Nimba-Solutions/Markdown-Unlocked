import { LightningElement, api } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import { logger } from 'c/logger';
import MARKED_JS from '@salesforce/resourceUrl/marked';

export default class MarkdownRenderer extends LightningElement {
    _markdownContent;
    _markedLoaded = false;
    _marked;
    resourcesLoading = false;

    connectedCallback() {
        logger.debug('MarkdownRenderer: Component initialized');
    }

    renderedCallback() {
        // Skip if already initialized or resources are currently loading
        if (this._markedLoaded || this.resourcesLoading) {
            return;
        }

        // Set flag to prevent concurrent loading
        this.resourcesLoading = true;

        this.loadMarked()
            .then(() => {
                this._markedLoaded = true;
                this.resourcesLoading = false;
                logger.info('Marked library loaded successfully');
                
                // If we already have content, render it now that marked is loaded
                if (this._markdownContent) {
                    this.renderMarkdown();
                }
            })
            .catch((error) => {
                logger.error('Error loading marked library:', error);
                this.resourcesLoading = false;
            });
    }

    async loadMarked() {
        try {
            const markedPath = `${MARKED_JS}/markedmin.js`;
            logger.debug('MarkdownRenderer: Loading marked library', { markedPath });
            await loadScript(this, markedPath);
            
            // Check for marked in various possible locations
            const marked = window.marked || window.Marked || (window.marked && window.marked.default);
            
            if (!marked) {
                throw new Error('Marked library failed to load into global scope');
            }

            this._marked = marked;
            logger.debug('MarkdownRenderer: Marked library loaded', { 
                markedExists: typeof this._marked !== 'undefined',
                markedType: typeof this._marked,
                markedKeys: Object.keys(this._marked || {})
            });

            // Use marked.use() to configure options
            this._marked.use({
                gfm: true,
                breaks: true
            });

            return Promise.resolve();
        } catch (error) {
            logger.error('MarkdownRenderer: Error loading marked library', { 
                error, 
                errorMessage: error.message, 
                errorStack: error.stack,
                windowMarkedExists: typeof window.marked !== 'undefined',
                windowMarked: window.marked,
                windowMarkedKeys: Object.keys(window)
            });
            return Promise.reject(error);
        }
    }

    renderMarkdown() {
        const container = this.template.querySelector('.markdown-content');
        if (container && this._markdownContent && this._markedLoaded && this._marked) {
            logger.debug('MarkdownRenderer: Rendering markdown content', { 
                contentLength: this._markdownContent.length,
                markedExists: typeof this._marked !== 'undefined',
                markedType: typeof this._marked
            });
            try {
                const html = this._marked.parse(this._markdownContent);
                logger.debug('MarkdownRenderer: Parsed markdown to HTML', { html });
                container.innerHTML = html;
            } catch (error) {
                logger.error('MarkdownRenderer: Error parsing markdown', { 
                    error, 
                    errorMessage: error.message, 
                    errorStack: error.stack,
                    markedExists: typeof this._marked !== 'undefined',
                    markedType: typeof this._marked
                });
                container.innerHTML = this._markdownContent; // Fallback to raw content
            }
        } else {
            logger.warn('MarkdownRenderer: Cannot render markdown', {
                hasContainer: !!container,
                hasContent: !!this._markdownContent,
                markedLoaded: this._markedLoaded,
                markedExists: !!this._marked
            });
        }
    }

    @api
    set markdownContent(value) {
        logger.debug('MarkdownRenderer: Setting markdown content', { value });
        this._markdownContent = value;
        if (this._markedLoaded) {
            this.renderMarkdown();
        }
    }

    get markdownContent() {
        return this._markdownContent;
    }
} 