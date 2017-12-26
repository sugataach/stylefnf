angular.module('Stylefnf')

.controller('newListingController', function($scope, Camera, $cordovaImagePicker, $ionicPlatform, $cordovaCamera, $state, $stateParams, $ionicTabsDelegate, $ionicSlideBoxDelegate, $ionicActionSheet, $ionicPopup, Post, $rootScope, $ionicLoading, s3serverURL, currentUser, $window) {

  if(!$rootScope.currentUser) {
    $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
  }

  if (!window.cordova) {
    // running on device/emulator
    $scope.isWeb = true;
  }

  // instantiate all variables
  $scope.newListing = {
    brand: "Brand not set",
    title: "Title not set",
    macro: "Not set",
    category: "Category not set",
    colour: "Not set",
    condition: "Not set",
    description: "Not set",
    tags: "",
    gender: "Not set",
    imageUrls: [],
    locations: [],
    price: -1,
    retail: -1,
    return: "Not set",
    size: "Not set",
    room: "Not set",
    ifTryOn: "Not set"
  };

  $scope.hasUploadedImgs = false;

  $scope.currentTitle = "Choose Photos";

  $scope.chosenPictures = [];

  $scope.localPictures = [];

  $scope.cameraPictures = [];

  $scope.galleryPics = [];

  $scope.listingTitle = {
    text: ''
  };

  $scope.listingPrice = {
    value: null
  };

  $scope.listingBrand = {
    text: ''
  };

  $scope.listingCondition = {
   selected: null,
   option1: 'new',
   option2: 'likenew',
   option3: 'used',
  };

  $scope.listingColor = {
    text: ''
  };

  $scope.listingDescription = {
    text: ''
  };

  $scope.listingTags = {
    text: ""
  };

  $scope.inputs = [{
      name: null,
      address: ""
  }];

  $scope.listingSize = {
    text: ''
  };

  $scope.furnitureRoom = {
    text: ''
  };

  $scope.listingCreated = false;

  $scope.ifBack = false;

  $scope.clearNewListing = function() {
    // instantiate all variables
    $scope.newListing = {
      brand: "Brand not set",
      title: "Title not set",
      macro: "not set",
      category: "Category not set",
      colour: "Not set",
      condition: "Not set",
      description: "Not set",
      tags: "",
      gender: "Not set",
      imageUrls: [],
      locations: [],
      price: -1,
      retail: -1,
      return: "Not set",
      size: "Not set",
      room: "Not set",
      ifTryOn: "Not set"
    };

    $scope.listingCategories = {
     availableOptions: [
       {value: 'fashion', name: 'Fashion'},
       {value: 'homefurniture', name: 'Home and Furniture'},
       {value: 'electronics', name: 'Electronics'},
       {value: 'textbooks', name: 'Textbooks'},
       {value: 'other', name: 'Other'}
     ],
     selected: {value: null, name: 'Pick One'},
     };

     $scope.returnOptions = {
      selected: null,
      option1: 'No',
      option2: 'Maybe',
      option3: 'Hour',
      option4: 'Day',
     };

    $scope.hasUploadedImgs = false;

    $scope.currentTitle = "Choose Photos";

    $scope.chosenPictures = [];

    $scope.localPictures = [];

    $scope.cameraPictures = [];

    $scope.galleryPics = [];

    $scope.listingTitle = {
      text: ''
    };

    $scope.listingPrice = {
      value: null
    };

    $scope.listingBrand = {
      text: ''
    };

    $scope.listingCondition = {
     selected: null,
     option1: 'new',
     option2: 'likenew',
     option3: 'used',
    };

    $scope.listingColor = {
      text: ''
    };

    $scope.listingDescription = {
      text: ''
    };

    $scope.listingTags = {
      text: ""
    };

    $scope.inputs = [{
        name: null,
        address: ""
    }];

    $scope.listingSize = {
      text: ''
    };

    $scope.furnitureRoom = {
      text: ''
    };

    $scope.listingCreated = false;

    $scope.ifBack = false;
  };

  $scope.addInput = function () {
    if ($scope.inputs[$scope.inputs.length-1].name != null) {
      //console.log("new input");
      $scope.inputs.push({
        name: null,
        address: ""
      });
    }
  };

  $scope.removeInput = function (index) {
      $scope.inputs.splice(index, 1);
  };

  $scope.listingCategories = {
   availableOptions: [
     {value: 'fashion', name: 'Fashion'},
     {value: 'homefurniture', name: 'Home and Furniture'},
     {value: 'electronics', name: 'Electronics'},
     {value: 'textbooks', name: 'Textbooks'},
     {value: 'other', name: 'Other'}
   ],
   selected: {value: null, name: 'Pick One'},
   };

   $scope.ifCategory = function(category) {
     if ($scope.listingCategories.selected.value == category) {
       return true;
     } else {
       return false;
     }
   };

  $scope.listingGender = {
   selected: null,
   option1: 'Women',
   option2: 'Men',
   option3: 'Any',
  };

  $scope.returnOptions = {
   selected: null,
   option1: 'No',
   option2: 'Maybe',
   option3: 'Hour',
   option4: 'Day',
  };

  $scope.returnInfo = function() {
    var alertPopup = $ionicPopup.alert({
      title: "Recommended",
      templateUrl: 'return-info.html',
      scope: $scope,
    });
  };

  $scope.fashionCategory = {
   availableOptions: [
   {text: 'Tops', value:'tops'},
   {text: 'Dresses', value:'dresses'},
   {text: 'Jackets', value:'jackets'},
   {text: 'Bottoms', value:'bottoms'},
   {text: 'Athletic', value:'athletic'},
   {text: 'Bags', value:'bags'},
   {text: 'Shoes', value:'shoes'},
   {text: 'Jewelry', value:'jewelry'},
   {text: 'Beauty', value:'beauty'},
   {text: 'Hats', value:'hats'},
   {text: 'Accessories', value:'accessories'},
   {text: 'Other', value:'other'},
],
   selected: {value: null, text: 'Pick One'},
 };

  $scope.fashionTryOn = {
   selected: null,
   option1: "Yes",
   option2: "No",
  };

  $scope.homefurnitureCategory = {
  availableOptions: [
    {text: 'Sofas & Chairs', value:'sofaschairs'},
    {text: 'Decor', value:'decor'},
    {text: 'Tables', value:'tables'},
    {text: 'Dressers & Wardrobes', value:'dresserswardrobes'},
    {text: 'Bedroom', value:'bedroom'},
    {text: 'Lighting', value:'lighting'},
    {text: 'Bathroom', value:'bathroom'},
    {text: 'Outdoors', value:'outdoors'},
    {text: 'Cookware', value:'cookware'},
    {text: 'Kitchen Appliances', value:'kitchenapps'},
    {text: 'Laundry', value:'laundry'},
    {text: 'Other', value:'other'}
 ],
   selected: {value: null, text: 'Pick One'},
  };

  $scope.electronicsCategory = {
 availableOptions: [
   {text: 'Phones', value:'phones'},
   {text: 'Computers', value:'computers'},
   {text: 'TVs & Monitors', value:'tvsmonitors'},
   {text: 'Audio & Headphones', value:'audio'},
   {text: 'Gaming', value:'gaming'},
   {text: 'Car Accessories', value:'caracc'},
   {text: 'Cables & Adapters', value:'cables'},
   {text: 'Cameras & Photography', value:'photography'},
   {text: 'Other', value:'other'}
],
   selected: {value: null, text: 'Pick One'},
 };

  $scope.textbooksCategory = {
  availableOptions: [
    {text: 'Arts', value:'arts'},
    {text: 'Science', value:'science'},
    {text: 'Commerce', value:'commerce'},
    {text: 'Engineering', value:'engineering'},
    {text: 'Kinesiology', value:'kinesiology'},
    {text: 'Medicine', value:'medicine'},
    {text: 'Law', value:'law'},
    {text: 'Music', value:'music'},
    {text: 'Nursing', value:'nursing'},
    {text: 'Pharmacy', value:'pharmacy'},
    {text: 'Other', value:'miscellaneous'}
 ],
   selected: {value: null, text: 'Pick One'},
  };

  $scope.otherCategory = {
    availableOptions: [
    {text: 'Tools', value:'tools'},
    {text: 'Health and Beauty', value:'healthBeauty'},
    {text: 'Sports and Rec', value:'sportsRec'},
    {text: 'Gifts and Parties', value:'giftsParties'},
    {text: 'Other', value:'other'}
 ],
   selected: {value: null, text: 'Pick One'},
  };

  $scope.lockSlide = function () {
      $ionicSlideBoxDelegate.enableSlide( false );
  };

  $scope.previousStep = function(){
    if ($ionicSlideBoxDelegate.currentIndex() == 0) {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Discard this listing?',
        template: 'You will lose all information you have entered so far.'
      });
      confirmPopup.then(function(res) {
        if(res) {
          $state.go("tab.feed");
          $scope.listingCreated = false;

          // clear the new listing

        } else {
          $scope.ifBack = false;
        }
      });
    }
    else if ($ionicSlideBoxDelegate.currentIndex() == 1) {
      $scope.currentTitle = "Choose Photos";
      $ionicSlideBoxDelegate.slide(0);
    } else {
      $scope.currentTitle = "Required";
      $ionicSlideBoxDelegate.slide(1);
    }
  };

  $scope.nextStep = function(){
    if ($ionicSlideBoxDelegate.currentIndex() == 0) {
      if ($scope.isFirstFinished()) {
      // if (true) {
        $scope.currentTitle = "Required";
        $ionicSlideBoxDelegate.next();
      } else {
        var alertPopup = $ionicPopup.alert({
          title: "<i class='icon ion-alert-circled assertive'>&nbsp;</i><span style=''>Oops!</span>",
          template: 'Please upload at least 1 photo.'
        });
        // $ionicSlideBoxDelegate.next();
      }
    } else if ($ionicSlideBoxDelegate.currentIndex() == 1) {
      // if (true) {
      if ($scope.isSecondFinished()) {
        $scope.currentTitle = "Optional";
        $ionicSlideBoxDelegate.next();
      } else {
        var alertPopup = $ionicPopup.alert({
          title: "<i class='icon ion-alert-circled assertive'>&nbsp;</i><span style=''>Uh oh!</span>",
          template: 'Looks like you\'re missing some info on this page.'
        });
        // $ionicSlideBoxDelegate.next();
      }
    }
  };

  // upload function
   $scope.s3UploadWeb = function(userFiles){

     // create a unique filename
     // console.log(userFiles);
     var file_name = userFiles[0].name;
     // file_name = file_name[file_name.length-1];

     // edit the individual files
     var file_element = userFiles;
     var f, files, output, _i, _len, _results, newF;
     files = userFiles;
     for (_i = 0, _len = files.length; _i < _len; _i++) {
       f = files[_i];
       resizePic(f, file_name);
     }
   };
   
  // helper function to resize the file to 720 x 720
   function resizePic(file, file_name) {
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

       $scope.resizedImg = canvas.toDataURL('image/jpeg', 0.75);
       // console.log($scope.resizedImg);

       // push the individual images to the chosen pics & local arrays
       pushToFixedArray($scope.chosenPictures, $scope.resizedImg, 6);

       pushToFixedArray($scope.localPictures, $scope.resizedImg, 6);

       $scope.$apply();
     }
     img.src = URL.createObjectURL(file);
   };

  // upload function for cordova
  // think about creating a service
  $scope.s3Upload = function(img){

    // create a unique filename
    var file_name = $rootScope.currentUser.firstName + $scope.newListing.title;

    // console.log(img);
    $scope.chosenListingPic = dataURLtoBlob(img);
    console.log(s3serverURL);

    // form the s3 upload object
    var s3upload = new S3Upload({
        s3_object_name: file_name,
        file_type: 'image',
        file_dom_selector: $scope.chosenListingPic,
        s3_sign_put_url: s3serverURL,
        onProgress: function(percent, message) {
          console.log('Upload progress: ', percent, message);
        },
        onFinishS3Put: function(public_url) {
          $scope.newListing.imageUrls.push(public_url);
          // if the images are fully uploaded
          if ($scope.newListing.imageUrls.length == $scope.chosenPictures.length) {
            $scope.postListing();
          }
        },
        onError: function(status) {
          console.log('Upload error: ', status);
        }
    });
  };

  // helper function to generate a blob from a base64 string
  function dataURLtoBlob(dataurl) {
    // console.log(dataurl);
      var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], {type:mime});
  }

  $scope.isFirstFinished = function () {
    if ($scope.chosenPictures.length == 0) {
      return false;
    } else {
      return true;
    }
  }

  $scope.isSecondFinished = function () {
    if ($scope.listingTitle.text == "") {
      return false;
    } else if ($scope.listingPrice.value == null) {
      return false;
    } else if ($scope.listingCategories.selected == null) {
      return false;
    } else if ($scope.listingCondition.selected == null) {
      return false;
    } else if ($scope.inputs.length == 0) {
      return false;
    } else if ($scope.returnOptions.selected == null) {
      return false;
    } else if (($scope.listingSize.text == "") && ($scope.listingCategories.selected.value != "electronics") &&
        ($scope.listingCategories.selected.value != "textbooks") && ($scope.listingCategories.selected.value != "other")) {
      return false;
    } else {
      return true;
    }
  };

  $scope.isLast = function () {
    if ($ionicSlideBoxDelegate.currentIndex() == 2) {
      return true;
    } else {
      return false;
    }
  };

  $scope.createListing = function() {

    $ionicLoading.show({
      template: 'Posting your listing',
      duration: 25000
    });

    for (var i in $scope.chosenPictures) {
      $scope.s3Upload($scope.chosenPictures[i]);
      // console.log('finished picture');
    }
  };

  $scope.postListing = function() {
    console.log('listingCreated', $scope.listingCreated);
    if ($scope.listingCreated == false) {
      $scope.newListing.brand = $scope.listingBrand.text;
      $scope.newListing.title = $scope.listingTitle.text;
      $scope.newListing.macro = $scope.listingCategories.selected.value;
      if ($scope.fashionCategory.selected.value != null) {
        $scope.newListing.category = $scope.fashionCategory.selected.value;
      } else if ($scope.homefurnitureCategory.selected.value != null) {
        $scope.newListing.category = $scope.homefurnitureCategory.selected.value;
      } else if ($scope.electronicsCategory.selected.value != null) {
        $scope.newListing.category = $scope.electronicsCategory.selected.value;
      } else if ($scope.textbooksCategory.selected.value != null) {
        $scope.newListing.category = $scope.textbooksCategory.selected.value;
      } else if ($scope.otherCategory.selected.value != null) {
        $scope.newListing.category = $scope.otherCategory.selected.value;
      }
      $scope.newListing.colour = $scope.listingColor.text;
      $scope.newListing.condition = $scope.listingCondition.selected;
      $scope.newListing.description = $scope.listingDescription.text;
      $scope.newListing.tags = $scope.listingTags.text;
      $scope.newListing.gender = $scope.listingGender.selected;
      $scope.newListing.return = $scope.returnOptions.selected;

      if ($scope.inputs[$scope.inputs.length - 1].name == null) {
        $scope.inputs.pop();
      }
      $scope.newListing.locations = $scope.inputs;
      $scope.newListing.price = $scope.listingPrice.value;
      $scope.newListing.retail = $scope.listingPrice.value;
      $scope.newListing.size = $scope.listingSize.text;
      $scope.newListing.room = $scope.furnitureRoom.text;
      $scope.newListing.ifTryOn = $scope.fashionTryOn.selected;

      if ($scope.newListing.macro == "fashion") {
        delete $scope.newListing["room"];
      }
      else if ($scope.newListing.macro == "homefurniture") {
        delete $scope.newListing["gender"];
        delete $scope.newListing["ifTryOn"];
      }
      else if ($scope.newListing.macro == "electronics") {
        delete $scope.newListing["room"];
        delete $scope.newListing["gender"];
        delete $scope.newListing["ifTryOn"];
      } else {
        delete $scope.newListing["room"];
        delete $scope.newListing["gender"];
        delete $scope.newListing["ifTryOn"];
        delete $scope.newListing["size"];
      }
      $scope.newListing.status = 'Available';
      $scope.newListing.seller_id = $rootScope.currentUser._id;
      $scope.newListing.seller = $rootScope.currentUser._id;
      if ($scope.newListing.retail == -1) {
        $scope.newListing.retail = null;
      }
      //console.log($scope.newListing);

      Post.createPost($scope.newListing)
        .success(function(data){
          // console.log('halo');
          $ionicLoading.hide();
          console.log($scope.returnOptions.selected);
          $scope.clearNewListing();
          console.log(data);
          $state.go('tab.listing-detail', {listingId: data._id});
      })
      .error(function(data) {
        console.log('err');
        console.log(data);
      });
    }
  };

  // function to take a picture
  $scope.takePicture = function () {

      var cameraOptions = {
         quality : 75,
         targetWidth: 720,
         targetHeight: 720,
         destinationType: 0,
         sourceType: 1,
         saveToPhotoAlbum: false,
         correctOrientation: true,
         allowEdit: true
      };

      Camera.getPicture(cameraOptions).then(function(imageData) {
        // save the picture in an array
        // $scope.cameraPictures.push(imageData);
        // $scope.chosenPictures.push(imageData);
        pushToFixedArray($scope.chosenPictures, getURI(imageData), 6);

        pushToFixedArray($scope.localPictures, getURI(imageData), 6);
        // $scope.localPictures.push(getURI(imageData));
      }, function(err) {
         console.log(err);
      });

  };

  // return a string that an img tag can consume
  function getURI(base64) {
    return 'data:image/*;base64,' + base64;
  }

  function pushToFixedArray(arr, uri, lengthWeWant) {
    if (arr.length == lengthWeWant) {
      arr.shift();
    }
    arr.push(uri);
  }

  // function to get pictures from gallery
  $scope.getPictures = function () {
    var photoOptions = {
      maximumImagesCount: 10,
      width: 720,
      height: 720,
      quality: 75
    };

    $cordovaImagePicker.getPictures(photoOptions).then(function (results) {
      for (var i = 0; i < results.length; i++) {
          // console.log('Image URI: ' + results[i]);
          var uri = results[i];
          pushToFixedArray($scope.localPictures, uri, 6);
          // $scope.localPictures.push(uri);

         // Encode URI to Base64
         window.plugins.Base64.encodeFile(uri, function(base64){
            // Save images in Base64
            // console.log(base64);
            pushToFixedArray($scope.chosenPictures, base64, 6);
            // $scope.chosenPictures.push(base64);
            // console.log($scope.chosenPictures);
         });
      }
      return;
    },  function(error) {
       console.log(error);
    });
  };

  $scope.showActionsheet = function(indexOfPic) {

    $ionicActionSheet.show({
      titleText: 'Photo Options',
      buttons: [
        { text: '<i class="icon ion-trash-a assertive"></i> Delete' },
      ],
      buttonClicked: function(index) {
        $scope.localPictures.splice(indexOfPic, 1);
        $scope.chosenPictures.splice(indexOfPic, 1);
        return true;
      },
    });
  };

  $scope.getIphone4Title = function(){
    if($ionicSlideBoxDelegate.currentIndex() == 1) {
      if($window.innerWidth  == 320){
        return "iphone4-title";
      }
     
    }

  }
  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    $scope.clearNewListing();
    $ionicSlideBoxDelegate.slide(0);
  });

});
