'use strict';

angular.module('Haberdashery')
  .controller('signupController', function($scope, $auth, $animate, $mdDialog, $location, $window, Profile, serverURL, $rootScope) {

    $scope.whiteList;

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
    });

    // SEO REQUIREMENT: 
    // PhantomJS pre-rendering workflow requires the page to declare, through htmlReady(), that
    // we are finished with this controller. 
    // $scope.htmlReady();

  });