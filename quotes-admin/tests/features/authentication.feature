Feature: Authentication - Login
  As an administrator or contributor
  I want to login to the Quotes Admin portal
  So that I can manage quotes and content

  Background:
    Given the backend API is running at "http://localhost:7071"
    And the admin portal is accessible at "http://localhost:3000"

  Scenario: Successful login with root admin account
    Given I am on the login page
    When I enter "root@quotes.com" in the email field
    And I enter "Root Admin" in the name field
    And I click the "Sign in with Email" button
    Then I should be redirected to the dashboard
    And I should see "Welcome back, Root Admin" message
    And my authentication token should be stored in localStorage
    And my user role should be "Admin"

  Scenario: Successful login with test admin account
    Given I am on the login page
    When I enter "admin@test.com" in the email field
    And I enter "Test Admin" in the name field
    And I click the "Sign in with Email" button
    Then I should be redirected to the dashboard
    And I should see "Welcome back, Test Admin" message
    And my user role should be "Admin"

  Scenario: Successful login with contributor account
    Given I am on the login page
    When I enter "editor@test.com" in the email field
    And I enter "Test Editor" in the name field
    And I click the "Sign in with Email" button
    Then I should be redirected to the dashboard
    And I should see "Welcome back, Test Editor" message
    And my user role should be "Contributor"

  Scenario: Login validation - empty email
    Given I am on the login page
    When I leave the email field empty
    And I enter "Test User" in the name field
    And I click the "Sign in with Email" button
    Then I should see an error message "Email is required"
    And I should remain on the login page

  Scenario: Login validation - invalid email format
    Given I am on the login page
    When I enter "invalid-email" in the email field
    And I enter "Test User" in the name field
    And I click the "Sign in with Email" button
    Then I should see an error message about invalid email format
    And I should remain on the login page

  Scenario: Login validation - empty name
    Given I am on the login page
    When I enter "user@test.com" in the email field
    And I leave the name field empty
    And I click the "Sign in with Email" button
    Then I should see an error message "Name is required"
    And I should remain on the login page

  Scenario: Login with backend API unavailable
    Given the backend API is not running
    And I am on the login page
    When I enter "root@quotes.com" in the email field
    And I enter "Root Admin" in the name field
    And I click the "Sign in with Email" button
    Then I should see an error message about connection failure
    And I should remain on the login page

  Scenario: Login form displays correctly
    Given I am on the login page
    Then I should see a "Quotes Admin Center" heading
    And I should see an email input field with placeholder "Enter your email"
    And I should see a name input field with placeholder "Enter your name"
    And I should see a "Sign in with Email" button
    And the login button should be enabled

  Scenario: Redirect authenticated user to dashboard
    Given I am already logged in as "root@quotes.com"
    When I navigate to the login page
    Then I should be automatically redirected to the dashboard
    And I should not see the login form

  Scenario: Token persistence after login
    Given I am on the login page
    When I enter "root@quotes.com" in the email field
    And I enter "Root Admin" in the name field
    And I click the "Sign in with Email" button
    And I wait for the dashboard to load
    When I refresh the page
    Then I should remain logged in
    And I should still be on the dashboard
    And my user information should be preserved

  Scenario: Login with different user overwrites previous session
    Given I am logged in as "admin@test.com"
    When I logout
    And I navigate to the login page
    And I enter "root@quotes.com" in the email field
    And I enter "Root Admin" in the name field
    And I click the "Sign in with Email" button
    Then I should be logged in as "root@quotes.com"
    And my user role should be "Admin"
    And the previous session should be cleared
