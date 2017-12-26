// 'use strict';

angular.module('Haberdashery')
  .controller('landingController', function($scope, $window, $location, $rootScope, $auth, toaster, Socket, Profile, Search, $filter, $mdDialog) {

    if ($auth.isAuthenticated()) {
      $location.path('/home');
    }

    $scope.whiteList;
    $scope.howToStep = 1;

    Profile.getWhitelist()
      .success(function(response) {
        $scope.whiteList = response;
      })
      .catch(function(response) {
        // console.log(response);
      });

    // $auth.logout();
    // $auth.removeToken();
    // delete $window.localStorage.currentUser;
    // delete $window.cookies;

    $scope.isSending = false;
    // $scope.sentEmail = false;

    if ($auth.isAuthenticated() && $rootScope.currentUser.isComplete) {
      $location.path('/');
    }

    if ($rootScope.signupEmail) {
      $scope.email = $rootScope.signupEmail;
    }

    $scope.goToDetail = function(ev, post) {
      // console.log('made it func');
      // $location.path('/detail/' + postID);
      $rootScope.viewListingDetail = post;

      // open a modal to show details
      $mdDialog.show({
        controller: PostCtrl,
        scope: $scope,
        preserveScope: true,
        templateUrl: '../../views/partials/detailModal.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true  
      })
      .then(function(answer) {
        $scope.$destroy();
        // $mdToast.show(
        //   $mdToast.simple()
        //     .content(JSON.stringify(answer))
        // );
      }, function() {
        // $scope.alert = 'You cancelled the dialog.';
      });
    };

    $scope.campusStatuses = {
      availableOptions: [
        {val:'Undergrad'},
        {val:'Grad'},
        {val:'Alumni'},
        {val:'Faculty'},
        {val:'Staff'}
      ],
      selectedOption: {val:'Undergrad'} //This sets the default value of the select in the ui
    };

    $scope.genderStatuses = {
      availableOptions: [
        {val:'male', label:'Male'},
        {val:'female', label: 'Female'},
      ],
      selectedOption: {val:'female'} //This sets the default value of the select in the ui
    };

    $scope.goToLink = function(type) {
      // console.log(postID);
      if (type == "login") {
        $location.path('/login/');
      }
      else {
        // console.log(postID);
        $location.path('/help/');
      }
    };


    $scope.checkEmail = function() {
        
      // check if email is in whitelist 
      if ($scope.whiteList.indexOf($scope.email) > -1) {
        $scope.signupForm.email.$setValidity("email", true);
      }
      // check if email is a valid school email
      else if (isValidEmail()) {
        $scope.signupForm.email.$setValidity("email", true);
      }
      else {
        // console.log(isValidEmail());
        $scope.signupForm.email.$setValidity("email", false);
      }
    };

    // check is email is a valid school email
    function isValidEmail() {
      // console.log($scope.whiteList);
      var splitEmail = $scope.email.split('@');

      if (splitEmail[0] == ['']) {
        return false;
      }

      if ($scope.whiteList.indexOf(splitEmail[1]) > -1) {
        return true;
      }
      return false;
    }

    $scope.signUp = function() {
      $scope.isSending = true;

      var user = {
        firstName: $scope.firstName,
        lastName: $scope.lastName,
        email: $scope.email,
        password: $scope.password,
        // status: $scope.campusStatuses.selectedOption.val,
        gender: $scope.genderStatuses.selectedOption.val
      };

      // console.log(user);
      
      // $scope.sentEmail = true;

      // $scope.tempEmail = angular.copy($scope.email);
      $auth.signup(user)
        // after sending the email successfully
        .success(function(response) {
          // console.log(response);

          // show the sent email message
          swal("Email Sent!", "A verification email has been sent to " + $scope.email + ".", "success"); 

          $location.path('/email-sent'); 
          
          // reset the form
          // $scope.signupForm.$setPristine();
          // $scope.firstName = '';
          // $scope.lastName = '';
          // $scope.email = '';
          // $scope.password = '';
          // $scope.confirmPassword = '';
          // $scope.campusStatuses.selectedOption = {val:'Undergrad'};
          // $scope.isSending = false;
          // $location.path('/');

        })
        .catch(function(response) {
          // console.log(response);
          
          // after getting an email is registered error
          if (response.status == 409) {
            swal({ 
              title: "Email already registered.",   
              type: "error",   
              showCancelButton: true,   
              confirmButtonColor: "#DD6B55",   
              confirmButtonText: "Send another verification email!",   
              closeOnConfirm: false 
            }, function(){   

              user.sendAgain = true;

              // console.log('made it to remove comment');
              $auth.signup(user)
                .catch(function(response) {
                  // console.log(response);
                });

              swal("Email Sent!", "A verification email has been sent to " + $scope.email, "success");

              $location.path('/email-sent');  

              // reset the form
              $scope.signupForm.$setPristine();
              $scope.firstName = '';
              $scope.lastName = '';
              $scope.email = '';
              $scope.password = '';
              $scope.confirmPassword = '';
              // $scope.campusStatuses.selectedOption = {val:'Undergrad'};
              $scope.genderStatuses.selectedOption = {val:'male'};
              $scope.isSending = false;
            });
          }
          // after getting a email is locked error
          if (response.status == 410) {
            swal("This account has been locked. Please contact support for help.", "Send an email to support@stylefnf.com", "error");
          }

          // $location.path('/');
        
        });
    };

    // reset signup email
    $scope.$on('$locationChangeStart', function(event) {
        $rootScope.signupEmail = undefined;
        $mdDialog.hide();
    });

    // popular posts
    Search.getAll('sort=newest')
      .success(function(data) {
          $scope.popularPosts = data['results'].slice(0,3);
          $scope.popularPosts2 = data['results'].slice(3,6);
    });

    $scope.showMorePopular = false;

    $scope.loadMorePopular = function() {
      if ($scope.showMorePopular) {
        document.getElementById('email_input').focus();
      }
      else {
        $scope.showMorePopular = true;
      }
    };

    $scope.goToLink = function(type) {
      // console.log(postID);
      if (type == "post") {
        $location.path('/detail/' + postID);
      }
      else {
        // console.log(postID);
        $location.path('/signup');
      }
    };

    $scope.hovercardURL = '../../views/partials/hoverProfile.html';

    $scope.hoverProfileIn = function(seller) {
      // console.log('hoverIn');
      $rootScope.hoverProfile = seller;
    };

    $scope.hoverProfileOut = function() {
      console.log('hoverOut');
      $rootScope.hoverProfile = undefined;
    };

    $scope.showCondition = function(cond) {

      var conditions = [
        {value: 'used', text: 'Gently Used'},
        {value: 'new', text: 'New (with tags)'},
        {value: 'likenew', text: 'Like New (no tags)'},
      ];
      var selected = $filter('filter')(conditions, {value: cond});
      return (cond && selected.length) ? selected[0].text : 'Not set';
    };

    $scope.schoolEmails = {
      availableOptions: [
        {val:'@mail.utoronto.ca', label:'@mail.utoronto.ca'},
        {val:'@utoronto.ca', label: '@utoronto.ca'},
      ],
      selectedOption: {val:'@mail.utoronto.ca'} //This sets the default value of the select in the ui
    };

    $scope.sendSignup = function() {
      console.log($scope.emailName);
      if ($scope.emailName) {
        $rootScope.signupEmail = $scope.emailName + $scope.schoolEmails.selectedOption.val;
        $location.path('/signup');
      }
    }

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