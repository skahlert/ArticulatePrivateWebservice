function RiseService(username,password){
  let authorizeQuery = {
    nonce: Math.floor(Math.random()*1000000000),//1.000.000.000,
    client_id: "0oaimtuxt2kGE1lgv356", //presumably Articulate's Okta client id
    redirect_uri: "https://rise.articulate.com/auth-callback",
    response_mode: "fragment",
    response_type: "id_token token",
    scope: "openid staff profile_name",
    state: Utilities.getUuid(),
  }
  const tokenData = getBearerToken(authorizeQuery)
  const bearerToken = tokenData["access_token"]
  
  function getBearerToken(authorizeQuery) {
    const newAuthQuery = authCall(authorizeQuery)
    const oktaResponse = oktaCall(newAuthQuery)
    const tokenResponse = oktaResponse.getAllHeaders()['Location']
    const hashQuery = tokenResponse.split("#")[1]
    const params = hashQuery.split("&").reduce((prev,current)=>{
      const [key,value] = current.split("=")
      return { ...prev, [key]: value}
    },{})
    return params
  }

  function oktaCall(authorizeQuery){
    const url = `https://id.articulate.com/okta-authorize?client_id=${authorizeQuery.client_id}&nonce=${authorizeQuery.nonce}&redirect_uri=${authorizeQuery.redirect_uri}&response_mode=${authorizeQuery.response_mode}&response_type=${authorizeQuery.response_type}&scope=${authorizeQuery.scope}&state=${authorizeQuery.state}&sessionToken=${authorizeQuery.sessionToken}`
    const options = {
      method: "GET",
      muteHttpExceptions:true,
      followRedirects:false,
      contentType:'application/json;charset=UTF-8',
      headers:{
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36',
        accept:"application/json, text/plain, */*",
      }
      // Convert the JavaScript object to a JSON string.
    };
    return UrlFetchApp.fetch(url, options);
  }

  function authCall(authorizeQuery){
    const queryString = `client_id=${authorizeQuery.client_id}&nonce=${authorizeQuery.nonce}&redirect_uri=${encodeURI(authorizeQuery.redirect_uri)}&response_mode=${authorizeQuery.response_mode}&response_type=${encodeURI(authorizeQuery.response_type)}&scope=${encodeURI(authorizeQuery.scope)}&state=${authorizeQuery.state}`
    const authenticationInitiation = UrlFetchApp.fetch(`https://id.articulate.com/oauth2/default/v1/authorize?${queryString}`,{
      method:"GET",
      followRedirects:false
    })
    
    const url = 'https://id.articulate.com/api/v1/authn'
    const data = {
      "username":username,
      "password":password
    }
    //const resp = call("POST",url,JSON.stringify(data))
    const options = {
      method: "POST",
      muteHttpExceptions:true,
      followRedirects:false,
      payload: JSON.stringify(data),
      contentType:'application/json;charset=UTF-8',
      headers:{
        accept:"application/json, text/plain, */*",
      }
      // Convert the JavaScript object to a JSON string.
    };
    return {...authorizeQuery,sessionToken:JSON.parse(UrlFetchApp.fetch(url, options).getContentText()).sessionToken};
  }

  function duplicateCourse(courseId,newCourseName){
    const url = "https://rise.articulate.com/api/rise-runtime/ducks/rise/courses/DUPLICATE_COURSE"
    const data = {
      "type": "rise/courses/DUPLICATE_COURSE",
      "payload": {
        "courseId": courseId,
        "title": newCourseName
      }
    }
    const resp = call("POST",url,JSON.stringify(dupData))
    const jsonResponse = JSON.parse(resp.getContentText())
    const newCourseId = jsonResponse.payload.id
    return newCourseId
  }

  function moveCourseToFolder(courseId,folderId){
    const url = "https://rise.articulate.com/api/rise-runtime/ducks/rise/courses/MOVE_TO_FOLDER"
    const data = {
      "type": "rise/courses/MOVE_TO_FOLDER",
      "payload": {
        "courseId": courseId,
        "tags": folderId
      }
    }
    return call("POST",url,JSON.stringify(data))
  }

  function getCourses(){
    const url = 'https://rise.articulate.com/api/rise-runtime/ducks/rise/data/FETCH_MANAGE_DATA'
    //for some reason it wants to get a color passed
    const data = {"type":"rise/data/FETCH_MANAGE_DATA","payload":"#1eb0ff"}
    const resp = call("POST",url,JSON.stringify(data))
    const courses = JSON.parse(resp.getContentText())
    return courses.payload
  }
  function getCourseInformation(courseId){
    const url = 'https://rise.articulate.com/api/rise-runtime/ducks/rise/courses/GET_COURSE'
    const data = {"type":"rise/courses/GET_COURSE","payload":{"courseId":courseId}}
    return JSON.parse(call("POST",url,JSON.stringify(data)).getContentText()).payload
  }
  function downloadXliff(courseId,courseName,language){
    const url = `https://rise.articulate.com/api/rise-runtime/export_course_translation/${courseId}`
    const resp = call("GET",url,{})
    const blob = resp.getBlob()
    const translated = TranslateXLIFF.translateRawFile(language,blob)
    const filename = `translated-${language}-${courseName}.xlf`
    const newBlob = Utilities.newBlob(translated.xml, 'application/xliff+xml', filename);
    
    return newBlob

  }

  function deselectAuthor(courseId){
    const url1 = "https://rise.articulate.com/api/rise-runtime/ducks/rise/courses/UPDATE_COURSE"
    const data1 = {"type":"rise/courses/UPDATE_COURSE","payload":{"id":courseId,"selectedAuthorId":"none"}}
    const url2 = "https://rise.articulate.com/api/rise-runtime/ducks/rise/lessons/UPDATE_COURSE_LESSONS"
    const data2 = {"type":"rise/lessons/UPDATE_COURSE_LESSONS","payload":{"courseId":courseId,"selectedAuthorId":"none"}}
    const resp1 = call("POST",url1,JSON.stringify(data1))
    const resp2 = call("POST",url2,JSON.stringify(data2))
    return {resp1,resp2}
  }


  function addCollaborator(courseId,email){
    const url = "https://rise.articulate.com/api/rise-runtime/ducks/rise/collaborators/CREATE_COLLABORATOR"
    const data = {
      "type": "rise/collaborators/CREATE_COLLABORATOR",
      "payload": {
        "courseId": courseId,
        "email": email
      }
    }
    return call("POST",url,JSON.stringify(data))
  }
  function triggerTranslationImport(key,courseId){
    const url = 'https://rise.articulate.com/api/rise-runtime/ducks/rise/courses/IMPORT_TRANSLATION'
    const data = {
      "type": "rise/courses/IMPORT_TRANSLATION",
      "payload": {
        "id": courseId,
        "key": key
      }
    }
    return call("POST",url,JSON.stringify(data))
  }



  function uploadToS3(blob,url){
    const headers = {
      'Access-Control-Request-Method':'PUT',
      'Access-Control-Request-Headers':'content-type'
    }
    //s3Call("OPTIONS",url,{},headers)
    return s3Call("PUT",url,blob.getDataAsString(),{})
  }


  function getYurl(courseId,filename){
    const url = 'https://rise.articulate.com/api/rise-runtime/ducks/rise/uploads/GET_YURL'
    const data = {
      "type": "rise/uploads/GET_YURL",
      "payload": {
        "assetPath": "translations/",
        "courseId": courseId,
        "filename": filename
      }
    }
    const resp = call("Post",url,JSON.stringify(data))
    return JSON.parse(resp.getContentText())
  }



  function s3Call(method,url,payload,headers){
    var options = {
      method: method,
      payload: payload,
      contentType:'application/xliff+xml',
      headers:headers
      // Convert the JavaScript object to a JSON string.
    };
    var response = UrlFetchApp.fetch(url, options);
    return response;
  }
  function call(method,url,payload){
    var options = {
      method: method,
      payload: payload,
      contentType:'application/json;charset=UTF-8',
      headers:{
        accept:"application/json, text/plain, */*",
        'Authorization': bearerToken
      }
      // Convert the JavaScript object to a JSON string.
    };
    var response = UrlFetchApp.fetch(url, options);
    return response;
  }
  return{
    duplicateCourse,
    getCourses,
    getCourseInformation,
    moveCourseToFolder,
    downloadXliff,
    deselectAuthor,
    addCollaborator,
    triggerTranslationImport,
    uploadToS3,
    getYurl,
    s3Call,
    call,
  }
}