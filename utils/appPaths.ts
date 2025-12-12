// Utility for handling application paths (GitHub Pages compatibility)

export const getBasePath = (): string => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/Auction')) {
        return '/Auction';
    }
    return '';
}

export const getAssetUrl = (path: string): string => {
    const basePath = getBasePath();
    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${basePath}${cleanPath}`;
}
