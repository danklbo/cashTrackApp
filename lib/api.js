// 'http://51.38.129.251'
// 'http://127.0.0.1:8000/'

export const buildApiUrl = (path) => new URL(path, 'https://cms.finance.danklbo.com').toString();