//Important: You have to copy the bearer token from one of you logged in sessions in rise. This token updates every hour or so.
//Unfortunately I haven't found a way yet to call for the token directly

const bearerToken = "Bearer ..."




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