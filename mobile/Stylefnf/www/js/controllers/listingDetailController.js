angular.module('Stylefnf')
.controller('listingDetailController', function($scope, $stateParams, Post, $ionicModal, $ionicSlideBoxDelegate, $state, $auth, currentUser, $ionicPopup, $timeout, Offer, $rootScope, $ionicHistory, $window, IonicClosePopupService, Like, paypalMerchantID, $cordovaInAppBrowser, $sce, $ionicLoading, $ionicPopover, serverURL) {

  $scope.$on("$destroy", function() {
    console.log('destroying scope');
  });

  if(!$rootScope.currentUser) {
    $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
  }

  $scope.payment = {};
  $scope.passwordObj = {};
  $scope.clickGoBack = false;
  $scope.merchantID = paypalMerchantID;
  // console.log('made it to the listing detail');
  // $scope.chat = Chats.get($stateParams.listingId);

  // check if we should show the pay button

  $scope.likedPost = false;

  $rootScope.$on('$cordovaInAppBrowser:loadstart', function(e, event){

    console.log('event');
    console.log("event ", event.url);
    console.log(window.location.href);
  });

  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    if (fromState.name == "tab.editListing") {
      $scope.loadListing();
    }

    if (fromState.name == "tab.listing-detail") {
      $scope.closeModal();
    }

    if (toState.name == "tab.listing-detail") {
      $scope.loadListing();
    }

    //check if trying to go back to edit listing or create listing
    if (toState.name == "tab.newListing" || toState.name == "tab.editListing") {
      // check if the user is trying to "go back"
      if ($scope.clickGoBack) {
        // reset the clickGoBack
        $scope.clickGoBack = false;
        // stop page change
        event.preventDefault();
        // redirect to feed
        $state.go('tab.feed');
      }
    }
    
  });

  $scope.lockSlide = function () {
      $ionicSlideBoxDelegate.$getByHandle('pay-slidebox').enableSlide( false );
  };

  $scope.loadListing = function() {
    // $ionicLoading.show();
    Post.getPost($stateParams.listingId)
      .success(function(data) {
        // $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');

        $scope.selectedPost = data;
        // console.log($scope.selectedPost);
        $scope.selectedPost['liked'] = Like.hasLiked($scope.selectedPost['likes']);

        $ionicSlideBoxDelegate.update();
        //console.log($scope.selectedPost);

        // check if the current user is the post creator
        $scope.isPostCreator = function() {
          //console.log(listing);
          return Post.isCreator($scope.selectedPost);
        };

        $scope.ifSeeFee = function(offer) {
          return (!Post.isCreator($scope.selectedPost)) && (offer.poster._id == $rootScope.currentUser._id)
        }

        // check if we should show the reserve button
        $scope.showReserveButton = function(listing) {
          // check if the current user is not the post creator

          if (!$scope.isPostCreator(listing)) {

            // check if the current has not already placed an offer
            if (!Offer.hasOffered(listing)) {
              //console.log('show reserve button');
              return true;

            }
          }
          return false;
        };


        $scope.showCancelButton = function(listing){
          if(Offer.hasOffered(listing)){
            return true;
          }
        };

        $scope.cancelOffer = function(listing) {

          var offers = listing.offers;

          for(var myOffer in offers){

            if($rootScope.currentUser._id == offers[myOffer].poster._id){

              if (Post.isBuyer(listing)) {
                var confirmPopup = $ionicPopup.confirm({
                  title: 'Confirm',
                  template: 'Are you sure you want to remove your offer?'
                });

                confirmPopup.then(function(res) {
                  if(res) {
                    Offer.cancelOffer(listing._id, offers[myOffer]._id)
                      .success(function(data) {
                        $scope.loadListing();
                        // reset the
                        listing.buyer="";
                        offers.splice(myOffer, 1);
                      });
                  }
                });
              }
              else {
                var confirmPopup = $ionicPopup.confirm({
                  title: 'Confirm',
                  template: "Are you sure you don't want to buy this item anymore?"
                });

                confirmPopup.then(function(res) {
                  if(res) {
                    Offer.cancelOffer(listing._id, offers[myOffer]._id)
                      .success(function(data) {
                        offers.splice(myOffer, 1);
                        $scope.loadListing();
                      });
                  }
                });
              }
              break;
            }
          }
        };

        $scope.updateListing = function() {
          $scope.editPopup.close();
          // $scope.editListingPopup.hide();
          $state.go('tab.editListing', {listingId: $scope.selectedPost._id});
        };

        // check if we should show the reserve button
        $scope.showPayButton = function(listing) {

          // check if the current user is not the post creator
          if (!$scope.isPostCreator(listing)) {

            if (Post.isBuyer(listing)) {
              //console.log('show pay button');
              return true;

            }
          }
          return false;
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

        $scope.placeOffer = function() {

          var offer = {
            total: $scope.offerData.offerPrice,
            name: $rootScope.currentUser.firstName,
            picture: $rootScope.currentUser.facebookPicture,
            post: $scope.selectedPost._id,
            poster: $rootScope.currentUser._id,
            serviceFee: $scope.serviceFee,
            sellerFee: $scope.sellerFee
          };

          Offer.makeOffer($scope.selectedPost._id, offer).success(function() {
            $scope.offerData.offerPrice = '';
            $scope.loadListing();
            //close the modal
            $scope.closeOfferModal();
          });

        };

        // click to like or unlike a listing
        $scope.likeListing = function() {
          Like.likeAction($scope.selectedPost._id).success(function(result) {
            // console.log(result);
            // check if the current user has liked the item
            $scope.selectedPost.liked = !$scope.selectedPost.liked;
            $scope.selectedPost.likes= result.likes;
          });
        };

        $scope.notStatus = function(status) {
          if (status == "Paid") {
            return ($scope.selectedPost.status != "Paid" && $scope.selectedPost.status != "Sold") ;
          } else if ($scope.selectedPost.status != status) {
            return true;
          } else {
            return false;
          }
        }

        $scope.isAvailable = function() {
          return $scope.selectedPost.status == "Available";
        }

        $scope.offerText = function() {
          if ($scope.selectedPost.offers.length-1 == 1) {
            return " + " + ($scope.selectedPost.offers.length-1) + " other placed offers";
          }
          else if ($scope.selectedPost.offers.length-1 > 1) {
            return " + " + ($scope.selectedPost.offers.length-1) + " others placed offers";
          }
          else return "placed an offer";
        };

        $scope.getBuyer = function() {
          for (var i in $scope.selectedPost.offers) {
            if ($scope.selectedPost.offers[i].poster._id == $scope.selectedPost.buyer) {
              return $scope.selectedPost.offers[i];
            }
          }
        };

        $scope.ifSize = function(size) {
          if (size == "Not set" || size == "" || size == null) {
            return false;
          } else {
            return true;
          }
        };

        $scope.getMobileImg = function(post) {

          if(post){
            if (typeof post.mobileImageUrls !== "undefined") {
              if (post.mobileImageUrls.length > 0) {
                return post.mobileImageUrls[0];
              } else {
                return post.imageUrls[0];
              }
            } else {
                return post.imageUrls[0];
            }
          }
        };

        $scope.getProfileAvatar = function(person) {
          if(person){
            if (typeof person.mobileProfileAvatars !== "undefined") {
              if (person.mobileProfileAvatars.length > 0) {
                return person.mobileProfileAvatars[0];
              } else {
                return person.profilePictures[0];
              }
            } else {
                return person.profilePictures[0];
            }
          }
        };


        $scope.getDisplayCondition = function(value) {
          if (value = "new") {
            return "New";
         } else if (value = "used") {
           return "Gently Used";
         } else {
            return "Like New";
          }
        };

        // $scope.payWithCreditCard = function() {
        //   $scope.paypalLink = createPayPalLink();
        //   $ionicSlideBoxDelegate.$getByHandle('pay-slidebox').slide(1);
        // };

        $scope.trustSrc = function(src) {
          return $sce.trustAsResourceUrl(src);
        };

        $scope.showPrice = function(price) {
          if (price == 0) {
            return "Free!";
          }
          if(price % 1 != 0){
            return "$" + price.toFixed(2);
          } else {
            return  "$" + price;
          }
        };
        $scope.payWithCreditCard = function() {

          var paypalLink = createPayPalLink();
          var options = {
            location: 'yes',
            clearcache: 'yes',
            toolbar: 'yes',
            close
          };

          $scope.closePayModal();

          $cordovaInAppBrowser.open(paypalLink, '_blank', options)

          .then(function(event) {
             // success
             // close the pay modal


          })

          .catch(function(event) {
             // error
          });

          // $cordovaInAppBrowser.close();
          $rootScope.$on('$cordovaInAppBrowser:exit', function(e, event) {
            $scope.closePayModal();
          });

        };

        function createPayPalLink() {

          var dev_main_url = 'https://www.sandbox.paypal.com/cgi-bin/webscr?';
          var dev_business = '&business=sugata.acharjya-facilitator@mail.utoronto.ca';

          var prod_main_url = 'https://www.paypal.com/cgi-bin/webscr?';
          var prod_business = '&business=sugata.acharjya@mail.utoronto.ca';

          var cmd_click = 'cmd=_xclick';
          var item_name = '&item_name=' + $scope.selectedPost.title;
          var item_number = '&item_number=' + $scope.selectedPost._id;
          var amount = '&amount=' + $scope.getTotal($scope.payingOffer.total, $scope.payingOffer.serviceFee, 'offer').toFixed(2);
          var bn = '&bn=PP-BuyNowBF:btn_buynowCC_LG.gif:NonHostedGuest'
          var output = '&output=embed';
          var currency_code = '&currency_code=CAD';
          var offer_id = '&custom=' + $scope.payingOffer._id;
          var cancel_url = '&cancel_return=http://stylefnf.com';

          // var dev_return_url = '&return=http://stylefnf.com';
          var dev_notify_url = '&notify_url=http://52.6.185.124:3000/api/confirmPayment';
          var prod_notify_url = '&notify_url=' + serverURL + '/api/confirmPayment';

          var testUrl =  dev_main_url +cmd_click + dev_business + item_name + item_number + amount + bn + output + currency_code + offer_id + dev_notify_url;

          var prodUrl = prod_main_url + cmd_click + prod_business + item_name + item_number + amount + bn + output + currency_code + offer_id + prod_notify_url;

          return testUrl;
        }

        $scope.slideIndex = 0;
        //console.log($scope.selectedPost);

        $scope.aImages = $scope.selectedPost.imageUrls;
      });
      // .catch(function(error) {

      // });
  };

  //duplicate calls on this function
  // $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
  //   if (toState.name == "tab.listing-detail") {
  //     $scope.loadListing();
  //   }
  // });


  $ionicModal.fromTemplateUrl('image-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $ionicModal.fromTemplateUrl('offer-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.offerModal = modal;
  });

  $ionicModal.fromTemplateUrl('pay-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.payModal = modal;
  });

  $ionicModal.fromTemplateUrl('viewOffers-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.viewOffersModal = modal;
  });

  $ionicPopover.fromTemplateUrl('edit-listing-template.html', {
    scope: $scope,
  }).then(function(popover) {
      $scope.editListingPopup = popover;
  });



  $scope.openModal = function() {
    // $ionicSlideBoxDelegate.slide(0);
    $scope.modal.show();
    $ionicSlideBoxDelegate.slide($scope.index);
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.closeOfferModal = function() {
    $scope.offerModal.hide();
  };

  $scope.closePayModal = function() {
    $scope.loadListing();
    $scope.payModal.hide();
    $ionicSlideBoxDelegate.$getByHandle('pay-slidebox').slide(0);
  };

  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
    $scope.offerModal.remove();
    $scope.payModal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hide', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });
  $scope.$on('modal.shown', function() {
    //console.log('Modal is shown!');
  });

  $scope.goToSlide = function() {
    $scope.modal.show();
    //console.log($scope.slideIndex);
    if (!$scope.slideIndex) {
      $scope.slideIndex = 0;
    }
    $ionicSlideBoxDelegate.slide($scope.slideIndex);
  };

  // Called each time the slide changes
  $scope.slideChanged = function(index) {
    $scope.slideIndex = index;
  };


  $scope.goToOfferDetails = function() {

    $scope.offerModal.show();
  };

  $scope.goToPayDetails = function() {

    for(i = 0; i < $scope.selectedPost.offers.length; i++) {
      if($scope.selectedPost.buyer == $scope.selectedPost.offers[i].poster._id) {
        $scope.payingOffer = $scope.selectedPost.offers[i];
        break;
      }
    }
    $scope.payModal.show();
  };

  $scope.goTo = function(route, id) {
    if (route == "listing") {
      // go to the given listing
      // $location.path('#/tab/detail/' + id);
      $state.go('tab.listing-detail', {listingId: id});
      // $state.transitionTo('tab/chats/' + id);
    }

    if (route == "profile") {
      if (id == $rootScope.currentUser._id) {
        $state.go('tab.account');
      }
      else {
        $state.go('tab.profile-detail', {profileId: id});
      }
    }

    if (route == "likes") {

      $state.go('tab.likes', {listingId: id});
    }

    if (route == "comments") {

      $state.go('tab.comments', {listingId: id});
    }
  };

  $scope.goToComments = function(){
    $state.go('tab.comments');
  }

  $scope.$on('$locationChangeStart', function(event, next) {
    //console.log(next);
    if (next.split('#/tab/')[1] == 'listings') {
      event.preventDefault();
    }
  });

  $scope.showAbout =  true;
  $scope.showMeetup = false;
  $scope.showSpec = false;

  $scope.toggleAbout = function() {
    if ($scope.showAbout == false) {
      $scope.showAbout = true;
    } else {
      $scope.showAbout = false;
    }
  };

  $scope.toggleMeetup = function() {
    if ($scope.showMeetup == false) {
      $scope.showMeetup= true;
    } else {
      $scope.showMeetup = false;
    }
  }

  $scope.toggleSpec = function() {
    if ($scope.showSpec == false) {
      $scope.showSpec = true;
    } else {
      $scope.showSpec = false;
    }
  }

  $scope.isCategory = function(wantedC, currentC) {
    if (wantedC == currentC) {
      return true;
    } else {
      return false;
    }
  };

  $scope.convertBoolean = function(bool) {
    if (bool == "false") {
      return "Nah";
    } else {
      return "Yep";
    }
  };

  /*$scope.toggleItem= function(item) {
    if ($scope.isItemShown(item)) {
      $scope.shownItem = null;
    } else {
      $scope.shownItem = item;
    }
  };
  $scope.isItemShown = function(item) {
    return $scope.shownItem === item;
  };*/

  // Triggered on a button click, or some other target
  $scope.showOfferPopup = function() {
    $scope.offerData = {};

    // An elaborate, custom popup
    var offerPopup = $ionicPopup.show({
      template: '<input type="number" min=0 max=100000 ng-model="offerData.offerPrice">',
      title: 'How much do you want to bid? (Just enter a number)',
      // subTitle: 'Please use normal things',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>OK</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.offerData.offerPrice) {
              //don't allow the user to close unless he/she enters offer price
              e.preventDefault();
            } else {
              return $scope.offerData.offerPrice;
            }
          }
        }
      ]
    });

    $scope.getTotalOfferPrice = function() {
      var total = $scope.serviceFee + $scope.offerData.offerPrice;
      return Math.round( total * 1e2 ) / 1e2;
    };

    IonicClosePopupService.register(offerPopup);

    offerPopup.then(function(res) {
      //console.log('Tapped!', res);
      if (res) {
        // get the service fee for the offer
        Offer.getServiceFee($scope.offerData.offerPrice, "offer")
          .success(function(allFees) {
            $scope.serviceFee = allFees['serviceFee'];
            $scope.sellerFee = allFees['sellerFee'];
            $scope.goToOfferDetails();
          });
      }
    });

    $timeout(function() {
       offerPopup.close(); //close the popup after 25 seconds for some reason
    }, 25000);
  };










  $scope.edit = function() {

    // $scope.editListingPopup.show($event);

    $scope.editPopup = $ionicPopup.show({
      cssClass: 'upload-pic-popup',
      templateUrl: 'edit-listing-template.html',
      scope: $scope,
    });
    IonicClosePopupService.register($scope.editPopup);
  };

  $scope.goBack = function(){
    $scope.clickGoBack = true;
    window.history.back();
  };

  $scope.goToOffers = function() {

    var offerPopup = $ionicPopup.show({
      //template: '<input type="number" ng-model="offerData.offerPrice">',
      title: 'Current Offers',
      template: '<ion-list ng-repeat="offer in selectedPost.offers">' +
                '<ion-item class="item-avatar item-icon-left item-text-wrap" style="padding: 15px 10px 0px 65px">' +
                '<img ng-src="{{offer.poster.profilePictures[0]}}">' +
                '<p>{{offer.poster.firstName}} placed an offer of ${{offer.total}} </p></ion-item><ion-list>',
      scope: $scope,
      buttons: [
        { text: 'Close' },
      ]
    });
  };

  $scope.goToViewOffersModal = function(status) {
    if(status == "Paid") return;
    $scope.viewOffersModal.show();
  };

  $scope.closeViewOffersModal = function() {
    $scope.viewOffersModal.hide();
  };

  $scope.showButtonForOwner = function() {
    return Post.isCreator($scope.selectedPost);
  };

  $scope.verify = function(warning) {

    $scope.verifyPopup = $ionicPopup.show({
      //template: '<input type="number" ng-model="offerData.offerPrice">',
      title: warning,
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Yes</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (warning == "Are you sure you want to remove this posting?") {
              Post.cancelPost($scope.selectedPost._id);
              $scope.editPopup.close();
              // $scope.editListingPopup.hide();
              $state.go('tab.feed');
            }
            else if (warning == "Are you sure you want to remove the hold on this item?") {

              for(i = 0; i < $scope.selectedPost.offers.length; i++) {

                if($scope.selectedPost.offers[i].accepted) {

                  Offer.cancelOffer($scope.selectedPost._id, $scope.selectedPost.offers[i]._id)
                    .success(function(data) {
                      $scope.loadListing();
                    });
                  // break;
                }
              }
            }
            else if (warning == "Are you sure you want to accept this offer?") {

            }
            else
              console.log(e);
          }
        }
      ]
    });
    return false;
  };


  $scope.markAsSold = function(){
    var confirmPopup = $ionicPopup.confirm({
      title: 'Confirm',
      template: 'Are you sure you want to mark this item as sold?'
    });

    confirmPopup.then(function(res) {
      if(res) {
        Post.soldPost($scope.selectedPost._id)
          .success(function(data){
            $scope.loadListing();
            $scope.sold = data;
          })

        $scope.editPopup.close();
        // $scope.editListingPopup.hide();
      }
    });

  };

  $scope.markAsAvailable = function(){
    var confirmPopup = $ionicPopup.confirm({
      title: 'Confirm',
      template: 'Are you sure you want to mark this item as available?'
    });

    confirmPopup.then(function(res) {
      if(res) {
        Post.reactivatePost($scope.selectedPost._id)
          .success(function(data){
            $scope.loadListing();
            $scope.sold = data;
          })

        $scope.editPopup.close();
        // $scope.editListingPopup.hide();
      }
    });

  };

  $scope.acceptOffer = function(offerID, buyerID) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Confirm',
      template: 'Are you sure you want to accept this offer?'
    });

    confirmPopup.then(function(res) {
      if(res) {
        Offer.acceptOffer($scope.selectedPost._id, offerID, buyerID)
          .then(function(data) {
            $scope.loadListing();
            $scope.selectedPost.status = 'Held';
            $scope.closeViewOffersModal();
          });
      }
    });

  };

  $scope.viewOffer = function(offer) {

  };

  $scope.removeHold = function() {

    $scope.verify("Are you sure you want to remove the hold on this item?");
  };

  //duplicate calls on this function
  // $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
  //   // console.log(toState);
  //   //check if trying to go back to edit listing or create listing
  //   if (toState.name == "tab.newListing" || toState.name == "tab.editListing") {
  //     // check if the user is trying to "go back"
  //     if ($scope.clickGoBack) {
  //       // reset the clickGoBack
  //       $scope.clickGoBack = false;
  //       // stop page change
  //       event.preventDefault();
  //       // redirect to feed
  //       $state.go('tab.feed');
  //     }
  //   }
  // });

  // hack to prevent the page from changing after clicking a button
  // $scope.$on('$locationChangeStart', function(event, next) {
  //   console.log(next);
  //   if (next.split('#/tab/')[1] == 'profiles') {
  //     event.preventDefault();
  //   }
  // });

  $scope.seeCondition = function(condition) {
    if (condition == "used") {
      return "New";
    } else if (condition == "likenew") {
      return "Like New";
    } else {
      return "Gently Used";
    }
  }

  $scope.convertType = function(type) {
    if (type == "homeFurniture") {
      return "Home and Furniture";
    } else {
      return capitalizeFirstLetter(type);
    }

    function capitalizeFirstLetter(string) {
      if (string == null) {
        return "";
      } else {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }
    };
  }

  $scope.convertReturn = function(option) {
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



  $scope.slideVisible = function(index){
    if(  index < $ionicSlideBoxDelegate.currentIndex() -1 
       || index > $ionicSlideBoxDelegate.currentIndex() + 1){
      return false;
    }
    
    return true;
  }

  $scope.getDeviceHeight = function(){
    return $window.innerHeight;
  }
  
});
