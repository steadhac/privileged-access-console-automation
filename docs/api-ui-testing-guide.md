# API Testing with Playwright UI Mode - Step-by-Step Guide

This guide explains how to execute and follow API tests using Playwright's interactive UI mode.
## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Opening Playwright UI Mode](#opening-playwright-ui-mode)
3. [Understanding the UI Interface](#understanding-the-ui-interface)
4. [Running API Tests](#running-api-tests)
5. [Viewing API Request/Response Details](#viewing-api-requestresponse-details)
6. [Debugging Failed Tests](#debugging-failed-tests)
7. [Viewing Test Reports](#viewing-test-reports)
8. [Tips for Effective API Testing](#tips-for-effective-api-testing)
9. [Common Workflows](#common-workflows)
10. [Keyboard Shortcuts](#keyboard-shortcuts)
11. [Troubleshooting](#troubleshooting)
12. [Next Steps](#next-steps)
13. [Additional Resources](#additional-resources)

## Prerequisites

Before starting, ensure:

✅ Dependencies are installed:
``` bash
npm install
```
✅ Playwright browsers are installed:
``` bash
npx playwright install
```

✅ Environment is configured (.env file exists with required variables)


## Opening Playwright UI Mode
### Method 1: Run All Tests in UI Mode
This opens the Playwright UI with all available tests.
npx playwright test --ui

### Method 2: Run Specific Test File in UI Mode
npx playwright test tests/api/api-authentication.spec.ts --ui
This opens the UI with only the API authentication tests loaded.

### What Happens Next?
A window will open showing the Playwright Test UI interface.

## Understanding the UI Interface
When the UI opens, you'll see three main sections:

### Left Sidebar - Test Explorer
┌─────────────────────────────┐
│ 🔍 Search tests...          │
├─────────────────────────────┤
│ 📁 tests                    │
│   ├─ 📁 api                 │
│   │   └─ ✅ api-authentication.spec.ts │
│   ├─ 📁 e2e                 │
│   └─ 📁 integration         │
└─────────────────────────────┘

```markdown
**Features:**

File tree: Browse all test files
Test cases: See individual test cases within each file
Status icons: ✅ Passed, ❌ Failed, ⏸️ Not run
Search box: Filter tests by name

### Center Panel - Test Details
┌─────────────────────────────────────┐
│ Test: "should generate valid token" │
├─────────────────────────────────────┤
│ Status: ✅ Passed (1.2s)           │
│                                     │
│ Steps:                              │
│ 1. ✅ POST /api/auth/login         │
│ 2. ✅ Expect status 200            │
│ 3. ✅ Validate token               │
└─────────────────────────────────────┘
**Shows**:

Test name and description
Execution status
Step-by-step execution
Timing information

### Right Panel - Details & Actions
┌────────────────────────────┐
│ 📊 Network                 │
│ 🔍 Console                 │
│ 📸 Screenshots             │
│ 🎬 Trace                   │
└────────────────────────────┘
**Tabs available**:

Network: API requests and responses
Console: Log output
Screenshots: Visual captures (for UI tests)
Trace: Detailed execution trace

## Running API Tests
### Step 1: Select Test File
In the left sidebar, expand the file tree:
tests/
  └─ api/
      └─ api-authentication.spec.ts

Click on api-authentication.spec.ts to see its test cases.

### Step 2: View Available Test Cases
You should see tests like:
✓ API Authentication
  ├─ ✓ should generate valid authentication token
  ├─ ✓ should fail with invalid credentials
  └─ ✓ should validate token successfully

### Step 3: Run Tests
Option A: Run All Tests in File

Click the ▶️ (play) button next to the file name
Option B: Run Individual Test

Click the ▶️ button next to a specific test case
Option C: Run All Tests

Click the ▶️ button at the top of the UI

### Step 4: Watch Execution
As tests run, you'll see:

Real-time status updates (⏳ Running → ✅ Passed / ❌ Failed)
Execution progress bar
Individual step completion
Timing for each step

### Viewing API Request/Response Details
### Step 1: Select a Completed Test
Click on any test case that has run (✅ or ❌ status).

### Step 2: Open Network Tab
In the right panel, click on the 📊 Network tab.

### Step 3: View API Calls
You'll see a list of all API requests made during the test:
┌──────────────────────────────────────────────┐
│ Network Requests                             │
├──────────────────────────────────────────────┤
│ POST /api/auth/login                         │
│ ├─ Status: 200 OK                           │
│ ├─ Duration: 245ms                          │
│ └─ Size: 1.2 KB                             │
│                                              │
│ GET /api/auth/validate                       │
│ ├─ Status: 200 OK                           │
│ ├─ Duration: 123ms                          │
│ └─ Size: 0.8 KB                             │
└──────────────────────────────────────────────┘
### Step 4: Inspect Request Details
Click on any request to see:

Request Headers:
{
  "Content-Type": "application/json",
  "Accept": "application/json",
  "User-Agent": "Playwright"
}
Request Body:
{
  "username": "admin@example.com",
  "password": "SecurePassword123!"
}
Response Headers:
{
  "Content-Type": "application/json",
  "X-Request-ID": "abc-123-def-456"
}
Response Body:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": "user-123",
    "role": "admin"
  }
}
Step 5: Analyze Response
Look for:

✅ Status codes: Should match expected (200, 401, etc.)
✅ Response structure: Verify JSON structure is correct
✅ Response data: Check values are as expected
✅ Headers: Confirm security headers are present


### Debugging Failed Tests
## When a Test Fails
Failed tests show ❌ status with error details.

### Step 1: Click on Failed Test
Select the failed test in the left sidebar.

### Step 2: Review Error Message
The center panel shows:
❌ Test Failed: should generate valid authentication token

Error: expect(received).toBe(expected)

Expected: 200
Received: 401

  at tests/api/api-authentication.spec.ts:25:45

### Step 3: Check Network Tab
Open Network tab
Find the failed request
Check:
Request was sent correctly
Response status and body
Any error messages in response

### Step 4: View Console Logs
Click Console tab
Look for error messages or warnings
Check API error responses

### Step 5: Use Trace Viewer
Click Trace tab
This shows a timeline of test execution
Hover over each step to see details
Look for where the test diverged from expected behavior

### Step 6: Re-run with Debugging
Click the 🐛 (debug) icon next to the test to:

Run test step-by-step
Pause at breakpoints
Inspect variables

### Viewing Test Reports
Generate HTML Report
After running tests, generate a detailed report:
npx playwright show-report

Report Contents
The HTML report shows:

1. Summary Dashboard
┌────────────────────────────┐
│ Test Results               │
├────────────────────────────┤
│ ✅ Passed: 8              │
│ ❌ Failed: 0              │
│ ⏭️  Skipped: 0            │
│ ⏱️  Duration: 3.2s        │
└────────────────────────────┘
2. ## Test List

All executed tests
Pass/fail status
Execution time
Retry attempts

3. ## Individual Test Details
Click any test to see:

Request/response data
Error messages (if failed)
Screenshots (if available)
Execution timeline

4. ## Filtering Options

View only failed tests
Filter by file
Search by test name

### Tips for Effective API Testing

1. Use Console Output
Add logging in your tests:
test('should authenticate', async ({ request }) => {
  const response = await request.post('/api/auth/login', {...});
  console.log('Response status:', response.status());
  console.log('Response body:', await response.json());
});
View logs in the Console tab.

2. Watch Network Traffic
The Network tab helps you:

Verify correct endpoints are called
Check request payloads
Validate response structure
Debug authentication issues
3. Use Test Annotations
Organize tests with tags:
test('critical login test', {
  tag: '@smoke',
}, async ({ request }) => {
  // test code
});
Filter in UI by tags.

4. Run Tests in Watch Mode
For development, use watch mode:
npx playwright test --ui --watch
Tests re-run automatically when files change.

### Common Workflows
## Workflow 1: Quick Test Verification
Open UI mode: npx playwright test --ui
Select test file
Click run all ▶️
Check status icons (all green = pass)
Close UI
Time: ~30 seconds

## Workflow 2: Debugging Failed Test
Run tests and identify failure
Open UI mode
Select failed test
Check Network tab for request/response
Review Console for errors
Fix code
Re-run test
Verify pass
Time: ~5-10 minutes

## Workflow 3: Deep API Investigation
Open UI with specific test
Run test with debug mode 🐛
Step through execution
Examine each request in Network tab
Verify response data structure
Check headers and status codes
Document findings
Time: ~15-20 minutes

Keyboard Shortcuts
While in UI mode:

Shortcut	Action
Space	Run/Stop selected test
↑ ↓	Navigate test list
Enter	Expand/collapse test group
Ctrl/Cmd + F	Search tests
Esc	Clear selection

### Troubleshooting
UI Doesn't Open
Problem: UI mode doesn't start

Solution:

No Network Data Shown
Problem: Network tab is empty

Solution:

Ensure test uses request fixture
Check that API calls are actually made
Verify test completed execution
Tests Don't Run
Problem: Tests show but don't execute

Solution:

Check .env configuration
Verify API endpoint is accessible
Review test file for syntax errors

### Next Steps
After mastering the UI:

✅ Create more comprehensive API tests
✅ Add assertions for response validation
✅ Implement test data management
✅ Set up CI/CD integration
✅ Generate automated reports

### Additional Resources
Playwright UI Mode Documentation
API Testing Guide
Test Reports
Last Updated: December 14, 2025
Version: 1.0.0
</content>
</write_file>

Created a comprehensive guide at docs/api-ui-testing-guide.md!

This step-by-step guide covers:

✅ How to open Playwright UI mode
✅ Understanding the interface layout
✅ Running API tests visually
✅ Viewing request/response details
✅ Debugging failed tests
✅ Generating and viewing reports
✅ Common workflows and shortcuts
✅ Troubleshooting tips

The guide includes visual representations of the UI, practical examples, and detailed instructions for following API test execution from start to finish.

