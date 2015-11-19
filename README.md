Documents (.doc/docx, .pdf)
---------

Input 1: post file directly:
```
curl -F file=@/some/file/on/your/local/disk http://localhost:8080
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

Input
```
{
  "url": "https://en.wikipedia.org/wiki/Oakland,_California",
  "selector": "#content",
  "exclude": ".toc, .infobox, .reflist",
  "images": "#content img"
}

```
(Command to run)
```
html=$(settings.selector).remove(settings.exclude).html();
images=$(settings.image).remove(settings.exclude).html(); // (extract src and alt/title attributes)
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
This will probably take a little collaboration between the two of us. We're working on an Angular app that will call these endpoints.  The angular app is going to be authenticating users and can ask for the 
proper permissions and can pass the tokens to the rest endpoint (as long as it's secure).  Ideally, we would like to be able to install the Angular app in multiple places without having to have different 
Google apps, so if there's some way the Google authentication can happen within the rest app, that would be great.  We'll probably want to talk about this when you get there.  The attached gdrive2.zip file
get the HTML code from a private Google Doc file in php, so hopefully you can just rewrite most of that code in node.





Cleanup
-------

We would like to strip most of the html tags. It seems like it can be done with String.replace: https://css-tricks.com/snippets/javascript/strip-html-tags-in-javascript/, http://phpjs.org/functions/strip_tags/.
The tags we would like to keep:
```
p,a,div,span,h2,h3,h4,h5,h6,section,article,strong,b,i,em,cite,blockquote,small,sub,sup,code,pre,ul,ol,li,dl,dt,dd,table,tbody,thead,th,tr,td,img,caption,br
```
