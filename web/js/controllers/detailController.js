angular.module('Haberdashery')
  .controller('detailController', function(
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
              serverURL,
              s3serverURL,
              $mdToast,
              $filter,
              Profile
              ) {

    $scope.isAuthenticated = function() {
      // check if logged in
      return $auth.isAuthenticated() && ($rootScope.currentUser.isComplete == true);
    };

    $scope.bid = {
      value: ''
    };

    $scope.isHovering = false;

    $scope.cancellingListing = false;

    $scope.hoverIn = function() {
      // console.log('yello');
      $scope.isHovering = true;
    };

    $scope.hoverOut = function() {
      // console.log('yello2');
      $scope.isHovering = false;
    };

    $scope.isEditing = false;

    $scope.changeEditing = function(offerNum) {
      // if (offerNum > 0) {
      //   $scope.selectedTabIndex = 1;
      // }
      // else {
      //   $scope.selectedTabIndex = 0;
      // }
      $scope.isEditing = !$scope.isEditing;
    };

    $scope.selectedTabIndex = 0;

    $scope.currentUser = $rootScope.currentUser;

    $scope.status = {
      isopen: false
    };

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

    Socket.on('comment.created', function(comments) {
      // console.log('hello');
      if(comments && (comments[0].post == $scope.selectedPost._id)) {
        // console.log(comments);
        $scope.comments = comments;
      }
    });

    Socket.on('comment.updated', function(comments) {
      // console.log('hello');
      // console.log(comments);
      if (comments.length == 0) {
        $scope.comments = comments;
      }
      else if(comments && (comments[0].post == $scope.selectedPost._id)) {
        // console.log(comments);
        $scope.comments = comments;
      }
    });

    Socket.on('offer.made', function(offers, post) {
      if(offers && (post._id == $scope.selectedPost._id)) {
        // console.log('woohoo made an offer');
        // console.log(offers);
        $scope.offers = offers;
        $scope.selectedPost = post;
        $scope.alreadyOffered = Offer.hasOffered($scope.selectedPost);
      }
    });

    Socket.on('offer.removed', function(offers, post) {
      // console.log(offers);
      // console.log('hello')
      // console.log(post);
      if(offers && (post._id == $scope.selectedPost._id)) {
        // console.log('woohoo made an offer');
        // console.log(offers);
        $scope.selectedPost = post;
        $scope.offers = post.offers;

        $scope.alreadyOffered = Offer.hasOffered($scope.selectedPost);
      }
      // $scope.selectedPost = post;
      // $scope.offers = offers;

      // $scope.alreadyOffered = Offer.hasOffered($scope.selectedPost);
      // if the offer length is zero, we still need an identifier so that we can check if the user is on the right page
      // console.log(offers.length === 0);
      // if(offers.length === 0) {
      //   console.log(offers);
      //   // console.log(post_pointer);
      //   $scope.offers = offers;
      // }
    });

    Socket.on('offer.accepted', function(offers, post) {
      // console.log('OFFER ACCEPTED');
      // console.log(offers);
      // console.log(post);
      // $scope.selectedPost = post;
      // $scope.offers = offers;
      if(offers && (post._id == $scope.selectedPost._id)) {
        // console.log('woohoo made an offer');
        // console.log(offers);
        // console.log(post);
        $scope.selectedPost = post;
        $scope.offers = post.offers;
      }
      // if(offers) {
      //   // console.log(offers);
      //   $scope.offers = offers;
      //   $scope.selectedPost = post;
      // }
      // $scope.selectedPost = post;
    });

    Socket.on('post.held', function(post) {
      if (post._id == $scope.selectedPost._id) {
        // console.log('post held update');
        // console.log(post);
        $scope.selectedPost = post;
      }
      // $scope.selectedPost = post;
    });

    Socket.on('post.purchased', function(post) {
      if($routeParams.postId === post._id) {
        // console.log(post);
        $scope.selectedPost = post;
      }
    });

    $scope.hovercardURL = '../../views/partials/hoverProfile.html';

    $scope.hoverProfileIn = function(seller) {
      // console.log('hoverIn');
      $rootScope.hoverProfile = seller;
    };

    $scope.hoverProfileOut = function() {
      console.log('hoverOut');
      $rootScope.hoverProfile = undefined;
    };

    var postId = $routeParams.detailId;

    $scope.getEditablePost = function(postId) {
      Post.getDeferredPost(postId).then(function(data) {
        $scope.editablePost = data;
        // console.log('setting editablePost');
        // console.log($scope.editablePost);
        Post.setEditablePost(data);
        // console.log(this.editablePost);
        // console.log('set editablePost');
      });
    };

    if(postId) {
      Post.getPost(postId)
        .success(function(data) {
            $scope.selectedPost = data;
            // console.log(data);

            $scope.isFashion = function() {
              return $scope.selectedPost.macro == "fashion";
            };

            $scope.isHomeFurniture = function() {
              return $scope.selectedPost.macro == "homefurniture";
            };

            $scope.isElectronics = function() {
              return $scope.selectedPost.macro == "electronics";
            };

            $scope.isTextbooks = function() {
              return $scope.selectedPost.macro == "textbooks";
            };

            $scope.isOther = function() {
              return $scope.selectedPost.macro == "other";
            };

            $scope.likeSelectedPost = function(post) {
              Like.likeAction(post._id).success(function(result) {
                // console.log('the result')
                // console.log(result);
                // console.log('result and post are identical');
                // console.log(post._id == result._id);
                $scope.selectedPost.likes = result.likes;
              });
            };

            $scope.showOffers = function() {
              return (($scope.selectedPost.offers.length > 0) && ($scope.isEditing == false))
            };

            $scope.getLikes = function() {
              var totalLikes = 0;
              for (var i in $scope.selectedPost.likes) {
                totalLikes += 1;
              }
              return totalLikes;
            };

            $scope.myLike = function(likes) {
              // console.log(likes);
              // console.log(likes);
              return Like.hasLiked(likes);
            };
            //angular.copy(data, $scope.selectedPost);
            // console.log($scope.selectedPost); 

            $scope.getRandom = Math.floor(Math.random() * (($scope.selectedPost.likes.length-1) - 0 + 1)) + 0;

            // $scope.seller_first_name = $scope.selectedPost.seller_name.split(' ')[0];  

            $scope.isOfferMaker = Offer.isMaker;

            $scope.savings = Math.ceil((1 - ($scope.selectedPost.price/$scope.selectedPost.retail))*100);

            $scope.isPostCreator = Post.isCreator;
            // $scope.isHolder = Post.isHolder;

            $scope.isLister = Post.isCreator($scope.selectedPost);
            $scope.isOfferable = Post.isAvailable($scope.selectedPost);

            // // check if the selected post is available
            // $scope.isAvailable = Post.isAvailable($scope.selectedPost);
            // console.log('isAvailable: ' + $scope.isAvailable);
            $scope.isAvailable = Post.isAvailable;

            // // check if current user has already made an offer
            $scope.alreadyOffered = Offer.hasOffered($scope.selectedPost);
            // console.log('alreadyOffered: ' + $scope.alreadyOffered);
            // $scope.alreadyOffered = Offer.hasOffered;

            //  // check if current user is the buyer
            // $scope.isBuyer = Post.isBuyer($scope.selectedPost);
            // console.log('isBuyer: ' + $scope.isBuyer);
            $scope.isBuyer = Post.isBuyer;

            // // check if current post has been purchased
            // $scope.isPurchased = Post.isPurchased($scope.selectedPost);
            // console.log('isPurchased: ' + $scope.isPurchased);
            $scope.isPurchased = Post.isPurchased;

            $scope.notPosterNotAvailable = function() {
              if (!$scope.isPostCreator($scope.selectedPost)) {
                return true;
              }
              else if (!$scope.isAvailable($scope.selectedPost)) {
                return true;
              }
              else {
                return false;
              }
              // return !isPostCreator($scope.selectedPost) && !isAvailable($scope.selectedPost);
            };

            $scope.usersLiked = function(likes) {
              // iterate through the likes and return an array of user names who like the post
              var userNames = "";
              for (var i in likes) {
                userNames = userNames + likes[i].user.firstName + " " + likes[i].user.lastName + "\n";
              }
              // console.log(userNames);
              return userNames;
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
              var selected = $filter('filter')($scope.conditions, {value: $scope.selectedPost.condition});
              return ($scope.selectedPost.condition && selected.length) ? selected[0].text : 'Not set';
            };

            $scope.showReturn = function() {
              var selected = $filter('filter')($scope.returnPolicies, {value: $scope.selectedPost.return});
              return ($scope.selectedPost.return && selected.length) ? selected[0].text : 'Not set';
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
              if ($scope.selectedPost.macro == "fashion") {
                selected = $filter('filter')($scope.fashionCategories, {value: $scope.selectedPost.category});
              }
              if ($scope.selectedPost.macro == "homefurniture") {
                selected = $filter('filter')($scope.homeFurnitureCategories, {value: $scope.selectedPost.category});
              }
              if ($scope.selectedPost.macro == "electronics") {
                selected = $filter('filter')($scope.electronicsCategories, {value: $scope.selectedPost.category});
              }
              if ($scope.selectedPost.macro == "textbooks") {
                selected = $filter('filter')($scope.textbooksCategories, {value: $scope.selectedPost.category});
              }
              return ($scope.selectedPost.category && selected.length) ? selected[0].text : 'Not set';
            };

            $scope.genders = [
              {text: 'Women', value: "Women"},
              {text: 'Men', value: "Men"},
              {text: 'Any', value: "Any"}
            ];

            $scope.showGender = function() {
              if ($scope.selectedPost.gender == "Men") {
                return "Men";
              }
              else {
                var selected = $filter('filter')($scope.genders, {value: $scope.selectedPost.gender});
                return ($scope.selectedPost.gender && selected.length) ? selected[0].text : 'Not set';
              }
            };


            $scope.tryOnOptions = [
              {text: 'Yes', value: "Yes"},
              {text: 'No', value: "No"}
            ];

            $scope.showTryOnOptions = function() {
              if ($scope.selectedPost.ifTryOn == "Yes") {
                return "Yes";
              }
              else {
                var selected = $filter('filter')($scope.tryOnOptions, {value: $scope.selectedPost.ifTryOn});
                return ($scope.selectedPost.ifTryOn && selected.length) ? selected[0].text : 'Not set';
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
              return $scope.selectedPost.price == 0;
            };

            $scope.updateListing = function(postId, postData, postField) {
              // console.log(postData);
              var updatedPost = {};
              // if (postField == "description") {
              //   postData = postData.replace(/\n\r?/g, '<br />');
              // }
              updatedPost[postField] = postData;
              
              Post.updatePost(postId, updatedPost);
            };

            $scope.comments = $scope.selectedPost.comments;

            $scope.addComment = function() {
              var text = $scope.content.replace(/\n\r?/g, '<br />');
              console.log($scope.content);
              var comment = {
                content: text,
                name: $rootScope.currentUser.facebookName,
                picture: $rootScope.currentUser.facebookPicture,
                post: $scope.selectedPost._id,
                poster: $rootScope.currentUser._id
              };

              Comment.addComment($scope.selectedPost._id, comment).then(
                function() {
                  $scope.content = '';
              });
            };

            $scope.updateComment = function(commentId, comment) {
              // console.log('made it to update comment');
              var text = comment.replace(/\n\r?/g, '<br />');
              var updatedComment = {
                content: text
              };
              // console.log(updatedComment);
              Comment.updateComment(commentId, updatedComment);
            };

            $scope.removeComment = function(commentId) {

              swal({ title: "Are you sure you want to delete this comment?",   type: "warning",   showCancelButton: true,   confirmButtonColor: "#DD6B55",   confirmButtonText: "Yes, delete this comment!",   closeOnConfirm: false }, function(){   

                // console.log('made it to remove comment');
                Comment.removeComment(commentId);

                swal("Comment removed!", "The comment been deleted.", "success"); 

              });
            };

            $scope.offers = $scope.selectedPost.offers;

            $scope.makeOffer = function() {

              var title_str = "Are you sure you want to offer $" + $scope.total + "?";
              var listing_percent = Math.floor(($scope.total/$scope.selectedPost.price)*100);
              var text_str = "You are offering " + listing_percent + "% of the listing price of $" + $scope.selectedPost.price + "."

              swal({   title: title_str, text: text_str, type: "warning",   showCancelButton: true,   confirmButtonColor: "#DD6B55",   confirmButtonText: "Yes, place my offer!",   closeOnConfirm: false }, function(){   


              });

              var offer = {
                total: $rootScope.offerModalPrice,
                name: $rootScope.currentUser.facebookName,
                picture: $rootScope.currentUser.facebookPicture,
                post: $scope.selectedPost._id,
                poster: $rootScope.currentUser._id,
                serviceFee: $rootScope.serviceFee,
                sellerFee: $rootScope.sellerFee
              };

              Offer.makeOffer($scope.selectedPost._id, offer).success(function() {
                // close the dialog box
                $scope.cancel();
                // toaster.pop('success', 'Your offer has been placed');
                $scope.total = '';
                $scope.block = true;
                $scope.alreadyOffered = true;
                // change the tab to the offers tab
                // $scope.selectedTabIndex = 1;
                // console.log($scope.alreadyOffered);
              });
              swal("Offer placed!", "Your offer for this listing has been placed.", "success"); 

              // console.log('made it to makeOffer');
              // console.log($scope.total);

            };

            $scope.cancelOffer = function(offerId) {

              Offer.cancelOffer($scope.selectedPost._id, offerId).success(function() {
                toaster.pop('success', 'Offer successfully cancelled.');
                
                $scope.alreadyOffered = false;
                $scope.block = false;
              });
            };

            $scope.cancelMyOfferMain = function() {

              swal({   title: "Are you sure you want to delete your offer?",   type: "warning",   showCancelButton: true,   confirmButtonColor: "#DD6B55",   confirmButtonText: "Yes, remove my offer!",   closeOnConfirm: true }, function(){   

                // find the offer id of the current user
                var userOfferId;
                // console.log($rootScope.currentUser._id);

                // iterate through the current posts's offers
                for (var offer in $scope.offers) {
                  // console.log(offer);

                  if ($scope.offers[offer].poster._id == $rootScope.currentUser._id){
                    userOfferId = $scope.offers[offer]._id;
                  }
                }

                // console.log(userOfferId);
                $scope.cancelOffer(userOfferId);

                // change the tab to the offers tab
                $scope.selectedTabIndex = 1;

                swal("Offer removed!", "Your offer for this listing has been removed.", "success"); 

              });
            };

            $scope.removeHold = function(offerId) {
              swal({   title: "Are you sure you want to remove the hold?", text:"This means that your listing will be available for purchase again.",  type: "warning",   showCancelButton: true,   confirmButtonColor: "#DD6B55",   confirmButtonText: "Yes, remove the hold!",   closeOnConfirm: false }, function(){   

                $scope.cancelOffer(offerId);

                // change the tab to the offers tab
                $scope.selectedTabIndex = 1;

                swal("Hold removed!", "Your listing is now available for purchase.", "success"); 
              });

            };

            $scope.rejectOffer = function(offerId) {
              swal({   title: "Are you sure you want to reject the offer on your listing?",   type: "warning",   showCancelButton: true,   confirmButtonColor: "#DD6B55",   confirmButtonText: "Yes, reject this offer!",   closeOnConfirm: false }, function(){   

                $scope.cancelOffer(offerId);

                // change the tab to the offers tab
                $scope.selectedTabIndex = 1;

                swal("Offer rejected!", "", "success"); 
              });

            };

            $scope.isSold = function(listing) {
              return (listing.status == 'Paid');
            };

            $scope.acceptOffer = function(offer) {

              var offerId = offer._id;
              var buyerId = offer.poster._id;

              Offer.acceptOffer($scope.selectedPost._id, offerId, buyerId).then(function() {
                $scope.cancel();
                toaster.pop('success', 'Offer accepted.');
                swal("Offer accepted!", "Your listing is now on hold.", "success"); 
              });
              // // var offer_first_name = offer.name.split(' ')[0];
              // var offer_first_name = offer.poster.firstName;

              // var title_str = "Are you sure you want to accept $" + offer.total + " from " + offer_first_name + "?";
              // var listing_percent = Math.floor((offer.total/$scope.selectedPost.price)*100);
              // var text_str = "You are receiving " + listing_percent + "% of your listing price.";

              // swal({   title: title_str, text: text_str,   type: "warning",   showCancelButton: true,   confirmButtonColor: "#DD6B55",   confirmButtonText: "Yes, accept this offer!",   closeOnConfirm: false }, function(){   

              //   // console.log('accept offer: ' + offerId);
              //   Offer.acceptOffer($scope.selectedPost._id, offerId, buyerId).then(function() {
              //     toaster.pop('success', 'Offer accepted.');
              //   });

              //   // change the tab to the offers tab
              //   $scope.selectedTabIndex = 1;

              //   swal("Offer accepted!", "Your listing is now on hold.", "success"); 

              // });
            };

            $scope.showAcceptOffer = function(ev, offer) {
              $rootScope.viewOffer = offer;
              $mdDialog.show({
                controller: PostCtrl,
                // scope: $scope,
                templateUrl: '../../views/partials/acceptOffer.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true
              })
              .then(function(answer) {
                // $mdToast.show(
                //   $mdToast.simple()
                //     .content(JSON.stringify(answer))
                // );
              }, function() {
                console.log('You cancelled the dialog.');
                // $scope.bid = { value: '' };
              });
            };

            $scope.reactivatePost = function(postId) {

              $scope.cancellingListing = true;

              swal({   title: "Are you sure you want to reactivate your listing?",   type: "warning",   showCancelButton: true,   confirmButtonColor: "#DD6B55",   confirmButtonText: "Yes, reactivate my listing!",   closeOnConfirm: false }, function(){   

                Post.reactivatePost(postId).success(function() {
                  $scope.cancellingListing = false;
                  $scope.status = "Available";
                  toaster.pop('success', 'Post successfully reactivated.');
                  // $location.path('/browse/'); 
                });

                swal("Listing reactivated!", "Your listing is now active.", "success");

              });
            };

            $scope.deletePhoto = function(imageLink) {

              console.log(imageLink);

              // confirmation box
              swal({   title: "Are you sure you want to delete this photo?",   type: "warning",   showCancelButton: true,   confirmButtonColor: "#DD6B55",   confirmButtonText: "Yes, delete it!",   closeOnConfirm: true }, function(){   

                // if yes, remove the image from the post's image array
                removeFromArray(imageLink, $scope.selectedPost.imageUrls);
                console.log($scope.selectedPost.imageUrls);

                // create update object
                var updatedPost = {};
                updatedPost["imageUrls"] = $scope.selectedPost.imageUrls;
                
                // update the post
                Post.updatePost($scope.selectedPost._id, updatedPost);

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

              $scope.uploadingPic = true;

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
                      $scope.currProgress = percent;
                      console.log('Upload progress: ', percent, message);
                    },
                    onFinishS3Put: function(public_url) {
                      $scope.uploadingPic = false;
                      console.log(public_url);

                      // add the new image to the images array
                      $scope.selectedPost.imageUrls.push(public_url);
                      console.log($scope.selectedPost.imageUrls);

                      // create update object
                      var updatedPost = {};
                      updatedPost["imageUrls"] = $scope.selectedPost.imageUrls;
                      
                      // update the post
                      Post.updatePost($scope.selectedPost._id, updatedPost);

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
                    for (var i = 0; i < $scope.selectedPost.imageUrls.length; i++) {
                      var random = (new Date()).toString();
                      $scope.selectedPost.imageUrls[i] = $scope.selectedPost.imageUrls[i] + "?cb=" + random;
                    }

                  }, function() {
                    $scope.alert = 'You cancelled the dialog.';
                  });
              }
              else {
                $location.path('/login');
              }
            };

            $scope.showOffer = function(ev) {
              // when you click the update my listing button, you set the post to a global var
              console.log('clicked offer listing');

              if ($auth.isAuthenticated()) {
                // console.log('offerPrice', $scope.bid.value);

                // get the service fee
                Offer.getServiceFee($scope.bid.value, "offer")
                  .success(function(allFees) {
                    $rootScope.offerModalPrice = $scope.bid.value;
                    $rootScope.serviceFee = allFees['serviceFee'];
                    $rootScope.sellerFee = allFees['sellerFee'];

                    // console.log('getting here');

                    $mdDialog.show({
                      controller: PostCtrl,
                      // scope: $scope,
                      templateUrl: '../../views/partials/offer.html',
                      parent: angular.element(document.body),
                      targetEvent: ev,
                      clickOutsideToClose:true
                    })
                    .then(function(answer) {
                      // $mdToast.show(
                      //   $mdToast.simple()
                      //     .content(JSON.stringify(answer))
                      // );
                    }, function() {
                      console.log('You cancelled the dialog.');
                      $scope.bid = { value: '' };
                    });
                  });
              }
              else {
                $location.path('/login');
              }

              // if ($scope.selectedPost.price == 0) {

              //   var offer = {
              //     total: 0,
              //     name: $rootScope.currentUser.firstName,
              //     picture: $rootScope.currentUser.profilePictures[0],
              //     post: $scope.selectedPost._id,
              //     poster: $rootScope.currentUser._id
              //   };

              //   Offer.makeOffer($scope.selectedPost._id, offer).success(function() {
              //     // close the dialog box
              //     $scope.cancel();
              //     toaster.pop('success', 'Your offer has been placed');
              //     $scope.total = '';
              //     $scope.block = true;
              //     $scope.alreadyOffered = true;
              //     // change the tab to the offers tab
              //     $scope.selectedTabIndex = 1;
              //     // console.log($scope.alreadyOffered);
              //   });
              // }
              // else {

              // }
            };

            $scope.markAsSold = function(post) {

              $scope.cancellingListing = true;

              swal({   title: "Are you sure you want to mark your listing as sold?",   type: "warning",   showCancelButton: true,   confirmButtonColor: "#DD6B55",   confirmButtonText: "Yes, my listing has been sold!",   closeOnConfirm: false }, function(){   

                // Post.completeTransaction(postId).then(function(data) {
                //   ;// toaster.pop('success', 'Congratulations! You have bought this item.');
                // });
                Post.markAsSold(post._id).success(function(data) {
                  $scope.selectedPost.status = "Sold";
                  $scope.cancellingListing = false;

                  Profile.getUserProfile(post.seller._id).success(function(data1) {

                    console.log(data1);
                    var updatedProfile = data1;
                    updatedProfile["soldPosts"].push(post);
                    // Profile.updateProfile(updatedProfile).success(function(data2) {

                    //   console.log(data2);
                    // });
                  });

                  toaster.pop('success', 'Listing updated to sold.');
                });

                swal("Listing sold!", "Listing updated to sold.", "success");
              });
            };

            $scope.getTotal = function(price, fee, type) {
              if (type == "seller") {
                var total = price - fee;
              }
              else {
                var total = price + fee;
              }
              return Math.round( total * 1e2 ) / 1e2;
            };

            $scope.completeTransaction = function(postId) {
              Post.completeTransaction(postId).then(function() {
                toaster.pop('success', 'Congratulations! You have bought this item.');
              });
            };
        
        })
        .catch(function(response) {
          swal("No listing found.", "", "error");
          $location.path('/browse');
        });
    }

    $scope.cancelPost = function(postId) {

      $scope.cancellingListing = true;

      swal({   title: "Are you sure you want to remove your listing?",   type: "warning",   showCancelButton: true,   confirmButtonColor: "#DD6B55",   confirmButtonText: "Yes, remove my listing!",   closeOnConfirm: false }, function(){   

        Post.cancelPost(postId).success(function() {
          $scope.cancellingListing = false;
          // toaster.pop('success', 'Listing successfully cancelled.');
          $location.path('/browse/'); 
        });

        swal("Listing cancelled!", "Your listing has been removed.", "success");

      });
    };

    $scope.buyItem = function(selectedPost){
      console.log(selectedPost);
      console.log("ji");



      //createPayPalLink(selectedPost);
      var paypalLink = createPayPalLink(selectedPost);
      
      var options = {
        location: 'yes',
        clearcache: 'yes',
        toolbar: 'yes',
        close
      };

      $window.open(paypalLink, '_blank', options);
    }

    
    function createPayPalLink(selectedPost) {

      for(i = 0; i < selectedPost.offers.length; i++) {
        if(selectedPost.buyer == selectedPost.offers[i].poster._id) {
          $scope.payingOffer = selectedPost.offers[i];
            break;
        }
      }
      var dev_main_url = 'https://www.sandbox.paypal.com/cgi-bin/webscr?';
      var dev_business = '&business=sugata.acharjya-facilitator@mail.utoronto.ca';

      var prod_main_url = 'https://www.paypal.com/cgi-bin/webscr?';
      var prod_business = '&business=sugata.acharjya@mail.utoronto.ca';
      
      var cmd_click = 'cmd=_xclick';
      var item_name = '&item_name=' + selectedPost.title;
      var item_number = '&item_number=' + selectedPost._id;
      var amount = '&amount=' + $scope.getTotal($scope.payingOffer.total, $scope.payingOffer.serviceFee, 'offer').toFixed(2);
      var bn = '&bn=PP-BuyNowBF:btn_buynowCC_LG.gif:NonHostedGuest'
      var output = '&output=embed';
      var currency_code = '&currency_code=CAD';
      var offer_id = '&custom=' + $scope.payingOffer._id;

      // var dev_return_url = '&return=http://stylefnf.com';
      var cancel_url = '&cancel_return=http://stylefnf.com';
      
      var dev_notify_url = '&notify_url=http://52.6.185.124:3000/api/confirmPayment';
      
      var prod_notify_url = '&notify_url=' + serverURL + '/api/confirmPayment';

      var testUrl =  dev_main_url + cmd_click + dev_business + item_name + item_number + amount + bn + output + currency_code + offer_id + dev_notify_url;

      var prodUrl = prod_main_url + cmd_click + prod_business + item_name + item_number + amount + bn + output + currency_code + offer_id + prod_notify_url;

      return prodUrl;
    }


    $scope.getTotal = function(price, fee, type) {
      if (type == "seller") {
        var total = price - fee;
      }
      else {
        var total = price + fee;
      }
      return Math.round( total * 1e2 ) / 1e2;
    };

    $scope.$on('$locationChangeStart', function(event, next) {
      if ($scope.discardselectedPost == true) {
        event.preventDefault();
      }
    });



    $scope.linkInstagram = function() {
      $auth.link('instagram')
      // connect email account with instagram
        .then(function(response) {
          $window.localStorage.currentUser = JSON.stringify(response.data.user);
          $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
          // API.getFeed().success(function(data) {
          //   $scope.photos = data;
          // });
        });
    };

    $scope.linkFacebook = function() {
      $auth.link('facebook')
      // connect email account with facebook
        .then(function(response) {
          $window.localStorage.currentUser = JSON.stringify(response.data.user);
          $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
          // API.getFeed().success(function(data) {
          //   $scope.photos = data;
          // });
        });
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
      $scope.selectedPost.locations.push(location);
    };

    $scope.changeLocation = function(location) {
      $scope.mapCenter = location.address;
      $scope.place.name = location.name;
    };

    $scope.removeLocation = function(value) {
      // remove the location from the post's location array
      for (var i = 0; i < $scope.selectedPost.locations.length; i++) {
        console.log(i);
        if (value == $scope.selectedPost.locations[i].name) {
          return $scope.selectedPost.locations.splice(i, 1);
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

    

    $scope.showLiked = function(ev) {
      // when you click the update my listing button, you set the post to a global var
      // console.log('clicked show likes');

      if ($auth.isAuthenticated()) {
          $mdDialog.show({
            controller: PostCtrl,
            templateUrl: '../../views/partials/liked.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true  
          })
          .then(function(answer) {
            // $mdToast.show(
            //   $mdToast.simple()
            //     .content(JSON.stringify(answer))
            // );
          }, function() {
            // $scope.alert = 'You cancelled the dialog.';
          });
      }
      else {
        $location.path('/login');
      }
    };

    $scope.$on('$locationChangeStart', function(event) {
      $mdDialog.hide();
    });

    $scope.showMessage = function(ev) {
      // when you click the update my listing button, you set the post to a global var
      // console.log('clicked offer listing');

      $rootScope.sendMessageProfile = $scope.selectedPost.seller;
      $rootScope.meetUpMsg = true;

      if ($auth.isAuthenticated()) {
          $mdDialog.show({
            controller: PostCtrl,
            templateUrl: '../../views/partials/newMessage.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
          })
          .then(function(answer) {
            // $mdToast.show(
            //   $mdToast.simple()
            //     .content(JSON.stringify(answer))
            // );
            $rootScope.meetUpMsg = false;
          }, function() {
            $scope.alert = 'You cancelled the dialog.';
            $rootScope.meetUpMsg = false;
          });
      }
      else {
        $location.path('/login');
      }
    };

    $scope.$on('$locationChangeStart', function(event, next) {
      if ($scope.cancellingListing == true) {
        event.preventDefault();
      }
    });

    // SEO REQUIREMENT: 
    // PhantomJS pre-rendering workflow requires the page to declare, through htmlReady(), that
    // we are finished with this controller. 
    // $scope.htmlReady();

    // $scope.listingId = $routeParams.listingId;

    // $http.get('data/' + $routeParams.listingId + '.json').success(function(data) {
    //   $scope.listing = data;
    // });
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