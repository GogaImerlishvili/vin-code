import inlineCss from 'inline-css'
import hb from 'handlebars'
import getConfig from 'next/config'

const { serverRuntimeConfig } = getConfig()

// უნიკალური და აგრესიული Carfax ლოგოს მოძებნის ფუნქცია
const extractAndEmbedCarfaxLogos = async (
  html: string,
  fetch: any
): Promise<string> => {
  console.log(
    '[extractCarfaxLogos] Starting aggressive Carfax logo extraction...'
  )

  let processedHtml = html

  // 1. ყველა სურათის URL-ის მოძებნა და შემოწმება Carfax-ის შესაძლო კავშირისთვის
  const allImageRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi
  const allImages = [...processedHtml.matchAll(allImageRegex)]

  console.log(
    `[extractCarfaxLogos] Found ${allImages.length} total images to analyze`
  )

  const carfaxKeywords = [
    'carfax',
    'CARFAX',
    'Carfax',
    'logo',
    'Logo',
    'LOGO',
    'brand',
    'header',
    'nav',
    'cf-',
    'cfx-',
    'carfax-'
  ]

  for (const imageMatch of allImages) {
    const fullImgTag = imageMatch[0]
    const imageUrl = imageMatch[1]

    // გამოვრიცხოთ უკვე base64 encoded სურათები
    if (imageUrl.startsWith('data:')) {
      continue
    }

    // შევამოწმოთ არის თუ არა ეს სურათი Carfax-თან დაკავშირებული
    const isCarfaxRelated = carfaxKeywords.some(
      (keyword) =>
        imageUrl.toLowerCase().includes(keyword.toLowerCase()) ||
        fullImgTag.toLowerCase().includes(keyword.toLowerCase())
    )

    // ან თუ URL-ში არის carfax domain
    const isCarfaxDomain =
      imageUrl.includes('carfax.com') ||
      imageUrl.includes('carfaxonline.com') ||
      imageUrl.includes('cfx.') ||
      imageUrl.includes('cf-')

    if (isCarfaxRelated || isCarfaxDomain) {
      console.log(
        `[extractCarfaxLogos] Processing potential Carfax image: ${imageUrl}`
      )

      try {
        const response = await fetch(imageUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            Referer: 'https://www.carfax.com/',
            'Accept-Encoding': 'gzip, deflate, br',
            Connection: 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          },
          timeout: 20000
        })

        if (!response.ok) {
          console.warn(
            `[extractCarfaxLogos] HTTP ${response.status} for ${imageUrl} - ${response.statusText}`
          )

          // თუ 403/401 ერორია, სცადოთ სხვა headers
          if (response.status === 403 || response.status === 401) {
            console.log(
              `[extractCarfaxLogos] Retrying with different headers for ${imageUrl}`
            )
            const retryResponse = await fetch(imageUrl, {
              headers: {
                'User-Agent': 'PostmanRuntime/7.26.8',
                Accept: '*/*',
                'Cache-Control': 'no-cache'
              },
              timeout: 15000
            })

            if (retryResponse.ok) {
              const buffer = await retryResponse.buffer()
              const contentType =
                retryResponse.headers.get('content-type') || 'image/png'
              const base64 = buffer.toString('base64')
              const base64Src = `data:${contentType};base64,${base64}`

              processedHtml = processedHtml.replace(
                new RegExp(
                  `src=["']${imageUrl.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    '\\$&'
                  )}["']`,
                  'gi'
                ),
                `src="${base64Src}"`
              )

              console.log(
                `[extractCarfaxLogos] ✅ Successfully converted (retry): ${imageUrl.substring(
                  0,
                  60
                )}... (${buffer.length} bytes)`
              )
              continue
            }
          }
          continue
        }

        const buffer = await response.buffer()
        const contentType = response.headers.get('content-type') || 'image/png'
        const base64 = buffer.toString('base64')
        const base64Src = `data:${contentType};base64,${base64}`

        // ჩავანაცვლოთ ორიგინალი URL base64-ით
        processedHtml = processedHtml.replace(
          new RegExp(
            `src=["']${imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`,
            'gi'
          ),
          `src="${base64Src}"`
        )

        console.log(
          `[extractCarfaxLogos] ✅ Successfully converted: ${imageUrl.substring(
            0,
            60
          )}... (${buffer.length} bytes)`
        )
      } catch (error) {
        console.error(
          `[extractCarfaxLogos] ❌ Failed to fetch: ${imageUrl}`,
          error.message
        )

        // თუ network error არის, სცადოთ კიდევ ერთხელ უფრო მარტივი მეთოდით
        try {
          console.log(
            `[extractCarfaxLogos] Attempting fallback method for ${imageUrl}`
          )
          const fallbackResponse = await fetch(imageUrl, {
            method: 'GET',
            timeout: 10000
          })

          if (fallbackResponse.ok) {
            const buffer = await fallbackResponse.buffer()
            const base64 = buffer.toString('base64')
            const base64Src = `data:image/png;base64,${base64}`

            processedHtml = processedHtml.replace(
              new RegExp(
                `src=["']${imageUrl.replace(
                  /[.*+?^${}()|[\]\\]/g,
                  '\\$&'
                )}["']`,
                'gi'
              ),
              `src="${base64Src}"`
            )

            console.log(
              `[extractCarfaxLogos] ✅ Fallback success: ${imageUrl.substring(
                0,
                60
              )}...`
            )
          }
        } catch (fallbackError) {
          console.error(
            `[extractCarfaxLogos] ❌ Fallback also failed for ${imageUrl}`
          )
        }
      }
    }
  }

  // 2. დამატებითი რაუნდი - მოძებნა CSS background-image-ებში
  const backgroundImageRegex =
    /background-image:\s*url\(["']?([^"'()]+)["']?\)/gi
  const backgroundMatches = [...processedHtml.matchAll(backgroundImageRegex)]

  console.log(
    `[extractCarfaxLogos] Found ${backgroundMatches.length} background images`
  )

  for (const bgMatch of backgroundMatches) {
    const bgUrl = bgMatch[1]
    if (bgUrl.startsWith('data:')) continue

    const isCarfaxBg = carfaxKeywords.some((keyword) =>
      bgUrl.toLowerCase().includes(keyword.toLowerCase())
    )

    if (isCarfaxBg) {
      try {
        console.log(
          `[extractCarfaxLogos] Converting background image: ${bgUrl}`
        )
        const response = await fetch(bgUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            Accept: 'image/*'
          },
          timeout: 15000
        })

        if (response.ok) {
          const buffer = await response.buffer()
          const contentType =
            response.headers.get('content-type') || 'image/png'
          const base64 = buffer.toString('base64')
          const base64Src = `data:${contentType};base64,${base64}`

          processedHtml = processedHtml.replace(
            bgMatch[0],
            `background-image: url(${base64Src})`
          )
          console.log(
            `[extractCarfaxLogos] ✅ Background image converted: ${bgUrl.substring(
              0,
              50
            )}...`
          )
        }
      } catch (error) {
        console.error(
          `[extractCarfaxLogos] Failed to convert background image: ${bgUrl}`,
          error.message
        )
      }
    }
  }

  console.log(
    `[extractCarfaxLogos] Aggressive Carfax extraction completed. HTML length: ${processedHtml.length}`
  )
  return processedHtml
}

// უნივერსალური სურათების converter ყველა დანარჩენი სურათისთვის
const convertAllRemainingImages = async (
  html: string,
  fetch: any
): Promise<string> => {
  console.log(
    '[convertAllImages] Starting conversion of all remaining images...'
  )

  let processedHtml = html

  // მოძებნა ყველა HTTP/HTTPS სურათისა რომელიც ჯერ base64-ად არაა გარდაქმნილი
  const httpImageRegex = /<img[^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/gi
  const httpImages = [...processedHtml.matchAll(httpImageRegex)]

  console.log(
    `[convertAllImages] Found ${httpImages.length} HTTP images to process`
  )

  for (const imageMatch of httpImages) {
    const fullImgTag = imageMatch[0]
    const imageUrl = imageMatch[1]

    // გამოვრიცხოთ base64 encoded სურათები
    if (imageUrl.startsWith('data:')) {
      continue
    }

    console.log(`[convertAllImages] Processing: ${imageUrl}`)

    try {
      // პირველი მცდელობა - სტანდარტული headers
      let response = await fetch(imageUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          DNT: '1',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 15000
      })

      // თუ 403, 401, 404 - სცადოთ სხვა User-Agent
      if (!response.ok && [403, 401, 404].includes(response.status)) {
        console.log(
          `[convertAllImages] Status ${response.status}, trying alternative headers for: ${imageUrl}`
        )

        response = await fetch(imageUrl, {
          headers: {
            'User-Agent': 'curl/7.68.0',
            Accept: '*/*',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache'
          },
          timeout: 10000
        })
      }

      // კიდევ ერთი მცდელობა wget-ის იმიტაციით
      if (!response.ok) {
        console.log(
          `[convertAllImages] Second attempt failed, trying wget-style for: ${imageUrl}`
        )

        response = await fetch(imageUrl, {
          headers: {
            'User-Agent': 'Wget/1.20.3 (linux-gnu)',
            Accept: '*/*',
            'Accept-Encoding': 'identity',
            Connection: 'Keep-Alive'
          },
          timeout: 8000
        })
      }

      if (!response.ok) {
        console.warn(
          `[convertAllImages] ❌ Failed to fetch ${imageUrl} - HTTP ${response.status}: ${response.statusText}`
        )
        continue
      }

      const buffer = await response.buffer()
      if (buffer.length === 0) {
        console.warn(`[convertAllImages] ❌ Empty response for ${imageUrl}`)
        continue
      }

      // MIME type-ის განსაზღვრა
      let contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('image/')) {
        // Fallback - URL extension-ით განვსაზღვროთ
        if (imageUrl.includes('.png')) contentType = 'image/png'
        else if (imageUrl.includes('.jpg') || imageUrl.includes('.jpeg'))
          contentType = 'image/jpeg'
        else if (imageUrl.includes('.gif')) contentType = 'image/gif'
        else if (imageUrl.includes('.svg')) contentType = 'image/svg+xml'
        else if (imageUrl.includes('.webp')) contentType = 'image/webp'
        else contentType = 'image/png' // Default fallback
      }

      const base64 = buffer.toString('base64')
      const base64Src = `data:${contentType};base64,${base64}`

      // ჩანაცვლება HTML-ში
      processedHtml = processedHtml.replace(
        new RegExp(
          `src=["']${imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`,
          'gi'
        ),
        `src="${base64Src}"`
      )

      console.log(
        `[convertAllImages] ✅ Converted: ${imageUrl.substring(0, 70)}... (${
          buffer.length
        } bytes, ${contentType})`
      )
    } catch (error) {
      console.error(
        `[convertAllImages] ❌ Error converting ${imageUrl}:`,
        error.message
      )
    }
  }

  console.log(`[convertAllImages] Universal image conversion completed`)
  return processedHtml
}

// Carfax elements-ის ანალიზის ფუნქცია
const analyzeCarfaxElements = (html: string) => {
  console.log(
    '[analyzeCarfaxElements] Starting comprehensive Carfax analysis...'
  )

  const analysis = {
    totalImages: 0,
    carfaxImages: [],
    carfaxKeywordMentions: 0,
    carfaxDomains: [],
    suspiciousElements: [],
    backgroundImages: [],
    inlineStyles: []
  }

  // 1. ყველა IMG tag-ის მოძებნა
  const allImgRegex = /<img[^>]*>/gi
  const allImages = [...html.matchAll(allImgRegex)]
  analysis.totalImages = allImages.length

  // 2. Carfax-თან დაკავშირებული სურათები
  allImages.forEach((imgMatch, index) => {
    const imgTag = imgMatch[0]
    const srcMatch = imgTag.match(/src=["']([^"']+)["']/)

    if (srcMatch) {
      const src = srcMatch[1]

      // შევამოწმოთ არის თუ არა Carfax-თან დაკავშირებული
      if (
        src.toLowerCase().includes('carfax') ||
        imgTag.toLowerCase().includes('carfax') ||
        imgTag.toLowerCase().includes('logo')
      ) {
        analysis.carfaxImages.push({
          index: index,
          src: src,
          fullTag: imgTag.substring(0, 150) + '...'
        })
      }

      // დომენის შემოწმება
      if (
        src.includes('carfax.com') ||
        src.includes('cfx.') ||
        src.includes('cf-')
      ) {
        analysis.carfaxDomains.push(src)
      }
    }
  })

  // 3. ტექსტში "carfax" keyword-ის რაოდენობა
  analysis.carfaxKeywordMentions = (html.match(/carfax/gi) || []).length

  // 4. background-image მოძებნა CSS-ში
  const bgImageRegex = /background-image:\s*url\(["']?([^"'()]+)["']?\)/gi
  const bgMatches = [...html.matchAll(bgImageRegex)]
  analysis.backgroundImages = bgMatches.map((match) => match[1])

  // 5. inline style-ების მოძებნა
  const styleRegex = /style=["']([^"']*carfax[^"']*)["']/gi
  const styleMatches = [...html.matchAll(styleRegex)]
  analysis.inlineStyles = styleMatches.map((match) => match[1])

  // 6. "ეჭვიანი" elements რომლებშიც შეიძლება იყოს carfax ლოგო
  const suspiciousPatterns = [
    /<[^>]*class=[^>]*logo[^>]*>/gi,
    /<[^>]*id=[^>]*logo[^>]*>/gi,
    /<[^>]*class=[^>]*brand[^>]*>/gi,
    /<[^>]*class=[^>]*header[^>]*>/gi
  ]

  suspiciousPatterns.forEach((pattern) => {
    const matches = [...html.matchAll(pattern)]
    analysis.suspiciousElements.push(
      ...matches.map((match) => match[0].substring(0, 100) + '...')
    )
  })

  console.log(`[analyzeCarfaxElements] Analysis complete:
    - Total images: ${analysis.totalImages}
    - Carfax images found: ${analysis.carfaxImages.length}
    - Carfax mentions: ${analysis.carfaxKeywordMentions}
    - Carfax domains: ${analysis.carfaxDomains.length}
    - Background images: ${analysis.backgroundImages.length}
    - Suspicious elements: ${analysis.suspiciousElements.length}`)

  return analysis
}

const generatePDF = async (html: string, tries: number = 3) => {
  console.log('[generatePDF] Start PDF generation. Tries left:', tries)
  try {
    const fetch = (await import('node-fetch')).default

    console.log('[generatePDF] Original HTML length:', html.length)
    console.log('[generatePDF] Analyzing HTML structure for Carfax elements...')

    // HTML preprocessing - მოძებნა და ლოგირება ყველა Carfax-ის შესაძლო element-ისა
    const carfaxElementAnalysis = analyzeCarfaxElements(html)
    console.log('[generatePDF] Carfax analysis result:', carfaxElementAnalysis)

    console.log('[generatePDF] Starting Carfax logos and images processing...')

    // პირველ რიგში Carfax ლოგოების მოძებნა და ჩანაცვლება
    let htmlWithBase64 = await extractAndEmbedCarfaxLogos(html, fetch)
    console.log(
      '[generatePDF] Carfax logos processed, new HTML length:',
      htmlWithBase64.length
    )

    // დამატებითი უნივერსალური სურათების converter
    console.log(
      '[generatePDF] Running universal image converter for all remaining images...'
    )
    htmlWithBase64 = await convertAllRemainingImages(htmlWithBase64, fetch)
    console.log(
      '[generatePDF] Universal image conversion completed, final HTML length:',
      htmlWithBase64.length
    )

    // Skip images that are already base64 encoded
    const base64ImgRegex =
      /<img([^>]*?)src=["']data:image\/[^"']+["']([^>]*?)>/gi
    const base64Matches = [...htmlWithBase64.matchAll(base64ImgRegex)]
    console.log(
      `[generatePDF] Found ${base64Matches.length} images already in base64 format`
    )

    // ფინალური შემოწმება - რამდენი სურათი დარჩა base64-ის გარეშე
    const remainingHttpImages = (
      htmlWithBase64.match(
        /<img[^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/gi
      ) || []
    ).length
    console.log(
      `[generatePDF] Remaining HTTP images after all conversions: ${remainingHttpImages}`
    )

    if (remainingHttpImages > 0) {
      console.warn(
        `[generatePDF] ⚠️  Warning: ${remainingHttpImages} images could not be converted to base64`
      )
    }

    console.log('[generatePDF] Getting puppeteer instance...')
    const puppeteerInstance = await serverRuntimeConfig.puppeteerInstance()

    if (!puppeteerInstance) {
      throw new Error('Failed to get puppeteer instance')
    }

    // Inline CSS to ensure all styles are included
    let parsedHTML
    try {
      parsedHTML = await inlineCss(htmlWithBase64, {
        url: 'https://example.com', // Base URL for relative paths
        preserveMediaQueries: true,
        removeLinkTags: false
      })
      console.log('[generatePDF] CSS inlined successfully')
    } catch (inlineCssError) {
      console.warn(
        '[generatePDF] CSS inlining failed, using original HTML:',
        inlineCssError.message
      )
      parsedHTML = htmlWithBase64
    }

    console.log('[generatePDF] Creating new page...')
    const page = await puppeteerInstance.newPage()

    // Set viewport for better rendering
    await page.setViewport({ width: 1680, height: 1189, deviceScaleFactor: 2 })

    console.log('[generatePDF] Setting page content...')
    await page.setContent(parsedHTML, {
      waitUntil: 'networkidle0',
      timeout: 30000 // Increased timeout for images
    })

    // Wait for images to load
    await page.evaluate(async () => {
      const images = Array.from(document.querySelectorAll('img'))
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve()
          return new Promise((resolve, reject) => {
            img.addEventListener('load', resolve)
            img.addEventListener('error', reject)
            setTimeout(resolve, 3000) // Fallback timeout
          })
        })
      )
    })
    console.log('[generatePDF] Generating PDF (landscape, wide)...')
    const pdf = await page.pdf({
      format: 'A3',
      landscape: true,
      printBackground: true,
      margin: { top: 10, right: 10, bottom: 10, left: 10 }, // Small margins to ensure content visibility
      preferCSSPageSize: false,
      displayHeaderFooter: false
    })

    await page.close()
    console.log(
      '[generatePDF] PDF generation successful. Size:',
      pdf.length,
      'bytes'
    )

    // PDF validation - შევამოწმოთ არის თუ არა valid PDF
    if (pdf.length < 1000) {
      throw new Error('Generated PDF is too small, likely corrupted')
    }

    // შევამოწმოთ PDF header
    const pdfHeader = pdf.slice(0, 4).toString()
    if (pdfHeader !== '%PDF') {
      console.warn('[generatePDF] ⚠️ PDF header validation failed, but continuing...')
    } else {
      console.log('[generatePDF] ✅ PDF header validation passed')
    }

    // Log some debug info about the final HTML with more details
    const imageCount = (parsedHTML.match(/<img/g) || []).length
    const base64ImageCount = (parsedHTML.match(/data:image/g) || []).length
    const carfaxMentions = (parsedHTML.match(/carfax/gi) || []).length
    const httpImagesRemaining = (
      parsedHTML.match(/<img[^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/gi) || []
    ).length

    console.log(`[generatePDF] 📊 Final HTML Statistics:`)
    console.log(`  - Total IMG tags: ${imageCount}`)
    console.log(`  - Base64 images: ${base64ImageCount}`)
    console.log(`  - HTTP images remaining: ${httpImagesRemaining}`)
    console.log(`  - Carfax mentions: ${carfaxMentions}`)
    console.log(
      `  - Conversion success rate: ${
        imageCount > 0 ? Math.round((base64ImageCount / imageCount) * 100) : 0
      }%`
    )

    // Save debug HTML to file for inspection (optional)
    if (process.env.NODE_ENV === 'development') {
      const fs = require('fs')
      const debugHtml = `
        <!-- DEBUG INFO -->
        <!--
        Original HTML length: ${html.length}
        Final HTML length: ${parsedHTML.length}
        Total images: ${imageCount}
        Base64 images: ${base64ImageCount}
        HTTP images remaining: ${httpImagesRemaining}
        Carfax mentions: ${carfaxMentions}
        -->
        ${parsedHTML}
      `
      fs.writeFileSync('debug-html.html', debugHtml, 'utf8')
      console.log('[generatePDF] 🐛 Debug HTML saved to debug-html.html')
    }

    return pdf
  } catch (err) {
    console.error('[generatePDF] Error:', err)
    if (tries > 0) {
      console.log(
        '[generatePDF] Retrying PDF generation. Tries left:',
        tries - 1
      )
      return generatePDF(html, tries - 1)
    } else {
      throw new Error(
        'Could not generate pdf: ' + (err && err.message ? err.message : err)
      )
    }
  }
}

export default generatePDF
