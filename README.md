# test-framework
> Playwright Web Testing Framework for YouTube


Automation testing framework created in TypeScript to practice SDET/QA skills on an industry product. Utilized DevOps skills such as Docker for containerization and GitHub Actions CI. Features Unit, Integration, and E2E tests while implementing the Page Object Model.

## Tools:
TypeScript, JavaScript, Playwright, Github Actions CI/CD, Docker Containerization

## Features

- **Cross-browser Testing**: Chrome, Firefox, and Safari support
- **Page Object Model**: Maintainable test architecture
- **Authentication Support**: Testing both authenticated and unauthenticated states
- **Parallel Execution**: Optimized for performance with sharding
- **Reporting**: Allure and HTML reports
- **CI/CD Integration**: GitHub Actions workflow
- **Dockerized Execution**: Container support for consistent environments
- **Retry Mechanisms**: Built-in resilience for flaky tests

## Prerequisites

- Node.js (LTS version)
- npm or yarn
- Java 11+ (for Allure reporting)
- Docker (optional)

## Getting Started

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd test-framework
   ```

2. Install dependencies
   ```bash
   npm ci
   ```

3. Install Playwright browsers
   ```bash
   npx playwright install
   ```

### Authentication Setup

For tests requiring authentication:

1. Create the auth directory
   ```bash
   mkdir -p tests/auth
   ```

2. Run the authentication setup script
   ```bash
   npx playwright test setup.authentication.ts
   ```
   
   This will create the necessary authentication files:
   - `tests/auth/cookies.json`
   - `tests/auth/localStorage.json`

### Test Data

Test data is stored in JSON format in the `tests/data` directory. The framework uses a utility function to load this data into tests.

## Running Tests

### Local Execution

```bash
# Run all tests
npm test

# Run with UI
npx playwright test --headed

# Run specific test file
npx playwright test tests/home.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium

# Run with debug mode
npx playwright test --debug

# Run with sharding for better performance by using optimal CPU core utilization
npx playwright test --shard=1/4
npx playwright test --shard=2/4
npx playwright test --shard=3/4
npx playwright test --shard=4/4 
```

### CI-specific Tests

```bash
# Run CI-specific tests
npm run test-ci
```

### Generate Reports

```bash
# Generate HTML report
npm run test-html-report

# Generate and view Allure report
npm run allure
```

### Docker Execution

```bash
# Build the Docker image
docker build -t playwright-docker .

# Run tests in Docker
docker run -it --rm --ipc=host playwright-docker

# Run with volume mounted for reports
docker run -it --rm --ipc=host -v $(pwd)/allure-results:/app/allure-results playwright-docker
```

## Project Structure

```
├── .github/workflows/    # GitHub Actions CI configuration
├── tests/                # Test files
│   ├── api/              # API test utilities
│   ├── auth/             # Authentication data (gitignored)
│   ├── data/             # Test data files
│   ├── fixtures/         # Test fixtures and hooks
│   ├── pages/            # Page Object Models
│   └── utils.ts          # Shared utility functions
├── Dockerfile            # Docker configuration
├── playwright.config.ts  # Main Playwright configuration
└── playwright.ci.config.ts # CI-specific configuration
```

## Page Object Model

The framework follows the Page Object Model pattern, with base classes and specialized page objects:

- `BasePage`: Core functionality shared across all pages
- Page-specific classes (HomePage, VideoPage, etc.)

Example usage:
```typescript
test('Navigate to home page', async ({ homePage }) => {
  await homePage.goto();
  await homePage.clickHomeButton();
});
```

## Best Practices

### Writing Tests

1. **Use page objects**: Don't put locators directly in test files
2. **Single responsibility**: Each test should verify one thing
3. **Use test data**: Externalize test data in JSON files
4. **Handle waits properly**: Use the `safeAction` utility for reliability
5. **Add meaningful assertions**: Verify the expected state clearly

### Locator Strategy

Prioritize locators in this order:
1. Semantic locators (role, label, text)
2. Test IDs or data attributes
3. CSS selectors (as a last resort)

### Test Reliability

- Tests include automatic retry mechanisms
- Authentication has built-in verification
- Page actions have proper waiting strategies

## Troubleshooting

### Common Issues

- **Authentication Failures**: Check if cookies/tokens are expired
- **Element Not Found**: YouTube UI may have changed; update locators
- **Timeouts**: Increase timeout values in `BasePage` or config
- **Flaky Tests**: Use `safeAction` with proper retry logic

### Debugging Tips

1. Run with `--headed` flag to see the browser
2. Use `--debug` flag for step-by-step execution
3. Check video recordings and screenshots in test results
4. Review logs for error messages

## Contributing

1. Follow the existing code style
2. Add proper error handling and retries
3. Write tests for new features
4. Update documentation

## CI/CD Pipeline

Tests automatically run on GitHub Actions:
- On pull requests to main/master
- On pushes to main/master
- Tests are sharded for faster execution
- Reports are generated and uploaded as artifacts