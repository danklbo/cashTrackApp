// http://51.38.129.251
// http://127.0.0.1:8000/
// https://cms.finance.danklbo.com

export const buildApiUrl = (path) => new URL(path, 'http://127.0.0.1:8000').toString();