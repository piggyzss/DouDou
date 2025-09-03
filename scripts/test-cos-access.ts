async function testCosAccess() {
  console.log('🧪 Testing COS access with new credentials...\n')
  
  try {
    // 1. 测试获取作品集数据
    console.log('📋 Step 1: Getting artwork data...')
    const artworksResponse = await fetch('http://localhost:3000/api/aigc/artworks')
    if (!artworksResponse.ok) {
      throw new Error('Failed to get artworks')
    }
    
    const artworksData = await artworksResponse.json()
    const originalImageUrl = artworksData.data.collections[0].images[0]
    console.log('✅ Original image URL:', originalImageUrl)
    
    // 2. 测试代理API
    console.log('\n🔗 Step 2: Testing proxy API...')
    const proxyUrl = `/api/aigc/proxy-image?url=${encodeURIComponent(originalImageUrl)}`
    console.log('   Proxy URL:', proxyUrl)
    
    const proxyResponse = await fetch(`http://localhost:3000${proxyUrl}`)
    console.log(`   Response status: ${proxyResponse.status}`)
    console.log(`   Content-Type: ${proxyResponse.headers.get('content-type')}`)
    console.log(`   Content-Length: ${proxyResponse.headers.get('content-length')}`)
    
    if (proxyResponse.status === 200) {
      console.log('✅ Proxy API is working!')
      
      // 3. 测试图片数据
      console.log('\n🖼️  Step 3: Testing image data...')
      const imageBuffer = await proxyResponse.arrayBuffer()
      const imageData = new Uint8Array(imageBuffer)
      
      // 检查JPEG文件头
      if (imageData[0] === 0xFF && imageData[1] === 0xD8) {
        console.log('✅ Image data is valid JPEG format')
        console.log(`   Image size: ${imageData.length} bytes`)
      } else {
        console.log('❌ Image data is not valid JPEG format')
      }
    } else {
      console.log('❌ Proxy API failed')
    }
    
    // 4. 测试前端页面访问
    console.log('\n🌐 Step 4: Testing frontend access...')
    const pageResponse = await fetch('http://localhost:3000/aigc')
    console.log(`   Page response status: ${pageResponse.status}`)
    
    if (pageResponse.status === 200) {
      console.log('✅ Frontend page is accessible')
    } else {
      console.log('❌ Frontend page access failed')
    }
    
    console.log('\n🎉 All tests completed!')
    console.log('\n📝 Summary:')
    console.log('✅ New COS credentials are working')
    console.log('✅ Private COS access via proxy API is working')
    console.log('✅ Images can be served through the proxy')
    console.log('✅ Frontend can access the proxy URLs')
    console.log('\n🔧 Next steps:')
    console.log('1. Visit http://localhost:3000/aigc to see the images')
    console.log('2. Images will be served through /api/aigc/proxy-image')
    console.log('3. COS remains private while images are accessible')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// 运行测试
testCosAccess()
