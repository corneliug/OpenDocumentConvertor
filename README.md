Documents (.doc/docx, .pdf)
---------

Input 1: post file directly:
```
curl -F file=@/some/file/on/your/local/disk http://localhost:8080/convert/file
```

Input 2: post url to file
```
{
  "file": "http://www.publishers.org.uk/_resources/assets/attachment/full/0/2091.pdf",
}
```

Response
```
{
  html: "<h2>Title</h2><p>text</p>"
}
```

Websites
--------

Request
```
{
  "url": "https://en.wikipedia.org/wiki/Oakland,_California",
  "selector": "#content",
  "exclude": ".toc, .infobox, .reflist",
  "images": "#content img"
}
```

Response
```
{
  html: "<h2>Title</h2><p>text</p>",
  images: [
    {
      "url": '//upload.wikimedia.org/wikipedia/commons/thumb/8/81/Judy_Garland_Birth_House_Matt_Anderson.JPG/220px-Judy_Garland_Birth_House_Matt_Anderson.JPG',
      "alt": "",
    },
    {}
  ]
}
```

Google docs
-----------

Request
```
POST localhost:8080/api/v1/convert/file/gdrive

{
    "auth_code":"4/HbgglOj-Wxq7AEuqH-nIRn4pkIrLzWUjx_8-qB9lk-Q",
    "file_id":"1jMITY0G-yAqcsY-JQIVAUxeGoUqJWDWW6ox9_ipwl7g"
}

```

Response
```
  The file from Google Drive, converted as html and stripped of the html tags.
```
