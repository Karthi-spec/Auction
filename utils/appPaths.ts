// Utility for handling application paths (GitHub Pages compatibility)

export const getBasePath = (): string => {
    if (typeof window !== 'undefined') {
        // Check for known paths or GitHub Pages structure
        const path = window.location.pathname;

        // If explicitly starting with /Auction (legacy support)
        if (path.startsWith('/Auction')) {
            return '/Auction';
        }

        // Dynamic detection for GitHub Pages
        // URL format: username.github.io/REPO_NAME/...
        if (window.location.hostname.endsWith('github.io') && path !== '/') {
            const firstSegment = path.split('/')[1];
            if (firstSegment) {
                return `/${firstSegment}`;
            }
        }
    }
    return '';
}

export const getAssetUrl = (path: string): string => {
    const basePath = getBasePath();
    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${basePath}${cleanPath}`;
}
