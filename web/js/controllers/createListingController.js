angular.module('Haberdashery')
  .controller('createListingController', function(
              $scope, 
              $window,
              $mdSidenav,
              $mdUtil,
              $log,
              $rootScope, 
              $routeParams, 
              $location, 
              toaster, 
              Post, 
              $auth, 
              $route,
              $timeout, 
              Socket, 
              Comment, 
              Offer,
              Like,
              $animate,
              $mdDialog,
              s3serverURL,
              NewListing,
              $mdToast,
              $filter
              ) {

    if (!NewListing.getMacro()) {
      $location.path('/');
    }

    if ($rootScope.changeNewListing) {
      console.log('reseting the new listing');

      $scope.newListing = {
        brand: "Brand not set",
        title: "Title not set",
        macro: NewListing.getMacro(),
        category: "Category not set",
        colour: "Not set",
        condition: "Not set",
        description: "Not set",
        tags: "#cool#cute",
        gender: "Not set",
        imageUrls: [],
        locations: [],
        price: -1,
        retail: -1,
        size: "Not set",
        room: "Not set",
        ifTryOn: "Not set",
        return: "Not set"
      };

      $rootScope.changeNewListing = false;
    }

    // console.log(NewListing.getMacro());
    // console.log('blabal');

    $scope.isAuthenticated = function() {
      // check if logged in
      return $auth.isAuthenticated() && ($rootScope.currentUser.isComplete == true);
    };

    $scope.isHovering = false;

    $scope.hoverIn = function() {
      // console.log('yello');
      $scope.isHovering = true;
    };

    $scope.hoverOut = function() {
      // console.log('yello2');
      $scope.isHovering = false;
    };

    $scope.isEditing = true;

    $scope.changeEditing = function() {
      $scope.isEditing = !$scope.isEditing;
    };

    $scope.selectedTabIndex = 0;

    $scope.currentUser = $rootScope.currentUser;

    $scope.toggled = function(open) {
      $log.log('Dropdown is now: ', open);
    };

    $scope.toggleDropdown = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.status.isopen = !$scope.status.isopen;
    };

    $scope.dynamicPopover = {
      templateUrl: '../../views/partials/hovercard.html'
    };

    $scope.newListing = {
      brand: "Brand not set",
      title: "Title not set",
      macro: NewListing.getMacro(),
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
      size: "Not set",
      room: "Not set",
      ifTryOn: false,
      return: "Not set"
    };

    console.log($scope.newListing);

    $scope.isFashion = function() {
      return NewListing.getMacro() == "fashion";
    };

    $scope.isHomeFurniture = function() {
      return NewListing.getMacro() == "homefurniture";
    };

    $scope.isElectronics = function() {
      return NewListing.getMacro() == "electronics";
    };

    $scope.isTextbooks = function() {
      return NewListing.getMacro() == "textbooks";
    };

    $scope.isOther = function() {
      return NewListing.getMacro() == "other";
    };

    if ($scope.isTextbooks()) {
      $scope.newListing.tags = "#MAT135";
    }

    $scope.fashionErrors = function() {
      var errs = []
      if ($scope.newListing.imageUrls.length == 0) {
        errs.push("Add at least 1 picture");
      }
      if ($scope.newListing.return == "Not set") {
        errs.push("Add a return policy for your listing");
      }
      if ($scope.newListing.locations.length == 0) {
        errs.push("Add at least 1 location where you can meetup");
      }
      if ($scope.newListing.title == "Title not set") {
        errs.push("Add a title for your listing");
      }
      if ($scope.newListing.price == -1) {
        errs.push("Add a price for your listing");
      }
      if ($scope.newListing.category == "Category not set") {
        errs.push("Add a category for your listing");
      }
      if ($scope.newListing.condition == "Not set" ) {
        errs.push("What's the condition of your listing?");
      }
      if ($scope.newListing.size == "Not set") {
        errs.push("What size is your listing?");
      }
      return errs;
    };

    $scope.homeFurnitureErrors = function() {
      var errs = []
      if ($scope.newListing.imageUrls.length == 0) {
        errs.push("Add at least 1 picture");
      }
      if ($scope.newListing.return == "Not set") {
        errs.push("Add a return policy for your listing");
      }
      if ($scope.newListing.locations.length == 0) {
        errs.push("Add at least 1 location where you can meetup");
      }
      if ($scope.newListing.title == "Title not set") {
        errs.push("Add a title for your listing");
      }
      if ($scope.newListing.price == -1) {
        errs.push("Add a price for your listing");
      }
      if ($scope.newListing.category == "Category not set") {
        errs.push("Add a category for your listing");
      }
      if ($scope.newListing.condition == "Not set" ) {
        errs.push("What's the condition of your listing?");
      }
      if ($scope.newListing.size == "Not set") {
        errs.push("What is the size of your listing?");
      }
      return errs;
    };

    $scope.electronicsErrors = function() {
      var errs = []
      if ($scope.newListing.imageUrls.length == 0) {
        errs.push("Add at least 1 picture");
      }
      if ($scope.newListing.return == "Not set") {
        errs.push("Add a return policy for your listing");
      }
      if ($scope.newListing.locations.length == 0) {
        errs.push("Add at least 1 location where you can meetup");
      }
      if ($scope.newListing.title == "Title not set") {
        errs.push("Add a title for your listing");
      }
      if ($scope.newListing.price == -1) {
        errs.push("Add a price for your listing");
      }
      if ($scope.newListing.category == "Category not set") {
        errs.push("Add a category for your listing");
      }
      if ($scope.newListing.condition == "Not set" ) {
        errs.push("What's the condition of your listing?");
      }
      return errs;
    };

    $scope.textbooksErrors = function() {
      var errs = []
      if ($scope.newListing.imageUrls.length == 0) {
        errs.push("Add at least 1 picture");
      }
      if ($scope.newListing.return == "Not set") {
        errs.push("Add a return policy for your listing");
      }
      if ($scope.newListing.locations.length == 0) {
        errs.push("Add at least 1 location where you can meetup");
      }
      if ($scope.newListing.title == "Title not set") {
        errs.push("Add a title for your listing");
      }
      if ($scope.newListing.price == -1) {
        errs.push("Add a price for your listing");
      }
      return errs;
    };

    $scope.otherErrors = function() {
      var errs = []
      if ($scope.newListing.imageUrls.length == 0) {
        errs.push("Add at least 1 picture");
      }
      if ($scope.newListing.return == "Not set") {
        errs.push("Add a return policy for your listing");
      }
      if ($scope.newListing.locations.length == 0) {
        errs.push("Add at least 1 location where you can meetup");
      }
      if ($scope.newListing.title == "Title not set") {
        errs.push("Add a title for your listing");
      }
      if ($scope.newListing.price == -1) {
        errs.push("Add a price for your listing");
      }
      return errs;
    };

    $scope.noErrors = function() {
      if ($scope.newListing.macro == "fashion") {
        return $scope.fashionErrors().length == 0;
      }
      if ($scope.newListing.macro == "homefurniture") {
        return $scope.homeFurnitureErrors().length == 0;
      }
      if ($scope.newListing.macro == "electronics") {
        return $scope.electronicsErrors().length == 0;
      }
      if ($scope.newListing.macro == "textbooks") {
        return $scope.textbooksErrors().length == 0;
      }
      if ($scope.newListing.macro == "other") {
        return $scope.otherErrors().length == 0;
      }
    };

    $scope.conditions = [
      {value: 'used', text: 'Gently Used'},
      {value: 'new', text: 'New (with tags)'},
      {value: 'likenew', text: 'Like New (without tags)'},
    ];

    $scope.returnPolicies = [
      {value: 'No', text: 'No Returns'},
      {value: 'Maybe', text: 'Conditional Return'},
      {value: 'Hour', text: 'Within 24 hours'},
      {value: 'Day', text: 'Within 3 days'},
    ];

    $scope.showCondition = function() {
      var selected = $filter('filter')($scope.conditions, {value: $scope.newListing.condition});
      return ($scope.newListing.condition && selected.length) ? selected[0].text : 'Not set';
    };

    $scope.showReturn = function() {
      var selected = $filter('filter')($scope.returnPolicies, {value: $scope.newListing.return});
      return ($scope.newListing.return && selected.length) ? selected[0].text : 'Not set';
    };

    $scope.conditionTop = $scope.showCondition();
    $scope.conditionTop = $scope.conditionTop.replace(/[(].*[)]/g,'');


    $scope.fashionCategories = [
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
    ];

    $scope.homeFurnitureCategories = [
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
    ];

    $scope.electronicsCategories = [
      {text: 'Phones', value:'phones'},
      {text: 'Computers', value:'computers'},
      {text: 'TVs & Monitors', value:'tvsmonitors'},
      {text: 'Audio & Headphones', value:'audio'},
      {text: 'Gaming', value:'gaming'},
      {text: 'Car Accessories', value:'caracc'},
      {text: 'Cables & Adapters', value:'cables'},
      {text: 'Cameras & Photography', value:'photography'},
      {text: 'Other', value:'other'}
    ];

    $scope.textbooksCategories = [
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
    ];

    $scope.showCategory = function() {
      var selected = "";
      if ($scope.newListing.macro == "fashion") {
        selected = $filter('filter')($scope.fashionCategories, {value: $scope.newListing.category});
      }
      if ($scope.newListing.macro == "homeFurniture") {
        selected = $filter('filter')($scope.homeFurnitureCategories, {value: $scope.newListing.category});
      }
      if ($scope.newListing.macro == "electronics") {
        selected = $filter('filter')($scope.electronicsCategories, {value: $scope.newListing.category});
      }
      if ($scope.newListing.macro == "textbooks") {
        selected = $filter('filter')($scope.textbooksCategories, {value: $scope.newListing.category});
      }
      return ($scope.newListing.category && selected.length) ? selected[0].text : 'Not set';
    };

    $scope.genders = [
      {text: 'Women', value: "Women"},
      {text: 'Men', value: "Men"},
      {text: 'Any', value: "Any"}
    ];

    $scope.showGender = function() {
      if ($scope.newListing.gender == "Men") {
        return "Men";
      }
      else {
        var selected = $filter('filter')($scope.genders, {value: $scope.newListing.gender});
        return ($scope.newListing.gender && selected.length) ? selected[0].text : 'Not set';
      }
    };

    $scope.tryOnOptions = [
      {text: 'Yes', value: "Yes"},
      {text: 'No', value: "No"}
    ];

    $scope.showTryOnOptions = function() {
      if ($scope.newListing.ifTryOn == "Yes") {
        return "Yes";
      }
      else {
        var selected = $filter('filter')($scope.tryOnOptions, {value: $scope.newListing.ifTryOn});
        return ($scope.newListing.ifTryOn && selected.length) ? selected[0].text : 'Not set';
      }
    };

    $scope.checkField = function(field, name) {
      if (field == 0 && name == "price") {
        return;
      }
      if (field == "" || field == null) {
        return "You cannot leave the field empty.";
      }
    };

    $scope.isFree = function() {
      return $scope.newListing.price == 0;
    };

    $scope.savings = Math.ceil((1 - ($scope.newListing.price/$scope.newListing.retail))*100);

    $scope.deletePhoto = function(imageLink) {

      console.log(imageLink);

      // confirmation box
      swal({   title: "Are you sure you want to delete this photo?",   type: "warning",   showCancelButton: true,   confirmButtonColor: "#DD6B55",   confirmButtonText: "Yes, delete it!",   closeOnConfirm: true }, function(){   

        // if yes, remove the image from the post's image array
        removeFromArray(imageLink, $scope.newListing.imageUrls);
        console.log($scope.newListing.imageUrls);

        // create update object
        var updatedPost = {};
        updatedPost["imageUrls"] = $scope.newListing.imageUrls;
        
        // update the post
        Post.updatePost($scope.newListing._id, updatedPost);

      });

    };

    // Removes an element from an array.
    // String value: the value to search and remove.
    // return: an array with the removed element; false otherwise.
    function removeFromArray(value, array) {
      var idx = array.indexOf(value);
      if (idx != -1) {
          return array.splice(idx, 1); // The second parameter is the number of elements to remove.
      }
      return false;
    }

    $scope.s3Upload = function(){

      // create a unique filename
      var file_name = angular.element('#images').val().split('\\');
      file_name = file_name[file_name.length-1];

      // edit the individual files
      var file_element = document.getElementById('images');
      var f, files, output, _i, _len, _results, newF;
      files = file_element.files;
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

        $scope.resizedImg = dataURLtoBlob(canvas.toDataURL('image/jpeg', 0.7));

        var s3upload = new S3Upload({
            s3_object_name: file_name,
            file_type: 'image',
            file_dom_selector: $scope.resizedImg,
            s3_sign_put_url: s3serverURL,
            onProgress: function(percent, message) {
              $scope.uploadingPic = true;
              $scope.currProgress = percent;
              console.log('Upload progress: ', percent, message);
            },
            onFinishS3Put: function(public_url) {
              $scope.uploadingPic = false;
              console.log(public_url);

              // add the new image to the images array
              $scope.newListing.imageUrls.push(public_url);
              console.log($scope.newListing.imageUrls);
              $scope.$apply();

            },
            onError: function(status) {
              // console.log('Upload error: ', status);
            }
        });
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

    // show "Edit Photo" Dialog
    $scope.editPhoto = function(imageLink) {
      // console.log($rootScope.uploadProfilePic);
      $rootScope.editablePhoto = imageLink;

      if ($auth.isAuthenticated() && $rootScope.editablePhoto) {
          $mdDialog.show({
            controller: PostCtrl,
            templateUrl: '../../views/partials/editPhoto.html',
            parent: angular.element(document.body),
            // targetEvent: ev,
            clickOutsideToClose:true 
          })
          .then(function(answer) {

            // reloads the image
            // http://geniuscarrier.com/a-problem-with-ng-src-in-angularjs/
            for (var i = 0; i < $scope.newListing.imageUrls.length; i++) {
              var random = (new Date()).toString();
              $scope.newListing.imageUrls[i] = $scope.newListing.imageUrls[i] + "?cb=" + random;
            }

          }, function() {
            $scope.alert = 'You cancelled the dialog.';
          });
      }
      else {
        $location.path('/login');
      }
    };

    $scope.showLocation = function(name) {
      // console.log('hello');
      $scope.address = name;
      $scope.place = name;
      this.place = name;
      // console.log($scope.address);
    };

    $scope.addLocation = function() {
      var location = {
        "name": $scope.place.name,
        "address": $scope.place.formatted_address,
        "type": "location"
      };
      console.log(location);
      $scope.newListing.locations.push(location);
    };

    $scope.changeLocation = function(location) {
      $scope.mapCenter = location.address;
      $scope.place.name = location.name;
    };

    $scope.removeLocation = function(value) {
      // remove the location from the post's location array
      for (var i = 0; i < $scope.newListing.locations.length; i++) {
        console.log(i);
        if (value == $scope.newListing.locations[i].name) {
          return $scope.newListing.locations.splice(i, 1);
        }
      }
    };

    $scope.types = "['geocode']";
    $scope.mapCenter = "University of Toronto - St. George's Campus"
    $scope.place = {};
    $scope.place.name = "University of Toronto";
    $scope.place.formatted_address = "27 King's College Cir, Toronto, ON";
    
    $scope.placeChanged = function() {
      // console.log(this);
      $scope.place = this.getPlace();
      // console.log($scope.place);
      // console.log($scope.place.geometry.location.lat(), $scope.place.geometry.location.lng());
      // console.log($scope.place.geometry.location);
      $scope.mapCenter = String($scope.place.geometry.location.lat()) + ', ' + String($scope.place.geometry.location.lng());
    };

    $scope.hasData = function() {

      if ($scope.newListing.imageUrls.length != 0) {
          if ($scope.isFashion() || $scope.isHomeFurniture()) {
            if ($scope.newListing.imageUrls.length > 0 && $scope.newListing.locations.length > 0 && $scope.newListing.title != "Title not set" && $scope.newListing.price != -1 && $scope.newListing.category != "Not set" && $scope.newListing.condition != "Not set" && $scope.newListing.size != "Not set") {
              return false;
            }
          }
          else {
            if ($scope.newListing.imageUrls.length > 0 && $scope.newListing.locations.length > 0 && $scope.newListing.title != "Title not set" && $scope.newListing.price != -1 && $scope.newListing.category != "Not set" && $scope.newListing.condition != "Not set") {
              return false;
            }
          }
      }
      return true;
    };

    $scope.createListing = function() {

      // remove any extra fields
      if ($scope.newListing.macro == "fashion") {
        delete $scope.newListing["room"];
      }
      else if ($scope.newListing.macro == "homeFurniture") {
        delete $scope.newListing["gender"];
      }
      else if ($scope.newListing.macro == "electronics") {
        delete $scope.newListing["room"];
        delete $scope.newListing["gender"];
      }
      else if ($scope.newListing.macro == "textbooks") {
        delete $scope.newListing["room"];
        delete $scope.newListing["gender"];
      }

      $scope.newListing.status = 'Available';
      $scope.newListing.seller_id = $rootScope.currentUser._id;
      $scope.newListing.seller = $rootScope.currentUser._id;
      if ($scope.newListing.retail == -1) {
        $scope.newListing.retail = null;
      }


      Post.createPost($scope.newListing).success(function(data) {
        toaster.pop('succcess', 'Listing created successfully.');

        $location.path('/detail/' + data._id);
      });
    };

    $scope.$on('$locationChangeStart', function(event, next) {
      if ($scope.discardNewListing != true && !$scope.noErrors() && NewListing.getMacro()) {
        event.preventDefault();
        swal({   title: "Are you sure you want to discard this listing?",   type: "warning",   showCancelButton: true,   confirmButtonColor: "#DD6B55",   confirmButtonText: "Yes, delete it!",   closeOnConfirm: true }, function(){   
          $mdDialog.hide();
          $scope.discardNewListing = true;
          $location.path(next.split('#')[1]);
          $scope.$apply();
        });
      }
    });

  });

function PostCtrl($scope, $mdDialog) {
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };

  $scope.save = function() {
    alert('Form was valid!');
  };
}