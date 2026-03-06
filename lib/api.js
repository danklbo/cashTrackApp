/*
        'http://127.0.0.1:8000'
        'https://cms.finance.danklbo.com'
*/

export const buildApiUrl = (path) => new URL(path,
        'https://cms.finance.danklbo.com'
    ).toString();