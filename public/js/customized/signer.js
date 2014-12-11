function Signer(upload){
  // exists because date has to be set right before ajax request, else there is a request time out after 15 mins
  this.upload           = upload;
  this.date             = new Date().toUTCString();
  this.initSingleStr    = 'PUT\n\nmultipart/form-data\n\nx-amz-date:'+this.date+'\n/'+upload.config.bucket+'/'+upload.awsObjURL;
  this.initMultiStr     = 'POST\n\n\n\nx-amz-date:'+this.date+'\n/'+upload.config.bucket+'/'+upload.awsObjURL+'?uploads';

  this.calculatemd5 = function(){
    var deferred = $.Deferred();

    var reader = new FileReader();
    reader.onload = function (e) {
      var binary = event.target.result;
      var md5 = CryptoJS.MD5(binary).toString();
      deferred.resolve(md5);
    };
    reader.readAsBinaryString(upload.file);

    return deferred.promise();
  };

   this.md5 = this.calculatemd5().then(
    function(val){
      return val
    });

  this.abortStr         = function(){
    return 'DELETE\n\n\n\nx-amz-date:'+this.date+
      '\n/'+this.upload.config.bucket+'/'+
      this.upload.awsObjURL+
      '?uploadId='+this.upload.uploadId;
  };

  this.finishMultiStr   = function(){
    return 'POST\n\ntext/plain;charset=UTF-8\n\nx-amz-date:'+this.date+
      '\n/'+this.upload.config.bucket+'/'+
      this.upload.awsObjURL+
      '?uploadId='+this.upload.uploadId;
  };

  this.multipartInitURL = 'https://' + this.upload.config.bucket + '.s3.amazonaws.com/'+this.upload.awsObjURL+'?uploads';

  this.singlepartInitURL = 'https://' + this.upload.config.bucket + '.s3.amazonaws.com/'+ this.upload.awsObjURL;

  this.partUploadURL = 'https://' + this.upload.config.bucket + '.s3.amazonaws.com/'+this.upload.awsObjURL+'?uploadId='+this.upload.uploadId;

  // part stuff
  this.stringToSign = function(part){
    return 'PUT\n\nmultipart/form-data\n\nx-amz-date:' + this.date +
      '\n/' + this.upload.config.bucket + '/' +
      this.upload.awsObjURL +
      '?partNumber=' + part.partNumber +
      '&uploadId=' + this.upload.uploadId;
  };
  this.partURL = function(part){
    return 'https://' + this.upload.config.bucket + '.s3.amazonaws.com/' +
      this.upload.awsObjURL +
      '?partNumber=' + part.partNumber
      + '&uploadId=' + this.upload.uploadId;
  };
}