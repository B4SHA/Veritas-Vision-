
'use server';
import {JSDOM} from 'jsdom';


/**
 * Fetches the text content of a news article from its URL.
 * @param url The URL of the news article.
 * @returns The text content of the article.
 */
export async function getArticleContentFromUrl(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;

        // Remove script and style elements
        document.querySelectorAll('script, style').forEach(elem => elem.remove());

        // Common selectors for article content
        const selectors = [
            'article',
            '.post-content',
            '.entry-content',
            '.article-body',
            '[itemprop="articleBody"]',
            'main[role="main"]',
            '#content',
            'body' // Fallback
        ];

        let mainContent = null;
        for (const selector of selectors) {
            mainContent = document.querySelector(selector);
            if (mainContent) break;
        }

        if (mainContent) {
            // Remove non-content elements
            mainContent.querySelectorAll('.ad, .advert, .sidebar, .footer, .header, .nav, .menu, .related-posts, .comments, .social-share, .author-bio, .cookie-notice, .ad-container, [class*="-ad-"], [id*="-ad-"]').forEach(elem => elem.remove());
            return mainContent.textContent?.trim().replace(/\s{2,}/g, ' ') || 'Could not extract article text.';
        }

        return 'Could not find main article content.';
    } catch (error) {
        console.error(`Error fetching article content: ${error}`);
        return `Error: Could not fetch or process content from the URL. Details: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
}
