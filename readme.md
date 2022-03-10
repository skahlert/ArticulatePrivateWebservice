# Articulate Rise (Private) Webservice API
This is a collection of private webservice calls for [Articulate Rise](https://articulate.com/360/rise). Please keep in mind that this is not an officially sanctioned webservice, so Articulate could also decide to close or remove any of the functions at any time in the future. Also, changes to the Articulate Rise backend might break any of the functions and cause data loss in your account.
**Please use with caution!**


# How to use
These functions are supposed to be used with Google Script:
1. Go to the [google script panel](https://script.google.com/)
2. Create a new project
3. Paste the contents of riseApi.js into the newly created script file.
4. Grab the bearer token from a logged in session in rise (more detail will follow)
5. Paste your bearer token at the beginning of the new script.

# Supported Functions
- Authenticaton (experimental)
- List of all courses
- List all folders
- Download course content
- Duplicate a course
- Move course to a folder
- Add collaborator
- Download XLIFF for translation
- Translate XLIFF via Google Translate
- Upload translated XLIFF to course

# Possible, but not yet implemented
- Transfer course ownership
- Change access rights for collaborators
- Edit course content
- Delete course
- Rename course
- Export (PDF/Scorm/HTML)

# Example
```javascript
function test(){
  const myEmail = "john.doe@gmail.com"
  const myPassword = "..."
  const service = RiseService(myEmail,myPassword)
  const courses = service.getCourses()
  const courseDetails = service.getCourseInformation(courses.courses[0].id)
  console.log(courseDetails)
}
```