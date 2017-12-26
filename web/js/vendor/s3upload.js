(function() {

  window.S3Upload = (function() {

    S3Upload.prototype.s3_object_name = 'default_name';

    S3Upload.prototype.s3_sign_put_url = '/signS3put';

    S3Upload.prototype.file_dom_selector = 'file_upload';

    S3Upload.prototype.file_type = 'file';

    S3Upload.prototype.onFinishS3Put = function(public_url) {
      return console.log('base.onFinishS3Put()', public_url);
    };

    S3Upload.prototype.onProgress = function(percent, status) {
      return console.log('base.onProgress()', percent, status);
    };

    S3Upload.prototype.onError = function(status) {
      return console.log('base.onError()', status);
    };

    function S3Upload(options) {
      if (options == null) options = {};
      for (option in options) {
        this[option] = options[option];
      }
      if (this.file_type == 'file') {
        this.handleFileSelect(document.getElementById(this.file_dom_selector));
      }
      else if (this.file_type == 'image') {
        this.handleFileSelect(this.file_dom_selector);
      }
      else if (this.file_type == 'image_reupload') {
        this.handleFileSelect(this.file_dom_selector);
      }
    }

    S3Upload.prototype.handleFileSelect = function(file_element) {

      if (this.file_type == "file") {
        var f, files, output, _i, _len, _results, newF;
        this.onProgress(0, 'Upload started.');
        files = file_element.files;
        output = [];
        _results = [];
        for (_i = 0, _len = files.length; _i < _len; _i++) {
          f = files[_i];
          // newF = resizePic(f, this.uploadFile);
          // console.log('newF');
          // console.log(newF);
          _results.push(this.uploadFile(f));
          // _results.push(newF);
        }
        return _results;
      }
      else if (this.file_type == "image") {
        var output, _results;
        this.onProgress(0, 'Upload started.');
        output = [];
        _results = [];
        _results.push(this.uploadFile(file_element));
        return _results;
      }
      else if (this.file_type == "image_reupload") {
        var output, _results;
        this.onProgress(0, 'Upload started.');
        output = [];
        _results = [];
        _results.push(this.uploadFile(file_element));
        return _results;
      }
    };

    S3Upload.prototype.createCORSRequest = function(method, url) {
      var xhr;
      xhr = new XMLHttpRequest();
      if (xhr.withCredentials != null) {
        xhr.open(method, url, true);
      } else if (typeof XDomainRequest !== "undefined") {
        xhr = new XDomainRequest();
        xhr.open(method, url);
      } else {
        xhr = null;
      }
      return xhr;
    };

    S3Upload.prototype.executeOnSignedUrl = function(file, callback) {
      console.log(file);
      var this_s3upload, xhr;
      this_s3upload = this;
      // console.log(this.s3_sign_put_url)
      
      /* FOR TESTING: Uncomment localhost */
      // this.s3_sign_put_url = 'http://localhost:3000/api/sign_s3';

      /* FOR PRODUCTION: Uncomment server */
      this.s3_sign_put_url = 'http://52.4.54.223:3000/api/sign_s3';

      xhr = new XMLHttpRequest();
      if (this.file_type == "image_reupload") {
        xhr.open('GET', this.s3_sign_put_url + '?s3_object_type=' + file.type + '&s3_object_name=' + this.s3_object_name, true);
      }
      else {
        xhr.open('GET', this.s3_sign_put_url + '?s3_object_type=' + file.type + '&s3_object_name=' + this.s3_object_name + Math.random(), true);
      }
      xhr.overrideMimeType('text/plain; charset=x-user-defined');
      xhr.onreadystatechange = function(e) {
        var result;
        if (this.readyState === 4 && this.status === 200) {
          try {
            result = JSON.parse(this.responseText);
          } catch (error) {
            this_s3upload.onError('Signing server returned some ugly/empty JSON: "' + this.responseText + '"');
            return false;
          }
          return callback(result.signed_request, result.url);
        } else if (this.readyState === 4 && this.status !== 200) {
          return this_s3upload.onError('Could not contact request signing server. Status = ' + this.status);
        }
      };
      return xhr.send();
    };

    S3Upload.prototype.uploadToS3 = function(file, url, public_url) {
      var this_s3upload, xhr;
      this_s3upload = this;
      xhr = this.createCORSRequest('PUT', url);
      if (!xhr) {
        this.onError('CORS not supported');
      } else {
        xhr.onload = function() {
          if (xhr.status === 200) {
            this_s3upload.onProgress(100, 'Upload completed.');
            return this_s3upload.onFinishS3Put(public_url);
          } else {
            return this_s3upload.onError('Upload error: ' + xhr.status);
          }
        };
        xhr.onerror = function() {
          return this_s3upload.onError('XHR error.');
        };
        xhr.upload.onprogress = function(e) {
          var percentLoaded;
          if (e.lengthComputable) {
            percentLoaded = Math.round((e.loaded / e.total) * 100);
            return this_s3upload.onProgress(percentLoaded, percentLoaded === 100 ? 'Finalizing.' : 'Uploading.');
          }
        };
      }
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.setRequestHeader('x-amz-acl', 'public-read');
      return xhr.send(file);
    };

    S3Upload.prototype.uploadFile = function(file) {
      console.log('uploadFile');
      console.log(file);
      var this_s3upload;
      this_s3upload = this;
      return this.executeOnSignedUrl(file, function(signedURL, publicURL) {
        return this_s3upload.uploadToS3(file, signedURL, publicURL);
      });
    };

    function resizePic(file, callback) {
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      var cw = canvas.width;
      var ch = canvas.height;

      // limit the image to 150x100 maximum size
      var maxW = 720;
      var maxH = 720;

      var img = new Image;
      img.onload = function() {
        var iw = img.width;
        var ih = img.height;
        var scale = Math.min((maxW/iw),(maxH/ih));
        var iwScaled = iw*scale;
        var ihScaled = ih*scale;
        canvas.width = iwScaled;
        canvas.height = ihScaled;
        ctx.drawImage(img,0,0,iwScaled,ihScaled);

        callback(dataURLtoBlob(canvas.toDataURL('image/jpeg', 0.7)));
        // return S3Upload.prototype.uploadFile(send_back);
      }
      img.src = URL.createObjectURL(file);
    };

    // helper function to generate a blob from a base64 string
    function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }

    return S3Upload;

  })();

}).call(this);