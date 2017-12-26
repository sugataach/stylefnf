// Dialog Box Function
(function () {
  'use strict';
  angular
      .module('Haberdashery')
      .controller('CustomInputDemoCtrl', postController)

  function postController (
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
              $animate,
              $mdDialog,
              $q,
              $mdToast,
              $http) {
    
    var self = this;
    $scope.newListing = {};
    $scope.newListing.imageUrls = [];
    self.newListing = {};

    $scope.newListing.location = 'UTSG;';
    self.newListing.readonly = false;
    self.newListing.tags = ['fresh'];
    
    $scope.possibleGenders = ['Women', 'Men'];
    self.newListing.gender = [];
    $scope.toggleSelection = function toggleSelection(gender) {
      var idx = self.newListing.gender.indexOf(gender);

      // is currently selected
      if (idx > -1) {
        self.newListing.gender.splice(idx, 1);
        // console.log(self.newListing.gender);
      }

      // is newly selected
      else {
        self.newListing.gender.push(gender);
        // console.log(self.newListing.gender);
      }
    };

    $scope.clearValue = function() {
      if (confirm("Are you sure you want to DELETE all the data?")) {
        $scope.newListing = {};
        self.newListing.tags = [];
      }
    };

    // self.newListing.selectedVegetables = [];
    // self.newListing.vegetables = loadVegetables();

    // var self = this;
    // self.newListing.readonly = false;
    // self.newListing.selectedItem = null;
    // self.newListing.searchText = null;
    // self.newListing.querySearch = querySearch;
    // self.newListing.vegetables = loadVegetables();
    // self.newListing.selectedVegetables = [];
    // self.newListing.numberChips = [];
    // self.newListing.numberChips2 = [];
    // self.newListing.numberBuffer = '';
    // self.newListing.selectedLocations = [];

    var self = this;
    self.newListing.readonly = false;
    self.newListing.selectedItem = null;
    self.newListing.searchText = null;
    self.newListing.querySearch = querySearch;
    self.newListing.locations = loadLocations();
    self.newListing.selectedLocations = [];

    self.newLocation = function(chip) {
      // console.log(chip);
      if (chip.type == undefined) {
        return {
          name: chip,
          type: 'Location'
        };
      }
      return chip;
    };

    /**
     * Search for locations.
    */
    function querySearch (query) {
      var results = query ? self.newListing.locations.filter(createFilterFor(query)) : [];
      // console.log(self.newListing.selectedLocations);
      return results;
    }
    /**
     * Create filter function for a query string
    */
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(myLocation) {
        // return (myLocation._lowername.indexOf(lowercaseQuery)  === 0) || (myLocation._lowertype.indexOf(lowercaseQuery) === 0);
        return (myLocation._lowername.match(lowercaseQuery)) || (myLocation._lowertype.match(lowercaseQuery)) || (myLocation._loweralias.match(lowercaseQuery));
      };
    }
    function loadLocations() {
      var locations = [
        {
            'name': 'University of Toronto St. George',
            'type': 'Campus',
            'alias': 'uoft U of T UTSG',
            'latitude': 43.662892,
            'longitude': -79.395656
        }, {
            'name': 'University of Toronto Scarborough',
            'type': 'Campus',
            'alias': 'uoft U of T UTSC',
            'latitude': 43.784712,
            'longitude': -79.185998
        }, {
            'name': 'University of Toronto Mississauga',
            'type': 'University',
            'alias': 'uoft U of T UTM',
            'latitude': 43.548043,
            'longitude': -79.660950
        }, {
            'name': 'Kipling Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Islington Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Royal York Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Old Mill Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Jane Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Runnymede Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'High Park Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Keele Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Dundas West Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Lansdowne Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Dufferin Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Ossington Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Christie Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Bathurst Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Spadina Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'St. George Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Bay Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Bloor/Yonge Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Sherbourne Station',
            'type': 'TTC ',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Castle Frank Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Broadview Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Chester Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Pape Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Donlands Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Greenwood Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Coxwell Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Woodbine Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Main Street Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Victoria Park Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Warden Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Kennedy Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Lawrence East Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Ellesmere Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Midland Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Scarborough Centre Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'McCowan Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'McCowan Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Downsview Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Wilson Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Yorkdale Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Lawrence West Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Glencairn Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Eglington West Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'St.Clair West Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Dupont Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Museum Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Queen\'s Park Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'St. Patrick Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Osgoode Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'St. Andrew Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Union Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'King Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Queen Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Dundas Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'College Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Wellesley Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Rosedale Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Summerhill Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'St. Clair Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Davisville Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Eglington Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Lawrence Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'York Mills Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Sheppard-Yonge Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'North York Centre Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Finch Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Bayview Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Bessarion Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Leslie Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        }, {
            'name': 'Don Mills Station',
            'type': 'TTC',
            'alias': 'transit',
            'latitude': null,
            'longitude': null,
        },

      ];
      return locations.map(function (location) {
        location._lowername = location.name.toLowerCase();
        location._lowertype = location.type.toLowerCase();
        location._loweralias = location.alias;
        return location;
      });
    }

    /**
    * Search for locations.
    */
    // function querySearch (query) {
    //   return $http.jsonp('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
    //     params: {
    //       location: '43.662892,-79.395656',
    //       radius: 50000,
    //       keyword: query,
    //       key: 'AIzaSyAMGL6fMWcJ84IEDmTAtVBlA74XZ5oaeBM'
    //     },
    //     transformRequeCfunction(data, headersGetter) {
    //         console.log(data);
    //         var headers = headersGetter();

    //         delete headers['Authorization'];
    //         // delete headers['Access-Control-Allow-Origin'];
    //         return headers;
    //     }
    //   }).then(function successCallback(response) {
    //     // this callback will be called asynchronously
    //     // when the response is available
    //     console.log('success');
    //   }, function errorCallback(response) {
    //     // called asynchronously if an error occurs
    //     // or server returns response with an error status.
    //     console.log(JSON.stringify(response, null, 4));
    //     // return response.data.results.map(function(item){
    //     //   console.log(self.newListing.selectedLocations);
    //     //   return item;
    //     // });
    //   });

    //   // .then(function(response){
    //   //   console.log(response);

    //   //   return response.data.results.map(function(item){
    //   //     console.log(self.newListing.selectedLocations);
    //   //     return item;
    //   //   });
    //   // })
    //   // .catch(function(error) {
    //   //   console.log(error);
    //   // });
    // }

    // CREATE A POST =================================================
    // when submitting the post, send the data to the node API

    $scope.createPost = function() {
      $scope.newListing.status = 'Available';
      // $scope.newListing.seller_pic = $rootScope.currentUser.facebookPicture;

      // $scope.newListing.seller_name = $rootScope.currentUser.facebookName;
      $scope.newListing.seller_id = $rootScope.currentUser._id;
      $scope.newListing.seller = $rootScope.currentUser._id;

      $scope.newListing.tags = self.newListing.tags;
      $scope.newListing.locations = self.newListing.selectedLocations;
      
      if (self.newListing.gender.length > 1) {
        $scope.newListing.gender = "Any";
      }
      else {
        $scope.newListing.gender = self.newListing.gender[0];
      }

      // $scope.newListing.gender = self.newListing.gender;
      // console.log('gender ' + $scope.newListing.gender);
      // console.log($scope.newListing);

      Post.createPost($scope.newListing).success(function(data) {
        // close the dialog box
        $scope.cancel();
        toaster.pop('succcess', 'Listing created successfully.');

        $scope.newListing = {
          status: 'Available',

        };
        $location.path('/detail/' + data._id);
      });
    };

    $scope.hasData = function(listing) {
      // console.log(listing);
      // console.log(self.newListing.selectedLocations);

      if (listing.imageUrls != undefined) {
          if (listing.imageUrls.length > 0 && self.newListing.selectedLocations.length > 0 && listing.title != undefined && listing.price != undefined && listing.category != undefined && listing.condition != undefined && listing.colour != undefined && listing.size != undefined) {
            return false;
          }
      }
      return true;
    };

    // UPDATE A POST ====================================================
    $scope.updatePost = function(post) {

      // TO DO ========================================
      // Error: if i try to reload the scope, the scroll
      // stops working, so i'm actually refreshing the page
      // ==============================================

      // validate the post to make sure that something is there
      // if the post is empty, nothing will happen
      //if (!$.isEmptyObject(post)) {

        // call the update function from our service (returns a promise object)
        Post.updatePost(post).success(function(data) {
            
            $window.location.reload();
            // redirect to the browse page
            $location.path('/browse/' + $scope.selectedPost._id);
            // $route.reload();
            
            // $location.path('/browse/');
            
            // console.log('/browse/' + $scope.selectedPost._id);
        });
        //toaster.pop('success', "Post updated successfully.");
    };

    // ==============UNCOMMENT============================
    // this line to serve locally
    var s3Url = 'http://localhost:3000' + '/api/sign_s3';
    // ==================================================

    // Uncomment this line to serve remotely
    // var s3Url = 'http://45.55.156.158:3000' + '/api/sign_s3';

    $scope.s3Upload = function(stuff){

      var file_name = angular.element('#images').val().split('\\');
      file_name = file_name[file_name.length-1];

      console.log(file_name);
      // console.log(stuff);
      var status_elem = document.getElementById("status");
      var url_elem = document.getElementById("imageUrl");
      var preview_elem = document.getElementById("preview");
      var s3upload = new S3Upload({
          file_type: 'file',
          s3_object_name: file_name,
          file_dom_selector: 'images',
          s3_sign_put_url: s3Url,
          onProgress: function(percent, message) {
            status_elem.innerHTML = 'Upload progress: ' + percent + '% ' + message;
            // console.log('Upload progress: ', percent, message);
          },
          onFinishS3Put: function(public_url) {
            // console.log(public_url);
            $scope.newListing.imageUrls.push(public_url);
            // status_elem.innerHTML = 'Upload completed. Uploaded to: '+ public_url;
            // url_elem.value = public_url;
            preview_elem.innerHTML +=
            '<div class="col-sm-6 col-md-4">' +
            '<div class="thumbnail">' +
            '<a href="' +
            public_url +
            '" data-lightbox="pics">' + 
            '<img src="' + 
            public_url +
            // '"data-lightbox="lightbox-'
            // + public_url +
            '" style="max-height:auto;max-width:50px;"/>'+
            '</a>' +
            // '<div class="btn-group">' +
            // '<a class="btn btn-xs btn-danger" ng-click="file.cancel()">Remove</a>' +
            '</div>'+
            '</div>';
          },
          onError: function(status) {
            // console.log('Upload error: ', status);
          }
      });
    };

    function showImageIdentifier() {
      // var title = $scope.newListing.title.split(' ').join('_');
      var title = $rootScope.currentUser._id;
      // console.log(title);
      var dateId = Date.now().toString();
      return [dateId, title].join('_');
    }

  }
})();