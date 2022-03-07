
function translateRawFile(language,blob){
  const xml = blob.getDataAsString()
  const filename = blob.getName()
  const document = XmlService.parse(xml)
  const root = document.getRootElement()
  const xliff = XmlService.getNamespace('urn:oasis:names:tc:xliff:document:1.2');
  const files = root.getChildren("file",xliff)
  const regex = RegExp('(<\/?)source[^>]*(>)','gi')


  files.forEach((file)=>{
    const bodies = file.getChildren("body",xliff)
    bodies.forEach((body)=>{
      const transUnits = body.getChildren("trans-unit",xliff)
      transUnits.forEach((transUnit)=>{
        const source = transUnit.getChild("source",xliff)
        //convert to text and replace <source> with <target>, keep the rest the same
        const toTranslate = XmlService.getPrettyFormat().format(source).replace(regex,'$1target$2')
        console.log(toTranslate)
        const targetText = LanguageApp.translate(toTranslate.replace('xmlns="urn:oasis:names:tc:xliff:document:1.2"',''),'en', language, {contentType: 'html'});
        const targetXml = XmlService.parse(targetText)
        transUnit.addContent(targetXml.getRootElement().detach())
      })
    })
  })

  let newXml = XmlService.getPrettyFormat().format(document);
  return {filename:`translated-${language}-${filename}`,xml:newXml}
}
