angular.module('Stylefnf')

.controller('editListingController', function($scope, Camera, $cordovaImagePicker, $ionicPlatform, $state, $stateParams, $ionicTabsDelegate, $ionicSlideBoxDelegate, $ionicActionSheet, $ionicPopup, Post, $rootScope, $ionicLoading, s3serverURL, currentUser, $window) {

  if(!$rootScope.currentUser) {
    $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
  }

  $scope.loadListing = function() {
    Post.getPost($stateParams.listingId).success(function(data) {
        $scope.selectedPost = data;

        $scope.localPictures = [];
        $scope.addedURLs = [];
        $scope.addedPictures = [];
        for (i = 0; i < $scope.selectedPost.imageUrls.length; i++) {
            $scope.localPictures.push($scope.selectedPost.imageUrls[i]);
            $scope.addedURLs.push($scope.selectedPost.imageUrls[i]);
        }

        $scope.listingBrand = {
          text: $scope.selectedPost.brand
        };

        function getDisplayName(value) {
          if (value == "homeFurniture") {
            return "Home and Furniture";
          } else if (value = "likenew") {
            return "Like New";
         } else if (value = "used") {
           return "Gently Used";
         } else {
            return value;
          }
        };

        function getDisplayReturn(option) {
          if (option == "Day") {
            return "3 days return";
          } else if (option == "Maybe") {
            return "Conditional Return";
          } else if (option == "Hour") {
            return "24 hr return";
          } else {
            return "No return/refund";
          }
        }

        $scope.returnOptions = {
         availableOptions: [
           {value: 'No', name: 'No return/refund'},
           {value: 'Maybe', name: 'Conditional Return'},
           {value: 'Hour', name: '24 hr return'},
           {value: 'Day', name: '3 days return'},
         ],
         selected: {value: $scope.selectedPost.return, name: getDisplayReturn($scope.selectedPost.return)}
         };

        function capitalizeFirstLetter(string) {
          if (string == null) {
            return "";
          } else {
            return string.charAt(0).toUpperCase() + string.slice(1);
          }
        };
        console.log($scope.selectedPost.macro);

        $scope.listingCategories = {
         availableOptions: [
           {value: 'fashion', name: 'Fashion'},
           {value: 'homeFurniture', name: 'Home and Furniture'},
           {value: 'electronics', name: 'Electronics'},
           {value: 'textbooks', name: 'Textbooks'},
           {value: 'other', name: 'Other'},
         ],
         selected: {value: $scope.selectedPost.macro, name: capitalizeFirstLetter(getDisplayName($scope.selectedPost.macro))}
         };

          $scope.fashionCategory = {
         availableOptions: [
           {text: 'Tops', value:'tops'},
           {text: 'Dresses', value:'dresses'},
           {text: 'Jackets', value:'jackets'},
           {text: 'Bottoms', value:'bottoms'},
           {text: 'Althetic', value:'athletic'},
           {text: 'Bags', value:'bags'},
           {text: 'Shoes', value:'shoes'},
           {text: 'Jewelry', value:'jewelry'},
           {text: 'Beauty', value:'beauty'},
           {text: 'Hats', value:'hats'},
           {text: 'Accessories', value:'accessories'},
           {text: 'Other', value:'other'},
        ],
           selected: {text: capitalizeFirstLetter($scope.selectedPost.category), value: $scope.selectedPost.category},
         };

         $scope.homeFurnitureCategory = {
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
           selected: {text: capitalizeFirstLetter(displayHF($scope.selectedPost.category)), value: $scope.selectedPost.category},
         };

        function displayHF(value) {
          if (value == "sofaschairs") {
           return "Sofas & Chairs";
         } else if (value == "dresserswardrobes") {
           return "Dressers & Wardrobes";
         }else if (value == "kitchenapps") {
           return "Kitchen Appliances";
         } else {
            return value;
          }
        };
        console.log($scope.selectedPost.category);

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
             selected: {text: capitalizeFirstLetter($scope.selectedPost.category), value: $scope.selectedPost.category},
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
          selected: {text: capitalizeFirstLetter(displayElectronics($scope.selectedPost.category)), value: $scope.selectedPost.category},
        };

        function displayElectronics(value) {
          if (value == "tvsmonitors") {
            return "TVs & Monitors";
          } else if (value == "audio") {
            return "Audio & Headphones";
          } else if (value == "caracc") {
            return "Car Accessories";
          } else if (value == "cables") {
            return "Cables & Adapters";
          } else if (value == "photography") {
            return "Cameras & photography";
          } else {
            return value;
          }
        }

        $scope.listingColor = {
         text: $scope.selectedPost.colour,
        };

        $scope.listingCondition = {
         availableOptions: [
           {value: 'new', name: 'New'},
           {value: 'likenew', name: 'Like New'},
           {value: 'used', name: 'Gently Used'},
         ],
         selected: {value: $scope.selectedPost.condition, name: capitalizeFirstLetter(getDisplayName($scope.selectedPost.condition))}
         };

        $scope.listingDescription = {
          text: $scope.selectedPost.description,
        };

        $rootScope.currentUser = currentUser.getCurrentUser();

        if (!window.cordova) {
          // running on device/emulator
          $scope.isWeb = true;
        }

        $scope.hasUploadedImgs = false;

        $scope.currentTitle = "Update Photos";

        $scope.cameraPictures = [];

        $scope.galleryPics = [];

        $scope.listingTitle = {
          text: $scope.selectedPost.title,
        };

        $scope.listingPrice = {
          value: $scope.selectedPost.price,
        };

        $scope.listingTags = {
          text: $scope.selectedPost.tags,
        };

        $scope.inputs = [];
        for (i = 0; i < $scope.selectedPost.locations.length; i++) {
            $scope.inputs.push($scope.selectedPost.locations[i]);
        }
        $scope.inputs.push({
          name: null,
          address: ""
        });

        console.log($scope.inputs);

        $scope.addInput = function () {
          if ($scope.inputs[$scope.inputs.length-1].name != null) {
            $scope.inputs.push({
              name: null,
              address: ""
            });
          }
        };

        $scope.listingSize = {
          text: $scope.selectedPost.size,
        };

        $scope.homeFurnitureRoom = {
          text: $scope.selectedPost.room,
        };

        $scope.removeInput = function (index) {
            $scope.inputs.splice(index, 1);
        };

        $scope.ifCategory = function(category) {
          if ($scope.listingCategories.selected.value == category) {
            return true;
          } else {
            return false;
          }
        };

        function dealNull(input) {
          if (input == null) {
            return "";
          } else {
            return input;
          }
        }

        $scope.listingGender = {
          availableOptions: [
            {value: 'Women', name: 'Women'},
            {value: 'Men', name: 'Men'},
            {value: 'Any', name: 'Any'},
          ],
          selected: {value: $scope.selectedPost.gender, name: dealNull($scope.selectedPost.gender)}
        };

        console.log($scope.listingGender.gender);

        $scope.fashionTryOn = {
          availableOptions: [
            {value: 'Yes', name: 'Yes'},
            {value: 'No', name: 'No'},
          ],
          selected: {value: $scope.selectedPost.ifTryOn, name: dealNull($scope.selectedPost.ifTryOn)}
        };

        console.log($scope.fashionTryOn.selected);

        $scope.editPost = function() {

          if(!$rootScope.currentUser) {
            $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
          }

          $scope.newListing = {
            brand: "Brand not set",
            title: "Title not set",
            macro: "not set",
            category: "Category not set",
            colour: "Not set",
            condition: "Not set",
            description: "Not set",
            tags: "#cool #cute",
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

          $ionicSlideBoxDelegate.stop()

          if ($ionicSlideBoxDelegate.currentIndex() == 0) {
            for (var i = 0; i < $scope.addedPictures.length; i++) {
              $scope.s3Upload($scope.addedPictures[i]);
            }
            $scope.addedPictures = [];
          }

          $scope.newListing.imageUrls = $scope.addedURLs;
          $scope.newListing.brand = $scope.listingBrand.text;
          $scope.newListing.title = $scope.listingTitle.text;
          $scope.newListing.macro = $scope.listingCategories.selected.value;
          if ($scope.ifCategory('fashion')) {
            $scope.newListing.category = $scope.fashionCategory.selected.value;
          } else if ($scope.ifCategory('homeFurniture')) {
            $scope.newListing.category = $scope.homeFurnitureCategory.selected.value;
          } else if ($scope.ifCategory('electronics')) {
            $scope.newListing.category = $scope.electronicsCategory.selected.value;
          } else if ($scope.ifCategory('textbooks')) {
            $scope.newListing.category = $scope.textbooksCategory.selected.value;
          }
          $scope.newListing.colour = $scope.listingColor.text;
          $scope.newListing.condition = $scope.listingCondition.selected.value;
          $scope.newListing.return = $scope.returnOptions.selected.value;
          $scope.newListing.description = $scope.listingDescription.text;
          $scope.newListing.tags = $scope.listingTags.text;
          $scope.newListing.gender = $scope.listingGender.selected.value;
          if ($scope.isLast()) {
            for (var i = 0; i < $scope.inputs.length; i++) {
              if ($scope.inputs[i].name == null) {
                $scope.inputs.splice(i, 1);
                i = i -1;
              }
            }
          }
          $scope.newListing.locations = $scope.inputs;
          $scope.newListing.price = $scope.listingPrice.value;
          $scope.newListing.retail = $scope.listingPrice.value;
          $scope.newListing.size = $scope.listingSize.text;
          $scope.newListing.room = $scope.homeFurnitureRoom.text;
          $scope.newListing.ifTryOn = $scope.fashionTryOn.selected.value;

          if ($scope.newListing.macro == "fashion") {
            delete $scope.newListing["room"];
          }
          else if ($scope.newListing.macro == "homeFurniture") {
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

          $scope.newListing.seller_id = $rootScope.currentUser._id;
          $scope.newListing.seller = $rootScope.currentUser._id;
          if ($scope.newListing.retail == -1) {
            $scope.newListing.retail = null;
          }

          Post.updatePost($scope.selectedPost._id, $scope.newListing)
            .success(function(data){
              $ionicLoading.hide();
          })
          .error(function(data) {
            console.log(data);
          });

          if ($scope.isLast()) {
            $state.go('tab.listing-detail', {listingId: data._id});
          }
        }

        $scope.lockSlide = function () {
            $ionicSlideBoxDelegate.enableSlide(false);
        };

        $scope.previousStep = function(){
          if ($ionicSlideBoxDelegate.currentIndex() == 0) {
            var confirmPopup = $ionicPopup.confirm({
              title: 'Exit?',
              template: "You will lose all changes that you haven't yet saved."
            });
            confirmPopup.then(function(res) {
              if(res) {
                $state.go("tab.feed");
              }
            });
          }
          else if ($ionicSlideBoxDelegate.currentIndex() == 1) {
            $scope.currentTitle = "Update Photos";
            $ionicSlideBoxDelegate.slide(0);
          } else {
            $scope.currentTitle = "We need this info";
            $ionicSlideBoxDelegate.slide(1);
          }
        };

        $scope.nextStep = function(){
          if ($ionicSlideBoxDelegate.currentIndex() == 0) {
            if ($scope.isFirstFinished()) {
              $scope.editPost();
              $scope.currentTitle = "We need this info";
              $ionicSlideBoxDelegate.slide(1);
            } else {
              var alertPopup = $ionicPopup.alert({
                title: "<i class='icon ion-alert-circled assertive'>&nbsp;</i><span style=''>Oops!</span>",
                template: 'Please upload at least 1 photo.'
              });
              // $ionicSlideBoxDelegate.next();
            }
          } else if ($ionicSlideBoxDelegate.currentIndex() == 1) {
            if ($scope.isSecondFinished()) {
              $scope.editPost();
              $scope.currentTitle = "Nice to haves";
              $ionicSlideBoxDelegate.slide(2);
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

            // push the individual images to the chosen pics & local arrays
            pushToFixedArray($scope.addedPictures, $scope.resizedImg, 6);

            pushToFixedArray($scope.localPictures, $scope.resizedImg, 6);

            $scope.$apply();
          }
          img.src = URL.createObjectURL(file);
        };

        // upload function for cordova
        // think about creating a service
        $scope.s3Upload = function(img){

          $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);

          // create a unique filename
          var file_name = $rootScope.currentUser.firstName + $scope.newListing.title;

          $scope.chosenListingPic = dataURLtoBlob(img);

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
                console.log(public_url);
                $scope.addedURLs.push(public_url);
                return;
              },
              onError: function(status) {
                // console.log('Upload error: ', status);
              }
          });
          return;
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
          if (($scope.addedPictures.length + $scope.addedURLs.length) == 0) {
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
          } else if (($scope.listingSize.text == "") && ($scope.listingCategories.selected.value != "electronics") && ($scope.listingCategories.selected.value != "textbooks")) {
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
        }

        $scope.isFirst = function () {
          if ($ionicSlideBoxDelegate.currentIndex() == 0) {
            return true;
          } else {
            return false;
          }
        }

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
              pushToFixedArray($scope.addedPictures, getURI(imageData), 6);

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
                console.log('Image URI: ' + results[i]);
                var uri = results[i];
                pushToFixedArray($scope.localPictures, uri, 6);
                // $scope.localPictures.push(uri);

               // Encode URI to Base64
               window.plugins.Base64.encodeFile(uri, function(base64){
                  // Save images in Base64
                  // console.log(base64);
                  pushToFixedArray($scope.addedPictures, base64, 6);
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
              if (indexOfPic < $scope.addedURLs.length) {
                $scope.addedURLs.splice(indexOfPic, 1);
              } else {
                $scope.addedPictures.splice((indexOfPic - $scope.addedURLs.length), 1);
              }
              $scope.localPictures.splice(indexOfPic, 1);
              return true;
            },
          });
        };

        $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
          $ionicSlideBoxDelegate.slide(0);
        });
    });

  };

});
