angular.module('Stylefnf')
.controller('signupController', function($scope, $auth, $state, $cordovaCamera, Profile,  $rootScope, $ionicSlideBoxDelegate, $ionicModal, $ionicLoading, $ionicPopup) {

  $scope.isSending = false;
  $scope.showFooter = true; 
  $scope.validEmail = false;
  $scope.validPassword = false;
  $scope.whiteList;
  $scope.emailNotValid = true;

  $scope.firstpage = {
    email:  "",
    password: ""
  };

  $scope.secondpage = {
    firstName:  "",
    lastName: ""
  };

  Profile.getWhitelist()
    .success(function(response) {
      $scope.whiteList = response;
    })
    .catch(function(response) {
      // console.log(response);
    });

  $scope.lockSlide = function () {
      $ionicSlideBoxDelegate.enableSlide( false );
  };

  $scope.genderStatuses = {
    availableOptions: [
      {val:'male', label:'Male'},
      {val:'female', label: 'Female'},
    ],
    selectedOption: {val:'female'} //This sets the default value of the select in the ui
  };

  $scope.emailChange = function(email) {

    try {
      // console.log($scope.firstpage.email);

      // check if email is in whitelist 
      if ($scope.whiteList.indexOf($scope.firstpage.email) > -1) {
        $scope.validEmail = true;
        $scope.emailNotValid = false;
      }
      // check if email is a valid school email
      else if (isValidEmail($scope.firstpage.email)) {
        $scope.validEmail = true;
        $scope.emailNotValid = false;
      }
      else {
        // console.log(isValidEmail());
        $scope.validEmail = false;
      }
    }
    catch(err) {
      $scope.validEmail = false;
    }

  };

  // check is email is a valid school email
  function isValidEmail(email) {

    var splitEmail = email.split('@');

    // check if there's an ending to the email
    if (splitEmail[0] == ['']) {
      return false;
    }

    // check if the email ending is part of the list of whitelisted schools
    // i.e. "utoronto.ca", "mail.utoronto.ca"
    if ($scope.whiteList.indexOf(splitEmail[1]) > -1) {
      // console.log('valid email');
      return true;
    }
    return false;
  }

  $scope.passChange = function(password) {
    // console.log($scope.firstpage.password);

    if ($scope.firstpage.password != "" || $scope.firstpage.password != undefined) {
      $scope.validPassword = true;
    }
    $scope.validPassword = false;
  };

  $scope.isValidEmailPassword = function() {
    // console.log($scope.firstpage.password);
    return ($scope.validEmail && $scope.firstpage.password);
  };

  $scope.nextSlide = function() {

    if (isValidEmail) {

      // check if the email is not registered
      Profile.checkValidEmail($scope.firstpage.email)
        .success(function(response) {

          $scope.showFooter = false;
          $ionicSlideBoxDelegate.next();

        })
        .catch(function(response) {

          if (response.status == 515) {

           var alertPopup = $ionicPopup.alert({
             title: 'Invalid email!',
             template: 'Email is already registered.'
           });

           alertPopup.then(function(res) {
              $scope.firstpage = {
                email:  "",
                password: ""
              };
              $scope.emailNotValid = true;
           });

          }

        });
    }
  };

  $scope.hasName = function() {
    return ($scope.secondpage.firstName && $scope.secondpage.lastName);
  };

  $scope.signUp = function() {
    // Setup the loader
    $ionicLoading.show({
      content: 'Registering',
      animation: 'fade-in',
      showBackdrop: true,
    });

    $scope.isSending = true;

    var user = {
      firstName: $scope.secondpage.firstName,
      lastName: $scope.secondpage.lastName,
      email: $scope.firstpage.email,
      password: $scope.firstpage.password,
      // status: $scope.campusStatuses.selectedOption.val,
      gender: "N/A"
    };

    $auth.signup(user)
      // after sending the email successfully
      .success(function(response) {
        $ionicLoading.hide();
        console.log(response);

        var alertPopup = $ionicPopup.alert({
         title: 'Congrats! You\'re registered!',
         template: 'Check your email to verify your account.'
        });

        alertPopup.then(function(res) {
          $scope.firstpage = {
            email:  "",
            password: ""
          };

          $scope.secondpage = {
            firstName:  "",
            lastName: ""
          };
          $scope.emailNotValid = true;
        });

        // show the sent email message
        // swal("Email Sent!", "A verification email has been sent to " + $scope.email + ".", "success"); 
        // console.log('success - user created; need to verify');
        $state.go('login');
        // $location.path('/email-sent');
      })
      .catch(function(response) {
        $ionicLoading.hide();
        // console.log(response);
        
        // after getting an email is registered error
        if (response.status == 409) {
          // console.log('user already registered');
          $state.go('signup');
        }
        // after getting a email is locked error
        if (response.status == 410) {
          // console.log('This account has been locked. Please contact support for help.');
          $state.go('signup');
          // swal("This account has been locked. Please contact support for help.", "Send an email to support@stylefnf.com", "error");
        }
      
      });
  };

  $ionicModal.fromTemplateUrl('email-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function() {
    $scope.modal.show();
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };


  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    $ionicSlideBoxDelegate.slide(0);
    $scope.showFooter = true; 

    // reset the fields
    $scope.firstpage = {
      email:  "",
      password: ""
    };

    $scope.secondpage = {
      firstName:  "",
      lastName: ""
    };
  });

});
