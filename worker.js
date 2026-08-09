addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  let targetUrlStr = url.pathname.slice(1) + url.search
  
  if (!targetUrlStr.startsWith('http://') && !targetUrlStr.startsWith('https://')) {
    return new Response('Invalid target URL', { status: 400 })
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      }
    })
  }

  const newHeaders = new Headers(request.headers)

  // Strip origin headers so CDNs don't see the GitHub Pages origin and block it
  newHeaders.delete('Origin')
  newHeaders.delete('Referer')

  // Spoof legitimate browser headers per-site
  if (targetUrlStr.includes('donmai.us')) {
    newHeaders.set('Referer', 'https://danbooru.donmai.us/')
    newHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
  } else if (targetUrlStr.includes('yande.re') || targetUrlStr.includes('files.yande.re')) {
    newHeaders.set('Referer', 'https://yande.re/')
    newHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
  } else if (targetUrlStr.includes('gelbooru.com') || targetUrlStr.includes('img1.gelbooru.com') || targetUrlStr.includes('img2.gelbooru.com') || targetUrlStr.includes('img3.gelbooru.com') || targetUrlStr.includes('img4.gelbooru.com')) {
    newHeaders.set('Referer', 'https://gelbooru.com/')
    newHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
  } else if (targetUrlStr.includes('aibooru.online')) {
    newHeaders.set('Referer', 'https://aibooru.online/')
    newHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
  } else if (targetUrlStr.includes('civitai.com') || targetUrlStr.includes('image.civitai.com')) {
    newHeaders.set('Referer', 'https://civitai.com/')
    newHeaders.set('Authorization', 'Bearer 9fdabaf75d757af6ffed6c0a4a5a7be1')
    newHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
  } else if (targetUrlStr.includes('rule34.xxx') || targetUrlStr.includes('api.rule34.xxx')) {
    newHeaders.set('Referer', 'https://rule34.xxx/')
    newHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
  } else if (targetUrlStr.includes('nhentai.net') || targetUrlStr.includes('t.nhentai.net') || targetUrlStr.includes('i.nhentai.net')) {
    newHeaders.set('Referer', 'https://nhentai.net/')
    newHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
  } else if (targetUrlStr.includes('deviantart.com') || targetUrlStr.includes('images-wixmp-') || targetUrlStr.includes('wixmp.com')) {
    newHeaders.set('Referer', 'https://www.deviantart.com/')
    newHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
  }

  try {
    // Forward body for POST requests (needed for DeviantArt OAuth token endpoint)
    const fetchInit = {
      method: request.method,
      headers: newHeaders,
      redirect: 'follow',
    }
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
      fetchInit.body = request.body
    }

    const response = await fetch(targetUrlStr, fetchInit)

    const modifiedHeaders = new Headers(response.headers)
    modifiedHeaders.set('Access-Control-Allow-Origin', '*')
    modifiedHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS')
    modifiedHeaders.set('Access-Control-Allow-Headers', '*')
    modifiedHeaders.set('Cross-Origin-Resource-Policy', 'cross-origin')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: modifiedHeaders
    })
  } catch (err) {
    return new Response('Proxy Error: ' + err.message, { status: 500 })
  }
}
